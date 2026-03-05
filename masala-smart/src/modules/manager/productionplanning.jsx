import React, { useState } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";

const ProductionPlanning = () => {
  const [formData, setFormData] = useState({
    ingredientName: "",
    weight: "",
    date: "",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Production Planning Data:", formData);

    setFormData({ ingredientName: "", weight: "", date: "" });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <>
      <div className="manager-layout">
        <ManagerSidebar activePage="productionplanning" />

        <div className="main-content">
          <ManagerNavbar />
          <div className="dashboard">
            <div className="section-card">
              <h2>Production Planning</h2>

              {submitSuccess && (
                <div className="success-message">
                  Production plan submitted successfully!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Ingredient Name</label>
                  <input
                    type="text"
                    name="ingredientName"
                    value={formData.ingredientName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit">Submit Plan</button>
              </form>
            </div>
          </div>

          <Footer />
        </div>
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
        }

        .manager-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          z-index: 0;
        }

        .main-content {
          margin-left: 280px;
          width: calc(100% - 280px);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .dashboard {
          padding: 40px 60px 60px;
          flex: 1;
          color: white;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 40px;
          max-width: 480px;
        }

        h2 {
          margin-bottom: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }

        label {
          margin-bottom: 6px;
          color: #cbd5f5;
        }

        input {
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-size: 16px;
        }

        button {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #22d3ee, #e879f9);
          color: #020617;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        button:hover {
          transform: translateY(-2px);
        }

        .success-message {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default ProductionPlanning;
