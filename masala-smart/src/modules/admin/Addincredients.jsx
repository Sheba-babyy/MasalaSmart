import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import backgroundImg from "../../assets/img.png";

// Import your API functions here
import { addIngredient, fetchIngredients, deleteIngredient } from "../../services/api";

function AddIngredients() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State to hold the list of available stock
  const [stockList, setStockList] = useState([]);

  // State for the form inputs
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
        // Ensure data is an array before setting it
        setStockList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    loadIngredients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. HANDLE SUBMIT (ADD) - UPDATED TO FIX INVISIBLE TEXT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.dateAdded || !formData.expiryDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Call API to save to database
      const response = await addIngredient(formData);

      // FIX: Construct the new item object manually for the UI state.
      // We combine the form data (which has the text) with the ID from the backend.
      const newItemForState = {
        ...formData,
        _id: response._id || response.id || response.data?._id || Date.now() // specific ID fallback
      };

      // Update UI immediately with the visible data
      setStockList([...stockList, newItemForState]);

      // Reset Form
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
        // Call API
        await deleteIngredient(id);

        // Update UI by filtering out the deleted item
        setStockList(stockList.filter((item) => (item._id || item.id) !== id));
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Failed to delete ingredient.");
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`main-content ${isSidebarOpen ? "content-open" : "content-closed"
          }`}
      >
        <AdminNavbar />

        <div className="page-content">
          <div className="header-box">
            <h1>Ingredient Inventory</h1>
            <p>Manage raw material stock and expiry details.</p>
          </div>

          <div className="grid">
            {/* LEFT CARD: ADD INGREDIENT FORM */}
            <div className="card">
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
                  style={{ borderColor: formData.expiryDate ? '#e74c3c' : '' }} // Visual cue for expiry
                />

                <button className="save-btn" type="submit">Add to Stock</button>
              </form>
            </div>

            {/* RIGHT CARD: STOCK DETAILS TABLE */}
            <div className="card">
              <h3>Stock Details (Available)</h3>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Added On</th>
                      <th>Expires On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockList.length > 0 ? (
                      stockList.map((item) => (
                        /* Use _id (MongoDB) or fall back to id, or index if desperate */
                        <tr key={item._id || item.id || Math.random()}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.dateAdded}</td>
                          <td style={{ color: '#e74c3c' }}>{item.expiryDate}</td>
                          <td>
                            <button
                              className="delete-btn"
                              /* Pass _id to handleDelete */
                              onClick={() => handleDelete(item._id || item.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", opacity: 0.5 }}>
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
      </div>

      {/* STYLES - UNCHANGED */}
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
          border: 1px solid rgba(241, 196, 15, 0.1);
        }

        .card h3 {
          margin-bottom: 20px;
          color: #f1c40f;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }

        label {
          display: block;
          margin-top: 15px;
          font-size: 0.9rem;
          color: #ddd;
        }

        input {
          width: 92%;
          padding: 12px;
          margin-top: 8px;
          background: rgba(0,0,0,0.3);
          border: 1px solid #5d4037;
          border-radius: 6px;
          color: white;
          outline: none;
        }

        input:focus {
          border-color: #f1c40f;
        }

        /* Fix for Date Inputs in Dark Mode */
        input[type="date"] {
            color-scheme: dark;
        }

        .save-btn {
          width: 100%;
          margin-top: 25px;
          padding: 12px;
          background: linear-gradient(135deg,#d35400,#c0392b);
          border: none;
          color: white;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .save-btn:hover {
          transform: scale(1.02);
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          text-align: left;
        }

        th {
          color: #f1c40f;
          font-weight: 600;
          font-size: 0.95rem;
        }

        td {
            font-size: 0.9rem;
        }

        .delete-btn {
          background: rgba(231, 76, 60, 0.2);
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
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

export default AddIngredients;