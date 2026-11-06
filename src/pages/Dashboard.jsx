
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Menu from "../components/Menu";
import { useAuth } from "../context/auth.js";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const username = user?.name || "Student";

  const subjects = [
    {
      name: "Digital Techniques  (DTM)",
      path: "/dtm-experiments",
    },
    {
      name: "Data Communication Network (DCN)",
      path: "/dcn-experiments",
    },
    {
      name: "Data Structure using C (DST)",
      path: "/dst-experiments",
    },

    {
      name: "Information Security (IFS)",
      path: "/ifs-experiments",
    }
  ];

  const lastOpened = localStorage.getItem("lastOpenedExperiment");

  const openSubject = (subject) => {
    localStorage.setItem("lastOpenedExperiment", subject.name);
    navigate(subject.path);
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">

        <div
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        <h2 className="dashboard-title">
          Lab Simulator
        </h2>

      </header>

      {/* SIDE MENU */}
      {menuOpen && (
        <div className="side-menu">
          <Menu />
        </div>
      )}

      {/* WELCOME */}
      <section className="dashboard-section">

        <h3 className="welcome-text">
          Welcome,
          <span className="username">
            {" "}{username}
          </span>
        </h3>

        <p>
          Select a subject to start performing
          virtual laboratory experiments.
        </p>

      </section>

      {/* SUBJECTS */}
      <section className="dashboard-section">

        <h3>Subjects</h3>

        <div className="subject-list">

          {subjects.map((subject, index) => (
            <button
              key={index}
              className="subject-btn"
              onClick={() => openSubject(subject)}
            >
              {subject.name}
            </button>
          ))}

        </div>

      </section>

      {/* RECENT ACTIVITY */}
      <section className="dashboard-section">

        <h3>Recent Activity</h3>

        <div className="activity-box">

          {lastOpened ? (
            <p>
              Last Opened Subject:
              <strong> {lastOpened}</strong>
            </p>
          ) : (
            <p>
              No Recent Activity
            </p>
          )}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;
    
