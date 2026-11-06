import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Attendance.css";

function localDateValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function Attendance() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(localDateValue);
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ subjects: [], records: [], progress: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      date: selectedDate,
      subject: selectedSubject,
    });
    apiRequest(`/faculty/attendance?${params}`)
      .then((response) => {
        if (!active) return;
        setData(response);
        setError("");
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
  }, [selectedDate, selectedSubject, refreshVersion]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.records.filter((student) =>
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.roll_no.toLowerCase().includes(query)
    );
  }, [data.records, search]);

  const presentStudents = filteredAttendance.filter(
    (student) => student.status === "Present"
  ).length;
  const absentStudents = filteredAttendance.filter(
    (student) => student.status === "Absent"
  ).length;
  const attendancePercentage =
    filteredAttendance.length > 0
      ? Math.round((presentStudents / filteredAttendance.length) * 100)
      : 0;

  const updateAttendance = async (student, status) => {
    setSavingStudentId(student.student_id);
    setError("");
    try {
      await apiRequest(`/faculty/attendance/${student.student_id}`, {
        method: "PUT",
        body: JSON.stringify({
          subjectCode: student.subject_code,
          date: selectedDate,
          status,
        }),
      });
      setRefreshVersion((version) => version + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingStudentId(null);
    }
  };

  const exportReport = () => {
    const rows = [
      ["Roll No.", "Student Name", "Subject", "Date", "Status"],
      ...filteredAttendance.map((student) => [
        student.roll_no,
        student.name,
        student.subject_code,
        selectedDate,
        student.status || "Not marked",
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `labsim-attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <button
            className="attendance-back-btn"
            type="button"
            onClick={() => navigate("/faculty-dashboard")}
          >
            ← Faculty Dashboard
          </button>
          <h1>Attendance Management</h1>
          <p>Manage and monitor student attendance</p>
        </div>
        <button className="export-btn" type="button" onClick={exportReport}>
          Export Report
        </button>
      </div>

      {error && <p className="attendance-error" role="alert">{error}</p>}

      <div className="attendance-summary">
        <div className="summary-card">
          <div className="summary-icon total-icon">👥</div>
          <div><h3>{filteredAttendance.length}</h3><p>Total Students</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon present-icon">✓</div>
          <div><h3>{presentStudents}</h3><p>Present Today</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon absent-icon">✕</div>
          <div><h3>{absentStudents}</h3><p>Absent Today</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon percentage-icon">%</div>
          <div><h3>{attendancePercentage}%</h3><p>Attendance</p></div>
        </div>
      </div>

      <div className="attendance-filter">
        <div className="filter-group">
          <label htmlFor="attendance-date">Date</label>
          <input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="attendance-subject">Subject</label>
          <select
            id="attendance-subject"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            <option value="ALL">All Subjects</option>
            {data.subjects.map((subject) => (
              <option key={subject.id} value={subject.code}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group search-group">
          <label htmlFor="attendance-search">Search Student</label>
          <input
            id="attendance-search"
            type="search"
            placeholder="Search name or roll number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="attendance-container">
        <div className="table-header">
          <div>
            <h2>Attendance Records</h2>
            <p>Showing attendance for {selectedDate}</p>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Sr. No.</th><th>Roll No.</th><th>Student Name</th>
                <th>Subject</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="no-data">Loading attendance…</td></tr>
              ) : filteredAttendance.length ? (
                filteredAttendance.map((student, index) => (
                  <tr key={`${student.student_id}-${student.subject_id}`}>
                    <td>{index + 1}</td>
                    <td><strong>{student.roll_no}</strong></td>
                    <td>
                      <div className="student-name">
                        <div className="student-avatar">{student.name.charAt(0)}</div>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td><span className="subject-badge">{student.subject_code}</span></td>
                    <td>{selectedDate}</td>
                    <td>
                      <select
                        aria-label={`Attendance for ${student.name} in ${student.subject_code}`}
                        className={`attendance-status-select ${student.status === "Present" ? "status-present" : student.status === "Absent" ? "status-absent" : ""}`}
                        value={student.status || ""}
                        disabled={savingStudentId === student.student_id}
                        onChange={(event) => updateAttendance(student, event.target.value)}
                      >
                        <option value="" disabled>Not marked</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="no-data">No attendance records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="student-progress">
        <div className="progress-header">
          <div>
            <h2>Student Attendance Progress</h2>
            <p>Subject-wise attendance overview</p>
          </div>
        </div>
        <div className="progress-grid">
          {data.progress.map((student) => {
            const percentage = student.total_classes
              ? Math.round((student.present_classes / student.total_classes) * 100)
              : 0;
            return (
              <div className="progress-card" key={`${student.student_id}-${student.subject_code}`}>
                <div className="progress-top">
                  <div>
                    <h3>{student.name}</h3>
                    <p>Roll No: {student.roll_no}</p>
                  </div>
                  <strong>{percentage}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <div className="progress-subject">
                  {student.subject_code} · {student.present_classes}/{student.total_classes} classes
                </div>
              </div>
            );
          })}
          {!loading && data.progress.length === 0 && (
            <p className="no-data">Attendance progress will appear after records are marked.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
