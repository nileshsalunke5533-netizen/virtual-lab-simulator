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

import "./FacultyDashboard.css";


/* Faculty dashboard aggregates live student, experiment, and attempt data from the API. */


/* =====================================================================
   1. ROUTES  (set a path as soon as the page is connected in App.jsx)
   These match the routes already used by FacultyMenu / App.jsx.
   ===================================================================== */
const ROUTES = {
  dashboard: "/faculty-dashboard",
  students: "/student-management",       // Active Students card + menu
  experiments: "/experiment-management",
  results: "/result-progress",
  attendance: "/attendance",                      // future-scope module
  login: "/",                            // where Logout goes
};


/* =====================================================================
   2. DATA SOURCE  (faculty API)
   ---------------------------------------------------------------------
   Used only until the API is connected. Remove these constants and fill
   useDashboardData() with real responses.
   ===================================================================== */

/* `users` table, role = 'student'.  semester is 3 or 4 (SRS).
   Isha Pawar is 'inactive' (disabled): she is excluded from every count
   and percentage, but her attempts stay visible in the history table. */
function useDashboardData() {
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

  return { ...data, loading, error };
}


/* =====================================================================
   4. CALCULATIONS  (pure functions - no React, easy to test)
   ===================================================================== */

/* Q1: students whose account is active. */
const getActiveStudents = (students) =>
  students.filter((student) => student.status === "active");

/* Attempts card: every attempt, all subjects and students combined
   (including disabled students / disabled experiments - history is kept). */
const getTotalAttempts = (attempts) => attempts.length;

/* Percentage rounded to a whole number; 0 when nothing is required. */
const calcPercentage = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/* Q2, Q4, Q5: one entry per subject.
   requirements          = eligible students x enabled experiments
   completedRequirements = pairs (student, experiment) with >= 1 completed
                           attempt - counted once however many attempts. */
function buildSubjectProgress(subjects, experiments, students, attempts) {

  const active = getActiveStudents(students);

  // "studentId:experimentId" for every pair that has a completed attempt
  const completedPairs = new Set(
    attempts
      .filter((attempt) => attempt.status === "completed")
      .map((attempt) => `${attempt.student_id}:${attempt.experiment_id}`)
  );

  return subjects.map((subject) => {

    const subjectExperiments = experiments.filter(
      (experiment) => experiment.subject_id === subject.id
    );

    const enabled = subjectExperiments.filter((experiment) => experiment.enabled);

    const eligible = active.filter(
      (student) => student.semester === subject.semester
    );

    let completedRequirements = 0;

    eligible.forEach((student) => {
      enabled.forEach((experiment) => {
        if (completedPairs.has(`${student.id}:${experiment.id}`)) {
          completedRequirements += 1;
        }
      });
    });

    const requirements = eligible.length * enabled.length;

    return {
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      totalExperiments: subjectExperiments.length,
      enabledExperiments: enabled.length,
      eligibleStudents: eligible.length,
      requirements,
      completedRequirements,
      percent: calcPercentage(completedRequirements, requirements),
    };
  });
}

/* Attempt-history table rows, newest first. Joins attempt -> student and
   experiment -> subject. Score is shown only for a completed attempt of a
   quiz subject. */
function buildAttemptHistory(attempts, students, experiments, subjects) {

  const studentById = new Map(students.map((s) => [s.id, s]));
  const experimentById = new Map(experiments.map((e) => [e.id, e]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  return [...attempts]
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    .map((attempt) => {

      const student = studentById.get(attempt.student_id);
      const experiment = experimentById.get(attempt.experiment_id);
      const subject = experiment ? subjectById.get(experiment.subject_id) : null;

      const hasScore =
        attempt.status === "completed" &&
        attempt.score !== null &&
        attempt.max_score !== null;

      return {
        id: attempt.id,
        studentName: student ? student.name : "Unknown student",
        rollNo: student ? student.roll_no : "-",
        subjectCode: subject ? subject.code : "-",
        experimentLabel: experiment
          ? `Exp ${experiment.experiment_no}`
          : "-",
        attemptNumber: attempt.attempt_number,
        status: attempt.status,
        quiz: subject?.assessment_type === "quiz",
        score: hasScore ? `${attempt.score} / ${attempt.max_score}` : "—",
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
      };
    });
}

/* UTC (as stored) -> IST for display. */
const formatDateTime = (value) =>
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

const STATUS_LABEL = { completed: "Completed", in_progress: "In progress" };


/* =====================================================================
   5. MENU ITEMS  (floating menu under the hamburger button)
   `key` points into ROUTES; a null route shows a notice instead.
   ===================================================================== */
const MENU_ITEMS = [
  { key: "dashboard",   label: "Dashboard",             icon: House },
  { key: "students",    label: "Student Management",    icon: UsersRound },
  { key: "experiments", label: "Experiment Management", icon: FlaskConical },
  { key: "results",     label: "Results & Progress",    icon: ChartColumn },
  { key: "attendance",  label: "Attendance",            icon: CalendarDays },
];


/* =====================================================================
   6. THE SCREEN
   ===================================================================== */

const FacultyDashboard = ({ onLogout }) => {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { students, subjects, experiments, attempts, loading, error } =
    useDashboardData();

  const [menuOpen, setMenuOpen] = useState(false);


  // =====================================
  // DASHBOARD DATA  (all numbers come from the calculation functions)
  // =====================================

  const dashboardData = useMemo(() => ({

    totalStudents: students.length,

    // Q1
    activeStudents: getActiveStudents(students).length,

    totalAttempts: getTotalAttempts(attempts),

    // Q2, Q4, Q5
    subjects: buildSubjectProgress(subjects, experiments, students, attempts),

    // rows of the attempt-history table
    history: buildAttemptHistory(attempts, students, experiments, subjects),

  }), [students, subjects, experiments, attempts]);


  // =====================================
  // STAT CARDS  (same pattern as the old FacultyDashboard)
  // =====================================

  const statCards = [

    {
      key: "students",
      label: "Active Students",
      value: dashboardData.activeStudents,
      hint: `of ${dashboardData.totalStudents} registered students`,
      icon: "👥",
      action: "View student records",
      path: ROUTES.students,
      pathLabel: "Student Management"
    },

    {
      key: "attempts",
      label: "Total Attempts",
      value: dashboardData.totalAttempts,
      hint: "all subjects and students combined",
      icon: "📋",
      action: "View attempt history",
      opensHistory: true
    }

  ];


  // =====================================
  // ATTEMPT HISTORY (modal) STATE
  // =====================================

  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const openedFromRef = useRef(null);     // element to focus again on close
  const closeButtonRef = useRef(null);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    openedFromRef.current?.focus();
  }, []);

  const filteredHistory = useMemo(() => {

    const query = search.trim().toLowerCase();

    return dashboardData.history.filter((row) => {

      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (subjectFilter !== "all" && row.subjectCode !== subjectFilter) return false;
      if (!query) return true;

      return (
        row.studentName.toLowerCase().includes(query) ||
        row.rollNo.toLowerCase().includes(query) ||
        row.subjectCode.toLowerCase().includes(query) ||
        row.experimentLabel.toLowerCase().includes(query)
      );
    });

  }, [dashboardData.history, search, statusFilter, subjectFilter]);


  // =====================================
  // NOTICE (toast) for pages that are not connected yet
  // =====================================

  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);


  // =====================================
  // MENU: close on outside click and Escape
  // =====================================

  const menuRef = useRef(null);
  const toggleRef = useRef(null);

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

    document.addEventListener("mousedown", onClick);

    return () => document.removeEventListener("mousedown", onClick);

  }, [menuOpen]);


  // Escape closes the modal first, then the menu
  useEffect(() => {

    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (historyOpen) closeHistory();
      else setMenuOpen(false);
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);

  }, [historyOpen, closeHistory]);


  // Stop the page behind the modal from scrolling
  useEffect(() => {
    document.body.style.overflow = historyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [historyOpen]);

  useEffect(() => {
    if (historyOpen) closeButtonRef.current?.focus();
  }, [historyOpen]);


  // =====================================
  // ACTIONS
  // =====================================

  // Go to a page, or tell the user it is not connected yet
  const goTo = (path, label) => {

    setMenuOpen(false);

    if (!path) {
      setNotice(`${label} is not connected yet.`);
      return;
    }

    navigate(path);
  };

  const handleStatClick = (card, event) => {

    if (card.opensHistory) {
      openedFromRef.current = event.currentTarget;
      setHistoryOpen(true);
      return;
    }

    goTo(card.path, card.pathLabel);
  };

  const handleLogout = () => {

    signOut();

    if (onLogout) onLogout();

    navigate(ROUTES.login);
  };


  return (

    <div className="faculty-dashboard-container">


      {/* =================================
          HEADER
      ================================= */}

      <header className="faculty-dashboard-header">


        {/* Hamburger Menu */}

        <button
          ref={toggleRef}
          type="button"
          className="faculty-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="faculty-side-menu"
        >
          ☰
        </button>


        {/* Logo / Title */}

        <div className="faculty-header-logo">

          <h1>
            Lab Simulator
          </h1>

        </div>


        {/* User */}

        <div className="faculty-header-user">

          <div className="faculty-user-avatar">
            A
          </div>

          <div className="faculty-user-info">

            <p className="faculty-user-name">
              Admin
            </p>

            <p className="faculty-user-role">
              Faculty
            </p>

          </div>

        </div>

      </header>


      {/* =================================
          FLOATING MENU
      ================================= */}

      {menuOpen && (

        <nav
          ref={menuRef}
          id="faculty-side-menu"
          className="faculty-side-menu"
          aria-label="Admin menu"
        >

          {MENU_ITEMS.map((item) => {

            const active = item.key === "dashboard";

            return (

              <button
                key={item.key}
                type="button"
                className={`faculty-menu-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(ROUTES[item.key], item.label)}
              >

                <span className="faculty-menu-icon">
                  <item.icon size={22} strokeWidth={2} />
                </span>

                <span className="faculty-menu-label">{item.label}</span>

                {item.tag && (
                  <span className="faculty-menu-tag">{item.tag}</span>
                )}

              </button>

            );
          })}

          <div className="faculty-menu-divider" />

          <button
            type="button"
            className="faculty-menu-item logout"
            onClick={handleLogout}
          >
            <span className="faculty-menu-icon">
              <LogOut size={22} strokeWidth={2} />
            </span>
            <span className="faculty-menu-label">Logout</span>
          </button>

        </nav>

      )}


      {/* =================================
          PAGE CONTENT
      ================================= */}

      <main className="faculty-page-content">


        {/* =================================
            WELCOME
        ================================= */}

        <section className="faculty-welcome-section">

          <h2>
            Dashboard
          </h2>

          <p>
            Welcome back, <strong>Admin</strong>.
            Here's an overview of student accounts, experiment attempts
            and how far each subject has progressed.
          </p>

        </section>


        {loading && (
          <div className="faculty-state">Loading dashboard…</div>
        )}

        {error && (
          <div className="faculty-state error">{error}</div>
        )}

        {!loading && !error && (
          <>

            {/* =================================
                OVERVIEW  (Active students + Total attempts)
            ================================= */}

            <section className="faculty-overview-section">

              <h3>
                Overview
              </h3>

              <p className="faculty-section-subtitle">
                Quick overview of students and experiment attempts.
              </p>

              <div className="faculty-stats-grid">

                {statCards.map((card) => (

                  <button
                    key={card.key}
                    type="button"
                    className="faculty-stat-card"
                    aria-haspopup={card.opensHistory ? "dialog" : undefined}
                    onClick={(event) => handleStatClick(card, event)}
                  >

                    {/* Icon */}

                    <div className="faculty-stat-icon-container">

                      <span className="faculty-stat-icon">
                        {card.icon}
                      </span>

                    </div>

                    {/* Content */}

                    <div className="faculty-stat-content">

                      <p className="faculty-stat-label">
                        {card.label}
                      </p>

                      <p className="faculty-stat-value">
                        {card.value}
                      </p>

                      <p className="faculty-stat-hint">
                        {card.hint}
                      </p>

                      <span className="faculty-stat-action">
                        {card.action} →
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            </section>


            {/* =================================
                SUBJECT PROGRESS  (Q2, Q4, Q5)
            ================================= */}

            <section className="faculty-results-section">

              <div className="faculty-section-head">

                <div>

                  <h3>
                    Subject Progress
                  </h3>

                  <p className="faculty-section-subtitle">
                    Completion across enabled experiments
                  </p>

                </div>

                <button
                  type="button"
                  className="faculty-link-btn"
                  onClick={() => goTo(ROUTES.results, "Results & Progress")}
                >
                  Detailed results →
                </button>

              </div>


              <ul className="faculty-subject-list">

                {dashboardData.subjects.map((subject) => (

                  <li key={subject.code} className="faculty-subject-row">

                    {/* Subject + semester */}

                    <div className="faculty-subject-id">

                      <strong>{subject.code}</strong>

                      <span className="faculty-chip">
                        Semester {subject.semester}
                      </span>

                      <span className="faculty-subject-name">
                        {subject.name}
                      </span>

                    </div>

                    {/* Progress bar */}

                    <div
                      className="faculty-progress-bar-container"
                      role="progressbar"
                      aria-label={`${subject.code} completion`}
                      aria-valuenow={subject.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >

                      <div
                        className="faculty-progress-segment completed"
                        style={{ width: `${subject.percent}%` }}
                      />

                    </div>

                    {/* Experiments + completed count */}

                    <div className="faculty-subject-count">

                      <strong>Experiments: {subject.totalExperiments}</strong>

                      <span>
                        {subject.completedRequirements} / {subject.requirements} completed
                      </span>

                      {subject.enabledExperiments < subject.totalExperiments && (
                        <small>
                          {subject.totalExperiments - subject.enabledExperiments} disabled
                        </small>
                      )}

                    </div>

                    {/* Percentage */}

                    <div className="faculty-subject-percent">
                      {subject.percent}%
                    </div>

                  </li>

                ))}

              </ul>

              <p className="faculty-note">
                ℹ️ Progress is calculated from completed student-experiment
                requirements (eligible students × enabled experiments).
                Disabled experiments and disabled students are excluded
                from the calculation.
              </p>

            </section>

          </>
        )}

      </main>


      {/* =================================
          ATTEMPT HISTORY (modal)
      ================================= */}

      {historyOpen && (

        <div className="faculty-modal-overlay" onMouseDown={closeHistory}>

          <div
            className="faculty-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-history-title"
            onMouseDown={(event) => event.stopPropagation()}
          >

            <div className="faculty-modal-head">

              <div>

                <h3 id="faculty-history-title">
                  Attempt History
                </h3>

                <p className="faculty-section-subtitle">
                  Every attempt, newest first. Scores appear only for subjects
                  with a quiz (DST, DTM); DCN and IFS record completion only.
                </p>

              </div>

              <button
                type="button"
                ref={closeButtonRef}
                className="faculty-modal-close"
                aria-label="Close attempt history"
                onClick={closeHistory}
              >
                ✕
              </button>

            </div>


            {/* Filters */}

            <div className="faculty-filters">

              <input
                type="search"
                className="faculty-search"
                placeholder="Search student, roll no. or experiment"
                aria-label="Search attempts"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                aria-label="Filter by subject"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                <option value="all">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.code}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In progress</option>
              </select>

            </div>

            <p className="faculty-count">
              Showing {filteredHistory.length} of {dashboardData.history.length} attempts
            </p>


            {/* Table */}

            <div className="faculty-table-wrap">

              <table className="faculty-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll no.</th>
                    <th>Subject</th>
                    <th>Experiment</th>
                    <th>Attempt</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Started (IST)</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredHistory.map((row) => (

                    <tr key={row.id}>

                      <td data-label="Student"><strong>{row.studentName}</strong></td>
                      <td data-label="Roll no.">{row.rollNo}</td>
                      <td data-label="Subject">{row.subjectCode}</td>
                      <td data-label="Experiment">{row.experimentLabel}</td>
                      <td data-label="Attempt">#{row.attemptNumber}</td>

                      <td data-label="Status">
                        <span className={`faculty-badge ${row.status}`}>
                          {STATUS_LABEL[row.status] || row.status}
                        </span>
                      </td>

                      <td
                        data-label="Score"
                        title={row.quiz ? "" : "This subject records completion only"}
                      >
                        {row.score}
                      </td>

                      <td data-label="Started">{formatDateTime(row.startedAt)}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {filteredHistory.length === 0 && (
                <p className="faculty-empty">
                  No attempts match these filters.
                </p>
              )}

            </div>

          </div>

        </div>

      )}


      {/* =================================
          NOTICE (toast)
      ================================= */}

      {notice && (
        <div className="faculty-toast" role="status" aria-live="polite">
          {notice}
        </div>
      )}

    </div>

  );

};


export default FacultyDashboard;