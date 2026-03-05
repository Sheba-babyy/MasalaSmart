// pages/RawMaterialIssuance.jsx
import React, { useState } from "react";
import StaffSidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png";

function RawMaterialIssuance() {
  const [materials, setMaterials] = useState([
    { id: 1, name: "Turmeric Powder", issuedQty: 0, stock: 100 },
    { id: 2, name: "Chili Powder", issuedQty: 0, stock: 50 },
    { id: 3, name: "Coriander Powder", issuedQty: 0, stock: 75 },
  ]);

  const handleInputChange = (id, value) => {
    setMaterials(
      materials.map((m) =>
        m.id === id ? { ...m, issuedQty: Number(value) } : m
      )
    );
  };

  const handleIssue = () => {
    const updated = materials.map((m) => ({
      ...m,
      stock: m.stock - m.issuedQty,
      issuedQty: 0,
    }));
    setMaterials(updated);
    alert("Materials issued successfully!");
  };

  return (
    <div className="staff-layout">
      <StaffSidebar />

      <div className="main-content">
        <StaffNavbar />

        <div className="dashboard">
          <div className="header-section">
            <h1>Raw Material Issuance</h1>
            <p className="subtitle">
              Issue raw materials to production staff according to today's blend plan.
            </p>
          </div>

          <div className="cards-grid">
            {materials.map((m) => (
              <div key={m.id} className="card">
                <div className="icon">📦</div>
                <h3>{m.name}</h3>
                <p>Current Stock: {m.stock} kg</p>
                <input
                  type="number"
                  min="0"
                  max={m.stock}
                  value={m.issuedQty}
                  onChange={(e) => handleInputChange(m.id, e.target.value)}
                  placeholder="Enter quantity to issue"
                  className="issue-input"
                />
              </div>
            ))}
          </div>

          <button className="issue-btn" onClick={handleIssue}>
            Issue Selected Materials
          </button>
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
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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
          font-size: 3rem;
          margin-bottom: 16px;
          color: #ffd700;
          font-weight: 800;
          text-shadow: 3px 3px 0px #000;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #e0e0e0;
          max-width: 900px;
          margin-bottom: 60px;
          line-height: 1.6;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 30px;
        }

        .card {
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 30px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
          animation: cardFadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .card:hover {
          transform: translateY(-5px);
          border-color: #ffd700;
        }

        .icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .card h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #ffd700;
        }

        .card p {
          font-size: 1rem;
          margin-bottom: 12px;
          color: #ccc;
        }

        .issue-input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #5d4037;
          background: rgba(0,0,0,0.2);
          color: white;
          font-size: 0.95rem;
        }

        .issue-btn {
          padding: 14px 30px;
          background: linear-gradient(135deg, #d35400, #c0392b);
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s;
        }

        .issue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(211, 84, 0, 0.4);
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 80px; }
          .dashboard { padding: 40px 20px; }
        }
      `}</style>
    </div>
  );
}

export default RawMaterialIssuance;
