import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DCNExperiment2.css";

function InlineHelp({ title, items }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="btn-help" onClick={() => setOpen(true)}> ? Help </button>
    {open && <div className="dcn-help-overlay" onClick={() => setOpen(false)}>
      <section className="dcn-help-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="dcn-help-header"><h2>{title}</h2><button className="dcn-help-close" type="button" aria-label="Close help" onClick={() => setOpen(false)}>×</button></div>
        <ul className="dcn-help-items">{items.map((item) => <li key={item}>{item}</li>)}</ul>
        <button className="dcn-help-done" type="button" onClick={() => setOpen(false)}>Got it</button>
      </section>
    </div>}
  </>;
}

const DCNExperiment2 = () => {
  const navigate = useNavigate();

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [minLength, setMinLength] = useState(8);
  const [maxAge, setMaxAge] = useState(42);
  const [lockoutThreshold, setLockoutThreshold] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(30);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");

  const steps = [
    "Create User Account",
    "Set User Password",
    "Configure Password Policy",
    "Configure Account Lockout Policy",
    "Verify Account Policies",
  ];

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2500);
  };

  const startSimulation = () => {
    if (!username.trim() || !fullName.trim()) {
      showToast("Please enter username and full name.");
      return;
    }
    setStarted(true);
    setCurrentStep(0);
    setCompleted(false);
    setSubmitted(false);
  };

  const resetSimulation = () => {
    setUsername("");
    setFullName("");
    setPassword("");
    setMinLength(8);
    setMaxAge(42);
    setLockoutThreshold(5);
    setLockoutDuration(30);
    setStarted(false);
    setCurrentStep(0);
    setCompleted(false);
    setSubmitted(false);
  };

  const completeStep = () => {
    if (currentStep === 1 && password.length < 4) {
      showToast("Please enter a password with at least 4 characters.");
      return;
    }
    if (currentStep === 2 && minLength < 6) {
      showToast("Minimum password length should be at least 6.");
      return;
    }
    if (currentStep === 2 && maxAge < 1) {
      showToast("Enter a valid maximum password age.");
      return;
    }
    if (currentStep === 3 && (lockoutThreshold < 1 || lockoutDuration < 1)) {
      showToast("Enter valid account lockout settings.");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      showToast("All configuration steps completed successfully!");
    }
  };

  const previousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

const submitExperiment = () => {
  if (!completed || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 2,
      experimentName: "User Account & Account Policies",
      experimentRoute: "/dcn-experiment-2",
    },
  });
};
  const progress = !started ? 0 : completed ? 100 : ((currentStep + 1) / steps.length) * 100;

  const observationRows = [
    { label: "Create local user account", done: started },
    { label: "Set user password", done: started && currentStep > 1 || completed },
    { label: "Configure password policy", done: started && currentStep > 2 || completed },
    { label: "Configure account lockout policy", done: started && currentStep > 3 || completed },
    { label: "Verify account and policies", done: completed },
  ];

  return (
    <div className="dcn2-root">
      <header className="exp-header">
 <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>

        <h1 className="exp-title">Experiment 2: User Account &amp; Account Policies</h1>
        <InlineHelp
          title="Experiment 2 Help"
          items={[
            "Create a local user account and set its password in the simulation.",
            "Configure the password policy and account lockout policy in order.",
            "Verify the account and policy settings before submitting the experiment.",
          ]}
        />
      </header>

      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To create a user account and apply password and account lockout policies on a standalone computer.</p>
      </section>

      <section className="card collapsible-card">
        <div className="collapsible-header" role="button" tabIndex={0} onClick={() => setTheoryOpen(!theoryOpen)} onKeyDown={(e) => e.key === "Enter" && setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>
        {theoryOpen && <div className="collapsible-body">
          <p>User accounts provide controlled access to a computer. A local account stores its information on the standalone computer.</p>
          <p>Password policies define requirements such as minimum password length and password age. Account lockout policies help protect accounts by locking access after a configured number of unsuccessful login attempts.</p>
        </div>}
      </section>

      <section className="card collapsible-card">
        <div className="collapsible-header" role="button" tabIndex={0} onClick={() => setProcedureOpen(!procedureOpen)} onKeyDown={(e) => e.key === "Enter" && setProcedureOpen(!procedureOpen)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procedureOpen ? "▲" : "▼"}</span>
        </div>
        {procedureOpen && <div className="collapsible-body proc-grid">
          <ol className="proc-col">
            <li>Open Computer Management or the local user management tool.</li>
            <li>Create a new local user and enter the username and full name.</li>
            <li>Set a password for the newly created user account.</li>
          </ol>
          <ol className="proc-col" start={4}>
            <li>Configure minimum password length and maximum password age.</li>
            <li>Set the account lockout threshold and lockout duration.</li>
            <li>Verify all settings and complete the simulation.</li>
          </ol>
        </div>}
      </section>

      <div className="sim-row">
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Configuration</h3>
          <label className="field-label" htmlFor="dcn2-username">Username</label>
          <input id="dcn2-username" className="panel-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" disabled={started} />
          <label className="field-label" htmlFor="dcn2-fullname">Full Name</label>
          <input id="dcn2-fullname" className="panel-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" disabled={started} />
          {!started
            ? <button type="button" className="btn-verify full-width" onClick={startSimulation}>▶ Start Simulation</button>
            : <button type="button" className="btn-reset full-width" onClick={resetSimulation}>↺ Reset Simulation</button>}

          <h3 className="panel-heading step-heading">Simulation Steps</h3>
          <div className="status-list">
            {steps.map((step, index) => {
              const done = completed || (started && index < currentStep);
              const current = started && !completed && index === currentStep;
              return <div className={`status-item step-status ${done ? "step-done" : current ? "step-current" : ""}`} key={step}>
                <span className="step-number">{done ? "✓" : index + 1}</span>
                <span>{step}</span>
              </div>;
            })}
          </div>
          <div className="side-progress">
            <div className="progress-label"><span>Progress</span><strong>{Math.round(progress)}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </aside>

        <section className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>
          <div className="canvas-area">
            {!started ? <div className="start-screen">
              <div className="computer-icon">🖥️</div>
              <h2>Standalone Computer</h2>
              <p>Enter the user details on the left and click <strong>Start Simulation</strong> to begin.</p>
              <div className="desktop-chip">Local Computer · User Management</div>
            </div> : <>
              <div className="os-window">
                <div className="os-titlebar">
                  <span>🖥️</span>
                  <strong>{currentStep === 0 ? "Computer Management" : currentStep === 1 ? "Set User Password" : currentStep === 2 ? "Password Policy" : currentStep === 3 ? "Account Lockout Policy" : "Verify Configuration"}</strong>
                  <span className="os-window-controls">─　□　×</span>
                </div>
                <div className="os-toolbar"><span>Control Panel</span><span>›</span><span>{currentStep === 0 ? "Local Users and Groups" : "Security Settings"}</span></div>
                <div className="os-window-body">
                  <div className="os-sidebar">
                    <div className={currentStep === 0 ? "selected" : ""}>👥 Users</div>
                    <div className={currentStep === 1 ? "selected" : ""}>🔑 Password</div>
                    <div className={currentStep === 2 ? "selected" : ""}>🛡 Password Policy</div>
                    <div className={currentStep === 3 ? "selected" : ""}>🔒 Account Lockout</div>
                    <div className={currentStep === 4 ? "selected" : ""}>✓ Verification</div>
                  </div>
                  <div className="os-content">
                    {currentStep === 0 && <div className="config-content">
                      <h2>Create New User</h2>
                      <div className="user-preview"><div className="avatar">👤</div><div><strong>{username}</strong><span>{fullName}</span></div></div>
                      <div className="system-row"><span>Account type</span><strong>Standard User</strong></div>
                      <div className="system-row"><span>Computer</span><strong>Standalone PC</strong></div>
                      <p className="inline-success">✓ User account details are ready to configure.</p>
                    </div>}
                    {currentStep === 1 && <div className="config-content">
                      <h2>Set User Password</h2><p className="account-name">Account: <strong>{username}</strong></p>
                      <label className="field-label" htmlFor="dcn2-password">New Password</label>
                      <input id="dcn2-password" className="panel-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                      <div className="security-note">🔐 Enter a password with at least 4 characters for this simulation.</div>
                    </div>}
                    {currentStep === 2 && <div className="config-content">
                      <h2>Password Policy</h2>
                      <div className="policy-row"><div><strong>Minimum Password Length</strong><span>Minimum number of characters required.</span></div><input type="number" min="6" value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} /></div>
                      <div className="policy-row"><div><strong>Maximum Password Age</strong><span>Days before password expiration.</span></div><input type="number" min="1" value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} /></div>
                      <p className="inline-success">✓ Password policy ready to apply.</p>
                    </div>}
                    {currentStep === 3 && <div className="config-content">
                      <h2>Account Lockout Policy</h2>
                      <div className="policy-row"><div><strong>Lockout Threshold</strong><span>Failed login attempts before lockout.</span></div><input type="number" min="1" value={lockoutThreshold} onChange={(e) => setLockoutThreshold(Number(e.target.value))} /></div>
                      <div className="policy-row"><div><strong>Lockout Duration</strong><span>Duration of the account lockout in minutes.</span></div><input type="number" min="1" value={lockoutDuration} onChange={(e) => setLockoutDuration(Number(e.target.value))} /></div>
                      <p className="inline-success">✓ Account lockout settings are ready to apply.</p>
                    </div>}
                    {currentStep === 4 && <div className="config-content verification-content">
                      <div className="verification-icon">✓</div><h2>Configuration Verification</h2>
                      <div className="verification-table">
                        <div><span>Username</span><strong>{username}</strong></div>
                        <div><span>Full Name</span><strong>{fullName}</strong></div>
                        <div><span>Minimum Password Length</span><strong>{minLength} characters</strong></div>
                        <div><span>Maximum Password Age</span><strong>{maxAge} days</strong></div>
                        <div><span>Lockout Threshold</span><strong>{lockoutThreshold} attempts</strong></div>
                        <div><span>Lockout Duration</span><strong>{lockoutDuration} minutes</strong></div>
                      </div>
                      <p className="inline-success">✓ All account policies are configured.</p>
                    </div>}
                  </div>
                </div>
              </div>
              <div className="canvas-actions">
                <button type="button" className="btn-reset" onClick={previousStep} disabled={currentStep === 0}>← Previous</button>
                {!completed && <button type="button" className="btn-verify" onClick={completeStep}>{currentStep === steps.length - 1 ? "Complete Experiment" : "Complete Step →"}</button>}
              </div>
              {completed && <div className="result-box success">✅ User account and security policies have been configured successfully.</div>}
            </>}
          </div>
        </section>

        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Result</h3>
          <div className="analysis-block">
            <h4 className="analysis-sub">Current Step</h4>
            <p className="analysis-current">{!started ? "Waiting to Start" : completed ? "Configuration Completed" : steps[currentStep]}</p>
            <p className="analysis-description">{!started ? "Enter the account details to begin the experiment." : currentStep === 0 ? "Create a local user account on the standalone computer." : currentStep === 1 ? "Assign a password to the newly created user account." : currentStep === 2 ? "Configure password length and expiration requirements." : currentStep === 3 ? "Configure failed-attempt threshold and lockout duration." : "Review the account information and configured security policies."}</p>
          </div>
          <div className="analysis-block">
            <h4 className="analysis-sub">User Account</h4>
            <table className="analysis-table"><tbody>
              <tr><td>Username</td><td>:</td><td>{username || "Not set"}</td></tr>
              <tr><td>Full Name</td><td>:</td><td>{fullName || "Not set"}</td></tr>
              <tr><td>Account Type</td><td>:</td><td>Standard</td></tr>
            </tbody></table>
          </div>
          <div className="analysis-block">
            <h4 className="analysis-sub">Security Settings</h4>
            <table className="analysis-table"><tbody>
              <tr><td>Password Length</td><td>:</td><td>{minLength}</td></tr>
              <tr><td>Password Age</td><td>:</td><td>{maxAge} days</td></tr>
              <tr><td>Lockout Threshold</td><td>:</td><td>{lockoutThreshold}</td></tr>
              <tr><td>Lockout Duration</td><td>:</td><td>{lockoutDuration} min</td></tr>
            </tbody></table>
          </div>
          {completed && <div className="analysis-block"><h4 className="analysis-sub">Conclusion</h4><p className="conclusion-text">A local user account was created and the password and account lockout policies were configured successfully.</p></div>}
        </aside>
      </div>

      <section className="card table-section">
        <h2 className="section-heading orange">Observation Table</h2>
        <div className="table-scroll"><table className="obs-table">
          <thead><tr><th>Sr. No.</th><th>Task Performed</th><th>Status</th></tr></thead>
          <tbody>{observationRows.map((row, index) => <tr key={row.label} className={row.done ? "row-verified" : ""}>
            <td>{index + 1}</td><td className="observation-label">{row.label}</td>
            <td className={row.done ? "status-verified" : "status-pending"}>{row.done ? "Completed" : "Pending"}</td>
          </tr>)}</tbody>
        </table></div>
      </section>

      <section className="submit-section-wrap">
        <div className="submit-section">
          <button type="button" className={`btn-submit ${completed && !submitted ? "enabled" : "disabled"}`} disabled={!completed || submitted} onClick={submitExperiment}>
            {submitted ? "Submitted ✓" : "Submit Experiment"}
          </button>
        </div>
        {!completed && <p className="submit-hint">{started ? `Step ${currentStep + 1} of ${steps.length}: complete the current step to continue.` : "Start the simulation and complete all five steps to enable submission."}</p>}
        {submitted && <p className="submitted-note">✅ Experiment submitted successfully.</p>}
      </section>

      {toast && <div className="dcn2-toast">{toast}</div>}
    </div>
  );
};

export default DCNExperiment2;
