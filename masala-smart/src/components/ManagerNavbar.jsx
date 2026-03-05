import React from 'react';
import { useNavigate, Link } from "react-router-dom";

function ManagerNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .manager-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #0c0b15ff; /* Indigo/Purple for Manager */
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .navbar-brand h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .navbar-features {
          display: flex;
          gap: 25px;
        }

        .nav-link {
          color: #e0e0e0;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #a29bfe; /* Lighter lavender on hover */
          text-shadow: 0 0 5px rgba(255,255,255,0.3);
        }

        .navbar-account {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .account-link {
          color: #e0e0e0;
          text-decoration: none;
          font-size: 0.9rem;
          text-wrap: nowrap;
        }

        .account-link:hover {
          text-decoration: underline;
          color: white;
        }

        .logout-btn {
          padding: 8px 16px;
          background-color: #0f0f11ff; /* Darker purple */
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background-color: #301b9e;
          transform: translateY(-1px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .manager-navbar {
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

      <nav className="navbar manager-navbar">
        {/* 1. Brand Section */}
        <div className="navbar-brand">
          <h3>Manager Panel</h3>
        </div>

        {/* 2. Manager Features Links */}
        <div className="navbar-features">
          <Link to="/managerhome" className="nav-link">Dashboard</Link>
          {/* <Link to="/manager/approvals" className="nav-link">Approvals</Link> */}
          <Link to="/manager/reports" className="nav-link">Reports</Link>
          {/* <Link to="/manager/team" className="nav-link">Team</Link> */}
        </div>

        {/* 3. Account & Logout Section */}
        <div className="navbar-account">
          <Link to="/manager/profile" className="account-link">My Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
    </>
  );
}

export default ManagerNavbar;