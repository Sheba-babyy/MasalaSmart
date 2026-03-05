import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function ManagerSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  const links = [
    { name: "Dashboard", path: "/managerhome" },
    // { name: "incredient adding", path: "/manager/productionplanning" },
    { name: "Blendplan", path: "/manager/blendplan" },
    { name: "Staff Management", path: "/manager/Staffmanagement" },
    { name: "Workforce Management", path: "/manager/WorkforceManagement" },
    { name: "Adding incredients", path: "/manager/addincredients" },
    {name: "Batch Tracking Page",path:"/manager/BatchTrackingPage"},
    
    {name:"Manager Dispatch" ,path: "/staff/ManagerDispatch"},
    { name: "Reports & Audits", path: "/manager/reports" },
    
  ];

  return (
    <>
      <div className="sidebar">
        <h2 className="sidebar-title">Manager Hub</h2>

        <div className="nav-links">
          {links.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          
          /* Glassmorphism - Dark elegant background */
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          
        }

        .sidebar-title {
          font-size: 2rem;
          margin-bottom: 30px;
          text-align: center;
          font-weight: 800;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          
          /* Beautiful Gold to White Gradient */
          background: linear-gradient(90deg, #ffffff, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .nav-links {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          padding-right: 5px;
        }

        /* Custom slim scrollbar */
        // .nav-links::-webkit-scrollbar {
        //   width: 4px;
        // }
        // .nav-links::-webkit-scrollbar-thumb {
        //   background: rgba(255, 215, 0, 0.3);
        //   border-radius: 10px;
        // }

        .nav-links::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }

        .nav-link {
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffd700;
          transform: translateX(5px);
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .nav-link.active {
          background: rgba(255, 215, 0, 0.15);
          color: #ffd700;
          border: 1px solid #0033ffff;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #416ae6ff;
        }

        .logout-btn {
          margin-top: 20px;
          margin-bottom: 20px;
          width: 100%;
          padding: 15px;
          background: rgba(220, 38, 38, 0.2);
          border: 1px solid rgba(220, 38, 38, 0.5);
          color: #ffcccc;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.4);
          color: white;
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
          transform: translateY(-2px);
          border-color: #ff4444;
        }
      `}</style>
    </>
  );
}