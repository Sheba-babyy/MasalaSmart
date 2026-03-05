import { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    // { name: "Master Setup", path: "/admin/master-setup", icon: "⚙️" },
    { name: "Manager SetUp", path: "/admin/UserSetup", icon: "👥" },
    { name: "BOM Creation", path: "/admin/BOMCreation", icon: "📋" },
    // { name: "Blend Plans", path: "/admin/blendplan", icon: "🔄" },
    { name: "Expiry Alerts", path: "/admin/ExpiryAlert", icon: "⚠️" },
    { name: "Reports", path: "/admin/reports", icon: "📊" },
    { name: "Add incredients", path: "/admin/Addincredients", icon: "+" }
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2>{isOpen ? "BlendMaster" : "BM"}</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
          {isOpen ? "◀" : "▶"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            {isOpen && <span className="text">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <style jsx>{`
        .sidebar {
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: white;
          transition: width 0.4s ease;
          width: 280px;
          z-index: 100;
          box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
        }

        .sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar-header h2 {
          font-size: 1.8rem;
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: white;
          font-size: 0.5rem;
          cursor: pointer;
        }

        .sidebar-nav {
          padding: 20px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 15px 25px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s;
        }

        .nav-item:hover {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
        }

        .nav-item.active {
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          color: #333;
          font-weight: bold;
        }

        .icon {
          font-size: 1.5rem;
          min-width: 40px;
          text-align: center;
        }

        .text {
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 80px;
          }
          .sidebar.open {
            width: 280px;
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;