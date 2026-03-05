import React, { useState, useEffect } from 'react';
import backgroundImg from "../../assets/img2.png";
import ManagerNavbar from "../../components/ManagerNavbar";
import Footer from "../../components/Footer";
import { getManagerProfile } from "../../services/api"; 

function ManagerProfile() {
  // State for Profile Data
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "",
    username: "", // New field from API
    status: "",   // New field from API
    phone: "",    // Not in API, defaulting to empty
    department: "", // Not in API, defaulting to empty
    bio: ""       // Not in API, defaulting to empty
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // Fetch Profile Data on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // ✅ FIX #1: Changed key from "loginId" to "login_id" to match login response
        const loginId = localStorage.getItem("login_id"); 

        // ✅ FIX #2: Debug Log
        console.log("LOGIN ID USED FOR PROFILE:", loginId);

        // 2. validation: If no ID, stop here.
        if (!loginId) {
            setError("No user ID found. Please log in again.");
            setLoading(false);
            return;
        }
        
        // 3. Call the API with the valid ID
        // Endpoint: /managers/<login_id>
        const response = await getManagerProfile(loginId);
        const data = response.data;

        // Map API response to State
        setProfileData({
            fullName: data.fullName || "",
            email: data.email || "",
            role: data.role || "",
            username: data.username || "",
            status: data.status || "Active",
            phone: "", 
            department: "", 
            bio: ""
        });
        
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Better error message handling
        if (err.response && err.response.status === 400) {
            setError("Invalid User ID format (400 Bad Request).");
        } else if (err.response && err.response.status === 404) {
            setError("User profile not found.");
        } else {
            setError("Failed to load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle Form Submission
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Profile updated successfully! (Mock action)");
    // TODO: You need to create a Python route for PUT /managers/<id> to save these changes
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#00e5ff", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", color: "red", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <>
      <ManagerNavbar />

      <div 
        className="profile-page-wrapper"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <div className="profile-container animate-fade-in">
          <div className="page-header">
            <h1>My Profile</h1>
            <p>Manage your account settings and personal details.</p>
          </div>

          <div className="profile-grid">
            {/* Left Column: Profile Card */}
            <div className="profile-card custom-card left-card">
              <div className="avatar-section">
                <div className="avatar">
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <h2>{profileData.fullName}</h2>
                <div className="badges">
                    <span className="role-badge">{profileData.role || "Manager"}</span>
                    {/* Display Status from API */}
                    <span className={`status-badge ${profileData.status === 'Active' ? 'active' : 'inactive'}`}>
                        {profileData.status}
                    </span>
                </div>
              </div>
              <div className="info-list">
                <p><strong>Username:</strong><br /> {profileData.username}</p>
                <p><strong>Email:</strong><br /> {profileData.email}</p>
                {/* Only show these if they have data (since API doesn't return them yet) */}
                {profileData.phone && <p><strong>Phone:</strong><br /> {profileData.phone}</p>}
                {profileData.department && <p><strong>Department:</strong><br /> {profileData.department}</p>}
              </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="form-card custom-card">
              <div className="card-header">
                <h3>Account Details</h3>
                <button
                  type="button"
                  className={`toggle-edit-btn ${isEditing ? 'cancel' : 'edit'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Details'}
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-grid">
                   {/* Full Name */}
                  <div className="input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="standard-input"
                    />
                  </div>

                  {/* Username (Read Only) */}
                  <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={profileData.username}
                      disabled={true} // Usually usernames are immutable
                      className="standard-input disabled-input"
                    />
                  </div>

                  {/* Email */}
                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="standard-input"
                    />
                  </div>

                  {/* Phone (Optional/Manual Entry since API misses it) */}
                  <div className="input-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Add phone number"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="standard-input"
                    />
                  </div>

                  {/* Department (Optional/Manual Entry) */}
                  <div className="input-group">
                    <label htmlFor="department">Department</label>
                    <input
                      id="department"
                      type="text"
                      name="department"
                      placeholder="Add department"
                      value={profileData.department}
                      onChange={handleInputChange} // Made editable since API returns nothing
                      disabled={!isEditing}
                      className="standard-input"
                    />
                  </div>

                  <div className="input-group full-width">
                    <label htmlFor="bio">Bio / Notes</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="standard-input"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
         <Footer />
      </div>

     

      <style>{`
        .profile-page-wrapper {
          position: relative;
        }
        .profile-page-wrapper::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 10, 20, 0.6);
          z-index: 0;
        }
        .profile-container {
          position: relative;
          z-index: 1;
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header { margin-bottom: 40px; text-align: center; }
        .page-header h1 {
          color: #00e5ff;
          margin: 0 0 10px 0;
          font-size: 2.4rem;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
        }
        .page-header p { color: #b2bec3; font-size: 1.1rem; }

        .profile-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
          align-items: start;
        }

        .custom-card {
          background: rgba(20, 30, 50, 0.75);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.15);
          border: 1px solid rgba(0, 229, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .left-card { text-align: center; }
        .avatar-section { margin-bottom: 30px; }
        .avatar {
          width: 120px; height: 120px;
          background: linear-gradient(135deg, #00bcd4, #00e5ff);
          color: white;
          font-size: 3.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto 20px;
          box-shadow: 0 0 25px rgba(0, 229, 255, 0.5);
        }
        .avatar-section h2 { margin: 10px 0; font-size: 1.6rem; color: #ffffff; }
        
        .badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .role-badge, .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .role-badge {
          background: rgba(0, 229, 255, 0.15);
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.3);
        }
        .status-badge.active {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }
        .status-badge.inactive {
           background: rgba(231, 76, 60, 0.15);
           color: #e74c3c;
           border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .info-list p {
          margin-bottom: 20px;
          color: #b2bec3;
          line-height: 1.6;
          text-align: left;
          word-break: break-all;
        }
        .info-list strong {
          color: #00e5ff;
          display: block;
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .card-header h3 { margin: 0; color: #ffffff; font-size: 1.4rem; }

        .toggle-edit-btn {
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          background: transparent;
        }
        .toggle-edit-btn.edit {
          color: #00e5ff;
          border: 1px solid #00e5ff;
        }
        .toggle-edit-btn.edit:hover {
          background: rgba(0, 229, 255, 0.1);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }
        .toggle-edit-btn.cancel {
          color: #b2bec3;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .toggle-edit-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .full-width { grid-column: 1 / -1; }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #e0f7fa;
          font-size: 0.95rem;
        }
        .standard-input {
          width: 100%;
          padding: 12px 15px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
          box-sizing: border-box;
          color: #ffffff;
        }
        .standard-input:focus {
          outline: none;
          border-color: #00e5ff;
          box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.2);
        }
        .standard-input:disabled {
          background-color: rgba(255, 255, 255, 0.05);
          color: #7f8c8d;
          cursor: not-allowed;
          border-color: rgba(255, 255, 255, 0.05);
        }
        .standard-input.disabled-input {
             opacity: 0.7;
        }
        textarea.standard-input {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          margin-top: 30px;
          text-align: right;
        }
        .save-btn {
          background: linear-gradient(to right, #00bcd4, #00e5ff);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0, 229, 255, 0.4);
          transition: all 0.3s;
        }
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 229, 255, 0.6);
        }

        @media (max-width: 960px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .left-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .profile-container {
            padding: 20px 15px;
          }
          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}

export default ManagerProfile;