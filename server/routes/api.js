import { Router } from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { config } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../services/email.js";

const router = Router();
const studentOnly = [requireAuth, requireRole("student")];
const facultyOnly = [requireAuth, requireRole("faculty")];

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseSemester(value) {
  const match = String(value ?? "").match(/\d+/);
  const semester = match ? Number(match[0]) : NaN;
  if (!Number.isInteger(semester) || semester < 1 || semester > 6) {
    throw httpError(400, "Choose a valid semester.");
  }
  return semester;
}

function parseAttendanceDate(value) {
  const date = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw httpError(400, "A valid attendance date is required.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw httpError(400, "A valid attendance date is required.");
  }
  return date;
}

function cleanProfile(body) {
  const profile = {
    name: String(body.name ?? body.fullName ?? "").trim(),
    roll_no: String(body.roll_no ?? body.rollNo ?? "").trim().toUpperCase(),
    email: String(body.email ?? "").trim().toLowerCase(),
    branch: String(body.branch ?? "").trim(),
    semester: parseSemester(body.semester),
  };

  if (!profile.name || !profile.roll_no || !profile.email || !profile.branch) {
    throw httpError(400, "Name, roll number, email, branch, and semester are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    throw httpError(400, "Enter a valid email address.");
  }

  return profile;
}

function createToken(user) {
  return jwt.sign(
    { role: user.role },
    config.jwtSecret,
    { subject: String(user.id), expiresIn: "8h" }
  );
}

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function publicUser(user) {
  const safeUser = { ...user };
  delete safeUser.password_hash;
  return safeUser;
}

async function findExperiment(subjectCode, experimentNo) {
  const [rows] = await pool.execute(
    `SELECT e.id, e.subject_id, e.experiment_no, e.title, e.enabled,
            s.code AS subject_code, s.name AS subject_name,
            s.assessment_type, s.max_score
       FROM experiments e
       JOIN subjects s ON s.id = e.subject_id
      WHERE s.code = ? AND e.experiment_no = ?
      LIMIT 1`,
    [String(subjectCode).toUpperCase(), Number(experimentNo)]
  );
  return rows[0] || null;
}

router.post("/auth/register", async (req, res) => {
  const profile = cleanProfile(req.body);
  const password = String(req.body.password ?? "");
  if (password.length < 6) {
    throw httpError(400, "Password must contain at least 6 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    `INSERT INTO users (name, roll_no, email, branch, semester, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?, 'student')`,
    [
      profile.name,
      profile.roll_no,
      profile.email,
      profile.branch,
      profile.semester,
      passwordHash,
    ]
  );

  const [users] = await pool.execute(
    `SELECT id, name, roll_no, email, phone, branch, semester, role, status
       FROM users WHERE id = ?`,
    [result.insertId]
  );
  return res.status(201).json({ user: users[0] });
});

router.post("/auth/forgot-password", async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, "Enter a valid student email address.");
  }

  const [users] = await pool.execute(
    `SELECT id, email
       FROM users
      WHERE email = ? AND role = 'student'
      LIMIT 1`,
    [email]
  );
  const user = users[0];
  if (user) {
    const [recentRequests] = await pool.execute(
      `SELECT id
         FROM password_resets
        WHERE user_id = ?
          AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE)
        LIMIT 1`,
      [user.id]
    );
    if (recentRequests.length === 0) {
      const token = randomBytes(32).toString("base64url");
      const tokenHash = hashResetToken(token);
      const [insert] = await pool.execute(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))`,
        [user.id, tokenHash]
      );
      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (error) {
        await pool.execute("DELETE FROM password_resets WHERE id = ?", [insert.insertId]);
        throw error;
      }
    }
  }

  return res.json({
    message: "If that email belongs to a student account, password reset instructions will be sent.",
  });
});

router.post("/auth/reset-password", async (req, res) => {
  const token = String(req.body.token ?? "");
  const password = String(req.body.password ?? "");
  if (token.length < 32 || token.length > 200) {
    throw httpError(400, "This password reset link is invalid or has expired.");
  }
  if (password.length < 8) {
    throw httpError(400, "New password must contain at least 8 characters.");
  }

  const tokenHash = hashResetToken(token);
  const passwordHash = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [resets] = await connection.execute(
      `SELECT pr.id, pr.user_id
         FROM password_resets pr
         JOIN users u ON u.id = pr.user_id
        WHERE pr.token_hash = ?
          AND pr.used_at IS NULL
          AND pr.expires_at > CURRENT_TIMESTAMP
          AND u.role = 'student'
        LIMIT 1
        FOR UPDATE`,
      [tokenHash]
    );
    const reset = resets[0];
    if (!reset) {
      throw httpError(400, "This password reset link is invalid or has expired.");
    }

    await connection.execute(
      "UPDATE users SET password_hash = ? WHERE id = ? AND role = 'student'",
      [passwordHash, reset.user_id]
    );
    await connection.execute(
      "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?",
      [reset.id]
    );
    await connection.execute(
      "DELETE FROM password_resets WHERE user_id = ? AND id <> ?",
      [reset.user_id, reset.id]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.json({ message: "Your student password has been reset. You can now log in." });
});

router.post("/auth/login", async (req, res) => {
  const rollNo = String(req.body.roll_no ?? "").trim().toUpperCase();
  const password = String(req.body.password ?? "");
  if (!rollNo || !password) {
    throw httpError(400, "Roll number and password are required.");
  }

  const [users] = await pool.execute(
    `SELECT id, name, roll_no, email, branch, semester, role, status, password_hash
       FROM users
      WHERE roll_no = ? AND role = 'student'
      LIMIT 1`,
    [rollNo]
  );
  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw httpError(401, "Invalid roll number or password.");
  }
  if (user.status !== "active") {
    throw httpError(403, "This student account is inactive. Contact faculty.");
  }
  return res.json({ token: createToken(user), user: publicUser(user) });
});

router.post("/auth/faculty/login", async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  if (!email || !password) {
    throw httpError(400, "Faculty email and password are required.");
  }

  const [users] = await pool.execute(
    `SELECT id, name, roll_no, email, branch, semester, role, status, password_hash
       FROM users
      WHERE email = ? AND role = 'faculty'
      LIMIT 1`,
    [email]
  );
  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw httpError(401, "Invalid faculty email or password.");
  }
  if (user.status !== "active") {
    throw httpError(403, "This faculty account is inactive.");
  }
  return res.json({ token: createToken(user), user: publicUser(user) });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.put("/students/me", ...studentOnly, async (req, res) => {
  const profile = cleanProfile(req.body);
  await pool.execute(
    `UPDATE users
        SET name = ?, roll_no = ?, email = ?, branch = ?, semester = ?
      WHERE id = ? AND role = 'student'`,
    [
      profile.name,
      profile.roll_no,
      profile.email,
      profile.branch,
      profile.semester,
      req.user.id,
    ]
  );
  const [users] = await pool.execute(
    `SELECT id, name, roll_no, email, phone, branch, semester, role, status
       FROM users WHERE id = ?`,
    [req.user.id]
  );
  return res.json({ user: users[0] });
});

router.get("/subjects", requireAuth, async (_req, res) => {
  const [subjects] = await pool.execute(
    `SELECT id, code, name, semester, assessment_type, max_score
       FROM subjects ORDER BY id`
  );
  return res.json({ subjects });
});

router.get("/subjects/:code/experiments", requireAuth, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT e.id, e.subject_id, e.experiment_no, e.title, e.enabled,
            s.code AS subject_code
       FROM experiments e
       JOIN subjects s ON s.id = e.subject_id
      WHERE s.code = ?
      ORDER BY e.experiment_no`,
    [String(req.params.code).toUpperCase()]
  );
  if (rows.length === 0) {
    const [subjects] = await pool.execute(
      "SELECT id FROM subjects WHERE code = ? LIMIT 1",
      [String(req.params.code).toUpperCase()]
    );
    if (!subjects[0]) throw httpError(404, "Subject not found.");
  }
  return res.json({ experiments: rows });
});

router.get("/experiments/:code/:experimentNo", ...studentOnly, async (req, res) => {
  const experiment = await findExperiment(req.params.code, req.params.experimentNo);
  if (!experiment) throw httpError(404, "Experiment not found.");
  return res.json({
    experiment: {
      ...experiment,
      enabled: Boolean(experiment.enabled),
    },
  });
});

router.post("/attempts/start", ...studentOnly, async (req, res) => {
  const subjectCode = String(req.body.subjectCode ?? "").trim().toUpperCase();
  const experimentNo = Number(req.body.experimentNo);
  if (!subjectCode || !Number.isInteger(experimentNo) || experimentNo < 1) {
    throw httpError(400, "A valid subject and experiment number are required.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [students] = await connection.execute(
      `SELECT id FROM users
        WHERE id = ? AND role = 'student' AND status = 'active'
        FOR UPDATE`,
      [req.user.id]
    );
    if (!students[0]) throw httpError(403, "This student account is inactive.");

    const [experiments] = await connection.execute(
      `SELECT e.id, e.enabled
         FROM experiments e
         JOIN subjects s ON s.id = e.subject_id
        WHERE s.code = ? AND e.experiment_no = ?
        LIMIT 1`,
      [subjectCode, experimentNo]
    );
    const experiment = experiments[0];
    if (!experiment) throw httpError(404, "Experiment not found.");
    if (!experiment.enabled) throw httpError(403, "This experiment is disabled.");

    const [previousAttempts] = await connection.execute(
      `SELECT COALESCE(MAX(attempt_number), 0) AS latest_attempt
         FROM attempts
        WHERE student_id = ? AND experiment_id = ?`,
      [req.user.id, experiment.id]
    );
    const attemptNumber = Number(previousAttempts[0].latest_attempt) + 1;
    const [insert] = await connection.execute(
      `INSERT INTO attempts (student_id, experiment_id, attempt_number, status)
       VALUES (?, ?, ?, 'in_progress')`,
      [req.user.id, experiment.id, attemptNumber]
    );
    await connection.commit();
    return res.status(201).json({
      attempt: {
        id: insert.insertId,
        experiment_id: experiment.id,
        attempt_number: attemptNumber,
        status: "in_progress",
      },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

router.post("/attempts/:id/complete", ...studentOnly, async (req, res) => {
  const attemptId = Number(req.params.id);
  if (!Number.isSafeInteger(attemptId) || attemptId < 1) {
    throw httpError(400, "A valid attempt ID is required.");
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw httpError(400, "An attempt result object is required.");
  }

  const [rows] = await pool.execute(
    `SELECT a.id, a.student_id, a.experiment_id, a.attempt_number, a.status,
            a.score, a.max_score, a.result_data, e.subject_id,
            s.assessment_type, s.max_score AS subject_max_score
       FROM attempts a
       JOIN experiments e ON e.id = a.experiment_id
       JOIN subjects s ON s.id = e.subject_id
      WHERE a.id = ? AND a.student_id = ?
      LIMIT 1`,
    [attemptId, req.user.id]
  );
  const attempt = rows[0];
  if (!attempt) throw httpError(404, "Attempt not found.");
  if (attempt.status === "completed") {
    return res.json({ attempt, alreadyCompleted: true });
  }

  let score = null;
  let maxScore = null;
  if (attempt.assessment_type === "quiz") {
    score = Number(req.body.score);
    maxScore = Number(req.body.maxScore);
    if (
      !Number.isFinite(score) ||
      !Number.isFinite(maxScore) ||
      score < 0 ||
      maxScore <= 0 ||
      maxScore !== Number(attempt.subject_max_score) ||
      score > maxScore
    ) {
      throw httpError(400, "A valid quiz score and maximum score are required.");
    }
  }

  await pool.execute(
    `UPDATE attempts
        SET status = 'completed', score = ?, max_score = ?, result_data = ?,
            completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND student_id = ? AND status = 'in_progress'`,
    [score, maxScore, JSON.stringify(req.body), attemptId, req.user.id]
  );
  const [completed] = await pool.execute(
    `SELECT id, student_id, experiment_id, attempt_number, status, score,
            max_score, result_data, started_at, completed_at
       FROM attempts WHERE id = ?`,
    [attemptId]
  );
  return res.json({ attempt: completed[0] });
});

router.get("/faculty/overview", ...facultyOnly, async (_req, res) => {
  const [students, subjects, experiments, attempts] = await Promise.all([
    pool.execute(
      `SELECT id, name, roll_no, email, phone, branch, semester, role, status, created_at
         FROM users WHERE role = 'student' ORDER BY roll_no`
    ),
    pool.execute(
      `SELECT id, code, name, semester, assessment_type, max_score
         FROM subjects ORDER BY id`
    ),
    pool.execute(
      `SELECT id, subject_id, experiment_no, title, enabled
         FROM experiments ORDER BY subject_id, experiment_no`
    ),
    pool.execute(
      `SELECT id, student_id, experiment_id, attempt_number, status, score,
              max_score, started_at, completed_at
         FROM attempts ORDER BY started_at DESC`
    ),
  ]);
  return res.json({
    students: students[0],
    subjects: subjects[0],
    experiments: experiments[0].map((experiment) => ({
      ...experiment,
      enabled: Boolean(experiment.enabled),
    })),
    attempts: attempts[0],
  });
});

router.get("/faculty/attendance", ...facultyOnly, async (req, res) => {
  const date = parseAttendanceDate(req.query.date);
  const subjectCode = String(req.query.subject ?? "ALL").trim().toUpperCase();
  if (subjectCode !== "ALL" && !/^[A-Z0-9]{2,10}$/.test(subjectCode)) {
    throw httpError(400, "Choose a valid subject.");
  }

  const [subjects] = await pool.execute(
    `SELECT id, code, name, semester
       FROM subjects
      ORDER BY semester, code`
  );
  if (
    subjectCode !== "ALL" &&
    !subjects.some((subject) => subject.code === subjectCode)
  ) {
    throw httpError(404, "Subject not found.");
  }

  const [records] = await pool.execute(
    `SELECT u.id AS student_id, u.name, u.roll_no,
            s.id AS subject_id, s.code AS subject_code, s.name AS subject_name,
            a.id AS attendance_id, a.status
       FROM users u
       JOIN subjects s ON s.semester = u.semester
       LEFT JOIN attendance a
         ON a.student_id = u.id
        AND a.subject_id = s.id
        AND a.attendance_date = ?
      WHERE u.role = 'student'
        AND u.status = 'active'
        AND (? = 'ALL' OR s.code = ?)
      ORDER BY s.code, u.roll_no`,
    [date, subjectCode, subjectCode]
  );

  const [progress] = await pool.execute(
    `SELECT u.id AS student_id, u.name, u.roll_no,
            s.code AS subject_code, s.name AS subject_name,
            COUNT(a.id) AS total_classes,
            COALESCE(SUM(a.status = 'Present'), 0) AS present_classes,
            COALESCE(SUM(a.status = 'Absent'), 0) AS absent_classes
       FROM attendance a
       JOIN users u ON u.id = a.student_id
       JOIN subjects s ON s.id = a.subject_id
      WHERE u.role = 'student'
        AND (? = 'ALL' OR s.code = ?)
      GROUP BY u.id, u.name, u.roll_no, s.code, s.name
      ORDER BY s.code, u.roll_no`,
    [subjectCode, subjectCode]
  );

  return res.json({ date, subjects, records, progress });
});

router.put("/faculty/attendance/:studentId", ...facultyOnly, async (req, res) => {
  const studentId = Number(req.params.studentId);
  const subjectCode = String(req.body.subjectCode ?? "").trim().toUpperCase();
  const date = parseAttendanceDate(req.body.date);
  const status = req.body.status;
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    throw httpError(400, "A valid student ID is required.");
  }
  if (!["Present", "Absent"].includes(status)) {
    throw httpError(400, "Attendance status must be Present or Absent.");
  }
  const [matchingSubjects] = await pool.execute(
    `SELECT s.id
       FROM subjects s
       JOIN users u ON u.semester = s.semester
      WHERE s.code = ?
        AND u.id = ?
        AND u.role = 'student'
        AND u.status = 'active'
      LIMIT 1`,
    [subjectCode, studentId]
  );
  const subject = matchingSubjects[0];
  if (!subject) {
    throw httpError(404, "Active student or matching subject not found.");
  }

  await pool.execute(
    `INSERT INTO attendance
       (student_id, subject_id, attendance_date, status, marked_by)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       marked_by = VALUES(marked_by),
       updated_at = CURRENT_TIMESTAMP`,
    [studentId, subject.id, date, status, req.user.id]
  );
  return res.json({ studentId, subjectCode, date, status });
});

router.patch("/faculty/students/:id", ...facultyOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw httpError(400, "Invalid student ID.");

  const allowedFields = {
    name: "name",
    roll_no: "roll_no",
    email: "email",
    phone: "phone",
    branch: "branch",
    semester: "semester",
  };
  const updates = [];
  const values = [];
  for (const [field, column] of Object.entries(allowedFields)) {
    if (Object.hasOwn(req.body, field)) {
      updates.push(`${column} = ?`);
      if (field === "semester") {
        values.push(parseSemester(req.body[field]));
      } else if (field === "email") {
        const email = String(req.body[field] ?? "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw httpError(400, "Enter a valid email address.");
        }
        values.push(email);
      } else if (field === "roll_no") {
        const rollNo = String(req.body[field] ?? "").trim().toUpperCase();
        if (!rollNo) throw httpError(400, "Roll number is required.");
        values.push(rollNo);
      } else if (field === "phone") {
        const phone = String(req.body[field] ?? "").trim();
        values.push(phone || null);
      } else {
        const value = String(req.body[field] ?? "").trim();
        if (!value) throw httpError(400, `${field} is required.`);
        values.push(value);
      }
    }
  }
  if (updates.length === 0) throw httpError(400, "No editable student fields were provided.");

  values.push(id);
  const [result] = await pool.execute(
    `UPDATE users SET ${updates.join(", ")}
      WHERE id = ? AND role = 'student'`,
    values
  );
  if (result.affectedRows === 0) throw httpError(404, "Student not found.");
  const [users] = await pool.execute(
    `SELECT id, name, roll_no, email, phone, branch, semester, role, status, created_at
       FROM users WHERE id = ?`,
    [id]
  );
  return res.json({ user: users[0] });
});

router.patch("/faculty/students/:id/status", ...facultyOnly, async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status;
  if (!Number.isSafeInteger(id) || id < 1) throw httpError(400, "Invalid student ID.");
  if (!["active", "inactive"].includes(status)) {
    throw httpError(400, "Status must be active or inactive.");
  }
  const [result] = await pool.execute(
    `UPDATE users SET status = ? WHERE id = ? AND role = 'student'`,
    [status, id]
  );
  if (result.affectedRows === 0) throw httpError(404, "Student not found.");
  return res.json({ id, status });
});

router.patch("/faculty/experiments/:id", ...facultyOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw httpError(400, "Invalid experiment ID.");
  if (typeof req.body.enabled !== "boolean") {
    throw httpError(400, "Enabled must be a boolean.");
  }
  const [result] = await pool.execute(
    "UPDATE experiments SET enabled = ? WHERE id = ?",
    [req.body.enabled ? 1 : 0, id]
  );
  if (result.affectedRows === 0) throw httpError(404, "Experiment not found.");
  return res.json({ id, enabled: req.body.enabled });
});

export default router;
