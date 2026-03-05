// src/components/Sidebar.jsx (or wherever your StaffSidebar is located)
import { NavLink, useNavigate } from "react-router-dom";

function StaffSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  const links = [
    { name: "Daily Production", path: "/staff/production" },
    { name: "Packing", path: "/staff/PackingPage" },
    { name: "Workflow", path: "/staff/StaffWorkflow" },
    { name: "Packed-items", path: "/staff/FinishedGoods" },
    { name: "feedback", path: "/staff/FeedbackPage" },
  ];

  return (
    <>
      <div className="sidebar">
        <h2 className="sidebar-title">Staff Panel</h2>

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
          
          /* FIX: Ensures padding is included in height calculation */
          box-sizing: border-box;
          
          /* Glassmorphism Theme */
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
          
          /* Gold Gradient Text */
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
          overflow-y: auto; /* Allow scrolling if list is too long */
          padding-right: 5px; /* Space for scrollbar */
        }

        /* Custom Scrollbar */
        .nav-links::-webkit-scrollbar {
          width: 4px;
        }
        .nav-links::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 10px;
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
          border: 1px solid #ffd700;
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
          background: #ffd700;
        }

        .logout-btn {
          /* FIX: This pushes the button to the bottom and lifts it up */
          margin-top: auto; 
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

export default StaffSidebar;