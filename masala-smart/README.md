# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# 🚀 COMPLETE PRODUCTION WORKFLOW SYSTEM - IMPLEMENTATION GUIDE

## 📋 OVERVIEW

This system connects Manager's blend plan creation to Staff's workflow execution with full tracking capabilities.

**Workflow Stages:**
1. Manager creates Blend Plan
2. Manager sends to Production (creates batch)
3. Staff completes: Blending → Grinding → Packing → Completed
4. Manager tracks progress in real-time

---

## 🔧 STEP 1: BACKEND SETUP (Flask)

### A. Add New Database Collections

You need to ensure MongoDB has these collections:
- `production_batches` (already exists)
- `production_stages` (NEW - tracks each workflow stage)

### B. Add API Endpoints to app.py

Copy ALL the code from `production_workflow_api.py` and add it to your `app.py` file.

**New endpoints added:**
```python
# Workflow Stage Management
GET  /production/stages/<batch_id>          # Get all stages for a batch
POST /production/stage/update                # Update/complete a stage

# Manager Tracking
GET  /production/all-batches                 # Get all batches with progress

# Staff Views
GET  /staff/active-batches/<login_id>        # Get batches needing work

# Notifications
GET  /production/notifications/<login_id>    # Get alerts
```

### C. Update Existing Endpoints (Optional Improvements)

**In your `/production/start` endpoint:**
Make sure it creates an initial stage record when starting production:

```python
@app.route("/production/start", methods=["POST"])
def start_production():
    data = request.json
    
    # Create batch (existing code)
    batch_record = {
        "batch_id": f"BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "masala_id": ObjectId(data["masala_id"]),
        "product_name": data["product_name"],
        "planned_qty": data["target_qty"],
        "bom": data["bom_details"],
        "status": "In Progress",
        "created_at": datetime.utcnow()
    }
    
    batch_id = mongo.insert_one("production_batches", batch_record)
    
    # NEW: Create initial stage tracking
    initial_stage = {
        "batch_id": batch_id,
        "stage": "created",
        "status": "Completed",
        "completed_by": None,
        "notes": "Batch initiated by manager",
        "timestamp": datetime.utcnow()
    }
    mongo.insert_one("production_stages", initial_stage)
    
    return jsonify({"message": "Production started", "batch_id": str(batch_id)}), 201
```

---

## 🎨 STEP 2: FRONTEND SETUP (React)

### A. Update api.jsx

Add the new functions from `api_additions.jsx` to your existing `src/services/api.jsx`:

```javascript
// Copy these functions to api.jsx:
export const updateProductionStage = async (batchId, stage, staffLoginId, notes = "") => { ... }
export const getBatchStages = async (batchId) => { ... }
export const getAllProductionBatches = async () => { ... }
export const getStaffActiveBatches = async (loginId) => { ... }
export const getProductionNotifications = async (loginId) => { ... }
```

### B. Replace/Create Components

**1. Manager Components:**

**File:** `src/modules/manager/BatchTracking.jsx`
- Replace your existing BatchTrackingPage.jsx OR create new
- Use code from `ManagerBatchTracking.jsx`
- Shows all batches with progress bars
- Allows viewing detailed stage timeline

**2. Staff Components:**

**File:** `src/modules/staff/StaffWorkflow.jsx`
- Create this NEW component
- Use code from `StaffWorkflow.jsx`
- Shows active batches
- Allows marking stages complete

**3. Update Your BlendPlan Component (Already Done)**
Your current BlendPlan.jsx already has the "Send to Staff" button working correctly! ✓

### C. Update Navigation/Routing

**In `src/router/AppRouter.jsx` (or wherever routes are defined):**

```javascript
// Manager Routes
<Route path="/manager/batch-tracking" element={<BatchTracking />} />

// Staff Routes
<Route path="/staff/workflow" element={<StaffWorkflow />} />
```

**In Manager Sidebar (`src/modules/manager/managersidebar.jsx`):**

```javascript
// Add to your menu items:
{
  name: "Batch Tracking",
  path: "/manager/batch-tracking",
  icon: "📊" // or your preferred icon
}
```

**In Staff Sidebar (`src/modules/staff/Sidebar.jsx`):**

```javascript
// Add to menu items:
{
  name: "Production Workflow",
  path: "/staff/workflow",
  icon: "⚙️"
}
```

---

## 🔄 STEP 3: WORKFLOW EXPLANATION

### How It Works End-to-End:

**1. Manager Creates Blend Plan:**
```
Manager Dashboard → Blend Plan → Select Masala + Quantity
→ Click "Generate Plan" → Review Materials
→ Click "Send to Staff" ✓
```

**2. System Creates Production Batch:**
```
POST /production/start
- Creates record in production_batches
- Status: "In Progress"
- Creates initial stage record
```

**3. Staff Sees Active Batches:**
```
Staff Dashboard → Production Workflow
- Shows all batches needing work
- Displays next required action:
  * "Start Blending" (first stage)
  * "Start Grinding" (after blending)
  * "Start Packing" (after grinding)
  * "Mark Complete" (final stage)
```

**4. Staff Completes Each Stage:**
```
Staff clicks "Complete Blending" button
→ POST /production/stage/update
  - batch_id: "BATCH-123"
  - stage: "blending"
  - staff_login_id: "staff_id_here"
  - notes: "Optional notes"

System updates:
- Creates/updates production_stages record
- Updates production_batches.status
```

**5. Manager Tracks Progress:**
```
Manager Dashboard → Batch Tracking
- Table shows all batches
- Progress bars: X/4 stages complete
- Click "View Details" → See full timeline
```

---

## 📊 STEP 4: DATABASE SCHEMA

### Collection: production_stages

```javascript
{
  _id: ObjectId,
  batch_id: ObjectId,              // References production_batches
  stage: String,                   // "blending", "grinding", "packing", "completed"
  status: String,                  // "Completed"
  completed_by: ObjectId,          // References login._id (staff who completed)
  notes: String,                   // Optional notes
  timestamp: DateTime              // When stage was completed
}
```

### Collection: production_batches (existing, for reference)

```javascript
{
  _id: ObjectId,
  batch_id: String,                // "BATCH-202602021230"
  masala_id: ObjectId,
  product_name: String,
  planned_qty: Number,
  actual_output: Number,           // Optional, set when completed
  bom: Array,                      // [{item, target}, ...]
  status: String,                  // "In Progress", "Sent to Grinding", etc.
  created_at: DateTime
}
```

---

## ✅ STEP 5: TESTING CHECKLIST

### Test as Manager:
- [ ] Create blend plan
- [ ] Send to staff successfully
- [ ] View in Batch Tracking table
- [ ] See progress as 0/4 initially
- [ ] Click "View Details" - see creation timestamp

### Test as Staff:
- [ ] Login as staff
- [ ] Navigate to Production Workflow
- [ ] See active batch with "Start Blending" action
- [ ] Add optional notes
- [ ] Click "Complete Blending"
- [ ] Batch should now show "Start Grinding"
- [ ] Complete all stages sequentially

### Verify Database:
- [ ] Check production_stages has records for each completed stage
- [ ] Verify batch status updates correctly
- [ ] Ensure staff_id is recorded in completed_by field

### Test Manager View Again:
- [ ] After staff completes stage, refresh Batch Tracking
- [ ] Progress should show 1/4, 2/4, etc.
- [ ] Status pill should update
- [ ] Timeline in details modal should show all stages

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "No Active Batches" for Staff
**Cause:** Batch status is already "Completed"
**Fix:** Create a new blend plan and send to staff

### Issue 2: Progress Not Updating
**Cause:** Frontend caching
**Fix:** Add page refresh after stage completion:
```javascript
await updateProductionStage(...);
loadActiveBatches(); // Refresh data
```

### Issue 3: Modal Not Showing Stages
**Cause:** API endpoint not returning data
**Fix:** Check backend logs, verify batch_id is correct ObjectId

### Issue 4: Stage Button Not Appearing
**Cause:** next_action logic mismatch
**Fix:** Check that stage names match exactly:
- Backend uses: "blending", "grinding", "packing", "completed"
- Frontend expects these exact strings (lowercase)

---

## 🎯 OPTIONAL ENHANCEMENTS

### 1. Real-Time Updates (Socket.io)
Add live updates when staff completes stages so manager sees changes instantly.

### 2. Email Notifications
Send email to manager when batch reaches certain stages.

### 3. Staff Assignment
Allow manager to assign specific batches to specific staff members.

### 4. Quality Control Stage
Add an additional stage for QC between packing and completed.

### 5. Batch Photos
Allow staff to upload photos at each stage for documentation.

---

## 📝 FILE STRUCTURE REFERENCE

```
project/
├── backend/
│   └── app.py (add all new endpoints here)
│
└── frontend/
    └── src/
        ├── services/
        │   └── api.jsx (add new API functions)
        │
        ├── modules/
        │   ├── manager/
        │   │   ├── blendplan.jsx (already updated ✓)
        │   │   └── BatchTracking.jsx (NEW - replace existing)
        │   │
        │   └── staff/
        │       ├── StaffWorkflow.jsx (NEW)
        │       └── DailyProduction.jsx (existing, can keep as backup)
        │
        └── router/
            └── AppRouter.jsx (add new routes)
```

---

## 🚀 DEPLOYMENT STEPS

1. **Stop your Flask server**
2. **Update app.py** with new endpoints
3. **Install any new dependencies** (if needed)
4. **Start Flask server:** `python app.py`
5. **Test backend** with Postman/curl
6. **Update frontend files** (api.jsx, components)
7. **Restart React dev server:** `npm run dev`
8. **Test full workflow** as described in testing checklist
9. **Deploy to production** when ready

---

## 💡 KEY POINTS TO REMEMBER

1. **Stage names are case-sensitive** - use lowercase consistently
2. **Always pass login_id** when staff completes stages (for audit trail)
3. **Progress calculation** is based on production_stages records
4. **Batch status** updates automatically when stages complete
5. **Modal details** require separate API call (not included in list view)

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Check Flask terminal for backend errors
3. Verify MongoDB has required collections
4. Ensure ObjectId conversions are correct
5. Test API endpoints individually with Postman

---

**Implementation Time Estimate:** 2-3 hours
**Difficulty Level:** Intermediate
**Prerequisites:** Working Flask + React + MongoDB setup

Good luck! 🎉

```

---

## 🎯 **Summary of Changes**

### ✅ What This Fixes:

1. **Inventory Deduction**: When manager sends blend plan, ingredients are automatically deducted
2. **Proper Workflow**: Staff sees active batch → updates stage → manager tracks progress
3. **Stage Tracking**: Each operation (blending, grinding, packing) is tracked separately
4. **Real-time Updates**: Batch tracking page shows current stage of all batches

### 🔄 **Workflow Flow**:
```
Manager creates blend plan 
  → Sends to production (inventory deducted)
    → Staff sees active batch in Daily Production
      → Staff updates stage (Blending → Grinding → Packing)
        → Manager sees progress in Batch Tracking
          → Final stage completed → Batch marked done


          

# Masala Production & Inventory Management System

A full-stack application designed to manage the lifecycle of masala production—from raw ingredient tracking and recipe (BOM) management to batch production, packing, and dispatch.

## 🚀 Project Overview
This system provides three distinct portals:
- **Admin:** Manages users, managers, and high-level analytics.
- **Manager:** Controls recipes (BOM), production planning, task assignment, and order dispatch.
- **Staff:** Executes production stages (Blending, Grinding, Packing) and records output.

---

## 🗄️ Database Documentation (MySQL)

### Entity Relationship Diagram (ERD)
The system uses a relational structure to ensure data integrity. The `login` table serves as the parent for all user-related profiles.



### 1. Authentication & Profiles
| Table | Description | Key Columns |
|:--- |:--- |:--- |
| **login** | Authentication hub | id, username, password, usertype, status |
| **user** | Staff profile details | login_id (FK), name, contact, address |
| **managers** | Manager profile details | login_id (FK), name, email, role |

### 2. Inventory & Recipes
| Table | Description | Key Columns |
|:--- |:--- |:--- |
| **ingredients**| Raw materials stock | id, name, quantity (kg), expiryDate |
| **masala_types**| Product catalog | id, name |
| **boms** | Master recipes | id, masala_id (FK), total_qty |
| **bom_items** | Recipe ingredients | bom_id (FK), ingredient_id (FK), qty |

### 3. Production & Workflow
| Table | Description | Key Columns |
|:--- |:--- |:--- |
| **production_batches** | Active batch tracking | id, batch_id, planned_qty, status |
| **production_stages** | Real-time stage logs | batch_id (FK), stage, completed_by (FK) |
| **finished_goods** | Packed items for dispatch | id, batch_id, total_units, status |
| **tasks** | Workforce management | id, assigned_to (FK), priority, due_date |

---

