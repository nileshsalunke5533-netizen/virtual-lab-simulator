import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import "./ResultProgress.css";


/* Results and progress are derived from live student, experiment, and attempt data. */


/* =====================================================================
   1. CONSTANTS
===================================================================== */

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

const TABS = [
  { key: "subject",    label: "By Subject" },
  { key: "student",    label: "By Student" },
  { key: "experiment", label: "By Experiment" },
];

const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In progress",
  not_attempted: "Not attempted",
  active: "Active",
  inactive: "Disabled",
  enabled: "Enabled",
  disabled: "Disabled",
};


/* =====================================================================
   2. DATA SOURCE  (faculty API)
   ---------------------------------------------------------------------
   Same sample set as Student Management, shaped like
   labsim_admin_ready.sql. Students 5-10 and attempts 10-36 were ADDED
   (the SQL seeds 3 students and 9 attempts).
===================================================================== */

function useResultData() {
  const [data, setData] = useState({
    students: [],
    subjects: [],
    experiments: [],
    attempts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/faculty/overview")
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    users: data.students,
    subjects: data.subjects,
    experiments: data.experiments,
    attempts: data.attempts,
    loading,
    error,
  };
}


/* =====================================================================
   4. CALCULATIONS  (pure functions - no React)
===================================================================== */

/* 3, "3" or "Semester 3" -> 3; anything else -> null. */
const toSemester = (value) => {
  const digits = String(value ?? "").match(/\d+/);
  const number = digits ? Number(digits[0]) : NaN;
  return Number.isInteger(number) && number > 0 ? number : null;
};

/* Subject belongs to the student's semester. No semester = no subjects,
   so a missing semester can never produce a fake percentage. */
const isSubjectForStudent = (subject, student) => {
  const semester = toSemester(student.semester);
  return semester !== null && semester === toSemester(subject.semester);
};

/* Eligible = real student, active, same semester as the subject. */
const isEligibleStudent = (user, subject) =>
  user.role === "student" &&
  user.status === "active" &&
  isSubjectForStudent(subject, user);

const percentOf = (part, whole) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

const compareStudents = (a, b) =>
  String(a.roll_no || "").localeCompare(String(b.roll_no || ""), undefined, {
    numeric: true,
  }) || Number(a.id) - Number(b.id);

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

/* Group attempts by "studentId:experimentId" once. */
function buildAttemptIndex(attempts) {
  const index = new Map();
  attempts.forEach((attempt) => {
    const key = `${Number(attempt.student_id)}:${Number(attempt.experiment_id)}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(attempt);
  });
  return index;
}

const lastTimeOf = (attempt) =>
  new Date(attempt.completed_at || attempt.started_at).getTime();

/* One student x one experiment.
   status       : completed | in_progress | not_attempted (derived;
                  a completed attempt wins over a newer unfinished one)
   attemptCount : number of attempt RECORDS
   bestScore    : best COMPLETED quiz score, else null
   lastActivity : newest timestamp across all attempts */
function getRecord(index, studentId, experimentId, isQuiz) {

  const attempts =
    index.get(`${Number(studentId)}:${Number(experimentId)}`) || [];
  const completed = attempts.filter((a) => a.status === "completed");

  let status = "not_attempted";
  if (completed.length > 0) status = "completed";
  else if (attempts.length > 0) status = "in_progress";

  const best = isQuiz
    ? completed
        .filter((a) => a.score !== null && a.max_score !== null)
        .reduce(
          (top, a) => (!top || Number(a.score) > Number(top.score) ? a : top),
          null
        )
    : null;

  const latest = attempts.reduce(
    (top, a) => (!top || lastTimeOf(a) > lastTimeOf(top) ? a : top),
    null
  );

  return {
    status,
    attemptCount: attempts.length,
    bestScore: best ? Number(best.score) : null,
    maxScore: best ? Number(best.max_score) : null,
    lastActivity: latest ? latest.completed_at || latest.started_at : null,
  };
}

/* ---------- BY SUBJECT ----------
   requirements = eligible students x enabled experiments
   completedStudents = students who finished EVERY enabled experiment */
function subjectStats(subject, students, index) {

  const isQuiz = subject.assessment_type === "quiz";
  const enabled = subject.experiments.filter((e) => e.enabled);
  const eligible = students.filter((s) => isEligibleStudent(s, subject));

  let completedRequirements = 0;
  let completedStudents = 0;

  eligible.forEach((student) => {
    const done = enabled.filter(
      (e) => getRecord(index, student.id, e.id, isQuiz).status === "completed"
    ).length;
    completedRequirements += done;
    if (enabled.length > 0 && done === enabled.length) completedStudents += 1;
  });

  const requirements = eligible.length * enabled.length;

  return {
    totalExperiments: subject.experiments.length,
    enabledExperiments: enabled.length,
    eligible,
    eligibleStudents: eligible.length,
    completedStudents,
    notCompletedStudents: eligible.length - completedStudents,
    requirements,
    completedRequirements,
    percent: percentOf(completedRequirements, requirements),
  };
}

/* ---------- STUDENT x SUBJECT (enabled experiments only) ---------- */
function studentSubjectProgress(index, student, subject) {

  const isQuiz = subject.assessment_type === "quiz";
  const enabled = subject.experiments.filter((e) => e.enabled);

  const statuses = enabled.map(
    (e) => getRecord(index, student.id, e.id, isQuiz).status
  );
  const count = (status) => statuses.filter((s) => s === status).length;
  const completed = count("completed");

  return {
    total: enabled.length,
    completed,
    inProgress: count("in_progress"),
    notAttempted: count("not_attempted"),
    percent: percentOf(completed, enabled.length),
  };
}

/* ---------- BY EXPERIMENT ----------
   rows = one per ELIGIBLE student (never per attempt) */
function experimentStats(experiment, subject, students, index, attempts) {

  const isQuiz = subject.assessment_type === "quiz";

  const rows = students
    .filter((s) => isEligibleStudent(s, subject))
    .map((student) => ({
      student,
      ...getRecord(index, student.id, experiment.id, isQuiz),
    }));

  const count = (status) => rows.filter((r) => r.status === status).length;

  return {
    rows,
    eligible: rows.length,
    completed: count("completed"),
    inProgress: count("in_progress"),
    notAttempted: count("not_attempted"),
    attemptsRecorded: attempts.filter(
      (a) => Number(a.experiment_id) === Number(experiment.id)
    ).length,
  };
}

/* Completed first, then in progress, then not attempted; inside a group
   highest score first, then roll number. */
const STATUS_ORDER = { completed: 0, in_progress: 1, not_attempted: 2 };

function compareRanking(a, b) {
  if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  }
  const scoreA = a.bestScore ?? -1;
  const scoreB = b.bestScore ?? -1;
  if (scoreA !== scoreB) return scoreB - scoreA;
  return compareStudents(a.student, b.student);
}


/* =====================================================================
   5. SMALL UI COMPONENTS
===================================================================== */

function StatusBadge({ status }) {
  return (
    <span className={`rp-badge rp-badge--${String(status).replace(/_/g, "-")}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ProgressBar({ value, label }) {

  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className="rp-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Width is the only dynamic inline style */}
      <div className="rp-progress-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

/* Bar with the percentage next to it, for table cells. */
function ProgressCell({ value, label }) {
  return (
    <div className="rp-progress-cell">
      <ProgressBar value={value} label={label} />
      <span>{value}%</span>
    </div>
  );
}

/* Window. Escape and a click on the dark area close it; the page behind
   stops scrolling while it is open. */
function Modal({ title, onClose, children }) {

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="rp-modal-overlay" onMouseDown={onClose}>
      <div
        className="rp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="rp-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="rp-modal-close"
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


/* =====================================================================
   6A. TAB 1  -  BY SUBJECT
===================================================================== */

function SubjectTab({ catalog, students, index }) {

  const [openId, setOpenId] = useState(null);

  const rows = useMemo(
    () => catalog.map((subject) => ({
      subject,
      stats: subjectStats(subject, students, index),
    })),
    [catalog, students, index]
  );

  const open = rows.find((row) => row.subject.id === openId) || null;

  // Students of the open subject, most completed first
  const openStudents = open
    ? open.stats.eligible
        .map((student) => ({
          student,
          progress: studentSubjectProgress(index, student, open.subject),
        }))
        .sort(
          (a, b) =>
            b.progress.completed - a.progress.completed ||
            compareStudents(a.student, b.student)
        )
    : [];

  const closeModal = useCallback(() => setOpenId(null), []);

  return (

    <section className="rp-card">

      <h3>Subject-wise Progress</h3>

      <p className="rp-card-sub">
        Completion = completed experiments ÷ (enabled experiments × eligible
        active students). A student counts as completed when every enabled
        experiment is done.
      </p>

      <div className="rp-table-wrap">

        <table className="rp-table">

          <thead>
            <tr>
              <th>Subject</th>
              <th>Experiments</th>
              <th>Active students</th>
              <th>Completed students</th>
              <th>Not completed</th>
              <th>Overall completion</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>

            {rows.map(({ subject, stats }) => (

              <tr key={subject.id}>

                <td>
                  <span className="rp-strong">{subject.name}</span>
                  <br />
                  <small className="rp-faint">
                    {subject.code} · Semester {subject.semester}
                  </small>
                </td>

                <td>
                  {stats.enabledExperiments}
                  {stats.enabledExperiments !== stats.totalExperiments &&
                    ` of ${stats.totalExperiments}`}
                </td>

                <td>{stats.eligibleStudents}</td>
                <td>{stats.completedStudents}</td>
                <td>{stats.notCompletedStudents}</td>

                <td>
                  <ProgressCell
                    value={stats.percent}
                    label={`${subject.code} overall completion`}
                  />
                </td>

                <td>
                  <button
                    type="button"
                    className="rp-btn rp-btn--outline"
                    onClick={() => setOpenId(subject.id)}
                  >
                    Students
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {open && (

        <Modal title={`${open.subject.code} – student progress`} onClose={closeModal}>

          <div className="rp-table-wrap">

            <table className="rp-table">

              <thead>
                <tr>
                  <th>Roll no.</th>
                  <th>Student</th>
                  <th>Completed</th>
                  <th>In progress</th>
                  <th>Not attempted</th>
                  <th>Progress</th>
                </tr>
              </thead>

              <tbody>

                {openStudents.length === 0 ? (

                  <tr>
                    <td colSpan="6" className="rp-empty">
                      No eligible active students.
                    </td>
                  </tr>

                ) : (

                  openStudents.map(({ student, progress }) => (

                    <tr key={student.id}>
                      <td>{student.roll_no || "—"}</td>
                      <td className="rp-strong">{student.name}</td>
                      <td>{progress.completed}/{progress.total}</td>
                      <td>{progress.inProgress}</td>
                      <td>{progress.notAttempted}</td>
                      <td>
                        <ProgressCell
                          value={progress.percent}
                          label={`${student.name} progress`}
                        />
                      </td>
                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </Modal>

      )}

    </section>
  );
}


/* =====================================================================
   6B. TAB 2  -  BY STUDENT
===================================================================== */

function StudentTab({ catalog, students, index }) {

  const [query, setQuery] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [subjectId, setSubjectId] = useState("all");

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return students
      .filter(
        (student) =>
          !search ||
          student.name.toLowerCase().includes(search) ||
          String(student.roll_no || "").toLowerCase().includes(search)
      )
      .sort(compareStudents);
  }, [students, query]);

  // Chosen student if still in the search results, else the first match
  const student = matches.find((s) => s.id === studentId) || matches[0] || null;

  // Only subjects of the student's semester, then the subject filter
  const studentSubjects = student
    ? catalog.filter((subject) => isSubjectForStudent(subject, student))
    : [];

  const visibleSubjects =
    subjectId === "all"
      ? studentSubjects
      : studentSubjects.filter((subject) => String(subject.id) === subjectId);

  return (

    <>

      <section className="rp-card">

        <div className="rp-toolbar">

          <input
            type="search"
            className="rp-input rp-input--grow"
            placeholder="Search student by name or roll no.…"
            aria-label="Search students"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            className="rp-select rp-select--wide"
            aria-label="Choose student"
            value={student ? student.id : ""}
            onChange={(event) => setStudentId(Number(event.target.value))}
          >
            {matches.length === 0 && <option value="">No match</option>}
            {matches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.roll_no ? `(${s.roll_no})` : ""}
                {s.status !== "active" ? " – disabled" : ""}
              </option>
            ))}
          </select>

          <select
            className="rp-select"
            aria-label="Filter by subject"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
          >
            <option value="all">All subjects</option>
            {catalog.map((subject) => (
              <option key={subject.id} value={String(subject.id)}>
                {subject.code}
              </option>
            ))}
          </select>

        </div>

      </section>

      {!student ? (

        <div className="rp-state">No student selected.</div>

      ) : visibleSubjects.length === 0 ? (

        <div className="rp-state">
          {studentSubjects.length === 0
            ? "No subjects are linked to this student's semester."
            : "The chosen subject is not part of this student's semester."}
        </div>

      ) : (

        visibleSubjects.map((subject) => {

          const isQuiz = subject.assessment_type === "quiz";
          const progress = studentSubjectProgress(index, student, subject);

          // Enabled experiments, plus disabled ones that have history
          const records = subject.experiments
            .map((experiment) => ({
              experiment,
              ...getRecord(index, student.id, experiment.id, isQuiz),
            }))
            .filter((r) => r.experiment.enabled || r.attemptCount > 0);

          return (

            <section key={subject.id} className="rp-card">

              <div className="rp-subject-head">

                <div>
                  <h3>{subject.name}</h3>
                  <p className="rp-card-sub">
                    {student.name} · {progress.completed}/{progress.total}{" "}
                    completed ({progress.percent}%)
                    {student.status !== "active" && " · disabled account"}
                  </p>
                </div>

                <div className="rp-pills">
                  <span className="rp-pill rp-pill--ok">
                    {progress.completed} completed
                  </span>
                  <span className="rp-pill rp-pill--warn">
                    {progress.inProgress} in progress
                  </span>
                  <span className="rp-pill">
                    {progress.notAttempted} not attempted
                  </span>
                </div>

              </div>

              <div className="rp-table-wrap">

                <table className="rp-table">

                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Experiment</th>
                      <th>Status</th>
                      <th>Attempts</th>
                      <th>Best score</th>
                    </tr>
                  </thead>

                  <tbody>

                    {records.map((r) => (

                      <tr
                        key={r.experiment.id}
                        className={r.experiment.enabled ? "" : "rp-muted-row"}
                      >
                        <td>{r.experiment.experiment_no}</td>
                        <td className="rp-name">
                          {r.experiment.title}
                          {!r.experiment.enabled && (
                            <> <StatusBadge status="disabled" /></>
                          )}
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>{r.attemptCount}</td>
                        <td>{formatScore(r)}</td>
                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

          );
        })

      )}

    </>
  );
}


/* =====================================================================
   6C. TAB 3  -  BY EXPERIMENT
===================================================================== */

function ExperimentTab({ catalog, students, attempts, index }) {

  const [subjectId, setSubjectId] = useState(null);
  const [experimentId, setExperimentId] = useState(null);

  const subject =
    catalog.find((s) => s.id === subjectId) || catalog[0] || null;

  const experiment = subject
    ? subject.experiments.find((e) => e.id === experimentId) ||
      subject.experiments[0] ||
      null
    : null;

  const stats = useMemo(
    () =>
      subject && experiment
        ? experimentStats(experiment, subject, students, index, attempts)
        : null,
    [subject, experiment, students, index, attempts]
  );

  // Highest score to lowest; completed first
  const ranked = useMemo(
    () => (stats ? [...stats.rows].sort(compareRanking) : []),
    [stats]
  );

  if (!subject || !experiment || !stats) {
    return <div className="rp-state">No experiments found.</div>;
  }

  const isQuiz = subject.assessment_type === "quiz";

  return (

    <>

      <section className="rp-card">

        <div className="rp-toolbar">

          <select
            className="rp-select rp-select--wide"
            aria-label="Choose subject"
            value={subject.id}
            onChange={(event) => {
              setSubjectId(Number(event.target.value));
              setExperimentId(null);
            }}
          >
            {catalog.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} – {s.name}
              </option>
            ))}
          </select>

          <select
            className="rp-select rp-select--wide"
            aria-label="Choose experiment"
            value={experiment.id}
            onChange={(event) => setExperimentId(Number(event.target.value))}
          >
            {subject.experiments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.experiment_no}. {e.title}
                {e.enabled ? "" : " (disabled)"}
              </option>
            ))}
          </select>

        </div>

      </section>

      <section className="rp-card">

        <h3>
          Experiment {experiment.experiment_no}: {experiment.title}
        </h3>

        <p className="rp-card-sub">
          {subject.code} · Semester {subject.semester} ·{" "}
          {experiment.enabled ? "Enabled" : "Disabled"}.{" "}
          {isQuiz
            ? "Students are ranked by best score, highest first."
            : "This subject records completion only, so there is no score."}
        </p>

        <div className="rp-pills rp-pills--spaced">
          <span className="rp-pill rp-pill--ok">{stats.completed} completed</span>
          <span className="rp-pill rp-pill--warn">{stats.inProgress} in progress</span>
          <span className="rp-pill">{stats.notAttempted} not attempted</span>
          <span className="rp-pill rp-pill--muted">
            {stats.eligible} active students · {stats.attemptsRecorded} attempts recorded
          </span>
        </div>

        <div className="rp-table-wrap">

          <table className="rp-table">

            <thead>
              <tr>
                <th>Rank</th>
                <th>Roll no.</th>
                <th>Student</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Best score</th>
                <th>Last activity</th>
              </tr>
            </thead>

            <tbody>

              {ranked.length === 0 ? (

                <tr>
                  <td colSpan="7" className="rp-empty">
                    No eligible active students.
                  </td>
                </tr>

              ) : (

                ranked.map((row, position) => (

                  <tr key={row.student.id}>
                    <td>{row.status === "completed" ? position + 1 : "—"}</td>
                    <td>{row.student.roll_no || "—"}</td>
                    <td className="rp-strong">{row.student.name}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.attemptCount}</td>
                    <td>{formatScore(row)}</td>
                    <td>{formatDate(row.lastActivity)}</td>
                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </>
  );
}


/* =====================================================================
   7. MAIN PAGE  -  header, menu, heading, tabs
===================================================================== */

function ResultProgress() {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const {
    users,
    subjects,
    experiments,
    attempts,
    loading: dataLoading,
    error: dataError,
  } = useResultData();

  /* ----- derived data (never stored in state) ----- */

  // Student accounts only; the admin user is never listed or counted.
  const students = useMemo(
    () => users.filter((user) => user.role === "student"),
    [users]
  );

  // Subjects with their experiments attached, in experiment_no order.
  const catalog = useMemo(
    () =>
      subjects.map((subject) => ({
        ...subject,
        experiments: experiments
          .filter((e) => Number(e.subject_id) === Number(subject.id))
          .sort((a, b) => a.experiment_no - b.experiment_no),
      })),
    [subjects, experiments]
  );

  const index = useMemo(() => buildAttemptIndex(attempts), [attempts]);

  /* ----- UI state ----- */

  const [tab, setTab] = useState("subject");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

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

  return (
    <div className="rp-container" style={{ "--rp-max": "1440px" }}>

      {dataLoading && <p role="status">Loading results and progress…</p>}
      {dataError && <p role="alert">{dataError}</p>}

      {/* HEADER: hamburger | Lab Simulator | Admin */}

      <header className="rp-header">

        <button
          ref={toggleRef}
          type="button"
          className="rp-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="rp-side-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <h1 className="rp-brand">Lab Simulator</h1>

        <div className="rp-user">
          <div className="rp-user-text">
            <strong>Admin</strong>
            <small>Faculty</small>
          </div>
          <div className="rp-avatar" role="img" aria-label="Admin profile">A</div>
        </div>

      </header>


      {/* FLOATING MENU */}

      {menuOpen && (

        <nav
          ref={menuRef}
          id="rp-side-menu"
          className="rp-menu"
          aria-label="Admin menu"
        >

          {MENU_ITEMS.map((item) => {

            const active = item.key === "results";

            return (
              <button
                key={item.key}
                type="button"
                className={`rp-menu-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(ROUTES[item.key])}
              >
                <span className="rp-menu-icon" aria-hidden="true">
                  <item.icon size={22} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="rp-menu-divider" />

          <button type="button" className="rp-menu-item logout" onClick={handleLogout}>
            <span className="rp-menu-icon" aria-hidden="true">
              <LogOut size={22} strokeWidth={2} />
            </span>
            <span>Logout</span>
          </button>

        </nav>

      )}


      <main className="rp-content">

        <div className="rp-page" style={{ maxWidth: "var(--rp-max)" }}>

          {/* PAGE HEADING */}

          <div className="rp-page-head">
            <h2>Results &amp; Progress</h2>
            <p>
              Completion by subject, by student and by experiment. Sample
              data only; it resets on refresh.
            </p>
          </div>


          {/* TABS */}

          <div className="rp-tabs" role="tablist" aria-label="Results views">

            {TABS.map((item) => (

              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={`rp-tab ${tab === item.key ? "rp-tab--active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>

            ))}

          </div>

          {tab === "subject" && (
            <SubjectTab catalog={catalog} students={students} index={index} />
          )}

          {tab === "student" && (
            <StudentTab catalog={catalog} students={students} index={index} />
          )}

          {tab === "experiment" && (
            <ExperimentTab
              catalog={catalog}
              students={students}
              attempts={attempts}
              index={index}
            />
          )}

        </div>

      </main>

    </div>
  );
}


export default ResultProgress;