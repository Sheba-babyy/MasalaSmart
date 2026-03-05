import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import backgroundImg from "../../assets/img.png";
import { fetchExpiryAlerts, deleteExpiryItem } from "../../services/api";

function ExpiryAlert() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch live alerts from Backend ---
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await fetchExpiryAlerts();
      setItems(data);
    } catch (err) {
      console.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Item Removal ---
  const handleRemove = async (id) => {
    if (window.confirm("Remove this item from inventory?")) {
      try {
        await deleteExpiryItem(id);
        setItems(items.filter((i) => i.id !== id));
      } catch (err) {
        alert("Error removing item");
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`main-content ${isSidebarOpen ? "content-open" : "content-closed"}`}>
        <AdminNavbar />

        <div className="page-content">
          <div className="header-box">
            <h1>Expiry Alerts</h1>
            <p>Monitor items nearing or past their expiry date.</p>
          </div>

          <div className="card">
            {loading ? (
              <p style={{ textAlign: "center" }}>Checking inventory dates...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    {/* <th>Batch No</th> */}
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      {/* <td>{item.batchNo}</td> */}
                      <td>{item.expiryDate}</td>
                      <td>
                        {/* Logic: Remove spaces for CSS classes like 'nearexpiry' */}
                        <span className={`status ${item.status.replace(/\s+/g, "").toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleRemove(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Keeping all your original CSS exactly as it was */
        .dashboard-layout { min-height: 100vh; background: url(${backgroundImg}) center/cover fixed; position: relative; }
        .dashboard-layout::before { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,0.65); }
        .main-content { position: relative; z-index: 1; min-height: 100vh; transition: margin-left 0.4s ease; }
        .content-open { margin-left: 280px; }
        .content-closed { margin-left: 80px; }
        .page-content { padding: 40px; color: white; }
        .header-box h1 { font-size: 2.4rem; margin-bottom: 8px; color: #f1c40f; }
        .card { background: rgba(43,29,24,0.85); padding: 25px; border-radius: 14px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; }
        th { color: #f1c40f; }
        .status { padding: 5px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }
        .status.safe { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        .status.nearexpiry { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
        .status.expired { background: rgba(231, 76, 60, 0.25); color: #e74c3c; }
        .delete-btn { background: transparent; border: 1px solid #e74c3c; color: #e74c3c; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
        .delete-btn:hover { background: #e74c3c; color: white; }
        @media (max-width: 1024px) { .content-open, .content-closed { margin-left: 0; } }
      `}</style>
    </div>
  );
}

export default ExpiryAlert;