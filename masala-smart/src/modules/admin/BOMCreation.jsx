import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import backgroundImg from "../../assets/img.png";

// Import API functions
import {
  fetchBOMs,
  createBOM,
  deleteBOM,
  fetchMasalaTypes,
  addMasalaType,
  fetchIngredients,
} from "../../services/api";

function BOMCreation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- DATA FROM API ---
  const [bomList, setBomList] = useState([]);
  const [masalaList, setMasalaList] = useState([]);
  const [ingredientList, setIngredientList] = useState([]);

  // --- FORM STATE FOR CREATING BOM ---
  const [selectedMasalaId, setSelectedMasalaId] = useState("");

  // CHANGED: We initialize with one empty row so the user can start typing immediately
  const [bomItems, setBomItems] = useState([
    { ingredient_id: "", qty: "" }
  ]);

  // --- FORM STATE FOR MASALA TYPE ---
  const [newMasalaName, setNewMasalaName] = useState("");

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bomsData, masalasData, ingredientsData] = await Promise.all([
        fetchBOMs(),
        fetchMasalaTypes(),
        fetchIngredients(),
      ]);
      setBomList(bomsData);
      setMasalaList(masalasData);
      setIngredientList(ingredientsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // --- HANDLERS FOR MASALA TYPES ---
  const handleAddMasala = async (e) => {
    e.preventDefault();
    if (!newMasalaName.trim()) return alert("Enter Masala Name");

    try {
      const newMasala = await addMasalaType(newMasalaName);
      setMasalaList([...masalaList, newMasala]);
      setNewMasalaName("");
    } catch (error) {
      console.error("Error adding masala:", error);
      alert("Failed to add masala type");
    }
  };

  // --- NEW HANDLERS FOR DYNAMIC BOM ROWS ---

  // 1. Handle changing values in a specific row
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...bomItems];
    updatedItems[index][field] = value;
    setBomItems(updatedItems);
  };

  // 2. Add a new empty row
  const addNewRow = () => {
    setBomItems([...bomItems, { ingredient_id: "", qty: "" }]);
  };

  // 3. Remove a row
  const removeRow = (index) => {
    const updatedItems = bomItems.filter((_, i) => i !== index);
    setBomItems(updatedItems);
  };

  // 4. Submit the full BOM to API
  const handleCreateBOM = async (e) => {
    e.preventDefault();
    if (!selectedMasalaId) return alert("Please select a Product/Masala");

    // Filter out empty rows before sending
    const validItems = bomItems.filter(item => item.ingredient_id && item.qty);

    if (validItems.length === 0) return alert("Please add at least one valid ingredient");

    try {
      // Prepare payload matches API: { masala_id, items: [{ ingredient_id, qty }] }
      const payloadItems = validItems.map(({ ingredient_id, qty }) => ({ ingredient_id, qty }));

      await createBOM(selectedMasalaId, payloadItems);

      alert("BOM Created Successfully!");

      // Reset Form
      setSelectedMasalaId("");
      setBomItems([{ ingredient_id: "", qty: "" }]); // Reset to one empty row

      // Refresh BOM list
      const updatedBOMs = await fetchBOMs();
      setBomList(updatedBOMs);

    } catch (error) {
      console.error("Error creating BOM:", error);
      alert("Failed to create BOM");
    }
  };

  const handleDeleteBOM = async (id) => {
    if (!window.confirm("Delete this Recipe?")) return;
    try {
      await deleteBOM(id);
      setBomList(bomList.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting BOM:", error);
    }
  };

  // Helper to lookup names for the table display
  const getMasalaName = (id) => masalaList.find(m => m.id === id)?.name || "Unknown Masala";
  const getIngredientName = (id) => ingredientList.find(i => i.id === id)?.name || "Unknown Ingredient";

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
            <h1>BOM & Product Master</h1>
            <p>Manage Bill of Materials and Masala Categories.</p>
          </div>

          <div className="grid">
            {/* --- LEFT COLUMN: FORMS --- */}
            <div className="left-column">

              {/* CARD 1: CREATE BOM */}
              <div className="card">
                <h3>Create BOM Recipe</h3>
                <form onSubmit={handleCreateBOM}>

                  {/* Select Masala Type */}
                  <label>Select Product / Blend</label>
                  <select
                    value={selectedMasalaId}
                    onChange={(e) => setSelectedMasalaId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Masala Type --</option>
                    {masalaList.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>

                  {/* Dynamic Ingredient Rows */}
                  <label>Build Recipe (Raw Materials)</label>
                  <div className="ingredients-container">
                    {bomItems.map((item, index) => (
                      <div key={index} className="ingredient-row">
                        {/* Ingredient Dropdown */}
                        <select
                          value={item.ingredient_id}
                          onChange={(e) => handleItemChange(index, "ingredient_id", e.target.value)}
                          className="row-select"
                        >
                          <option value="">Select Ingredient...</option>
                          {ingredientList.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>

                        {/* Quantity Input */}
                        <input
                          type="text"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                          className="row-input"
                        />

                        {/* Remove Button (Only show if more than 1 row or if user wants to clear) */}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeRow(index)}
                          title="Remove Line"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Button to Add New Row */}
                  <button
                    type="button"
                    className="add-row-btn"
                    onClick={addNewRow}
                  >
                    + Add Another Ingredient
                  </button>

                  <button className="save-btn">Save BOM Configuration</button>
                </form>
              </div>

              {/* CARD 2: ADD MASALA TYPE */}
              <div className="card mt-4">
                <h3>Add Masala Type</h3>
                <form onSubmit={handleAddMasala}>
                  <label>New Category Name</label>
                  <input
                    type="text"
                    value={newMasalaName}
                    onChange={(e) => setNewMasalaName(e.target.value)}
                    placeholder="e.g. Fish Fry Masala"
                  />
                  <button className="save-btn btn-secondary">Add Category</button>
                </form>
              </div>

            </div>

            {/* --- RIGHT COLUMN: LISTS --- */}
            <div className="right-column">

              {/* CARD 3: EXISTING BOMs */}
              <div className="card">
                <h3>Existing Recipes (BOM)</h3>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Materials Breakdown</th>
                        <th style={{ width: '60px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomList.map((bom) => (
                        <tr key={bom.id}>
                          <td>{getMasalaName(bom.masala_id)}</td>
                          <td>
                            <small>
                              {bom.items && bom.items.length > 0 ? (
                                bom.items.map((item, idx) => (
                                  <span key={idx}>
                                    {getIngredientName(item.ingredient_id)} ({item.qty})
                                    {idx < bom.items.length - 1 ? ", " : ""}
                                  </span>
                                ))
                              ) : (
                                <span style={{ opacity: 0.5 }}>No ingredients</span>
                              )}
                            </small>
                          </td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteBOM(bom.id)}
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

              {/* CARD 4: MASALA TYPE LIST */}
              <div className="card mt-4">
                <h3>Available Masala Types</h3>
                {masalaList.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No masala types added yet.</p>
                ) : (
                  <ul className="masala-list-view">
                    {masalaList.map((masala) => (
                      <li key={masala.id}>
                        <span>{masala.name}</span>
                        <button
                          className="icon-btn"
                          onClick={() => {
                            if (window.confirm("Delete this category?")) {
                              // Add delete logic here if needed
                              console.log("Delete logic here");
                            }
                          }}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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
          align-items: start;
        }
        
        .mt-4 { margin-top: 25px; }

        .card {
          background: rgba(43,29,24,0.85);
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .card h3 {
          margin-bottom: 15px;
          color: #f1c40f;
          border-bottom: 1px solid rgba(241, 196, 15, 0.2);
          padding-bottom: 10px;
        }

        label {
          display: block;
          margin-top: 10px;
          font-size: 0.9rem;
          color: #ddd;
        }
        select, textarea {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          background: rgba(0,0,0,0.3);
          border: 1px solid #5d4037;
          border-radius: 6px;
          color: white;
        }
        input {
          width: 93%;
          padding: 10px;
          margin-top: 5px;
          background: rgba(0,0,0,0.3);
          border: 1px solid #5d4037;
          border-radius: 6px;
          color: white;
        }
        option { background-color: #3e2723; color: white; }

        /* Dynamic Row Styles */
        .ingredients-container {
            margin-top: 10px;
        }
        .ingredient-row {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
            align-items: center;
        }
        .row-select {
            flex: 2; /* Takes up more space */
        }
        .row-input {
            flex: 1; /* Takes up less space */
        }
        .remove-btn {
            background: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            border: 1px solid #e74c3c;
            width: 30px;
            height: 38px;
            border-radius: 6px;
            font-size: 1.2rem;
            cursor: pointer;
            margin-top: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .remove-btn:hover {
            background: #e74c3c;
            color: white;
        }

        .add-row-btn {
            background: transparent;
            border: 1px dashed #f1c40f;
            color: #f1c40f;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            margin-top: 5px;
            font-size: 0.9rem;
        }
        .add-row-btn:hover {
            background: rgba(241, 196, 15, 0.1);
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
        .save-btn:hover { filter: brightness(1.1); }
        .btn-secondary { background: linear-gradient(135deg,#e67e22,#d35400); }

        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          text-align: left;
          font-size: 0.9rem;
        }
        th { color: #f1c40f; }

        .delete-btn {
          background: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .delete-btn:hover { background: #e74c3c; color: white; }

        .masala-list-view { list-style: none; padding: 0; margin: 0; }
        .masala-list-view li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 3px solid #f1c40f;
        }
        .icon-btn {
            background: none;
            border: none;
            color: #e74c3c;
            font-size: 1.4rem;
            cursor: pointer;
            line-height: 1;
        }
        .icon-btn:hover { color: white; }

        @media (max-width: 1024px) {
          .content-open, .content-closed { margin-left: 0; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default BOMCreation;