import React from 'react';
import { useNavigate, Link } from "react-router-dom";

function StaffNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .staff-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          /* Dark Brown background to match sidebar */
          background-color: #2a221b; 
          color: #d4af37; /* Gold text color */
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }

        .navbar-brand h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #d4af37; /* Gold title */
        }

        .navbar-features {
          display: flex;
          gap: 25px;
        }

        .nav-link {
          color: #d4af37; /* Gold links */
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #f1c40f; /* Lighter gold/yellow on hover */
        }

        .navbar-account {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .account-link {
          color: #d4af37; /* Gold account link */
          text-decoration: none;
          font-size: 0.9rem;
          text-wrap: nowrap;
        }

        .account-link:hover {
          text-decoration: underline;
          color: #f1c40f;
        }

        .logout-btn {
          padding: 8px 16px;
          /* Dark Blue button background from sidebar */
          background-color: #1f3a4d; 
          color: #d4af37; /* Gold button text */
          border: 1px solid #d4af37;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background-color: #2c526d; /* Slightly lighter blue on hover */
          color: #f1c40f;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .staff-navbar {
            flex-direction: column;
            gap: 15px;
          }
          .navbar-features {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
        }
      `}</style>

      <nav className="navbar staff-navbar">
        {/* 1. Brand Section */}
        {/* <div className="navbar-brand">
          <h3>Staff Panel</h3>
        </div> */}

        {/* 2. Staff Features Links */}
        <div className="navbar-features">
          <Link to="/staffhome" className="nav-link">Dashboard</Link>
          {/* ✅ Confirmed Link for Tasks */}
          <Link to="/staff/tasks" className="nav-link">My Tasks</Link> 
          {/* <Link to="/staff/schedule" className="nav-link">Schedule</Link> */}
          {/* <Link to="/staff/messages" className="nav-link">Messages</Link> */}
        </div>

        {/* 3. Account & Logout Section */}
        <div className="navbar-account">
          <Link to="/staff/profile" className="account-link">My Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
    </>
  );
}

export default StaffNavbar;