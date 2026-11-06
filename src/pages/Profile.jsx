import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.js";
import { apiRequest } from "../services/api";
import "./Profile.css";

function profileFromUser(user) {
  return {
    name: user?.name || "",
    roll_no: user?.roll_no || "",
    email: user?.email || "",
    branch: user?.branch || "",
    semester: user?.semester ? `Semester ${user.semester}` : "",
  };
}

function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser, signOut } = useAuth();
  const [profile, setProfile] = useState(() => profileFromUser(user));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const { user: updatedUser } = await apiRequest("/students/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      await refreshUser();
      setProfile(profileFromUser(updatedUser));
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name.trim().split(/\s+/).slice(0, 2)
        .map((word) => word[0]).join("").toUpperCase()
    : "ST";

  return (
    <div className="profile-page">
      <header className="profile-navbar">
        <h2>LabSim</h2>
        <div>
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button onClick={() => { signOut(); navigate("/"); }}>
            Logout
          </button>
        </div>
      </header>

      <main className="profile-container">
        <h1>My Profile</h1>
        <p className="profile-description">
          View and manage your student information.
        </p>

        <div className="profile-card">
          <div className="profile-banner"></div>

          <div className="profile-summary">
            <div className="profile-avatar">{initials}</div>
            <h2>{profile.name || "Student Name"}</h2>
            <p>{profile.branch || "Student"}</p>
            <span>{profile.roll_no || "Roll Number"}</span>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-section-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Your registration details</p>
            </div>

            {!isEditing && (
              <button
                className="profile-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="profile-grid">
              <div className="profile-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="profile-group">
                <label>Roll Number</label>
                <input
                  name="roll_no"
                  value={profile.roll_no}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="profile-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  required
                />
              </div>

              <div className="profile-group">
                <label>Branch</label>
                <select
                  name="branch"
                  value={profile.branch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Computer Engineering">
                    Computer Engineering
                  </option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                </select>
              </div>

              <div className="profile-group">
                <label>Year / Semester</label>
                <select
                  name="semester"
                  value={profile.semester}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setProfile(profileFromUser(user));
                    setError("");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="profile-save-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>
        </div>

        <p className="profile-footer">
          LabSim - Virtual Laboratory Simulator
        </p>
      </main>
    </div>
  );
}

export default Profile;