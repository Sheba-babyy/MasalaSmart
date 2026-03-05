import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Sidebar from "./Sidebar";
import Footer from "../../components/Footer";

// ✅ IMPORT API FUNCTIONS
import { createManager, fetchManagers, deleteManager } from "../../services/api";

// ✅ IMPORT BACKGROUND IMAGE
import backgroundImg from "../../assets/img.png";

function ManagerSetup() {
  // State for list of managers
  const [managers, setManagers] = useState([]);

  // State for loading status
  const [loading, setLoading] = useState(true);

  // ✅ UPDATED STATE: Added 'username' back so Admin can set it
  const [formData, setFormData] = useState({
    name: "",
    username: "", // ✅ Required for creation
    password: "",
    role: "Manager",
    email: "",
    contact: ""
  });

  // ✅ 1. FETCH MANAGERS ON LOAD
  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const data = await fetchManagers();
      setManagers(Array.isArray(data) ? data : data.managers || []);
    } catch (error) {
      console.error("Failed to load managers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ 2. CREATE MANAGER
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION: Ensure username is checked
    if (!formData.name || !formData.username || !formData.password || !formData.email) {
      alert("Please fill required fields (Name, Username, Email, Password)");
      return;
    }

    try {
      await createManager(formData);
      alert("Manager created successfully!");

      // Refresh the list
      loadManagers();

      // Reset Form
      setFormData({
        name: "",
        username: "", // Reset username
        password: "",
        role: "Manager",
        email: "",
        contact: ""
      });
    } catch (error) {
      alert(error.error || "Failed to create manager");
    }
  };

  // ✅ 3. DELETE MANAGER
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await deleteManager(id);
        // Optimistic UI update
        setManagers(managers.filter((m) => m.id !== id));
      } catch (error) {
        alert("Failed to delete manager");
        console.error(error);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Sidebar (Fixed Position) */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div className="main-content-wrapper">
        <AdminNavbar />

        <div className="page-content-container">
          <div className="header-box">
            <h1>Manager Setup</h1>
            <p>Create and manage system access for your managers.</p>
          </div>

          <div className="setup-grid">
            {/* LEFT: Add Manager Form */}
            <div className="card form-card">
              <h3>Add New Manager</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rajesh Kumar"
                    pattern="[A-Za-z]+"
                    title="Only letters allowed"
                    required
                  />
                </div>

                {/* ✅ USERNAME INPUT ADDED BACK (Admin sets it) */}
                <div className="form-group">
                  <label>Username</label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g. rajesh.k"
                    required
                    pattern="[A-Za-z0-9]{4,15}"
                    title="Username must be 4-15 characters with letters and numbers"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="rajesh@blendmaster.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled // Lock role to Manager
                  >
                    <option>Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    pattern="[A-Za-z0-9@#$%^&*!]{6,}"
                    title="Password must contain at least 6 characters including letters,numbers and special characters"
                  />
                </div>

                <button className="save-btn">Create Manager</button>
              </form>
            </div>

            {/* RIGHT: Manager List Table */}
            <div className="card list-card">
              <h3>Existing Managers</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {/* ❌ USERNAME COLUMN HIDDEN (Admin doesn't view it) */}
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#ccc", padding: "20px" }}>Loading...</td></tr>
                    ) : managers.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#ccc", padding: "20px" }}>No managers found.</td></tr>
                    ) : (
                      managers.map((m) => (
                        <tr key={m.id}>
                          <td>{m.name || m.user?.name}</td>
                          <td>{m.email || "N/A"}</td>
                          <td>
                            <span className="role-badge manager">
                              Manager
                            </span>
                          </td>
                          <td><span className="status-dot active"></span> Active</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(m.id || m.login_id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* --- LAYOUT FIXES --- */
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
        }

        .dashboard-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7); 
          z-index: 0;
          pointer-events: none;
        }

        .main-content-wrapper {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          height: 100vh;
          overflow-y: auto;
        }

        .page-content-container {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* --- THEME STYLES --- */
        .header-box { margin-bottom: 30px; }

        .header-box h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          color: #f1c40f; 
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .header-box p { color: #dcdde1; font-size: 1.1rem; }

        .setup-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          align-items: start;
        }

        .card {
          background: rgba(43, 29, 24, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 30px;
          border-radius: 16px;
          border: 1px solid rgba(241, 196, 15, 0.15);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          color: white;
        }

        .card h3 {
          margin-top: 0;
          margin-bottom: 25px;
          color: #f1c40f;
          font-size: 1.4rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 15px;
        }

        /* --- FORM STYLES --- */
        .form-group { margin-bottom: 20px; }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #ecf0f1;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #5d4037;
          border-radius: 8px;
          color: white;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: 0.3s;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #f1c40f;
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 0 2px rgba(241, 196, 15, 0.2);
        }

        .save-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #d35400, #c0392b);
          border: none;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(211, 84, 0, 0.4);
        }

        /* --- TABLE STYLES --- */
        .table-responsive { overflow-x: auto; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        
        th {
          text-align: left;
          padding: 15px;
          color: #f1c40f;
          background: rgba(0,0,0,0.2);
          border-bottom: 2px solid #5d4037;
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        td {
          padding: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #ecf0f1;
          font-size: 0.95rem;
          vertical-align: middle;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }

        .role-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          display: inline-block;
        }
        .role-badge.manager { background: rgba(52, 152, 219, 0.15); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.3); }

        .status-dot {
            height: 8px; width: 8px; background-color: #ccc; border-radius: 50%; display: inline-block; margin-right: 5px;
        }
        .status-dot.active { background-color: #2ecc71; box-shadow: 0 0 5px #2ecc71; }

        .delete-btn {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.5);
          color: #e74c3c;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
          font-size: 0.85rem;
        }
        
        .delete-btn:hover { background: #e74c3c; color: white; }

        @media (max-width: 1024px) {
          .setup-grid { grid-template-columns: 1fr; }
          .main-content-wrapper { margin-left: 0; } 
        }
      `}</style>
    </div>
  );
}

export default ManagerSetup;