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

import "./ExperimentManagement.css";


/* Experiment availability and derived attempt statistics are backed by MySQL. */


/* =====================================================================
   1. CONSTANTS
===================================================================== */

// Same routes as the other admin pages / App.jsx.
const ROUTES = {
  dashboard: "/faculty-dashboard",
  students: "/student-management",
  experiments: "/experiment-management",
  results: "/result-progress",
  attendance: "/attendance",
  login: "/",
};

// Page of one experiment (same pattern the student side uses):
// DST experiment 4 -> /dst-experiment-4
const experimentPath = (subject, experiment) =>
  `/${subject.code.toLowerCase()}-experiment-${experiment.experiment_no}`;

const MENU_ITEMS = [
  { key: "dashboard",   label: "Dashboard",             icon: House },
  { key: "students",    label: "Student Management",    icon: UsersRound },
  { key: "experiments", label: "Experiment Management", icon: FlaskConical },
  { key: "results",     label: "Results & Progress",    icon: ChartColumn },
  { key: "attendance",  label: "Attendance",            icon: CalendarDays },
];

const DEFAULT_ERROR = "Something went wrong. Please try again.";

const STATUS_LABELS = {
  enabled: "Enabled",
  disabled: "Disabled",
  completed: "Completed",
  in_progress: "In progress",
  not_attempted: "Not attempted",
};

// Icon and colour of each subject (looked up by subjects.code).
const SUBJECT_STYLE = {
  DST: { icon: "📘", tone: "blue" },
  DTM: { icon: "🔌", tone: "orange" },
  DCN: { icon: "🌐", tone: "green" },
  IFS: { icon: "🔒", tone: "purple" },
};

const styleFor = (subject) =>
  SUBJECT_STYLE[subject.code] || { icon: "📘", tone: "blue" };

// Level 3 student filters. "not_completed" has no chip of its own: it is
// reached by clicking the Not Completed count on Level 2.
const STUDENT_FILTERS = {
  all: { label: "All Students", test: () => true },
  completed: { label: "Completed", test: (row) => row.status === "completed" },
  in_progress: { label: "In Progress", test: (row) => row.status === "in_progress" },
  not_attempted: { label: "Not Attempted", test: (row) => row.status === "not_attempted" },
  not_completed: { label: "Not Completed", test: (row) => row.status !== "completed" },
};

const FILTER_CHIPS = ["all", "completed", "in_progress", "not_attempted"];


/* =====================================================================
   2. DATA SOURCE  (faculty API)
   ---------------------------------------------------------------------
   Development-only snapshot based on the supplied labsim_admin_ready.sql:
   all 4 users, 4 subjects, 41 experiments, and 9 attempt records are retained.
   No extra students or attempts are fabricated. The requested target state
   specifies DST experiment 12 as disabled, but the available SQL files mark
   it enabled; reconcile that discrepancy before treating this as live data.
===================================================================== */

/* `users`. password_hash is intentionally absent: the UI never needs it.
   The admin row is here only to prove it is filtered out of the list.
   semester is an integer, as in the SQL (TINYINT). */
function useExperimentData() {
  const [data, setData] = useState({
    students: [],
    subjects: [],
    experiments: [],
    attempts: [],
  });
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiRequest("/faculty/overview"));
      setDataError("");
    } catch (requestError) {
      setDataError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => reload());
  }, [reload]);

  const setExperimentEnabled = useCallback(async (id, enabled) => {
    await apiRequest(`/faculty/experiments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
    setData((current) => ({
      ...current,
      experiments: current.experiments.map((experiment) =>
        Number(experiment.id) === Number(id) ? { ...experiment, enabled } : experiment
      ),
    }));
  }, []);

  return {
    users: data.students,
    subjects: data.subjects,
    experiments: data.experiments,
    attempts: data.attempts,
    setExperimentEnabled,
    reload,
    loading,
    error: dataError,
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

/* Eligible = a real student account (never the admin), account active,
   and the same semester as the subject. A missing semester means NOT
   eligible, so it can never inflate a count. */
const isEligibleStudent = (user, subject) => {

  const semester = toSemester(user.semester);

  return (
    user.role === "student" &&
    user.status === "active" &&
    semester !== null &&
    semester === toSemester(subject.semester)
  );
};

/* Roll number (natural order), then id. */
const compareStudents = (a, b) =>
  String(a.roll_no || "").localeCompare(String(b.roll_no || ""), undefined, {
    numeric: true,
  }) || Number(a.id) - Number(b.id);

/* Total / enabled / disabled experiments of one subject.
   Disabled experiments stay in the total. */
function countExperiments(subject) {

  const enabled = subject.experiments.filter((e) => Number(e.enabled) === 1 || e.enabled === true).length;

  return {
    total: subject.experiments.length,
    enabled,
    disabled: subject.experiments.length - enabled,
  };
}

/* Search matches the experiment title or its number. */
function matchesSearch(experiment, query) {

  const text = query.trim().toLowerCase();

  if (!text) return true;

  return (
    experiment.title.toLowerCase().includes(text) ||
    String(experiment.experiment_no).includes(text)
  );
}

function matchesStatus(experiment, statusFilter) {
  if (statusFilter === "enabled") return Number(experiment.enabled) === 1 || experiment.enabled === true;
  if (statusFilter === "disabled") return !(Number(experiment.enabled) === 1 || experiment.enabled === true);
  return true;
}

/* Group attempts by "studentId:experimentId" once, so every lookup is
   cheap. Attempts are copied, never mutated. */
function buildAttemptIndex(attempts) {

  const index = new Map();

  attempts.forEach((attempt) => {
    const key = `${Number(attempt.student_id)}:${Number(attempt.experiment_id)}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(attempt);
  });

  return index;
}

/* One student x one experiment.
   status       : completed | in_progress | not_attempted (derived).
                  A completed attempt wins over a newer unfinished one.
   attemptCount : number of attempt RECORDS
   bestScore    : highest score among COMPLETED attempts, quiz subjects
                  only; null when there is no valid score. */
function getRecord(index, studentId, experimentId, isQuiz) {

  const attempts = index.get(`${Number(studentId)}:${Number(experimentId)}`) || [];
  const completed = attempts.filter((a) => a.status === "completed");

  let status = "not_attempted";
  if (completed.length > 0) status = "completed";
  else if (attempts.length > 0) status = "in_progress";

  const best = isQuiz
    ? completed
        .filter((a) => a.score !== null && a.max_score !== null)
        .reduce((top, a) => (!top || a.score > top.score ? a : top), null)
    : null;

  return {
    status,
    attemptCount: attempts.length,
    bestScore: best ? best.score : null,
    maxScore: best ? best.max_score : null,
  };
}

/* Everything Levels 2 and 3 need for ONE experiment.
   rows         : one row per ELIGIBLE student (not per attempt)
   completed + inProgress + notAttempted = eligible
   notCompleted = inProgress + notAttempted
   attemptsRecorded counts every attempt record of the experiment, even
   from students who are no longer eligible, so history is never hidden. */
function buildExperimentStats(experiment, subject, students, attemptIndex, attempts) {

  const isQuiz = subject.assessment_type === "quiz";

  const rows = students
    .filter((student) => isEligibleStudent(student, subject))
    .sort(compareStudents)
    .map((student) => ({
      student,
      ...getRecord(attemptIndex, student.id, experiment.id, isQuiz),
    }));

  const count = (status) => rows.filter((r) => r.status === status).length;

  const completed = count("completed");
  const inProgress = count("in_progress");
  const notAttempted = count("not_attempted");

  return {
    rows,
    eligible: rows.length,
    completed,
    inProgress,
    notAttempted,
    notCompleted: inProgress + notAttempted,
    attemptsRecorded: attempts.filter((a) => Number(a.experiment_id) === Number(experiment.id))
      .length,
  };
}

/* "17/20" or the neutral placeholder. */
const formatScore = (record) =>
  record.bestScore === null || record.bestScore === undefined
    ? "—"
    : `${record.bestScore}/${record.maxScore}`;


/* =====================================================================
   5. SMALL UI COMPONENTS
===================================================================== */

function StatusBadge({ status }) {
  return (
    <span className={`em-badge em-badge--${String(status).replace(/_/g, "-")}`}>
      {STATUS_LABELS[status] || status}
    </span>
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
    <div className="em-modal-overlay" onMouseDown={onClose}>
      <div
        className="em-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="em-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="em-modal-close"
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

/* Heading + breadcrumb. crumbs: [{ label, onClick? }]; last = current page. */
function PageHead({ crumbs }) {

  return (
    <div className="em-page-head">

      <h2>Experiment Management</h2>

      <nav className="em-breadcrumb" aria-label="Breadcrumb">

        {crumbs.map((crumb, index) => {

          const isLast = index === crumbs.length - 1;

          return (
            <span key={crumb.label} className="em-crumb">

              {index > 0 && (
                <span className="em-crumb-sep" aria-hidden="true">/</span>
              )}

              {crumb.onClick && !isLast ? (
                <button type="button" className="em-link" onClick={crumb.onClick}>
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={isLast ? "em-crumb-current" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}

            </span>
          );
        })}

      </nav>

    </div>
  );
}


/* =====================================================================
   6A. LEVEL 1  -  SUBJECT OVERVIEW
   Cards and table are built from the same list, so numbers always match.
===================================================================== */

function SubjectOverview({ catalog, onSelect }) {

  const rows = catalog.map((subject) => ({
    subject,
    counts: countExperiments(subject),
  }));

  return (

    <>

      <PageHead crumbs={[{ label: "Admin" }, { label: "Experiment Management" }]} />

      {rows.length === 0 ? (

        <div className="em-card em-state">No subjects found.</div>

      ) : (

        <>

          <div className="em-cards">

            {rows.map(({ subject, counts }) => {

              const { icon, tone } = styleFor(subject);

              return (

                <div key={subject.id} className="em-card em-subject-card">

                  <div className="em-subject-top">
                    <span className={`em-icon em-icon--${tone}`} aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <strong className="em-subject-code">{subject.code}</strong>
                      <div className="em-subject-name">{subject.name}</div>
                    </div>
                  </div>

                  <div className="em-subject-sem">Semester {subject.semester}</div>

                  <div className="em-subject-numbers">
                    <span><b>{counts.total}</b> Total</span>
                    <span><b>{counts.enabled}</b> Enabled</span>
                    <span><b>{counts.disabled}</b> Disabled</span>
                  </div>

                  <button
                    type="button"
                    className="em-btn em-btn--outline em-full"
                    onClick={() => onSelect(subject.id)}
                  >
                    View Experiments
                  </button>

                </div>
              );
            })}

          </div>

          <section className="em-card">

            <div className="em-table-wrap">

              <table className="em-table">

                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Semester</th>
                    <th>Total Experiments</th>
                    <th>Enabled</th>
                    <th>Disabled</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {rows.map(({ subject, counts }) => (

                    <tr key={subject.id}>
                      <td className="em-strong">
                        {subject.code} - {subject.name}
                      </td>
                      <td>{subject.semester}</td>
                      <td>{counts.total}</td>
                      <td>{counts.enabled}</td>
                      <td>{counts.disabled}</td>
                      <td>
                        <button
                          type="button"
                          className="em-btn em-btn--primary"
                          onClick={() => onSelect(subject.id)}
                        >
                          View Experiments
                        </button>
                      </td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </>

      )}

    </>
  );
}


/* =====================================================================
   6B. LEVEL 2  -  EXPERIMENTS OF ONE SUBJECT
===================================================================== */

function ExperimentList({
  data,
  subjectId,
  search,
  statusFilter,
  onSearch,
  onStatusFilter,
  onBack,
  onOpen,
  onToggle,
  busyId,
  error,
}) {

  const { catalog, students, attempts, attemptIndex } = data;

  const subject = catalog.find((item) => Number(item.id) === Number(subjectId));

  // Numbers for EVERY experiment of the subject. Search and status filter
  // are applied afterwards, so they can never change the counts.
  const allRows = useMemo(
    () =>
      subject
        ? subject.experiments.map((experiment) => ({
            experiment,
            stats: buildExperimentStats(
              experiment,
              subject,
              students,
              attemptIndex,
              attempts
            ),
          }))
        : [],
    [subject, students, attemptIndex, attempts]
  );

  if (!subject) {
    return (
      <>
        <PageHead crumbs={[{ label: "Admin" }, { label: "Experiment Management" }]} />
        <div className="em-card em-state">Subject not found.</div>
      </>
    );
  }

  const rows = allRows.filter(
    ({ experiment }) =>
      matchesSearch(experiment, search) &&
      matchesStatus(experiment, statusFilter)
  );

  const counts = countExperiments(subject);
  const { icon, tone } = styleFor(subject);
  const subjectLabel = `${subject.code} - ${subject.name}`;

  return (

    <>

      <PageHead
        crumbs={[
          { label: "Admin" },
          { label: "Experiment Management", onClick: onBack },
          { label: subjectLabel },
        ]}
      />

      <button type="button" className="em-btn em-btn--primary em-back" onClick={onBack}>
        ← Back to Subjects
      </button>

      <section className="em-card">

        {/* SUBJECT SUMMARY */}

        <div className="em-head">

          <span className={`em-icon em-icon--lg em-icon--${tone}`} aria-hidden="true">
            {icon}
          </span>

          <div>
            <h3 className="em-head-title">{subjectLabel}</h3>
            <p className="em-meta">
              <span>Semester {subject.semester}</span>
              <span>Total Experiments: {counts.total}</span>
              <span>Enabled: {counts.enabled}</span>
              <span>Disabled: {counts.disabled}</span>
            </p>
          </div>

        </div>

        {/* SEARCH + STATUS FILTER */}

        <div className="em-toolbar">

          <input
            type="search"
            className="em-input em-input--grow"
            placeholder="Search by experiment name or number"
            aria-label="Search experiments"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />

          <select
            className="em-select"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => onStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

        </div>

        {error && <div className="em-alert">{error}</div>}

        {/* EXPERIMENT TABLE */}

        <div className="em-table-wrap">

          <table className="em-table">

            <thead>
              <tr>
                <th>Experiment No.</th>
                <th>Experiment Name</th>
                <th>Completed</th>
                <th>Not Completed</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {rows.length === 0 ? (

                <tr>
                  <td colSpan="7" className="em-empty">
                    {allRows.length === 0
                      ? "This subject has no experiments."
                      : "No experiments match your search."}
                  </td>
                </tr>

              ) : (

                rows.map(({ experiment, stats }) => (

                  <tr
                    key={experiment.id}
                    className={experiment.enabled ? "" : "em-muted-row"}
                  >

                    <td>{experiment.experiment_no}</td>

                    <td className="em-name">{experiment.title}</td>

                    {/* Completed = unique students with a completed attempt */}
                    <td>
                      <button
                        type="button"
                        className="em-count em-count--ok"
                        onClick={() => onOpen(experiment.id, "completed")}
                      >
                        {stats.completed} / {stats.eligible}
                      </button>
                    </td>

                    {/* Not Completed = In Progress + Not Attempted */}
                    <td>
                      <button
                        type="button"
                        className="em-count em-count--warn"
                        onClick={() => onOpen(experiment.id, "not_completed")}
                      >
                        {stats.notCompleted} / {stats.eligible}
                      </button>
                    </td>

                    {/* Attempts = every attempt record (repeats included) */}
                    <td>
                      <span
                        className="em-count em-count--static"
                        title="Raw attempt records, including historical attempts from inactive students"
                        aria-label={`${stats.attemptsRecorded} attempt records`}
                      >
                        {stats.attemptsRecorded}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={experiment.enabled ? "enabled" : "disabled"} />
                    </td>

                    <td>
                      <div className="em-row-actions">

                        <button
                          type="button"
                          className="em-btn em-btn--outline"
                          onClick={() => onOpen(experiment.id, "all")}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className={`em-btn ${
                            experiment.enabled ? "em-btn--danger" : "em-btn--success"
                          }`}
                          disabled={busyId === experiment.id}
                          onClick={() => onToggle(experiment)}
                        >
                          {experiment.enabled ? "Disable" : "Enable"}
                        </button>

                      </div>
                    </td>

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
   6C. LEVEL 3  -  ONE EXPERIMENT
   One row per eligible student (never per attempt).
   Completed + In Progress + Not Attempted = eligible students.
===================================================================== */

function ExperimentDetail({
  data,
  subjectId,
  experimentId,
  studentFilter,
  onFilter,
  onBackToList,
  onBackToSubjects,
  onOpenExperiment,
}) {

  const { catalog, students, attempts, attemptIndex } = data;

  const subject = catalog.find((item) => Number(item.id) === Number(subjectId));

  const experiment = subject
    ? subject.experiments.find((item) => Number(item.id) === Number(experimentId))
    : null;

  const stats = useMemo(
    () =>
      subject && experiment
        ? buildExperimentStats(experiment, subject, students, attemptIndex, attempts)
        : null,
    [subject, experiment, students, attemptIndex, attempts]
  );

  if (!subject || !experiment || !stats) {
    return (
      <>
        <PageHead crumbs={[{ label: "Admin" }, { label: "Experiment Management" }]} />
        <div className="em-card em-state">Experiment not found.</div>
      </>
    );
  }

  const subjectLabel = `${subject.code} - ${subject.name}`;

  // Quiz subjects (DST, IFS) show a score; completion subjects do not.
  const showScore = subject.assessment_type === "quiz";

  const countOf = (key) => stats.rows.filter(STUDENT_FILTERS[key].test).length;

  const visibleRows = stats.rows.filter(STUDENT_FILTERS[studentFilter].test);

  const emptyMessage =
    stats.eligible === 0
      ? "No eligible students are currently available for this subject."
      : "No students found for this status.";

  return (

    <>

      <PageHead
        crumbs={[
          { label: "Admin" },
          { label: "Experiment Management", onClick: onBackToSubjects },
          { label: subjectLabel, onClick: onBackToList },
          { label: `Experiment ${experiment.experiment_no}` },
        ]}
      />

      <div className="em-detail-bar">

        <button type="button" className="em-btn em-btn--primary" onClick={onBackToList}>
          ← Back to Experiments
        </button>

        {/* Opens the experiment itself (the simulator page) */}
        <button
          type="button"
          className="em-btn em-btn--outline"
          onClick={() => onOpenExperiment(subject, experiment)}
        >
          Open Experiment ↗
        </button>

      </div>

      {/* EXPERIMENT HEADER */}

      <section className="em-card">

        <div className="em-head-row">
          <h3 className="em-head-title">{experiment.title}</h3>
          <StatusBadge status={experiment.enabled ? "enabled" : "disabled"} />
        </div>

        <p className="em-meta">
          <span>Experiment No. {experiment.experiment_no}</span>
          <span>{subject.code}</span>
          <span>Semester {subject.semester}</span>
        </p>

        {experiment.description && (
          <p className="em-description">{experiment.description}</p>
        )}

      </section>

      {/* THREE STATUS CARDS */}

      <div className="em-status-cards">

        <div className="em-card em-status-card em-status-card--ok">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="em-card em-status-card em-status-card--progress">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>

        <div className="em-card em-status-card em-status-card--none">
          <span>Not Attempted</span>
          <strong>{stats.notAttempted}</strong>
        </div>

      </div>

      {/* STUDENT PROGRESS */}

      <section className="em-card">

        <h3 className="em-section-title">Student Progress</h3>

        <div className="em-chips">

          {FILTER_CHIPS.map((key) => (

            <button
              key={key}
              type="button"
              className={`em-chip ${studentFilter === key ? "em-chip--active" : ""}`}
              aria-pressed={studentFilter === key}
              onClick={() => onFilter(key)}
            >
              {STUDENT_FILTERS[key].label} ({countOf(key)})
            </button>

          ))}

        </div>

        {studentFilter !== "all" && (
          <p className="em-showing">
            Showing: <strong>{STUDENT_FILTERS[studentFilter].label}</strong>
            {" · "}
            <button type="button" className="em-link" onClick={() => onFilter("all")}>
              All Students
            </button>
          </p>
        )}

        <div className="em-table-wrap">

          <table className="em-table">

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Attempts</th>
                {showScore && <th>Best Score</th>}
              </tr>
            </thead>

            <tbody>

              {visibleRows.length === 0 ? (

                <tr>
                  <td colSpan={showScore ? 6 : 5} className="em-empty">
                    {emptyMessage}
                  </td>
                </tr>

              ) : (

                visibleRows.map((row) => (

                  <tr key={row.student.id}>
                    <td>{row.student.roll_no || "—"}</td>
                    <td className="em-strong">{row.student.name}</td>
                    <td>{toSemester(row.student.semester) ?? "—"}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.attemptCount}</td>
                    {showScore && <td>{formatScore(row)}</td>}
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
   6D. MAIN PAGE  -  header, menu, navigation, enable / disable
===================================================================== */

function ExperimentManagement() {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const {
    users,
    subjects,
    experiments,
    attempts,
    setExperimentEnabled,
    reload,
    loading: dataLoading,
    error: dataError,
  } = useExperimentData();


  /* ----- derived data (never stored in state) ----- */

  // Student accounts only; the admin user is never listed or counted.
  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
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

  const attemptIndex = useMemo(() => buildAttemptIndex(attempts), [attempts]);

  const data = { catalog, students, attempts, attemptIndex };


  /* ----- UI state ----- */

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // Which level is showing (stable ids, never array positions)
  const [subjectId, setSubjectId] = useState(null);
  const [experimentId, setExperimentId] = useState(null);

  // Level 2 filters live here so they survive "Back to Experiments"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Level 3 student filter
  const [studentFilter, setStudentFilter] = useState("all");

  // Enable / disable
  const [pendingDisable, setPendingDisable] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");


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

  const openExperimentPage = (subject, experiment) =>
    navigate(experimentPath(subject, experiment));

  const handleLogout = () => {
    signOut();
    setMenuOpen(false);
    navigate(ROUTES.login);
  };


  /* ----- navigation ----- */

  const openSubject = (id) => {
    // A different subject starts with clean filters
    if (id !== subjectId) {
      setSearch("");
      setStatusFilter("all");
    }
    setSubjectId(id);
    setExperimentId(null);
    setError("");
  };

  const openExperiment = (id, filter) => {
    setExperimentId(id);
    setStudentFilter(filter);
    setError("");
  };

  const backToSubjects = () => {
    setSubjectId(null);
    setExperimentId(null);
    setError("");
  };

  const backToExperiments = () => {
    setExperimentId(null);
    setError("");
  };


  /* ----- enable / disable -----
     Only the `enabled` flag changes; nothing is deleted. If saving fails,
     the old state stays and the error is shown. */

  const saveEnabled = async (experiment) => {

    if (busyId !== null) return; // ignore double clicks while saving

    setBusyId(experiment.id);
    setError("");

    try {

      await setExperimentEnabled(experiment.id, !experiment.enabled);
      await reload();
      setPendingDisable(null);

    } catch (err) {

      setError(err.message || DEFAULT_ERROR);

    } finally {

      setBusyId(null);

    }
  };

  // Enabling is immediate; disabling asks for confirmation first
  const handleToggle = (experiment) => {

    setError("");

    if (experiment.enabled) {
      setPendingDisable(experiment);
    } else {
      saveEnabled(experiment);
    }
  };

  const cancelDisable = useCallback(() => {
    setPendingDisable(null);
    setError("");
  }, []);

  const pendingSubject = pendingDisable
    ? catalog.find((s) => Number(s.id) === Number(pendingDisable.subject_id))
    : null;


  /* ----- render ----- */

  return (
    <div className="em-container">

      {dataLoading && <p role="status">Loading experiment records…</p>}
      {dataError && <p role="alert">{dataError}</p>}

      {/* HEADER: hamburger | Lab Simulator | Admin */}

      <header className="em-header">

        <button
          ref={toggleRef}
          type="button"
          className="em-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="em-side-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <h1 className="em-brand">Lab Simulator</h1>

        <div className="em-user">
          <div className="em-user-text">
            <strong>Admin</strong>
          </div>
          <div className="em-avatar" role="img" aria-label="Admin profile">A</div>
        </div>

      </header>


      {/* FLOATING MENU */}

      {menuOpen && (

        <nav
          ref={menuRef}
          id="em-side-menu"
          className="em-menu"
          aria-label="Admin menu"
        >

          {MENU_ITEMS.map((item) => {

            const active = item.key === "experiments";

            return (
              <button
                key={item.key}
                type="button"
                className={`em-menu-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(ROUTES[item.key])}
              >
                <span className="em-menu-icon" aria-hidden="true">
                  <item.icon size={22} strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="em-menu-divider" />

          <button type="button" className="em-menu-item logout" onClick={handleLogout}>
            <span className="em-menu-icon" aria-hidden="true">
              <LogOut size={22} strokeWidth={2} />
            </span>
            <span>Logout</span>
          </button>

        </nav>

      )}


      <main className="em-content">

        <div className="em-page">

          {subjectId === null ? (

            <SubjectOverview catalog={catalog} onSelect={openSubject} />

          ) : experimentId === null ? (

            <ExperimentList
              data={data}
              subjectId={subjectId}
              search={search}
              statusFilter={statusFilter}
              onSearch={setSearch}
              onStatusFilter={setStatusFilter}
              onBack={backToSubjects}
              onOpen={openExperiment}
              onToggle={handleToggle}
              busyId={busyId}
              error={pendingDisable ? "" : error}
            />

          ) : (

            <ExperimentDetail
              data={data}
              subjectId={subjectId}
              experimentId={experimentId}
              studentFilter={studentFilter}
              onFilter={setStudentFilter}
              onBackToList={backToExperiments}
              onBackToSubjects={backToSubjects}
              onOpenExperiment={openExperimentPage}
            />

          )}

        </div>

      </main>


      {/* DISABLE CONFIRMATION */}

      {pendingDisable && (

        <Modal title="Disable Experiment" onClose={cancelDisable}>

          <p className="em-confirm-text">
            Are you sure you want to disable this experiment? Students will not
            be able to start new attempts. Existing in-progress attempts may be
            completed, and all past attempts and results will remain available
            in history.
          </p>

          <div className="em-confirm-card">
            <strong>{pendingDisable.title}</strong>
            <span>
              Subject: {pendingSubject ? pendingSubject.code : "—"}
              {"  |  "}
              Experiment No.: {pendingDisable.experiment_no}
            </span>
          </div>

          {error && <div className="em-alert">{error}</div>}

          <div className="em-modal-actions">

            <button type="button" className="em-btn em-btn--ghost" onClick={cancelDisable}>
              Cancel
            </button>

            <button
              type="button"
              className="em-btn em-btn--danger-solid"
              disabled={busyId === pendingDisable.id}
              onClick={() => saveEnabled(pendingDisable)}
            >
              {busyId === pendingDisable.id ? "Please wait…" : "Disable"}
            </button>

          </div>

        </Modal>

      )}

    </div>
  );
}


export default ExperimentManagement;