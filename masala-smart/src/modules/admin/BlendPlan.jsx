import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import backgroundImg from "../../assets/img.png";

function BlendPlans() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [blendPlans, setBlendPlans] = useState([
    {
      id: 1,
      name: "Garam Masala",
      batchSize: "50 kg",
      ingredients: "Coriander, Cumin, Pepper",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    batchSize: "",
    ingredients: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.batchSize) {
      alert("Please fill required fields");
      return;
    }

    setBlendPlans([
      ...blendPlans,
      { id: Date.now(), ...formData },
    ]);

    setFormData({ name: "", batchSize: "", ingredients: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this blend plan?")) {
      setBlendPlans(blendPlans.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`main-content ${
          isSidebarOpen ? "content-open" : "content-closed"
        }`}
      >
        <AdminNavbar />

        <div className="page-content">
          <div className="header-box">
            <h1>Blend Plans</h1>
            <p>Create and manage spice blend recipes.</p>
          </div>

          <div className="grid">
            {/* CREATE BLEND */}
            <div className="card">
              <h3>Create Blend Plan</h3>

              <form onSubmit={handleSubmit}>
                <label>Blend Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Garam Masala"
                />

                <label>Batch Size</label>
                <input
                  name="batchSize"
                  value={formData.batchSize}
                  onChange={handleChange}
                  placeholder="e.g. 50 kg"
                />

                <label>Ingredients</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Coriander, Cumin, Pepper"
                />

                <button className="save-btn">Save Blend</button>
              </form>
            </div>

            {/* BLEND LIST */}
            <div className="card">
              <h3>Existing Blend Plans</h3>

              <table>
                <thead>
                  <tr>
                    <th>Blend Name</th>
                    <th>Batch Size</th>
                    <th>Ingredients</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blendPlans.map((blend) => (
                    <tr key={blend.id}>
                      <td>{blend.name}</td>
                      <td>{blend.batchSize}</td>
                      <td>{blend.ingredients}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(blend.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .dashboard-layout {
          min-height: 100vh;
          background: url(${backgroundImg}) center/cover fixed;
          position: relative;
        }

        .dashboard-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.65);
        }

        .main-content {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          transition: margin-left 0.4s ease;
        }

        .content-open { margin-left: 280px; }
        .content-closed { margin-left: 80px; }

        .page-content {
          padding: 40px;
          color: white;
        }

        .header-box h1 {
          font-size: 2.4rem;
          margin-bottom: 8px;
          color: #f1c40f;
        }

        .grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          margin-top: 30px;
        }

        .card {
          background: rgba(43,29,24,0.85);
          padding: 25px;
          border-radius: 14px;
        }

        .card h3 {
          margin-bottom: 15px;
          color: #f1c40f;
        }

        label {
          display: block;
          margin-top: 10px;
          font-size: 0.9rem;
        }

        input, textarea {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          background: rgba(0,0,0,0.3);
          border: 1px solid #5d4037;
          border-radius: 6px;
          color: white;
        }

        textarea {
          min-height: 80px;
        }

        .save-btn {
          width: 100%;
          margin-top: 15px;
          padding: 12px;
          background: linear-gradient(135deg,#d35400,#c0392b);
          border: none;
          color: white;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }

        th {
          color: #f1c40f;
        }

        .delete-btn {
          background: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #e74c3c;
          color: white;
        }

        @media (max-width: 1024px) {
          .content-open,
          .content-closed {
            margin-left: 0;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default BlendPlans;
