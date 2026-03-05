import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png"; // Manager specific background

// Import API functions (Same as Admin)
import { addIngredient, fetchIngredients, deleteIngredient } from "../../services/api";

const ManagerAddIngredients = () => {
  // State for stock list
  const [stockList, setStockList] = useState([]);

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    dateAdded: "",
    expiryDate: "",
  });

  // 1. FETCH DATA ON LOAD
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const data = await fetchIngredients();
        setStockList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    loadIngredients();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.dateAdded || !formData.expiryDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await addIngredient(formData);
      
      // Construct new item for UI state
      const newItemForState = {
        ...formData,
        _id: response._id || response.id || response.data?._id || Date.now()
      };
      
      setStockList([...stockList, newItemForState]);
      setFormData({ name: "", quantity: "", dateAdded: "", expiryDate: "" });
      alert("Ingredient added successfully!");
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Failed to add ingredient. Please try again.");
    }
  };

  // 3. HANDLE DELETE
  const handleDelete = async (id) => {
    if (window.confirm("Remove this ingredient from stock?")) {
      try {
        await deleteIngredient(id);
        setStockList(stockList.filter((item) => (item._id || item.id) !== id));
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Failed to delete ingredient.");
      }
    }
  };

  return (
    <>
      {/* Layout */}
      <div className="manager-layout">
        {/* Sidebar - assuming 'inventory' is the active key */}
        <ManagerSidebar activePage="inventory" />

        {/* Main Content */}
        <div className="main-content">
          {/* Navbar */}
      <ManagerNavbar />
          <div className="dashboard">
            
            {/* Page Header */}
            <div className="header-section">
              <h2>Ingredient Inventory</h2>
              <p className="subtitle">Manage raw material stock and expiry details.</p>
            </div>

            <div className="grid-container">
              
              {/* LEFT CARD: ADD FORM */}
              <div className="glass-card">
                <h3>Add New Ingredient</h3>
                <form onSubmit={handleSubmit}>
                  <label>Ingredient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Black Pepper"
                  />

                  <label>Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 10 kg"
                  />

                  <label>Date Added</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={formData.dateAdded}
                    onChange={handleChange}
                  />

                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    style={{ borderColor: formData.expiryDate ? '#ef4444' : '' }}
                  />

                  <button className="action-btn" type="submit">Add to Stock</button>
                </form>
              </div>

              {/* RIGHT CARD: TABLE */}
              <div className="glass-card table-card">
                <h3>Current Stock</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Added</th>
                        <th>Expires</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockList.length > 0 ? (
                        stockList.map((item) => (
                          <tr key={item._id || item.id || Math.random()}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.dateAdded}</td>
                            <td style={{ color: '#ef4444', fontWeight: '500' }}>{item.expiryDate}</td>
                            <td>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(item._id || item.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            No stock available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Scoped Styles for Manager Theme */}
      <style jsx>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
          font-family: "Inter", sans-serif;
        }

        .manager-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.85); /* Dark overlay */
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
          padding: 80px 40px;
          flex: 1;
          color: white;
        }

        .header-section {
          margin-bottom: 40px;
        }

        h2 {
          font-size: 2.2rem;
          margin-bottom: 10px;
          color: white;
        }

        .subtitle {
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        /* Grid Layout for Form + Table */
        .grid-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
        }

        /* Glassmorphism Card Style */
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-card h3 {
          margin-bottom: 20px;
          color: #f1c40f; /* Gold accent kept from admin */
          font-size: 1.3rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }

        /* Form Elements */
        label {
          display: block;
          margin-top: 15px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        input {
          width: 92%;
          padding: 12px;
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus {
          border-color: #f1c40f;
        }
        
        input[type="date"] {
          color-scheme: dark;
        }

        .action-btn {
          width: 100%;
          margin-top: 25px;
          padding: 12px;
          background: linear-gradient(135deg, #d97706, #b45309);
          border: none;
          color: white;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .action-btn:hover {
          transform: scale(1.02);
        }

        /* Table Styling */
        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        th {
          color: #f1c40f;
          font-weight: 600;
          font-size: 0.95rem;
        }

        td {
          font-size: 0.9rem;
          color: #e2e8f0;
        }

        .empty-state {
          text-align: center;
          padding: 30px;
          opacity: 0.6;
          font-style: italic;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: #ef4444;
          color: white;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
          .dashboard {
            padding: 100px 30px 40px;
          }
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

export default ManagerAddIngredients;