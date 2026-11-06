import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.js";
import { apiRequest } from "../../services/api";
import {
  CalendarDays,
  ChartColumn,
  FlaskConical,
  House,
  LogOut,
  UsersRound,
} from "lucide-react";

import "./StudentManagement.css";


/* Student profiles and derived progress are loaded from the faculty API. */


/* =====================================================================
   1. CONSTANTS
===================================================================== */

const PAGE_SIZE = 10;

// Semester choices offered in the filter and the edit form.
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6];

// Same routes as FacultyDashboard / App.jsx. null = page not connected yet.
const ROUTES = {
  dashboard: "/faculty-dashboard",
  students: "/student-management",
  experiments: "/experiment-management",
  results: "/result-progress",
  attendance: "/attendance",
  login: "/",
};

const MENU_ITEMS = [
  { key: "dashboard",   label: "Dashboard",             icon: House },
  { key: "students",    label: "Student Management",    icon: UsersRound },
  { key: "experiments", label: "Experiment Management", icon: FlaskConical },
  { key: "results",     label: "Results & Progress",    icon: ChartColumn },
  { key: "attendance",  label: "Attendance",            icon: CalendarDays },
];

const DEFAULT_ERROR = "Something went wrong. Please try again.";

const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In progress",
  not_attempted: "Not attempted",
  active: "Active",
  inactive: "Disabled",
  disabled: "Disabled",
};


/* =====================================================================
   2. DATA SOURCE  (faculty API)
   ---------------------------------------------------------------------
   Shaped like labsim_admin_ready.sql. Subjects and experiments are copied
   from the SQL. The SQL seeds only 3 students and 9 attempts, so ids
   5-10 and attempts 10-36 were ADDED to give the page realistic content
   (9 students, 8 active, 36 attempts). Attempts 1-9 are the SQL rows.
===================================================================== */

/* `users`. password_hash is intentionally absent: the UI never needs it.
   The admin row is here only to prove it is filtered out of the list.
   semester is an integer, as in the SQL (TINYINT). */
function useStudentData() {

  const [data, setData] = useState({
    students: [],
    subjects: [],
    experiments: [],
    attempts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest("/faculty/overview");
      setData(response);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => reload());
  }, [reload]);

  const { students: users, subjects, experiments, attempts } = data;

  // Edit student info. Students are never deleted.
  const updateStudent = useCallback(
    async (id, body) => {
      if (!body.name || !body.email) {
        throw new Error("Name and email are required.");
      }
      const { user } = await apiRequest(`/faculty/students/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setData((current) => ({
        ...current,
        students: current.students.map((student) =>
          Number(student.id) === Number(id) ? user : student
        ),
      }));
    },
    []
  );

  const setStudentStatus = useCallback(async (id, status) => {
    await apiRequest(`/faculty/students/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setData((current) => ({
      ...current,
      students: current.students.map((student) =>
        Number(student.id) === Number(id) ? { ...student, status } : student
      ),
    }));
  }, []);

  return {
    users,
    subjects,
    experiments,
    attempts,
    updateStudent,
    setStudentStatus,
    reload,
    loading,
    error,
  };
}


/* =====================================================================
   4. CALCULATIONS  (pure functions - no React, easy to test)
===================================================================== */

/* Accepts 3, "3" or "Semester 3"; returns a positive integer or null. */
const toSemester = (value) => {
  const digits = String(value ?? "").match(/\d+/);
  const number = digits ? Number(digits[0]) : NaN;
  return Number.isInteger(number) && number > 0 ? number : null;
};

const semesterLabel = (value) => {
  const number = toSemester(value);
  return number === null ? "—" : `Semester ${number}`;
};

/* The database uses "active" / "inactive"; anything else is not active. */
const isActive = (student) => student.status === "active";

/* Only real student accounts belong on this page (never the admin user). */
const isStudentAccount = (user) => user.role === "student";

/* Eligibility: the subject's semester must equal the student's semester.
   A student without a valid semester has NO eligible subjects, so a
   missing semester can never produce a fake 100% or count unrelated work. */
const isSubjectEligible = (subject, student) => {
  const studentSemester = toSemester(student.semester);
  return (
    studentSemester !== null &&
    studentSemester === toSemester(subject.semester)
  );
};

const percentOf = (part, whole) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

/* Active first, then roll number, then id. */
const compareStudents = (a, b) => {
  const statusOrder = Number(!isActive(a)) - Number(!isActive(b));
  if (statusOrder !== 0) return statusOrder;

  const rollOrder = String(a.roll_no || "").localeCompare(
    String(b.roll_no || ""),
    undefined,
    { numeric: true }
  );
  if (rollOrder !== 0) return rollOrder;

  return Number(a.id) - Number(b.id);
};

/* Group attempts by "studentId:experimentId" once, so every lookup is
   cheap. Each group is ordered by attempt_number, then id. Attempts are
   copied, never mutated. */
function buildAttemptIndex(attempts) {

  const index = new Map();

  attempts.forEach((attempt) => {
    const key = `${attempt.student_id}:${attempt.experiment_id}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(attempt);
  });

  index.forEach((list) =>
    list.sort(
      (a, b) => a.attempt_number - b.attempt_number || a.id - b.id
    )
  );

  return index;
}

/* The latest timestamp of an attempt (unfinished attempts count too). */
const lastTimeOf = (attempt) =>
  new Date(attempt.completed_at || attempt.started_at).getTime();

/* One student x one experiment.
   status        : completed | in_progress | not_attempted (derived)
   attemptCount  : number of attempt RECORDS
   bestScore     : highest score among COMPLETED attempts, quiz subjects only
   lastActivity  : newest relevant timestamp across all attempts */
function getRecord(index, studentId, experimentId, isQuiz) {

  const attempts = index.get(`${studentId}:${experimentId}`) || [];
  const completed = attempts.filter((a) => a.status === "completed");

  let status = "not_attempted";
  if (completed.length > 0) status = "completed";
  else if (attempts.length > 0) status = "in_progress";

  // Unfinished attempts are never a "result"; completion-only subjects
  // never show a score.
  const best = isQuiz
    ? completed
        .filter((a) => a.score !== null && a.max_score !== null)
        .reduce((top, a) => (!top || a.score > top.score ? a : top), null)
    : null;

  const latest = attempts.reduce(
    (top, a) => (!top || lastTimeOf(a) > lastTimeOf(top) ? a : top),
    null
  );

  return {
    attempts,
    status,
    attemptCount: attempts.length,
    bestScore: best ? best.score : null,
    maxScore: best ? best.max_score : null,
    lastActivity: latest ? latest.completed_at || latest.started_at : null,
  };
}

/* Progress of one student in one ELIGIBLE subject.
   Only enabled experiments count; each experiment counts once. */
function studentSubjectProgress(index, student, subject) {

  const enabled = subject.experiments.filter((e) => e.enabled);
  const isQuiz = subject.assessment_type === "quiz";

  const statuses = enabled.map(
    (e) => getRecord(index, student.id, e.id, isQuiz).status
  );

  const completed = statuses.filter((s) => s === "completed").length;
  const inProgress = statuses.filter((s) => s === "in_progress").length;

  return {
    subject,
    total: enabled.length,
    completed,
    inProgress,
    // Pending = not completed yet (includes in-progress experiments).
    pending: enabled.length - completed,
    percent: percentOf(completed, enabled.length),
  };
}

/* Two lists for the profile.
   attempted    : every experiment with at least one attempt record, even a
                  disabled one or one outside the student's semester, so
                  history is never hidden.
   notAttempted : ENABLED experiments of ELIGIBLE subjects with no attempt.
                  An in-progress or completed experiment is never listed. */
function studentAttemptLists(index, student, subjects) {

  const attempted = [];
  const notAttempted = [];

  subjects.forEach((subject) => {

    const isQuiz = subject.assessment_type === "quiz";
    const eligible = isSubjectEligible(subject, student);

    subject.experiments.forEach((experiment) => {

      const record = getRecord(index, student.id, experiment.id, isQuiz);

      if (record.attemptCount > 0) {
        attempted.push({ subject, experiment, ...record });
      } else if (eligible && experiment.enabled) {
        notAttempted.push({ subject, experiment });
      }
    });
  });

  return { attempted, notAttempted };
}

/* "17/20" or the neutral placeholder. */
const formatScore = (record) =>
  record.bestScore === null || record.bestScore === undefined
    ? "—"
    : `${record.bestScore}/${record.maxScore}`;

/* UTC (as stored) -> IST for display. */
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";


/* =====================================================================
   5. SMALL UI COMPONENTS
===================================================================== */

function StatusBadge({ status }) {
  return (
    <span className={`sm-badge sm-badge--${String(status).replace(/_/g, "-")}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ProgressBar({ value }) {

  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className="sm-progress"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Width is the only dynamic inline style */}
      <div className="sm-progress-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="sm-stat">
      <span className="sm-stat-icon" aria-hidden="true">{icon}</span>
      <span className="sm-stat-body">
        <span className="sm-stat-label">{label}</span>
        <span className="sm-stat-value">{value}</span>
      </span>
    </div>
  );
}

/* Confirmation dialog. Escape and a click on the dark area close it. */
function Modal({ title, onClose, children }) {

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sm-modal-overlay" onMouseDown={onClose}>
      <div
        className="sm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sm-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="sm-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Back link on the left, page heading on the right. */
function TopBar({ onBack }) {
  return (
    <div className="sm-topbar">
      <button type="button" className="sm-back" onClick={onBack}>
        ← Back to students
      </button>
      <h2 className="sm-topbar-title">Student Management</h2>
    </div>
  );
}


/* =====================================================================
   6A. STUDENT PROFILE  (view page)
   `subjects` already contain their experiments. Every number below comes
   from the calculation functions, never from typed-in values.
===================================================================== */

function StudentProfile({ student, subjects, attemptIndex, onBack, onEdit }) {

  const [expandedRow, setExpandedRow] = useState(null);

  // Only this student's semester subjects feed progress and totals.
  const eligibleSubjects = subjects.filter((s) => isSubjectEligible(s, student));

  const progress = eligibleSubjects.map((s) =>
    studentSubjectProgress(attemptIndex, student, s)
  );

  // Enabled experiments this student is expected to complete.
  const totalRequired = progress.reduce((sum, item) => sum + item.total, 0);

  const { attempted, notAttempted } = studentAttemptLists(
    attemptIndex,
    student,
    subjects
  );

  // Attempt RECORDS (not unique experiments).
  const attemptRecords = attempted.reduce(
    (sum, row) => sum + row.attemptCount,
    0
  );

  // Group the "not attempted" experiments by subject for the collapsible list.
  const pendingBySubject = [];
  notAttempted.forEach(({ subject, experiment }) => {
    let group = pendingBySubject.find((g) => g.subject.id === subject.id);
    if (!group) {
      group = { subject, items: [] };
      pendingBySubject.push(group);
    }
    group.items.push(experiment);
  });

  const info = [
    ["Full name", student.name],
    ["Roll no.", student.roll_no],
    ["Email", student.email],
    ["Phone", student.phone],
    ["Branch", student.branch],
    ["Semester", semesterLabel(student.semester)],
    ["Registered on", formatDate(student.created_at)],
    ["Account status", isActive(student) ? "Active" : "Disabled"],
  ];

  return (

    <>

      <TopBar onBack={onBack} />


      {/* 1. STUDENT INFO */}

      <section className="sm-card">

        <div className="sm-profile-head">

          <div>
            <h3>{student.name}</h3>
            <StatusBadge status={student.status} />
          </div>

          <button
            type="button"
            className="sm-btn sm-btn--primary"
            onClick={() => onEdit(student)}
          >
            Edit student
          </button>

        </div>

        <dl className="sm-info">
          {info.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "—"}</dd>
            </div>
          ))}
        </dl>

        {!isActive(student) && (
          <p className="sm-note">
            This account is disabled. History is kept, but the student
            is excluded from class totals.
          </p>
        )}

      </section>


      {/* 2. SUBJECT PROGRESS (eligible subjects only) */}

      <section className="sm-card">

        <h3>Subject Progress</h3>

        <p className="sm-card-sub">
          Completed experiments out of the enabled experiments in each
          subject of this student's semester.
        </p>

        {progress.length === 0 ? (

          <p className="sm-note">
            No subjects are linked to this student because the semester is
            not set to one that has subjects.
          </p>

        ) : (

          <div className="sm-grid sm-grid--4">

            {progress.map((item) => (

              <div key={item.subject.id} className="sm-progress-card">

                <div className="sm-progress-top">
                  <strong>{item.subject.code}</strong>
                  {/* total = 0 shows 0%, never NaN or a fake 100% */}
                  <span>{item.percent}%</span>
                </div>

                <p className="sm-progress-name">{item.subject.name}</p>

                <ProgressBar value={item.percent} />

                <p className="sm-progress-count">
                  <b>{item.completed}/{item.total}</b> completed
                </p>

                <p className="sm-progress-meta">
                  Pending: {item.pending}
                  {item.inProgress > 0 && ` (${item.inProgress} in progress)`}
                </p>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* 3. ATTEMPTED EXPERIMENTS (all history, incl. disabled experiments) */}

      <section className="sm-card">

        <h3>Attempted Experiments</h3>

        <p className="sm-card-sub">
          {attempted.length} experiment(s) attempted, {attemptRecords} attempt
          record(s) in total. {totalRequired} enabled experiment(s) are
          required for this student. The best score is shown for completed
          quiz experiments.
        </p>

        <div className="sm-table-wrap">

          <table className="sm-table">

            <thead>
              <tr>
                <th>Subject</th>
                <th>Experiment</th>
                <th>Attempts</th>
                <th>Best score</th>
                <th>Status</th>
                <th>Last activity</th>
              </tr>
            </thead>

            <tbody>

              {attempted.length === 0 ? (

                <tr>
                  <td colSpan="6" className="sm-empty">
                    No experiments attempted yet.
                  </td>
                </tr>

              ) : (

                attempted.map((row) => {

                  const rowId = row.experiment.id;
                  const open = expandedRow === rowId;

                  return (

                    <Fragment key={rowId}>

                      <tr className={row.experiment.enabled ? "" : "sm-muted-row"}>

                        <td>{row.subject.code}</td>

                        <td className="sm-exp-cell">
                          {row.experiment.experiment_no}. {row.experiment.title}
                          {!row.experiment.enabled && (
                            <> <StatusBadge status="disabled" /></>
                          )}
                        </td>

                        <td>
                          {row.attemptCount}{" "}
                          <button
                            type="button"
                            className="sm-expand"
                            aria-expanded={open}
                            onClick={() => setExpandedRow(open ? null : rowId)}
                          >
                            {open ? "Hide" : "Details"}
                          </button>
                        </td>

                        <td>{formatScore(row)}</td>

                        <td><StatusBadge status={row.status} /></td>

                        <td>{formatDate(row.lastActivity)}</td>

                      </tr>

                      {/* One line per individual attempt record */}
                      {open &&
                        row.attempts.map((attempt) => (
                          <tr key={attempt.id} className="sm-attempt-row">
                            <td colSpan="6">
                              <div className="sm-attempt-inner">
                                <span>Attempt {attempt.attempt_number}</span>
                                <span>
                                  Score:{" "}
                                  {attempt.score === null
                                    ? "—"
                                    : `${attempt.score}/${attempt.max_score}`}
                                </span>
                                <span>
                                  {attempt.status === "completed"
                                    ? "Completed"
                                    : "In progress"}
                                </span>
                                <span>
                                  {formatDate(
                                    attempt.completed_at || attempt.started_at
                                  )}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}

                    </Fragment>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* 4. NOT ATTEMPTED (no attempt record at all) */}

      <section className="sm-card">

        <h3>Not Attempted</h3>

        <p className="sm-card-sub">
          {notAttempted.length} enabled experiment(s) with no attempt.
        </p>

        {notAttempted.length === 0 ? (

          <p className="sm-note">
            {progress.length === 0
              ? "No subjects are linked to this student."
              : "Every enabled experiment has been attempted."}
          </p>

        ) : (

          <div className="sm-pending-groups">

            {pendingBySubject.map(({ subject, items }) => (

              <details key={subject.id} className="sm-pending-group">

                <summary>
                  <span className="sm-pending-code">{subject.code}</span>
                  {subject.name}
                  <span className="sm-pending-count">
                    {items.length} not attempted
                  </span>
                </summary>

                <ul className="sm-pending-list">
                  {items.map((experiment) => (
                    <li key={experiment.id}>
                      {experiment.experiment_no}. {experiment.title}
                    </li>
                  ))}
                </ul>

              </details>

            ))}

          </div>

        )}

      </section>

    </>
  );
}


/* =====================================================================
   6B. EDIT FORM  (info only - no deleting)
===================================================================== */

function StudentEdit({ student, onCancel, onSave }) {

  const [form, setForm] = useState({
    name: student.name || "",
    roll_no: student.roll_no || "",
    email: student.email || "",
    phone: student.phone || "",
    branch: student.branch || "",
    // The select works with strings; it is converted back to a number on save.
    semester: toSemester(student.semester) ?? "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const update = (field) => (event) =>
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSave = async (event) => {

    event.preventDefault();

    if (form.password && form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {

      const body = {
        ...form,
        // Database value is a number (TINYINT), not the "Semester 3" label.
        semester: toSemester(form.semester),
        // Empty optional fields become null so UNIQUE columns stay valid.
        roll_no: form.roll_no.trim() || null,
        phone: form.phone.trim() || null,
        branch: form.branch.trim() || null,
      };

      // A blank password must NOT overwrite the existing one, so the field
      // is left out of the payload entirely.
      if (!body.password) delete body.password;

      await onSave(student.id, body);

    } catch (err) {

      setFormError(err?.message || DEFAULT_ERROR);
      setSaving(false);

    }
  };

  // Keep the student's current semester selectable even if unusual.
  const currentSemester = toSemester(student.semester);
  const semesters =
    currentSemester === null || SEMESTER_OPTIONS.includes(currentSemester)
      ? SEMESTER_OPTIONS
      : [currentSemester, ...SEMESTER_OPTIONS];

  return (

    <>

      <TopBar onBack={onCancel} />

      <form className="sm-card" onSubmit={handleSave}>

        <h3>Edit Student</h3>

        <p className="sm-card-sub">
          Update this student's account information. Students cannot be
          deleted — use Disable on the list instead.
        </p>

        {formError && <div className="sm-alert" role="alert">{formError}</div>}

        <div className="sm-form-grid">

          <label className="sm-field">
            Name
            <input className="sm-input" value={form.name} onChange={update("name")} required />
          </label>

          <label className="sm-field">
            Roll no.
            <input className="sm-input" value={form.roll_no} onChange={update("roll_no")} />
          </label>

          <label className="sm-field">
            Email
            <input className="sm-input" type="email" value={form.email} onChange={update("email")} required />
          </label>

          <label className="sm-field">
            Phone
            <input className="sm-input" type="tel" value={form.phone} onChange={update("phone")} />
          </label>

          <label className="sm-field">
            Branch
            <input className="sm-input" value={form.branch} onChange={update("branch")} />
          </label>

          <label className="sm-field">
            Semester
            <select className="sm-select" value={form.semester} onChange={update("semester")}>
              <option value="">Not set</option>
              {semesters.map((number) => (
                <option key={number} value={number}>
                  Semester {number}
                </option>
              ))}
            </select>
          </label>

          <label className="sm-field">
            New password
            <input
              className="sm-input"
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={update("password")}
            />
            <small>Minimum 6 characters.</small>
          </label>

        </div>

        <div className="sm-modal-actions">

          <button type="button" className="sm-btn sm-btn--ghost" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit" className="sm-btn sm-btn--primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>

        </div>

      </form>

    </>
  );
}


/* =====================================================================
   6C. MAIN PAGE  (header + menu + list / profile / edit)
===================================================================== */

function StudentManagement() {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const {
    users,
    subjects,
    experiments,
    attempts,
    updateStudent,
    setStudentStatus,
    reload,
    loading: dataLoading,
    error: dataError,
  } = useStudentData();


  /* ----- derived data (never stored in state) ----- */

  // Student accounts only; the admin user is never listed or counted.
  const students = useMemo(() => users.filter(isStudentAccount), [users]);

  // Subjects with their experiments attached, in experiment_no order.
  const catalog = useMemo(
    () =>
      subjects.map((subject) => ({
        ...subject,
        experiments: experiments
          .filter((e) => e.subject_id === subject.id)
          .sort((a, b) => a.experiment_no - b.experiment_no),
      })),
    [subjects, experiments]
  );

  const attemptIndex = useMemo(() => buildAttemptIndex(attempts), [attempts]);


  /* ----- UI state ----- */

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [view, setView] = useState("list"); // list | profile | edit
  const [activeId, setActiveId] = useState(null);

  const [pendingToggle, setPendingToggle] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const activeStudent = students.find((s) => s.id === activeId) || null;


  /* ----- menu: close on outside click and Escape ----- */

  useEffect(() => {

    if (!menuOpen) return undefined;

    const onClick = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        toggleRef.current?.contains(event.target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };

  }, [menuOpen]);

  const goTo = (path) => {
    setMenuOpen(false);
    if (path) navigate(path);
  };

  const handleLogout = () => {
    signOut();
    setMenuOpen(false);
    navigate(ROUTES.login);
  };


  /* ----- counts (disabled students are not in the active total) ----- */

  const activeCount = students.filter(isActive).length;
  const disabledCount = students.length - activeCount;


  /* ----- filtering, sorting, pagination ----- */

  const semesterOptions = useMemo(() => {
    const found = students.map((s) => toSemester(s.semester)).filter(Boolean);
    return [...new Set([...SEMESTER_OPTIONS, ...found])].sort((a, b) => a - b);
  }, [students]);

  const filtered = useMemo(() => {

    const search = query.trim().toLowerCase();

    return students
      .filter((student) => {

        const matchesQuery =
          !search ||
          String(student.name || "").toLowerCase().includes(search) ||
          String(student.roll_no || "").toLowerCase().includes(search) ||
          String(student.email || "").toLowerCase().includes(search);

        const matchesSemester =
          semester === "all" || toSemester(student.semester) === Number(semester);

        // Disabled students stay searchable through the status filter.
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? isActive(student) : !isActive(student));

        return matchesQuery && matchesSemester && matchesStatus;
      })
      .sort(compareStudents);

  }, [students, query, semester, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Both are 0 when nothing matches, so "Showing 0–0 of 0" stays correct.
  const rangeStart = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Changing any filter returns to page 1.
  const onFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };


  /* ----- actions ----- */

  const openView = (student) => {
    setActiveId(student.id);
    setView("profile");
  };

  const openEdit = (student) => {
    setActiveId(student.id);
    setView("edit");
  };

  const backToList = () => {
    setView("list");
    setActiveId(null);
  };

  const handleSave = async (id, body) => {
    await updateStudent(id, body);
    await reload();
    backToList();
  };

  // Disable / enable changes the account status only. Attempts are kept.
  const confirmToggle = async () => {

    if (!pendingToggle) return;

    setBusy(true);
    setActionError("");

    try {

      await setStudentStatus(
        pendingToggle.id,
        isActive(pendingToggle) ? "inactive" : "active"
      );

      await reload();
      setPendingToggle(null);

    } catch (err) {

      setActionError(err?.message || DEFAULT_ERROR);

    } finally {

      setBusy(false);

    }
  };

  const closeToggle = useCallback(() => {
    setPendingToggle(null);
    setActionError("");
  }, []);

  const disabling = pendingToggle && isActive(pendingToggle);
  const inList = view === "list";


  /* ----- render ----- */

  return (
    <div className="sm-container" style={{ "--sm-max": "1440px" }}>

      {dataLoading && <p role="status">Loading student records…</p>}
      {dataError && <p role="alert">{dataError}</p>}

      {/* HEADER: hamburger | Lab Simulator | Admin */}

      <header className="sm-header">

        <button
          ref={toggleRef}
          type="button"
          className="sm-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="sm-side-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <h1 className="sm-brand">Lab Simulator</h1>

        <div className="sm-user">
          <div className="sm-user-text">
            <strong>Admin</strong>
            <small>Faculty</small>
          </div>
          <div className="sm-avatar" role="img" aria-label="Admin profile">A</div>
        </div>

      </header>


      {/* FLOATING MENU */}

      {menuOpen && (

        <nav
          ref={menuRef}
          id="sm-side-menu"
          className="sm-menu"
          aria-label="Admin menu"
        >

          {MENU_ITEMS.map((item) => {

            const active = item.key === "students";

            return (
              <button
                key={item.key}
                type="button"
                className={`sm-menu-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(ROUTES[item.key])}
              >
                <span className="sm-menu-icon" aria-hidden="true">
                  <item.icon size={22} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="sm-menu-divider" />

          <button type="button" className="sm-menu-item logout" onClick={handleLogout}>
            <span className="sm-menu-icon" aria-hidden="true">
              <LogOut size={22} strokeWidth={2} />
            </span>
            <span>Logout</span>
          </button>

        </nav>

      )}


      <main className="sm-content">

        <div className="sm-page" style={{ maxWidth: "var(--sm-max)" }}>

          {/* PAGE HEADING (list view only) */}

          {inList && (
            <div className="sm-page-head">
              <h2>Student Management</h2>
              <p>
                Search students, review their progress and manage account
                access. Sample data only; it resets on refresh.
              </p>
            </div>
          )}


          {/* LIST VIEW */}

          {inList && (

            <>

              <div className="sm-grid sm-grid--3 sm-summary">
                <StatCard icon="👥" label="Total Students" value={students.length} />
                <StatCard icon="✅" label="Active Students" value={activeCount} />
                <StatCard icon="🚫" label="Disabled Students" value={disabledCount} />
              </div>


              <section className="sm-card">

                <div className="sm-toolbar">

                  <input
                    className="sm-input sm-input--grow"
                    placeholder="Search by name, roll no. or email…"
                    aria-label="Search students"
                    value={query}
                    onChange={onFilter(setQuery)}
                  />

                  <select
                    className="sm-select"
                    aria-label="Filter by semester"
                    value={semester}
                    onChange={onFilter(setSemester)}
                  >
                    <option value="all">All semesters</option>
                    {semesterOptions.map((number) => (
                      <option key={number} value={number}>
                        Semester {number}
                      </option>
                    ))}
                  </select>

                  <select
                    className="sm-select"
                    aria-label="Filter by account status"
                    value={statusFilter}
                    onChange={onFilter(setStatusFilter)}
                  >
                    <option value="all">All accounts</option>
                    <option value="active">Active</option>
                    <option value="inactive">Disabled</option>
                  </select>

                </div>

              </section>


              <section className="sm-card">

                <h3>Student List</h3>

                <div className="sm-table-wrap sm-table-gap">

                  <table className="sm-table">

                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Roll no.</th>
                        <th>Semester</th>
                        <th>Account status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {pageRows.length === 0 ? (

                        <tr>
                          <td colSpan="6" className="sm-empty">
                            No students match your search or filters.
                          </td>
                        </tr>

                      ) : (

                        pageRows.map((student) => (

                          <tr
                            key={student.id}
                            className={isActive(student) ? "" : "sm-muted-row"}
                          >

                            <td>{student.id}</td>
                            <td className="sm-strong">{student.name}</td>
                            <td>{student.roll_no || "—"}</td>
                            <td>{semesterLabel(student.semester)}</td>
                            <td><StatusBadge status={student.status} /></td>

                            <td>
                              <div className="sm-row-actions">

                                <button
                                  type="button"
                                  className="sm-btn sm-btn--outline"
                                  onClick={() => openView(student)}
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="sm-btn sm-btn--primary"
                                  onClick={() => openEdit(student)}
                                >
                                  Edit
                                </button>

                                {isActive(student) ? (
                                  <button
                                    type="button"
                                    className="sm-btn sm-btn--danger"
                                    onClick={() => setPendingToggle(student)}
                                  >
                                    Disable
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="sm-btn sm-btn--success"
                                    onClick={() => setPendingToggle(student)}
                                  >
                                    Enable
                                  </button>
                                )}

                              </div>
                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

                <div className="sm-pagination">

                  <span>
                    Showing {rangeStart}–{rangeEnd} of {filtered.length} students
                  </span>

                  <div className="sm-pagination-controls">

                    <button
                      type="button"
                      className="sm-btn sm-btn--ghost"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      ‹ Prev
                    </button>

                    <span>Page {currentPage} of {totalPages}</span>

                    <button
                      type="button"
                      className="sm-btn sm-btn--ghost"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next ›
                    </button>

                  </div>

                </div>

              </section>

            </>

          )}


          {/* PROFILE VIEW */}

          {view === "profile" && activeStudent && (
            <StudentProfile
              student={activeStudent}
              subjects={catalog}
              attemptIndex={attemptIndex}
              onBack={backToList}
              onEdit={openEdit}
            />
          )}


          {/* EDIT VIEW (key resets the form when another student is opened) */}

          {view === "edit" && activeStudent && (
            <StudentEdit
              key={activeStudent.id}
              student={activeStudent}
              onCancel={backToList}
              onSave={handleSave}
            />
          )}

        </div>

      </main>


      {/* DISABLE / ENABLE CONFIRMATION */}

      {pendingToggle && (

        <Modal
          title={disabling ? "Disable this student?" : "Enable this student?"}
          onClose={closeToggle}
        >

          <p className="sm-note">
            <strong>{pendingToggle.name}</strong>
            {pendingToggle.roll_no ? ` (Roll no. ${pendingToggle.roll_no})` : ""}
            <br />
            {disabling
              ? "They will no longer be able to use LabSim. Their attempts and results are kept and nothing is deleted."
              : "They will be able to log in and use LabSim again."}
          </p>

          {actionError && <div className="sm-alert" role="alert">{actionError}</div>}

          <div className="sm-modal-actions">

            <button type="button" className="sm-btn sm-btn--ghost" onClick={closeToggle}>
              Cancel
            </button>

            <button
              type="button"
              className={`sm-btn ${disabling ? "sm-btn--danger-solid" : "sm-btn--primary"}`}
              disabled={busy}
              onClick={confirmToggle}
            >
              {busy
                ? "Please wait…"
                : disabling
                ? "Disable student"
                : "Enable student"}
            </button>

          </div>

        </Modal>

      )}

    </div>
  );
}


export default StudentManagement;