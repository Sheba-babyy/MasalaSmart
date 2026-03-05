import React from "react";
import { useNavigate, Link } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .admin-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #2b1d18; 
          border-bottom: 3px solid #d35400; 
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          width: 100%;
          box-sizing: border-box;
          position: relative; /* Needed for absolute centering */
        }
        
        /* 1. The Title - Centered Absolutely */
        .navbar-brand {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }

        .navbar-brand h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #f1c40f; 
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap; /* Prevents text wrapping */
        }

        /* 2. Left Side - Home Link */
        .navbar-features {
          display: flex;
          gap: 25px;
          z-index: 2; /* Ensures clickable over absolute elements */
        }

        .nav-link {
          color: #ecf0f1;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nav-link:hover {
          color: #f39c12;
        }

        /* 3. Right Side - Account & Logout */
        .navbar-account {
          display: flex;
          align-items: center;
          gap: 20px;
          z-index: 2; /* Ensures clickable */
        }

        .account-link {
          color: #bdc3c7;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .account-link:hover {
          text-decoration: underline;
          color: #f1c40f;
        }

        .logout-btn {
          padding: 8px 20px;
          background-color: #c0392b; 
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }

        .logout-btn:hover {
          background-color: #a93226;
        }

        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .admin-navbar {
            flex-direction: column;
            gap: 15px;
            padding-bottom: 20px;
          }
          
          /* Reset position for mobile so they stack vertically */
          .navbar-brand {
            position: static;
            transform: none;
            order: 1; /* Title first on mobile */
            margin-bottom: 10px;
          }
          
          .navbar-features {
            order: 2;
          }
          
          .navbar-account {
            order: 3;
          }
        }
      `}</style>

      <nav className="navbar admin-navbar">
        {/* LEFT: Home Button */}
        <div className="navbar-features">
          <Link to="/Adminhome" className="nav-link">
            🏠 <span style={{ marginLeft: '5px' }}>Home</span>
          </Link>
        </div>

        {/* CENTER: Title */}
        <div className="navbar-brand">
          <h3>ADMIN PANEL</h3>
        </div>

        {/* RIGHT: Account & Logout */}
        <div className="navbar-account">
          <Link to="/admin/profile" className="account-link">My Account</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
    </>
  );
}

export default AdminNavbar;