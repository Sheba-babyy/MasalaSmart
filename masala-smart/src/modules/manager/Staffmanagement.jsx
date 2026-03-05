import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";

// IMPORTS FROM YOUR API
import {
  getAllUsers,
  updateStaffProfile,
  registerUser,
  getPendingStaff,
  approveStaff,
  deleteStaff
} from "../../services/api";

//  - Visualization of how staff moves between sessions
const AVAILABLE_SESSIONS = [
  "Unassigned",
  "Packing",
  "Machine Operation",
  "Cleaning",
  "Blending",
  "Quality Check",
  "Dispatch"
];

const StaffManagement = () => {
  // --- STATE ---
  const [staff, setStaff] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    role: "",
    assignedSession: "Unassigned", // ✅ New Field
    active: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- API CALLS ---

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Active/All Users
      const usersData = await getAllUsers();
      const staffOnly = usersData
        .filter(u => u.login_details?.usertype === "user")
        .map(u => ({
          id: u.login_id,
          name: u.name,
          email: u.email,
          role: "Staff",
          phone: u.contact,
          address: u.address || "",
          assignedSession: u.assigned_session || "Unassigned",
          sessionStatus: u.session_status || "N/A", // ✅ New Field
          active: u.login_details?.account_status === "active",
        }));
      setStaff(staffOnly);

      // 2. Fetch Pending Users
      const pendingData = await getPendingStaff();
      setPendingStaff(pendingData);

    } catch (err) {
      console.error(err);
      setError("Failed to load staff data.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleApprove = async (loginId) => {
    try {
      await approveStaff(loginId);
      alert("Staff member approved successfully!");
      fetchAllData();
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve staff member.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    try {
      await deleteStaff(id);
      setStaff(staff.filter(item => item.id !== id));
      alert("Staff member deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete staff member.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleEdit = (person) => {
    const nameParts = person.name ? person.name.split(" ") : ["", ""];
    const fName = nameParts[0];
    const lName = nameParts.slice(1).join(" ");

    setFormData({
      firstName: fName,
      lastName: lName,
      email: person.email,
      phone: person.phone,
      address: person.address || "",
      role: person.role,
      username: "",
      password: "",
      // ✅ Load existing session
      assignedSession: person.assignedSession || "Unassigned",
      active: person.active
    });

    setIsEditing(true);
    setEditingId(person.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill required fields (Name, Email)");
      return;
    }

    try {
      if (isEditing) {
        // --- UPDATE EXISTING ---
        await updateStaffProfile(editingId, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
          address: formData.address,
          assigned_session: formData.assignedSession // ✅ Send to Backend
        });

        alert("Staff updated successfully");
        setIsEditing(false);
        setEditingId(null);
        fetchAllData();
      } else {
        // --- REGISTER NEW ---
        if (!formData.username || !formData.password) {
          alert("Username and Password are required for new users.");
          return;
        }

        const registerPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contact: formData.phone,
          address: formData.address,
          username: formData.username,
          password: formData.password,
          usertype: "user"
          // Note: assigned_session isn't in register API, 
          // so new users default to Unassigned until edited.
        };

        await registerUser(registerPayload);
        alert("Registration successful! Use 'Edit' to assign a session.");
        fetchAllData();
      }

      // Reset Form
      setFormData({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", username: "", password: "", role: "",
        assignedSession: "Unassigned", active: true
      });

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message;
      alert(isEditing ? "Update failed: " + errMsg : "Registration failed: " + errMsg);
    }
  };

  return (
    <>
      <div className="manager-layout">
        <ManagerSidebar activePage="staff" />

        <div className="main-content">
           <ManagerNavbar />
          <div className="dashboard">

            {/* ADD / EDIT FORM */}
            <div className="section-card mb-8">
              <h2>{isEditing ? "Edit Staff Member" : "Add New Staff"}</h2>

              <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-grid">

                  {/* Row 1: Names */}
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Anoop"
                      pattern="[A-Za-z]+"
                      title="Only letters allowed"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Kumar"
                      pattern="[A-Za-z]+"
                      required
                    />
                  </div>

                  {/* Row 2: Contact */}
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@company.in"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone / Contact</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                      title="Phone number must be 10 digits"
                      required
                    />
                  </div>

                  {/* Row 3: Address & Role */}
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full residential address"
                      required
                    />
                  </div>

                  {/* ✅ SESSION DROPDOWN (New) */}
                  <div className="form-group">
                    <label style={{ color: '#60a5fa', fontWeight: 'bold' }}>Assign Section</label>
                    <select
                      name="assignedSession"
                      value={formData.assignedSession}
                      onChange={handleInputChange}
                      className="session-select"
                    >
                      {AVAILABLE_SESSIONS.map(sess => (
                        <option key={sess} value={sess}>{sess}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Credentials (Only show when NOT editing) */}
                  {!isEditing && (
                    <>
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Unique username"
                          required
                          autoComplete="new-password"
                          pattern="[A-Za-z0-9]{4,15}"
                          title="Username must be 4-15 characters with letters and numbers"
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Secret password"
                          required
                          autoComplete="new-password"
                          pattern="[A-Za-z0-9@#$%^&*!]{6,}"
                          title="Password must contain at least 6 characters including letters,numbers and special characters"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {isEditing ? "Update Staff" : "Register Staff"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: "", lastName: "", email: "", phone: "",
                          address: "", username: "", password: "", role: "",
                          assignedSession: "Unassigned", active: true
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* PENDING APPROVALS SECTION */}
            {pendingStaff.length > 0 && (
              <div className="section-card mb-8">
                <div className="section-header">
                  <h2 className="text-yellow-400">Pending Approvals</h2>
                  <span className="badge-count">{pendingStaff.length} New</span>
                </div>
                <div className="table-container">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStaff.map((person) => (
                        <tr key={person.login_id}>
                          <td>{person.name}</td>
                          <td>{person.email}</td>
                          <td>{person.contact}</td>
                          <td>{person.address || "—"}</td>
                          <td>
                            <button
                              className="action-btn approve"
                              onClick={() => handleApprove(person.login_id)}
                            >
                              ✓ Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EXISTING STAFF LIST */}
            <div className="section-card">
              <h2>Staff Directory</h2>
              <p className="subtitle mb-6">Manage active team members and their sessions</p>

              {isLoading && <p style={{ color: '#94a3b8' }}>Loading staff data...</p>}
              {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

              {!isLoading && !error && (
                <div className="table-container">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Session</th> {/* ✅ New Column */}
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((person, index) => (
                        <tr key={person.id || index}>
                          <td>
                            <div className="font-bold">{person.name}</div>
                            <div className="text-xs text-gray-400">{person.email}</div>
                          </td>
                          {/* ✅ Session Display */}
                          <td>
                            <div className="session-stack">
                              <span className={`session-badge ${person.assignedSession.toLowerCase().replace(" ", "-")}`}>
                                {person.assignedSession}
                              </span>
                              <span className={`mini-status ${person.sessionStatus.toLowerCase()}`}>
                                {person.sessionStatus}
                              </span>
                            </div>
                          </td>
                          <td>{person.phone || "—"}</td>
                          <td title={person.address}>
                            {person.address ? (person.address.length > 15 ? person.address.substring(0, 15) + "..." : person.address) : "—"}
                          </td>
                          <td>
                            <span className={`status-badge ${person.active ? "active" : "inactive"}`}>
                              {person.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button className="action-btn edit" onClick={() => handleEdit(person)}>
                              Edit
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(person.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
          <Footer />
        </div>
      </div>

      <style jsx>{`
        /* ... (Existing styles) ... */
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
          font-family: "Inter", sans-serif;
        }
        .manager-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          z-index: 0;
        }
        .main-content {
          margin-left: 280px;
          width: calc(100% - 280px);
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .dashboard {
          padding: 120px 60px 80px;
          flex: 1;
          color: white;
        }
        .section-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 40px;
          margin-bottom: 32px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        h2 { font-size: 2.1rem; margin-bottom: 20px; font-weight: 700; }
        .subtitle { color: #cbd5e1; font-size: 1.05rem; margin-bottom: 24px; }
        .mb-8 { margin-bottom: 48px; }
        
        .section-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .text-yellow-400 { color: #facc15; }
        .badge-count {
            background: #facc15;
            color: #0f172a;
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .staff-form { display: flex; flex-direction: column; gap: 24px; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }
        .full-width { grid-column: 1 / -1; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.95rem; color: #e2e8f0; }
        
        /* Input & Select Styles */
        .form-group input, .session-select {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: white;
          font-size: 1rem;
        }
        .session-select option {
            background: #1e293b; /* Fix dropdown bg color on Chrome */
            color: white;
        }
        .form-group input:focus, .session-select:focus {
          outline: none; border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }

        .form-actions { display: flex; gap: 16px; margin-top: 12px; }
        .btn-primary, .btn-secondary {
          padding: 12px 28px; border-radius: 12px; font-weight: 500; cursor: pointer; border: none;
        }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: rgba(255,255,255,0.12); color: white; }

        .table-container { overflow-x: auto; }
        .staff-table { width: 100%; border-collapse: collapse; font-size: 0.98rem; }
        .staff-table th, .staff-table td {
          padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .staff-table th { color: #94a3b8; font-weight: 500; text-transform: uppercase; font-size: 0.85rem; }
        
        .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 500; }
        .status-badge.active { background: rgba(34, 197, 94, 0.2); color: #86efac; }
        .status-badge.inactive { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

        /* ✅ SESSION BADGES */
        .session-badge {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            background: rgba(255,255,255,0.1);
            color: #e2e8f0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .session-badge.packing { background: rgba(236, 72, 153, 0.2); color: #fbcfe8; border-color: rgba(236, 72, 153, 0.3); }
        .session-badge.blending { background: rgba(249, 115, 22, 0.2); color: #fdba74; border-color: rgba(249, 115, 22, 0.3); }
        .session-badge.machine-operation { background: rgba(59, 130, 246, 0.2); color: #bfdbfe; border-color: rgba(59, 130, 246, 0.3); }
        .session-badge.cleaning { background: rgba(168, 162, 158, 0.2); color: #e7e5e4; border-color: rgba(168, 162, 158, 0.3); }

        /* ✅ MINI STATUS STYLES */
        .session-stack { display: flex; flex-direction: column; gap: 4px; }
        .mini-status { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding-left: 2px; }
        .mini-status.active { color: #60a5fa; }
        .mini-status.completed { color: #4ade80; }
        .mini-status.n\/a { color: #64748b; }

        .action-btn { padding: 8px 16px; margin-right: 8px; border-radius: 8px; font-size: 0.9rem; border: none; cursor: pointer; transition: all 0.2s; }
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        
        .action-btn.approve {
            background: #22c55e;
            color: white;
            font-weight: 600;
        }
        .action-btn.approve:hover {
            background: #16a34a;
            transform: translateY(-2px);
        }

        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 600; }
        .text-gray-400 { color: #94a3b8; }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; width: 100%; }
          .dashboard { padding: 100px 20px 60px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default StaffManagement;