// src/api.jsx
import axios from "axios";

// Base URL for your Flask backend
const BASE_URL = "http://127.0.0.1:5000"; // or your server IP

// -------------------------
// REGISTER USER
// -------------------------
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    // If backend sends JSON error
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw { error: "Something went wrong!" };
    }
  }
};

// -------------------------
// LOGIN USER
// -------------------------
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw { error: "Login failed" };
    }
  }
};






export const getStaffProfile = async (loginId) => {
  try {
    const response = await axios.get(`${BASE_URL}/staff/${loginId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to load profile" };
  }
};




// -------------------------
// UPDATE STAFF PROFILE
// -------------------------
export const updateStaffProfile = async (loginId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/staff/${loginId}`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Profile update failed" };
  }
};














// -------------------------
// GET ALL USERS
// -------------------------
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};


// -------------------------
// GET STAFF COUNT
// -------------------------
export const getStaffCount = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/staff/count`);
    return response.data; // returns { totalStaff: 5 }
  } catch (error) {
    console.error("Error fetching staff count:", error);
    return { totalStaff: 0 }; // Return 0 on error
  }
};



export const createManager = async (managerData) => {
  try {
    const response = await axios.post(`${BASE_URL}/managers`, managerData);
    return response.data;
  } catch (error) {
    console.error("Error creating manager:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};




// Get all managers
export const fetchManagers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/managers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};




// Delete a manager by ID
export const deleteManager = async (managerId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/managers/${managerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting manager:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


// ============================
// 🔹 INGREDIENTS
// ============================
export const addIngredient = async (data) => {
  const res = await axios.post(`${BASE_URL}/ingredients`, data);
  return { ...res.data, id: res.data._id }; // normalize _id → id
};

export const fetchIngredients = async () => {
  const res = await axios.get(`${BASE_URL}/ingredients`);
  return res.data.map(i => ({
    ...i,
    id: i._id,
    name: i.name,
    quantity: i.quantity
  }));
};

export const deleteIngredient = async (id) => {
  const res = await axios.delete(`${BASE_URL}/ingredients/${id}`);
  return res.data;
};

// ============================
// 🔹 MASALA TYPES
// ============================
export const fetchMasalaTypes = async () => {
  const res = await axios.get(`${BASE_URL}/masala-types`);

  return res.data.map((m) => ({
    ...m,
    id: m._id,   // ✅ normalize
  }));
};

/**
 * ADD new masala type
 */
export const addMasalaType = async (name) => {
  const res = await axios.post(`${BASE_URL}/masala-types`, { name });

  return {
    ...res.data,
    id: res.data._id, // ✅ normalize
  };
};

// export const deleteMasalaType = async (id) => {
//   const res = await axios.delete(`${BASE_URL}/masala-types/${id}`);
//   return res.data;
// };

// ============================
// 🔹 BOMs
// ============================
export const fetchBOMs = async () => {
  const res = await axios.get(`${BASE_URL}/boms`);
  return res.data.map(bom => ({
    ...bom,
    id: bom._id,
    masala_id: bom.masala_id,
    items: bom.materials
      ? bom.materials.map(item => ({
        ingredient_id: item.ingredient_id || item.ingredient, // fallback if backend returns name
        qty: item.qty,
        tempName: item.ingredient || item.name
      }))
      : []
  }));
};

export const createBOM = async (masala_id, items) => {
  const res = await axios.post(`${BASE_URL}/boms`, { masala_id, items });
  return { ...res.data, id: res.data._id };
};

export const deleteBOM = async (id) => {
  const res = await axios.delete(`${BASE_URL}/boms/${id}`);
  return res.data;
};


//manager profile

export const getManagerProfile = (loginId) =>
  axios.get(`${BASE_URL}/managers/profile/${loginId}`);


// Add to src/services/api.jsx

export const generateBlendPlan = async (masala_id, target_quantity) => {
  try {
    // Passing masala_name is optional but helps the frontend display it
    const res = await axios.post(`${BASE_URL}/blend-plan`, {
      masala_id,
      target_quantity
    });
    return res.data;
  } catch (error) {
    console.error("Error generating blend plan:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get pending staff for Manager Dashboard
export const getPendingStaff = async () => {
  const res = await axios.get(`${BASE_URL}/managers/pending-staff`);
  return res.data;
};

// Approve a specific staff member
export const approveStaff = async (loginId) => {
  const res = await axios.post(`${BASE_URL}/managers/approve-staff/${loginId}`);
  return res.data;
};



// Delete a staff member
export const deleteStaff = async (loginId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/staff/${loginId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting staff:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// -------------------------
// REPORTS
// -------------------------
export const fetchReportData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw error; // Let the component handle the error state
  }
};


// ... existing imports

// TASK MANAGEMENT
export const createTask = async (taskData) => {
  const res = await axios.post(`${BASE_URL}/tasks`, taskData);
  return res.data;
};

export const fetchTasks = async () => {
  const res = await axios.get(`${BASE_URL}/tasks`);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await axios.delete(`${BASE_URL}/tasks/${id}`);
  return res.data;
};



// ... existing imports

// STAFF SPECIFIC TASKS
export const fetchStaffTasks = async (loginId) => {
  const res = await axios.get(`${BASE_URL}/staff/tasks/${loginId}`);
  return res.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const res = await axios.patch(`${BASE_URL}/tasks/${taskId}/status`, { status });
  return res.data;
};

// --- STAFF SESSION TRACKING ---
export const fetchStaffSession = async (loginId) => {
  try {
    const response = await axios.get(`${BASE_URL}/staff/current-session/${loginId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch session" };
  }
};

export const completeStaffSession = async (loginId) => {
  try {
    const response = await axios.post(`${BASE_URL}/staff/complete-session/${loginId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to complete session" };
  }
};

// --- ADD TO api.jsx ---

// Add this to your existing api.jsx
export const startProduction = async (productionData) => {
  try {
    const response = await axios.post(`${BASE_URL}/production/start`, productionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to start production" };
  }
};

export const fetchActiveProduction = async () => {
  const res = await axios.get(`${BASE_URL}/production/active`);
  return res.data;
};

// --- ADD TO api.jsx ---

export const updateProductionRecord = async (batchId, updateData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/production/update/${batchId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to update production" };
  }
};

// --- ADD TO api.jsx ---

/**
 * Saves the packing record and moves the batch to finished goods.
 * This should also update the bulk production batch status to 'Completed'.
 */
export const savePackingRecord = async (packingData) => {
  try {
    const response = await axios.post(`${BASE_URL}/packing/save`, packingData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving packing record:", error.response?.data || error.message);
    throw error.response?.data || { error: "Failed to save packing record" };
  }
};


export const fetchAllPacking = async () => {
  const res = await axios.get(`${BASE_URL}/packing/all`);
  return res.data;
};

// --- ADD TO api.jsx ---

export const fetchTrackingBatches = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/production/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    throw error;
  }
};

export const fetchAdminAnalytics = async () => {
  const res = await axios.get(`${BASE_URL}/admin/analytics`);
  return res.data;
};

// --- ADD TO api.jsx ---

// --- Ensure these are in api.jsx ---

export const fetchExpiryAlerts = async () => {
  const res = await axios.get(`${BASE_URL}/admin/expiry-alerts`);
  return res.data;
};

export const deleteExpiryItem = async (id) => {
  const res = await axios.delete(`${BASE_URL}/admin/expiry-alerts/${id}`);
  return res.data;
};


// ------------------------------------------
// PRODUCTION WORKFLOW MANAGEMENT
// ------------------------------------------

/**
 * Update a specific stage of production
 * @param {string} batchId - Production batch ID
 * @param {string} stage - Stage name: "blending", "grinding", "packing", "completed"
 * @param {string} staffLoginId - Staff member's login ID
 * @param {string} notes - Optional notes
 */
export const updateProductionStage = async (batchId, stage, staffLoginId, notes = "") => {
  try {
    const response = await axios.post(`${BASE_URL}/production/stage/update`, {
      batch_id: batchId,
      stage,
      staff_login_id: staffLoginId,
      notes
    });
    return response.data;
  } catch (error) {
    console.error("Error updating production stage:", error);
    throw error.response?.data || { error: "Failed to update stage" };
  }
};

/**
 * Get all stages for a specific batch
 * @param {string} batchId - Production batch ID
 */
export const getBatchStages = async (batchId) => {
  try {
    const response = await axios.get(`${BASE_URL}/production/stages/${batchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch batch stages" };
  }
};

/**
 * Get all production batches for manager tracking
 */
// Add this function to your api.jsx

export const getAllProductionBatches = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/production/all-batches`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all batches:", error);
    throw error.response?.data || { error: "Failed to fetch batches" };
  }
};

/**
 * Get active batches that need staff action
 * @param {string} loginId - Staff login ID
 */
export const getStaffActiveBatches = async (loginId) => {
  try {
    const response = await axios.get(`${BASE_URL}/staff/active-batches/${loginId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch active batches" };
  }
};

/**
 * Get production notifications
 * @param {string} loginId - User login ID
 */
export const getProductionNotifications = async (loginId) => {
  try {
    const response = await axios.get(`${BASE_URL}/production/notifications/${loginId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Update the handleSendToStaff function

const handleSendToStaff = async () => {
  if (!plan) return;
  
  setSending(true);
  try {
    const selectedType = masalaTypes.find(m => m.id === selectedMasala);
    
    const payload = {
      masala_id: selectedMasala,
      product_name: selectedType ? selectedType.name : "Custom Blend",
      target_qty: plan.target_quantity,
      bom_details: plan.plan.map(item => ({
        ingredient_id: item.ingredient_id,  // ✅ Now included from backend
        item: item.ingredient_name,
        required_qty: item.required_qty,
        target: `${item.required_qty} kg` 
      }))
    };

    await startProduction(payload);
    alert("✅ Plan sent! Inventory has been updated.");
    
    // Clear form
    setPlan(null);
    setTargetQty('');
    setSelectedMasala('');
    
    // Optional: Refresh ingredients to show new quantities
    loadMasalaTypes();
    
  } catch (err) {
    alert(err.error || "Error sending plan to staff");
  } finally {
    setSending(false);
  }
};

// --- UPDATE IN services/api.jsx ---

export const fetchReadyForDispatch = async () => {
    try {
        // Changed API_URL to BASE_URL to match your file's definition
        const response = await axios.get(`${BASE_URL}/packing/ready-for-dispatch`);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const dispatchPackedOrder = async (id) => {
    try {
        // Changed API_URL to BASE_URL
        const response = await axios.post(`${BASE_URL}/dispatch/order/${id}`);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// -------------------------
// ADMIN PROFILE
// -------------------------
export const getAdminProfile = async (loginId) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/profile/${loginId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to load admin profile" };
  }
};

export const updateAdminProfile = async (loginId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/admin/profile/${loginId}`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Admin profile update failed" };
  }
};