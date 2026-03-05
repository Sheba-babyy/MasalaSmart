import React, { useState } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";

const Masala = () => {
  const stock = {
    chilli: 50,
    coriander: 40,
    turmeric: 30,
    pepper: 20,
    cumin: 25,
    mustard: 10,
    fenugreek: 8,
  };

  const masalaRecipes = {
    "Chicken Masala": {
      chilli: 10,
      coriander: 8,
      turmeric: 5,
      pepper: 5,
      cumin: 5,
    },
    "Sambar Masala": {
      chilli: 8,
      coriander: 10,
      turmeric: 6,
      cumin: 6,
      fenugreek: 4,
    },
    "Pickle Masala": {
      chilli: 12,
      mustard: 8,
      fenugreek: 5,
      turmeric: 4,
    },
  };

  const [selectedMasala, setSelectedMasala] = useState("");
  const [result, setResult] = useState(null);

  const generatePlan = () => {
    if (!selectedMasala) return alert("Please select a masala");

    const recipe = masalaRecipes[selectedMasala];
    const missing = [];

    Object.keys(recipe).forEach((i) => {
      if (!stock[i] || stock[i] < recipe[i]) missing.push(i);
    });

    setResult(
      missing.length === 0
        ? { status: "success", message: `${selectedMasala} can be produced`, recipe }
        : { status: "error", message: "Insufficient stock", missing }
    );
  };

  return (
    <>
      <div className="manager-layout">
        <ManagerSidebar activePage="masala" />

        <div className="main-content">
          <ManagerNavbar />
          <div className="dashboard">
            <div className="section-card">
              <h2>Masala Production Planning</h2>

              <div className="input-group">
                <label>Select Next Masala</label>
                <select
                  value={selectedMasala}
                  onChange={(e) => setSelectedMasala(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option>Chicken Masala</option>
                  <option>Sambar Masala</option>
                  <option>Pickle Masala</option>
                </select>
              </div>

              <button onClick={generatePlan}>Generate Plan</button>

              {result && (
                <div className="result">
                  <strong>{result.message}</strong>

                  {result.status === "success" && (
                    <ul>
                      {Object.entries(result.recipe).map(([k, v]) => (
                        <li key={k}>{k} : {v} kg</li>
                      ))}
                    </ul>
                  )}

                  {result.status === "error" && (
                    <p>Missing Ingredients: {result.missing.join(", ")}</p>
                  )}
                </div>
              )}
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
          color: white;
          flex: 1;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 40px;
          max-width: 520px;
        }

        h2 {
          margin-bottom: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }

        select {
          padding: 10px;
          border-radius: 8px;
          border: none;
        }

        button {
          padding: 12px;
          width: 100%;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #22d3ee, #e879f9);
          color: #020617;
          font-weight: 700;
          cursor: pointer;
        }

        .result {
          margin-top: 25px;
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 16px;
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

export default Masala;
