import React, { useState, useEffect } from "react";
import StaffSidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png";
import { fetchStaffSession, completeStaffSession } from "../../services/api";

function StaffHome() {
  const [sessionInfo, setSessionInfo] = useState({ assigned_session: "Unassigned", session_status: "N/A" });
  const [loading, setLoading] = useState(true);
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const data = await fetchStaffSession(loginId);
      setSessionInfo(data);
    } catch (err) {
      console.error("Error loading session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm("Mark this session as completed?")) return;
    try {
      await completeStaffSession(loginId);
      alert("Session completed successfully!");
      loadSession();
    } catch (err) {
      alert("Error: " + (err.error || "Could not complete session"));
    }
  };

  return (
    <div className="staff-layout">
      <StaffSidebar />

      <div className="main-content">
        <StaffNavbar />

        <div className="dashboard">
          <div className="header-section">
            <h1>Welcome Back, Staff!</h1>
            <p className="subtitle">
              Execute daily production tasks efficiently with BlendMaster Blend Plan System.
            </p>
          </div>

          {/* --- NEW SESSION ASSIGNMENT CARD --- */}
          {!loading && sessionInfo.assigned_session !== "Unassigned" && (
            <div className="assignment-highlight">
              <div className="assignment-content">
                <div className="assignment-info">
                  <span className="assignment-label">Current Assignment:</span>
                  <div className="assignment-value">
                    <span className={`session-icon ${sessionInfo.assigned_session.toLowerCase().replace(" ", "-")}`}>●</span>
                    {sessionInfo.assigned_session}
                  </div>
                </div>
                <div className="assignment-status-chip">
                  Status: <span className={`status-val ${sessionInfo.session_status.toLowerCase()}`}>{sessionInfo.session_status}</span>
                </div>
              </div>
              {sessionInfo.session_status === "Active" && (
                <button className="complete-btn" onClick={handleComplete}>
                  ✓ Mark as Completed
                </button>
              )}
            </div>
          )}

          <div className="cards-grid">
            <div className="card highlight">
              <div className="icon">📦</div>
              <h3>Daily Stock Issuance</h3>
              <p>Issue raw materials as per today's approved blend plan</p>
            </div>

            <div className="card">
              <div className="icon">⚙️</div>
              <h3>Record Production</h3>
              <p>Log blending, grinding, and packing activities with batch details</p>
            </div>

            <div className="card">
              <div className="icon">✅</div>
              <h3>Batch Tracking</h3>
              <p>Scan QR/barcode and record finished goods batch numbers</p>
            </div>

            <div className="card highlight">
              <div className="icon">📊</div>
              <h3>Today's Targets</h3>
              <p>View assigned production goals and real-time progress</p>
            </div>

            <div className="card alert">
              <div className="icon">⚠️</div>
              <h3>Near-Expiry Alert</h3>
              <p>Prioritize using stock items expiring soon – Zero Waste Goal!</p>
            </div>

            <div className="card">
              <div className="icon">🖨️</div>
              <h3>Print Labels</h3>
              <p>Generate packing slips, batch labels, and expiry stickers</p>
            </div>

            <div className="card">
              <div className="icon">📋</div>
              <h3>Shift Handover</h3>
              <p>Submit end-of-shift report and pending tasks</p>
            </div>

            <div className="card">
              <div className="icon">🔍</div>
              <h3>Quick Stock Check</h3>
              <p>Instant lookup of current raw material and FG inventory</p>
            </div>
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
        }

        .staff-layout::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: -1;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          padding: 80px 50px;
          flex: 1;
          color: white;
        }

        .header-section h1 {
          font-size: 3.5rem;
          margin-bottom: 16px;
          color: #ffd700;
          font-weight: 800;
          text-shadow: 3px 3px 0px #000000;
          letter-spacing: 1px;
        }

        .subtitle {
          font-size: 1.4rem;
          color: #e0e0e0;
          max-width: 900px;
          margin-bottom: 40px;
          line-height: 1.6;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        }

        /* Assignment Highlight Styles */
        .assignment-highlight {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(0, 0, 0, 0.5));
          border: 2px solid #ffd700;
          border-radius: 20px;
          padding: 25px 40px;
          margin-bottom: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(15px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }

        .assignment-content {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .assignment-label {
          color: #ffd700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          display: block;
          margin-bottom: 5px;
        }

        .assignment-value {
          font-size: 2.2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .session-icon { font-size: 1.5rem; }
        .session-icon.packing { color: #ec4899; }
        .session-icon.blending { color: #f97316; }
        .session-icon.machine-operation { color: #3b82f6; }
        .session-icon.cleaning { color: #a8a29e; }

        .assignment-status-chip {
          background: rgba(255,255,255,0.08);
          padding: 8px 20px;
          border-radius: 99px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .status-val.active { color: #60a5fa; }
        .status-val.completed { color: #4ade80; }

        .complete-btn {
          background: #4ade80;
          color: #064e3b;
          border: none;
          padding: 14px 30px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
        }

        .complete-btn:hover {
          background: #22c55e;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }

        .card {
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 36px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          opacity: 0;
          animation: cardFadeIn 0.8s ease-out forwards;
        }

        .card:hover {
          transform: translateY(-8px);
          border-color: #ffd700;
          background: rgba(45, 45, 45, 0.95);
        }

        .card.highlight {
          border-left: 5px solid #ffd700;
          background: rgba(45, 35, 20, 0.85);
        }

        .card h3 {
          font-size: 1.6rem;
          margin-bottom: 12px;
          color: #ffd700;
          font-weight: 700;
        }

        .card p {
          font-size: 1.05rem;
          color: #cccccc;
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .assignment-highlight { flex-direction: column; gap: 24px; align-items: flex-start; }
          .complete-btn { width: 100%; }
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 80px; }
          .dashboard { padding: 40px 20px; }
          .header-section h1 { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}

export default StaffHome;