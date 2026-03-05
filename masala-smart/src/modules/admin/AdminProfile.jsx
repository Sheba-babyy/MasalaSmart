import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/img.png";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { getAdminProfile, updateAdminProfile } from "../../services/api";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  // :white_tick: FIX: Read login_id directly — Login.jsx stores it as a plain string
  const getLoginId = () => {
    const loginId = localStorage.getItem("login_id");
    console.log(":key: Login ID from localStorage:", loginId);
    return loginId || null;
  };

  const loginId = getLoginId();

  // Fetch profile on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!loginId) {
        setError("User ID not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAdminProfile(loginId);
        setProfile(data);
        setEditedProfile(data);
        setError(null);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loginId]);

  const handleEditToggle = async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        const updatedData = await updateAdminProfile(loginId, editedProfile);
        setProfile(updatedData);
        setIsEditing(false);
        setError(null);
        alert("Profile updated successfully!");
      } catch (err) {
        console.error(err);
        setError(err.error || "Failed to update profile.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setEditedProfile({ ...profile });
      setIsEditing(true);
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };

  if (isLoading) {
    return <div style={styles.centerText}>Loading Profile...</div>;
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.mainContent}>
        <AdminNavbar />
        <div style={{ ...styles.page, backgroundImage: `url(${bgImage})` }}>
          <div style={styles.card}>
            {error && <div style={styles.errorMsg}>{error}</div>}

            <div style={styles.header}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Admin"
                style={styles.avatar}
              />
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleInputChange}
                  style={styles.editInput}
                  autoFocus
                  placeholder="Full Name"
                />
              ) : (
                <>
                  <h2 style={styles.name}>{profile.name || "Admin User"}</h2>
                  <p style={styles.role}>{profile.role || "Admin"}</p>
                </>
              )}
            </div>

            <div style={styles.details}>
              <div style={styles.row}>
                <span style={styles.label}>Email:</span>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleInputChange}
                    style={styles.editField}
                  />
                ) : (
                  <span>{profile.email}</span>
                )}
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Phone:</span>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleInputChange}
                    style={styles.editField}
                  />
                ) : (
                  <span>{profile.phone}</span>
                )}
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Status:</span>
                <span style={styles.active}>Active</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={{ ...styles.editBtn, opacity: isSaving ? 0.7 : 1 }}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
              </button>
              <button style={styles.logoutBtn} onClick={handleLogout} disabled={isSaving}>
                Logout
              </button>
            </div>

            {isEditing && !isSaving && (
              <p style={{ textAlign: "center", marginTop: "10px", color: "#666", fontSize: "12px" }}>
                Click "Save Profile" to confirm changes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#F3F4F6" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  page: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "20px",
  },
  centerText: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#555",
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    background: "rgba(255, 255, 255, 0.92)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  errorMsg: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    fontSize: "14px",
    border: "1px solid #FCA5A5",
  },
  header: { textAlign: "center", marginBottom: "24px" },
  avatar: { width: "100px", height: "100px", borderRadius: "50%", marginBottom: "12px", border: "4px solid #2563EB" },
  name: { margin: "0 0 4px 0", fontSize: "24px", fontWeight: "600" },
  role: { margin: "0", color: "#555", fontSize: "16px", textTransform: "capitalize" },
  editInput: {
    fontSize: "22px", fontWeight: "600", textAlign: "center",
    width: "100%", padding: "6px", border: "2px solid #2563EB",
    borderRadius: "8px", marginTop: "8px",
  },
  details: { marginTop: "10px" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", fontSize: "15px" },
  label: { fontWeight: "600", color: "#333" },
  active: { color: "#16A34A", fontWeight: "600" },
  editField: { padding: "6px 10px", border: "1px solid #ccc", borderRadius: "6px", width: "180px", fontSize: "14px" },
  actions: { display: "flex", gap: "12px", marginTop: "28px" },
  editBtn: {
    flex: 1, padding: "12px", border: "none", borderRadius: "10px",
    background: "#2563EB", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
  logoutBtn: {
    flex: 1, padding: "12px", border: "none", borderRadius: "10px",
    background: "#DC2626", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
};