import React, { useEffect, useState } from "react";
import StaffSidebar from "../staff/Sidebar"; 
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png";
import { getStaffProfile, updateStaffProfile } from "../../services/api";

function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    contact: ""
  });

  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStaffProfile(loginId);
        setProfile(data);

        setFormData({
          name: data.user?.name || "",
          username: data.login?.username || "",
          contact: data.user?.contact || ""
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [loginId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await updateStaffProfile(loginId, formData);
      alert(res.message);
      const updatedProfile = await getStaffProfile(loginId);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      alert(err.error || "Update failed");
    }
  };

  return (
    <div className="staff-layout">
      <StaffSidebar />

      <div className="main-content">
        <StaffNavbar />

        <div className="dashboard">
          <div className="header-section">
            <h1>My Profile</h1>
            <p className="subtitle">Manage your personal information and account details.</p>
          </div>

          <div className="profile-container">
            {loading ? (
              <div className="loading-text">Loading Profile...</div>
            ) : (
              <div className="profile-card">
                
                {/* Profile Avatar Area */}
                <div className="avatar-section">
                  <div className="avatar-circle">
                    {profile.user?.name ? profile.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="avatar-info">
                    <h2>{profile.user?.name || "Staff Member"}</h2>
                    <span className="role-badge">Production Staff</span>
                  </div>
                </div>

                {/* Form Section */}
                <div className="form-section">
                  {/* Username */}
                  <div className="form-group">
                    <label>Username</label>
                    <div className="readonly-field">
                        {profile.login?.username || "N/A"}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="form-group">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <div className="readonly-field">{profile.user?.name || "N/A"}</div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="form-group">
                    <label>Contact Number</label>
                    {isEditing ? (
                      <input
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <div className="readonly-field">{profile.user?.contact || "N/A"}</div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label>Account Status</label>
                    <div className="status-text">Active</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-row">
                    {isEditing ? (
                      <>
                        <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                        <button className="btn btn-gold" onClick={handleUpdate}>
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-gold" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .staff-layout {
          position: relative;
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          animation: fadeIn 1.2s ease-out;
          font-family: 'Inter', sans-serif;
        }

        .staff-layout::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: 0;
        }

        .main-content {
          margin-left: 280px;
          width: 100%;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .dashboard {
          /* ✅ UPDATED: Reduced top padding from 80px to 40px to move content up */
          padding: 40px 50px 80px; 
          flex: 1;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header-section {
          width: 100%;
          max-width: 800px;
          /* ✅ UPDATED: Reduced margin bottom to pull card closer */
          margin-bottom: 25px; 
        }

        .header-section h1 {
          font-size: 3rem;
          margin-bottom: 10px;
          color: #ffd700;
          font-weight: 800;
          text-shadow: 3px 3px 0px #000000;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #e0e0e0;
        }

        .profile-container {
          width: 100%;
          max-width: 600px;
        }

        .profile-card {
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideUp 0.6s ease-out;
        }

        .avatar-section {
          background: rgba(255, 215, 0, 0.05);
          padding: 40px;
          display: flex;
          align-items: center;
          gap: 25px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          background: #ffd700;
          color: #1a1a1a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        }

        .avatar-info h2 {
          font-size: 1.8rem;
          color: white;
          margin-bottom: 5px;
        }

        .role-badge {
          background: rgba(212, 175, 55, 0.2);
          color: #ffd700;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-section {
          padding: 40px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          color: #ffd700;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .readonly-field {
          font-size: 1.1rem;
          color: #e0e0e0;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-field {
          width: 100%;
          padding: 12px 15px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input-field:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }

        .status-text {
          color: #4ade80;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .action-row {
          display: flex;
          gap: 15px;
          margin-top: 35px;
        }

        .btn {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-gold {
          background: #ffd700;
          color: #1a1a1a;
        }

        .btn-gold:hover {
          background: #e6c200;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #e0e0e0;
          color: #e0e0e0;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .loading-text { font-size: 1.5rem; color: #ffd700; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 80px; }
          .dashboard { padding: 40px 20px; }
          .header-section h1 { font-size: 2.2rem; }
          .avatar-section { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}

export default StaffProfile;