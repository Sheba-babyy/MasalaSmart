from flask import Flask, jsonify, request
from config import MongoDB, oid
from bson import ObjectId
from bson import ObjectId
from flask_cors import CORS
from bson.errors import InvalidId
from datetime import datetime


app = Flask(__name__)
CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True
)

# Create MongoDB instance
mongo = MongoDB()

# -------------------------------
# 🔍 TEST MONGODB CONNECTION
# -------------------------------
@app.route('/test-db')
def test_db():
    try:
        # Ping MongoDB server
        mongo.client.admin.command("ping")
        return jsonify({"status": "success", "message": "MongoDB connected successfully!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def serialize_user(user):
    """
    Serialize a user document from MongoDB into JSON-friendly format.
    Works for managers, staff, or admins.
    """
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "Staff"),  # default role as Staff
        "status": user.get("status", "Active")
    }


# ------------------------------------------
# SINGLE API → insert login first, then user
# ------------------------------------------


@app.route('/register', methods=['POST'])
def register_user():
    data = request.json

    required = [
        "firstName",
        "lastName",
        "email",
        "contact",
        "address",
        "username",
        "password"
    ]

    # 1️⃣ Validate input
    if not data or not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    # 2️⃣ Check username uniqueness
    existing = mongo.find_one("login", {"username": data["username"]})
    if existing:
        return jsonify({"error": "Username already exists"}), 409
    
    usertype = data.get("usertype", "user")

# Inside /register route in app.py


    # 3️⃣ Insert into login collection
    login_data = {
        "username": data["username"],
        "password": data["password"], 
        "usertype": usertype,
        "status": "Pending"  # <--- ADD THIS LINE
    }
    login_id = mongo.insert_one("login", login_data)

    # ... (rest of the code remains same) ...

    # 4️⃣ Insert into users collection
    user_data = {
        "name": f"{data['firstName']} {data['lastName']}",
        "email": data["email"],
        "contact": data["contact"],
        "address": data["address"],
        "login_id": ObjectId(login_id)
    }

    user_id = mongo.insert_one("user", user_data)

    return jsonify({
        "message": "Registration successful",
        "login_id": str(login_id),
        "user_id": str(user_id)
    }), 201



@app.route('/login', methods=['POST'])
def login_user():
    data = request.json

    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), 400

    # 1️⃣ Find login record
    login_user = mongo.find_one("login", {
        "username": data["username"],
        "password": data["password"]
    })

    print("login_user:", login_user)

    if not login_user:
        return jsonify({"error": "Invalid username or password"}), 401

    # 🔴 IMPORTANT FIX HERE
    login_id = ObjectId(login_user["_id"])

    # 2️⃣ Find user profile using ObjectId
    user = mongo.find_one("user", {
        "login_id": login_id
    })

    print("user:", user)

    return jsonify({
        "message": "Login successful",
        "login_id": str(login_user["_id"]),
        "username": login_user["username"],
        "usertype": login_user.get("usertype", "user"),
        "user": {
            "_id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "contact": user.get("contact"),
            "address": user.get("address")
        } if user else None
    }), 200



@app.route('/user', methods=['GET'])
def list_users():
    users = mongo.find_all("user")
    fixed_users = []

    for u in users:
        # Convert user _id
        u["_id"] = str(u["_id"])

        # Get login_id from user document
        login_id = u.get("login_id")  # using correct field from register_user
        if isinstance(login_id, ObjectId):
            login_id_str = str(login_id)
        elif login_id:
            try:
                login_id_str = str(ObjectId(login_id))
            except:
                login_id_str = None
        else:
            login_id_str = None

        u["login_id"] = login_id_str  # store as string
        # Remove other non-JSON-safe fields
        if "usertype" in u:
            u["usertype"] = str(u["usertype"]) if u["usertype"] else None

        # Join login table
        login_ref = mongo.find_one("login", {"_id": login_id}) if login_id else None
        if login_ref:
            # Convert all ObjectId fields to string
            for k, v in login_ref.items():
                if isinstance(v, ObjectId):
                    login_ref[k] = str(v)
            u["login_details"] = login_ref
        else:
            u["login_details"] = None

        fixed_users.append(u)

    return jsonify(fixed_users)




@app.route('/staff/<login_id>', methods=['GET'])
def get_staff_by_login(login_id):
    try:
        login_obj_id = ObjectId(login_id.strip())
    except InvalidId:
        return jsonify({"error": "Invalid login_id"}), 400

    # Find login record
    login_rec = mongo.find_one("login", {"_id": login_obj_id})
    if not login_rec or login_rec.get("usertype") != "user":
        return jsonify({"error": "Staff not found"}), 404

    # Find user profile linked via login_id
    user = mongo.find_one("user", {"login_id": login_obj_id})
    if user:
        # Convert all ObjectIds to string
        user["_id"] = str(user["_id"])
        if "login_id" in user:
            user["login_id"] = str(user["login_id"])
    else:
        user = None

    return jsonify({
        "login": {
            "_id": str(login_rec["_id"]),
            "username": login_rec["username"],
            "usertype": login_rec["usertype"]
        },
        "user": user
    }), 200



@app.route("/staff/<staff_id>", methods=["PATCH"])
def update_staff_profile(staff_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        login_oid = ObjectId(staff_id.strip())  # ✅ VERY IMPORTANT
    except InvalidId:
        return jsonify({"error": "Invalid login_id"}), 400

    # check staff exists
    staff = mongo.find_one("user", {"login_id": login_oid})
    if not staff:
        return jsonify({"error": "Staff not found"}), 404

    # If session is being updated/assigned, set status to Active
    if "assigned_session" in data:
        data["session_status"] = "Active" if data["assigned_session"] != "Unassigned" else "N/A"

    updated = mongo.update_one(
        "user",                      # ✅ correct collection
        {"login_id": login_oid},     # ✅ match by login_id
        data                          # fields to update
    )

    if updated == 0:
        return jsonify({"message": "No changes made"}), 200

    return jsonify({"message": "Profile updated successfully"}), 200


@app.route("/staff/current-session/<login_id>", methods=["GET"])
def get_current_session(login_id):
    try:
        login_oid = ObjectId(login_id.strip())
    except InvalidId:
        return jsonify({"error": "Invalid login_id"}), 400

    user = mongo.find_one("user", {"login_id": login_oid})
    if not user:
        return jsonify({"error": "Staff not found"}), 404

    return jsonify({
        "assigned_session": user.get("assigned_session", "Unassigned"),
        "session_status": user.get("session_status", "N/A")
    }), 200


@app.route("/staff/complete-session/<login_id>", methods=["POST"])
def complete_session(login_id):
    try:
        login_oid = ObjectId(login_id.strip())
    except InvalidId:
        return jsonify({"error": "Invalid login_id"}), 400

    user = mongo.find_one("user", {"login_id": login_oid})
    if not user or user.get("assigned_session") == "Unassigned":
        return jsonify({"error": "No active session found"}), 400

    mongo.update_one(
        "user",
        {"login_id": login_oid},
        {"session_status": "Completed"}
    )

    return jsonify({"message": "Session marked as completed"}), 200


@app.route("/staff/count", methods=["GET"])
def get_staff_count():
    try:
        # Get all login records where usertype = "user"
        staff_list = mongo.find_all("login", {"usertype": "user"})

        return jsonify({
            "totalStaff": len(staff_list)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500






@app.route("/managers", methods=["POST"])
def add_manager():
    data = request.json

    required_fields = ["name", "username", "password"]
    if not data or not all(data.get(f) for f in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # 1️⃣ Check username already exists in login table
    existing = mongo.find_one("login", {"username": data["username"]})
    if existing:
        return jsonify({"error": "Username already exists"}), 409

    # 2️⃣ Insert into login collection
    login_data = {
        "username": data["username"],
        "password": data["password"],   # ⚠️ hash later
        "usertype": "manager",
        "status": "Active"
    }

    login_id = mongo.insert_one("login", login_data)

    # 3️⃣ Insert into managers collection (linked with login_id)
    manager_data = {
        "name": data["name"],
        "email": data.get("email", ""),
        "role": data.get("role", "manager"),
        "status": "Active",
        "login_id": ObjectId(login_id)
    }

    manager_id = mongo.insert_one("managers", manager_data)

    # 4️⃣ Response (convert ObjectIds)
    return jsonify({
        "_id": str(manager_id),
        "name": manager_data["name"],
        "email": manager_data["email"],
        "username": login_data["username"],
        "role": manager_data["role"],
        "status": manager_data["status"],
        "login_id": str(login_id)
    }), 201




@app.route("/managers", methods=["GET"])
def get_managers():
    managers = mongo.find_all("managers")
    serialized = [serialize_user(m) for m in managers]
    return jsonify(serialized), 200



@app.route("/managers/<manager_id>", methods=["DELETE"])
def delete_manager(manager_id):
    try:
        oid_manager = ObjectId(manager_id)
    except InvalidId:
        return jsonify({"error": "Invalid manager ID"}), 400

    deleted = mongo.delete_one("managers", {"_id": oid_manager})
    if deleted == 0:
        return jsonify({"error": "Manager not found"}), 404
    return jsonify({"message": "Manager deleted"}), 200


#for profile page manager


@app.route("/managers/profile/<login_id>", methods=["GET"])
def get_manager_profile(login_id):
    try:
        login_object_id = ObjectId(login_id)
    except InvalidId:
        return jsonify({"error": "Invalid login ID"}), 400

    manager = mongo.find_one(
        "managers",
        {"login_id": login_object_id}
    )

    if not manager:
        return jsonify({"error": "Manager not found"}), 404

    login = mongo.find_one(
        "login",
        {"_id": login_object_id}
    )

    return jsonify({
        "id": str(manager["_id"]),
        "fullName": manager.get("name"),
        "email": manager.get("email"),
        "role": manager.get("role"),
        "status": manager.get("status"),
        "username": login.get("username") if login else "",
        "login_id": login_id
    }), 200




#incredients adding ------------------------

@app.route("/ingredients", methods=["POST"])
def add_ingredient():
    data = request.json

    required_fields = ["name", "quantity", "dateAdded", "expiryDate"]
    if not data or not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    ingredient_data = {
        "name": data["name"],
        "quantity": data["quantity"],
        "dateAdded": data["dateAdded"],
        "expiryDate": data["expiryDate"],
        "created_at": datetime.utcnow()
    }

    ingredient_id = mongo.insert_one("ingredients", ingredient_data)

    return jsonify({
        "message": "Ingredient added successfully",
        "id": ingredient_id
    }), 201




@app.route("/ingredients", methods=["GET"])
def get_ingredients():
    ingredients = mongo.find_all("ingredients")

    # Sort by expiry date (soonest first)
    ingredients.sort(key=lambda x: x.get("expiryDate", ""))

    return jsonify(ingredients), 200




@app.route("/ingredients/<ingredient_id>", methods=["DELETE"])
def delete_ingredient(ingredient_id):
    try:
        oid_ingredient = ObjectId(ingredient_id)
    except InvalidId:
        return jsonify({"error": "Invalid ingredient ID"}), 400

    deleted = mongo.delete_one("ingredients", {"_id": oid_ingredient})
    if deleted == 0:
        return jsonify({"error": "Ingredient not found"}), 404

    return jsonify({"message": "Ingredient deleted successfully"}), 200





@app.route("/masala-types", methods=["GET"])
def get_masala_types():
    # Convert ObjectIds to strings before sending to frontend
    data = mongo.find_all("masala_types")
    for item in data:
        item['_id'] = str(item['_id']) 
    return jsonify(data), 200

@app.route("/masala-types", methods=["POST"])
def add_masala_type():
    data = request.json
    if not data or not data.get("name"):
        return jsonify({"error": "Masala name required"}), 400

    masala = {
        "name": data["name"],
        # "created_at": datetime.utcnow() # Ensure you import datetime
    }

    # Assuming your wrapper returns the ID directly. 
    # If using standard PyMongo, use result.inserted_id
    masala_id = mongo.insert_one("masala_types", masala)
    
    # IMPORTANT: Convert ObjectId to string for the frontend
    masala["_id"] = str(masala_id)

    return jsonify(masala), 201


#bom creating api

@app.route("/boms", methods=["POST"])
def create_bom():
    data = request.json

    if not data or not data.get("masala_id") or not data.get("items"):
        return jsonify({"error": "Invalid BOM data"}), 400

    total_qty = 0
    for item in data["items"]:
        if not item.get("ingredient_id") or not item.get("qty"):
            return jsonify({"error": "Invalid item data"}), 400
        total_qty += float(item["qty"])

    if total_qty <= 0:
        return jsonify({"error": "Total quantity must be greater than zero"}), 400

    # ✅ masala_id needs oid
    bom = {
        "masala_id": oid(data["masala_id"]),
        "total_qty": total_qty,
        "created_at": datetime.utcnow()
    }

    # ✅ bom_id is already ObjectId
    bom_id = mongo.insert_one("boms", bom)

    # ✅ DO NOT wrap bom_id again
    for item in data["items"]:
        qty = float(item["qty"])
        percentage = round((qty / total_qty) * 100, 2)

        mongo.insert_one("bom_items", {
            "bom_id": bom_id,  # ✅ FIXED
            "ingredient_id": oid(item["ingredient_id"]),
            "qty": qty,
            "percentage": percentage
        })

    return jsonify({
        "_id": str(bom_id),
        "total_qty": total_qty
    }), 201


@app.route("/boms", methods=["GET"])
def get_boms():
    boms = mongo.find_all("boms")
    result = []

    for bom in boms:
        # ✅ masala_id already ObjectId
        masala = mongo.find_one(
            "masala_types",
            {"_id": bom["masala_id"]}
        )

        items = mongo.find_all(
            "bom_items",
            {"bom_id": bom["_id"]}
        )

        materials = []
        for item in items:
            # ✅ ingredient_id already ObjectId
            ing = mongo.find_one(
                "ingredients",
                {"_id": item["ingredient_id"]}
            )

            materials.append({
                "ingredient_id": str(item["ingredient_id"]),  # ✅ frontend needs this
                "ingredient": ing["name"] if ing else "",
                "qty": item["qty"],
                "percentage": item.get("percentage", 0)
            })

        result.append({
            "_id": str(bom["_id"]),
            "masala_id": str(bom["masala_id"]),  # ✅ frontend mapping
            "productName": masala["name"] if masala else "",
            "total_qty": bom.get("total_qty", 0),
            "materials": materials
        })

    return jsonify(result), 200


@app.route("/boms/<bom_id>", methods=["DELETE"])
def delete_bom(bom_id):
    mongo.delete_one("boms", {"_id": oid(bom_id)})

    items = mongo.find_all("bom_items", {"bom_id": oid(bom_id)})
    for item in items:
        mongo.delete_one("bom_items", {"_id": oid(item["_id"])})

    return jsonify({"message": "BOM deleted"}), 200

#----------------------------------------------------------------------------------------------------->

# Add this to app.py

# In app.py

@app.route("/blend-plan", methods=["POST"])
def generate_blend_plan():
    data = request.json
    masala_id = data.get("masala_id")
    
    try:
        target_qty_raw = data.get("target_quantity", 0)
        target_quantity = float(str(target_qty_raw).lower().replace("kg", "").strip())
    except:
        return jsonify({"error": "Invalid target quantity"}), 400

    if not masala_id or target_quantity <= 0:
        return jsonify({"error": "Invalid input"}), 400

    try:
        bom = mongo.find_one("boms", {"masala_id": ObjectId(masala_id)})
    except:
        return jsonify({"error": "Invalid Masala ID"}), 400
        
    if not bom:
        return jsonify({"error": "Recipe (BOM) not found"}), 404

    bom_items = mongo.find_all("bom_items", {"bom_id": bom["_id"]})
    
    plan_details = []
    is_feasible = True

    for item in bom_items:
        try:
            ing_id = item["ingredient_id"]
            if not isinstance(ing_id, ObjectId):
                ing_id = ObjectId(str(ing_id))
            
            ingredient = mongo.find_one("ingredients", {"_id": ing_id})
        except:
            continue 

        if not ingredient:
            continue

        ratio = target_quantity / bom["total_qty"]
        required_qty = round(ratio * item["qty"], 2)
        
        try:
            raw_qty = ingredient.get("quantity", 0)
            clean_qty_str = str(raw_qty).lower().replace("kg", "").replace("g", "").strip()
            available_qty = float(clean_qty_str)
        except ValueError:
            available_qty = 0.0

        status = "OK"
        if available_qty < required_qty:
            is_feasible = False
            status = "Insufficient Stock"

        plan_details.append({
            "ingredient_id": str(ing_id),  # ✅ ADD THIS
            "ingredient_name": ingredient["name"],
            "required_qty": required_qty,
            "available_qty": available_qty,
            "status": status
        })

    return jsonify({
        "masala_id": masala_id,
        "target_quantity": target_quantity,
        "is_feasible": is_feasible,
        "plan": plan_details
    }), 200

#------------------------------------------------------------------------------------------------>
#approving system

# Get all pending staff
# In app.py

@app.route("/managers/pending-staff", methods=["GET"])
def get_pending_staff():
    # 1. Find all logins that are waiting for approval
    pending_logins = mongo.find_all("login", {"usertype": "user", "status": "Pending"})
    result = []

    for login in pending_logins:
        # ⚠️ CRITICAL FIX: Ensure we use ObjectId for the lookup
        # The 'user' collection stores 'login_id' as an ObjectId.
        # If login["_id"] is a string, we MUST convert it.
        try:
            login_oid = ObjectId(str(login["_id"]))
        except:
            continue # Skip if ID is invalid

        # 2. Find the user profile with this ObjectId
        user_profile = mongo.find_one("user", {"login_id": login_oid})
        
        result.append({
            "login_id": str(login["_id"]),
            "username": login["username"],
            # If user_profile is found, use its data; otherwise "Unknown"
            "name": user_profile.get("name") if user_profile else "Unknown",
            "email": user_profile.get("email") if user_profile else "Unknown",
            "contact": user_profile.get("contact") if user_profile else "Unknown",
            "address": user_profile.get("address") if user_profile else "Unknown",
            "date_joined": login.get("created_at", "")
        })
    
    return jsonify(result), 200

# Approve a staff member
@app.route("/managers/approve-staff/<login_id>", methods=["POST"])
def approve_staff(login_id):
    try:
        oid = ObjectId(login_id)
    except InvalidId:
        return jsonify({"error": "Invalid ID"}), 400

    updated = mongo.update_one(
        "login",
        {"_id": oid},
        {"status": "Active"} # Change status from Pending to Active
    )

    if updated:
        return jsonify({"message": "Staff approved successfully"}), 200
    return jsonify({"error": "Staff not found"}), 404



# ---------------------------------------------------------
# DELETE STAFF (By Manager)
# ---------------------------------------------------------

@app.route("/staff/<login_id>", methods=["DELETE"])
def delete_staff(login_id):
    try:
        oid_staff = ObjectId(login_id)
    except InvalidId:
        return jsonify({"error": "Invalid ID"}), 400

    # 1. Delete from 'login' collection
    deleted_login = mongo.delete_one("login", {"_id": oid_staff})
    
    # 2. Delete from 'user' collection (using login_id reference)
    deleted_user = mongo.delete_one("user", {"login_id": oid_staff})

    if deleted_login == 0 and deleted_user == 0:
        return jsonify({"error": "Staff not found"}), 404

    return jsonify({
        "message": "Staff deleted successfully",
        "deleted_login_count": deleted_login,
        "deleted_user_count": deleted_user
    }), 200



# ------------------------------------------
# REPORTS & ANALYTICS
# ------------------------------------------
# ------------------------------------------
# REPORTS & ANALYTICS (FIXED & SAFE)
# ------------------------------------------
@app.route("/reports/dashboard", methods=["GET"])
def get_dashboard_reports():
    try:
        # 1. Inventory Stats (Safe Float Conversion)
        ingredients = mongo.find_all("ingredients")
        inventory_data = []
        for i in ingredients:
            try:
                # Handle cases where quantity might be string "10" or "10kg" or missing
                qty_raw = i.get("quantity", 0)
                qty = float(str(qty_raw).replace("kg", "").strip()) if qty_raw else 0.0
                inventory_data.append({"name": i.get("name", "Unknown"), "quantity": qty})
            except:
                continue # Skip bad data

        # 2. Staff Stats (Safe Counting)
        # We fetch all users first to be safe, then filter in Python 
        # (This avoids crashes if your find_all doesn't support queries perfectly)
        all_logins = mongo.find_all("login")
        
        active_staff = 0
        pending_staff = 0
        
        for login in all_logins:
            if login.get("usertype") == "user":
                if login.get("status") == "Active":
                    active_staff += 1
                elif login.get("status") == "Pending":
                    pending_staff += 1
        
        total_staff = active_staff + pending_staff
        
        staff_data = [
            {"name": "Active", "value": active_staff},
            {"name": "Pending", "value": pending_staff}
        ]

        # 3. Masala Types Count
        masala_list = mongo.find_all("masala_types")
        masala_count = len(masala_list)

        # 4. Audit Logs (Safe Date Sorting)
        def get_sort_key(item):
            # Safe date extractor: converts everything to string for comparison
            val = item.get("created_at", "")
            return str(val)

        # Sort safely in Python
        sorted_ingredients = sorted(ingredients, key=get_sort_key, reverse=True)
        recent_ingredients = sorted_ingredients[:5]
        
        audit_logs = []
        for item in recent_ingredients:
            # Format Date for Frontend
            raw_date = item.get("created_at")
            display_date = str(raw_date) # Default fallback
            
            # If it's a real datetime object, format it nicely
            if isinstance(raw_date, datetime):
                display_date = raw_date.strftime("%Y-%m-%d")
            
            audit_logs.append({
                "action": "Ingredient Added",
                "details": f"Added {item.get('name', '?')} ({item.get('quantity', 0)}kg)",
                "date": display_date
            })

        print("Dashboard Data Prepared Successfully") # Debug print

        return jsonify({
            "inventory": inventory_data,
            "staff_stats": staff_data,
            "total_staff": total_staff,
            "masala_count": masala_count,
            "audit_logs": audit_logs
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc() # Print full error to your VS Code terminal
        return jsonify({"error": "Backend Error", "details": str(e)}), 500
    


# ------------------------------------------
# WORKFORCE & TASK MANAGEMENT
# ------------------------------------------

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    required = ["title", "assigned_to", "priority", "due_date"]
    
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    try:
        task = {
            "title": data["title"],
            "description": data.get("description", ""),
            "assigned_to": ObjectId(data["assigned_to"]), # Login ID of staff
            "priority": data["priority"], # High, Medium, Low
            "status": "Pending", # Pending, In Progress, Completed
            "due_date": data["due_date"],
            "created_at": datetime.utcnow()
        }
        mongo.insert_one("tasks", task)
        return jsonify({"message": "Task assigned successfully"}), 201
    except:
        return jsonify({"error": "Invalid Staff ID"}), 400

@app.route("/tasks", methods=["GET"])
def get_all_tasks():
    tasks = mongo.find_all("tasks")
    result = []
    
    for task in tasks:
        # Get Staff Details
        staff_user = mongo.find_one("user", {"login_id": task["assigned_to"]})
        
        result.append({
            "_id": str(task["_id"]),
            "title": task["title"],
            "description": task["description"],
            "priority": task["priority"],
            "status": task["status"],
            "due_date": task["due_date"],
            "staff_name": staff_user["name"] if staff_user else "Unknown",
            "staff_session": staff_user.get("assigned_session", "Unassigned") if staff_user else "N/A"
        })
    
    return jsonify(result), 200

@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        mongo.delete_one("tasks", {"_id": ObjectId(task_id)})
        return jsonify({"message": "Task deleted"}), 200
    except:
        return jsonify({"error": "Invalid Task ID"}), 400    
    

# ------------------------------------------
# STAFF TASK VIEW
# ------------------------------------------
@app.route("/staff/tasks/<login_id>", methods=["GET"])
def get_staff_tasks(login_id):
    try:
        # 1. Convert string ID to ObjectId
        staff_oid = ObjectId(login_id)
        
        # 2. Find tasks assigned to this ID
        tasks = mongo.find_all("tasks", {"assigned_to": staff_oid})
        
        # 3. Serialize results
        result = []
        for task in tasks:
            result.append({
                "_id": str(task["_id"]),
                "title": task["title"],
                "description": task.get("description", ""),
                "priority": task["priority"],
                "status": task["status"],
                "due_date": task["due_date"],
                "created_at": task.get("created_at", "")
            })
            
        return jsonify(result), 200
    except InvalidId:
        return jsonify({"error": "Invalid Staff ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# OPTIONAL: Allow staff to update task status (e.g., to "Completed")
@app.route("/tasks/<task_id>/status", methods=["PATCH"])
def update_task_status(task_id):
    data = request.json
    new_status = data.get("status")
    
    if new_status not in ["Pending", "In Progress", "Completed"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        mongo.update_one("tasks", {"_id": ObjectId(task_id)}, {"status": new_status})
        return jsonify({"message": "Status updated"}), 200
    except:
        return jsonify({"error": "Update failed"}), 500    
    

# --- ADD TO app.py ---

@app.route("/production/start", methods=["POST"])
def start_production():
    data = request.json
    
    # 1. Validate ingredients are still available
    bom_details = data.get("bom_details", [])
    
    for item in bom_details:
        ingredient_id = item.get("ingredient_id")
        required_qty = item.get("required_qty", 0)
        
        if not ingredient_id:
            continue
            
        try:
            ing_oid = ObjectId(ingredient_id)
            ingredient = mongo.find_one("ingredients", {"_id": ing_oid})
            
            if not ingredient:
                return jsonify({"error": f"Ingredient {item.get('item')} not found"}), 404
            
            # Get current quantity
            raw_qty = ingredient.get("quantity", 0)
            clean_qty_str = str(raw_qty).lower().replace("kg", "").replace("g", "").strip()
            current_qty = float(clean_qty_str)
            
            # Check if enough stock
            if current_qty < required_qty:
                return jsonify({
                    "error": f"Insufficient stock for {ingredient['name']}. Available: {current_qty}kg, Required: {required_qty}kg"
                }), 400
            
            # ✅ DEDUCT FROM INVENTORY
            new_qty = round(current_qty - required_qty, 2)
            mongo.update_one(
                "ingredients",
                {"_id": ing_oid},
                {"quantity": f"{new_qty}"}  # Store as string to match your format
            )
            
        except Exception as e:
            return jsonify({"error": f"Error processing ingredient: {str(e)}"}), 500
    
    # 2. Create batch record
    batch_record = {
        "batch_id": f"BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "masala_id": ObjectId(data["masala_id"]),
        "product_name": data["product_name"],
        "planned_qty": data["target_qty"],
        "bom": data["bom_details"],
        "status": "Pending - Awaiting Blending",
        "created_at": datetime.utcnow()
    }
    
    batch_id = mongo.insert_one("production_batches", batch_record)
    
    # 3. Create initial stage
    initial_stage = {
        "batch_id": batch_id,
        "stage": "created",
        "status": "Completed",
        "completed_by": None,
        "notes": "Batch initiated by manager",
        "timestamp": datetime.utcnow()
    }
    mongo.insert_one("production_stages", initial_stage)
    
    return jsonify({
        "message": "Production started and inventory updated",
        "batch_id": str(batch_id)
    }), 201


@app.route("/production/active", methods=["GET"])
def get_active_production():
    # Fetch the latest incomplete batch
    batch = mongo.find_one("production_batches", {"status": {"$ne": "Completed"}})
    if not batch:
        return jsonify({"message": "No active production"}), 404
        
    batch["_id"] = str(batch["_id"])
    batch["masala_id"] = str(batch["masala_id"])
    return jsonify(batch), 200    
    

 # --- ADD THIS TO app.py ---

@app.route("/production/update/<batch_id>", methods=["PATCH"])
def update_production_status(batch_id):
    data = request.json
    new_status = data.get("status")
    actual_output = data.get("actual_output")
    notes = data.get("notes")

    update_fields = {}
    if new_status: update_fields["status"] = new_status
    if actual_output: update_fields["actual_output"] = actual_output
    if notes: update_fields["notes"] = notes

    try:
        updated = mongo.update_one("production_batches", {"_id": ObjectId(batch_id)}, update_fields)
        if updated:
            return jsonify({"message": "Production record updated"}), 200
        return jsonify({"error": "Batch not found"}), 404
    except:
        return jsonify({"error": "Invalid Batch ID"}), 400
    

# --- Ensure these are in app.py ---

@app.route('/packing/all', methods=['GET'])
def get_all_packing():
    try:
        # Fetch all records from the finished goods collection
        records = mongo.find_all("finished_goods")
        
        # Sort by creation time (descending) if available, else standard order
        # Assuming you want to see the newest at the top
        records.reverse() 
        
        for r in records:
            r['_id'] = str(r['_id'])
            # Ensure keys match frontend (batchId vs batch_id)
            r['batchId'] = r.get('batch_id')
            r['packedQty'] = r.get('total_units')
            r['unitSize'] = r.get('unit_size')
            r['mfgDate'] = r.get('mfg_date', datetime.utcnow().strftime('%Y-%m-%d'))
            
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/packing/save', methods=['POST'])
def save_packing():
    data = request.json
    try:
        # 1. Create the entry
        packing_record = {
            "batch_id": data['batchId'],
            "product": data['product'],
            "unit_size": data['unitSize'],
            "total_units": int(data['packedQty']),
            "mfg_date": data['mfgDate'],
            "status": "Ready", # Default status for new packing
            "created_at": datetime.utcnow()
        }
        record_id = mongo.insert_one("finished_goods", packing_record)
        
        # 2. Update the source production batch to 'Completed'
        # This helps in your BatchTracking page logic
        mongo.update_one("production_batches", {"batch_id": data['batchId']}, {"status": "Completed"})
        
        return jsonify({"message": "Inventory updated", "id": str(record_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
       

@app.route('/admin/analytics', methods=['GET'])
def get_admin_analytics():
    try:
        # 1. Production Trend (last 5 months/entries)
        batches = mongo.find_all("production_batches")
        # Simplified: Summing planned_qty per batch for the chart
        prod_labels = [b.get("batch_id")[-5:] for b in batches[-5:]]
        prod_values = [float(b.get("planned_qty", 0)) for b in batches[-5:]]

        # 2. Batch Status Distribution
        status_counts = {"Pending": 0, "In Progress": 0, "Completed": 0}
        for b in batches:
            s = b.get("status", "Pending")
            if s in status_counts: status_counts[s] += 1
            else: status_counts["In Progress"] += 1 # Catch-all for sub-stages

        # 3. Inventory Stock (Ingredients)
        ingredients = mongo.find_all("ingredients")
        stock_labels = [i.get("name") for i in ingredients[:5]]
        stock_values = []
        for i in ingredients[:5]:
            qty_raw = i.get("quantity", "0")
            qty = float(str(qty_raw).lower().replace("kg", "").strip())
            stock_values.append(qty)

        return jsonify({
            "production": {"labels": prod_labels, "data": prod_values},
            "status": {"labels": list(status_counts.keys()), "data": list(status_counts.values())},
            "inventory": {"labels": stock_labels, "data": stock_values}
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500       
    

# --- ADD TO app.py ---

@app.route('/admin/expiry-alerts', methods=['GET'])
def get_expiry_alerts():
    try:
        ingredients = mongo.find_all("ingredients")
        now = datetime.utcnow()
        alerts = []

        for item in ingredients:
            try:
                # Convert string date "YYYY-MM-DD" to datetime object
                expiry_date = datetime.strptime(item.get("expiryDate"), "%Y-%m-%d")
                days_left = (expiry_date - now).days

                status = "Safe"
                if days_left < 0:
                    status = "Expired"
                elif days_left <= 30: # Alert if expiring within 30 days
                    status = "Near Expiry"
                
                # Only send items that are not 'Safe' or all items based on your preference
                # Here we send everything so the table stays populated
                alerts.append({
                    "id": str(item["_id"]),
                    "itemName": item.get("name"),
                    "batchNo": item.get("batchNo", "N/A"), # Ensure batchNo exists in DB
                    "expiryDate": item.get("expiryDate"),
                    "status": status
                })
            except (ValueError, TypeError):
                continue # Skip items with invalid date formats

        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/expiry-alerts/<id>', methods=['DELETE'])
def remove_expiry_alert(id):
    # In a real app, you might "archive" the alert. 
    # Here we delete the ingredient or just clear the alert status.
    try:
        mongo.delete_one("ingredients", {"_id": ObjectId(id)})
        return jsonify({"message": "Item removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

# ========================================
# PRODUCTION WORKFLOW API ENDPOINTS
# ========================================

# ------------------------------------------
# 1. WORKFLOW STAGE MANAGEMENT
# ------------------------------------------

@app.route("/production/stages/<batch_id>", methods=["GET"])
def get_batch_stages(batch_id):
    """
    Get all workflow stages for a specific batch.
    Returns stages: blending → grinding → packing → completed
    """
    try:
        batch_oid = ObjectId(batch_id)
        
        # Find the production batch
        batch = mongo.find_one("production_batches", {"_id": batch_oid})
        if not batch:
            return jsonify({"error": "Batch not found"}), 404
        
        # Find all stage records for this batch
        stages = mongo.find_all("production_stages", {"batch_id": batch_oid})
        
        # Sort by timestamp
        stages.sort(key=lambda x: x.get("timestamp", datetime.min))
        
        # Convert ObjectIds to strings
        result = []
        for stage in stages:
            result.append({
                "_id": str(stage["_id"]),
                "batch_id": str(stage["batch_id"]),
                "stage": stage["stage"],
                "status": stage["status"],
                "completed_by": str(stage.get("completed_by")) if stage.get("completed_by") else None,
                "notes": stage.get("notes", ""),
                "timestamp": stage.get("timestamp", "").strftime("%Y-%m-%d %H:%M") if isinstance(stage.get("timestamp"), datetime) else str(stage.get("timestamp", ""))
            })
        
        return jsonify({
            "batch_id": str(batch["_id"]),
            "batch_code": batch.get("batch_id"),
            "product_name": batch.get("product_name"),
            "stages": result
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/production/stage/update", methods=["POST"])
def update_production_stage():
    """
    Update a specific stage of production workflow.
    Used by staff to mark stages as complete.
    
    Expected payload:
    {
        "batch_id": "...",
        "stage": "grinding" | "packing" | "completed",
        "staff_login_id": "...",
        "notes": "Optional notes"
    }
    """
    data = request.json
    
    required = ["batch_id", "stage", "staff_login_id"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        batch_oid = ObjectId(data["batch_id"])
        staff_oid = ObjectId(data["staff_login_id"])
        
        # Verify batch exists
        batch = mongo.find_one("production_batches", {"_id": batch_oid})
        if not batch:
            return jsonify({"error": "Batch not found"}), 404
        
        # Check if this stage already exists
        existing = mongo.find_one("production_stages", {
            "batch_id": batch_oid,
            "stage": data["stage"]
        })
        
        if existing:
            # Update existing stage
            updated = mongo.update_one(
                "production_stages",
                {"_id": existing["_id"]},
                {
                    "status": "Completed",
                    "completed_by": staff_oid,
                    "notes": data.get("notes", ""),
                    "timestamp": datetime.utcnow()
                }
            )
        else:
            # Create new stage record
            stage_record = {
                "batch_id": batch_oid,
                "stage": data["stage"],
                "status": "Completed",
                "completed_by": staff_oid,
                "notes": data.get("notes", ""),
                "timestamp": datetime.utcnow()
            }
            mongo.insert_one("production_stages", stage_record)
        
        # Update main batch status based on stage
        stage_to_status = {
            "blending": "Blending Completed",
            "grinding": "Sent to Grinding",
            "packing": "Sent to Packing",
            "completed": "Completed"
        }
        
        new_status = stage_to_status.get(data["stage"], "In Progress")
        mongo.update_one(
            "production_batches",
            {"_id": batch_oid},
            {"status": new_status}
        )
        
        return jsonify({"message": f"Stage '{data['stage']}' updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 2. BATCH TRACKING FOR MANAGER
# ------------------------------------------

@app.route("/production/all-batches", methods=["GET"])
def get_all_production_batches():
    """
    Get all production batches with their current stage status.
    Used for Manager's Batch Tracking page.
    """
    try:
        batches = mongo.find_all("production_batches")
        result = []
        
        for batch in batches:
            # Get all stages for this batch
            stages = mongo.find_all("production_stages", {"batch_id": batch["_id"]})
            
            # Determine current stage
            stage_order = ["blending", "grinding", "packing", "completed"]
            completed_stages = [s["stage"] for s in stages if s.get("status") == "Completed"]
            
            if "completed" in completed_stages:
                current_stage = "Completed"
            elif "packing" in completed_stages:
                current_stage = "Packing Done"
            elif "grinding" in completed_stages:
                current_stage = "Grinding Done"
            elif "blending" in completed_stages:
                current_stage = "Blending Done"
            else:
                current_stage = "In Progress"
            
            result.append({
                "_id": str(batch["_id"]),
                "batch_id": batch.get("batch_id"),
                "product_name": batch.get("product_name"),
                "planned_qty": batch.get("planned_qty"),
                "actual_output": batch.get("actual_output", "N/A"),
                "status": batch.get("status"),
                "current_stage": current_stage,
                "created_at": batch.get("created_at", "").strftime("%Y-%m-%d") if isinstance(batch.get("created_at"), datetime) else str(batch.get("created_at", "")),
                "stages_completed": len(completed_stages),
                "total_stages": 4
            })
        
        # Sort by creation date (newest first)
        result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 3. STAFF WORKFLOW VIEW
# ------------------------------------------

@app.route("/staff/active-batches/<login_id>", methods=["GET"])
def get_staff_active_batches(login_id):
    """
    Get batches that need action from this staff member.
    Shows batches in different stages that staff can work on.
    """
    try:
        staff_oid = ObjectId(login_id)
        
        # Get all batches that are not completed
        batches = mongo.find_all("production_batches", {
            "status": {"$ne": "Completed"}
        })
        
        result = []
        for batch in batches:
            # Get stages for this batch
            stages = mongo.find_all("production_stages", {"batch_id": batch["_id"]})
            stage_names = [s["stage"] for s in stages if s.get("status") == "Completed"]
            
            # Determine what stage this batch is ready for
            next_action = None
            if "completed" not in stage_names:
                if "packing" not in stage_names:
                    if "grinding" not in stage_names:
                        if "blending" not in stage_names:
                            next_action = "Start Blending"
                        else:
                            next_action = "Start Grinding"
                    else:
                        next_action = "Start Packing"
                else:
                    next_action = "Mark Complete"
            
            if next_action:  # Only show batches that need action
                result.append({
                    "_id": str(batch["_id"]),
                    "batch_id": batch.get("batch_id"),
                    "product_name": batch.get("product_name"),
                    "planned_qty": batch.get("planned_qty"),
                    "status": batch.get("status"),
                    "next_action": next_action,
                    "bom": batch.get("bom", [])
                })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 4. PRODUCTION NOTIFICATIONS
# ------------------------------------------

@app.route("/production/notifications/<login_id>", methods=["GET"])
def get_production_notifications(login_id):
    """
    Get pending production notifications for staff/manager.
    """
    try:
        user_oid = ObjectId(login_id)
        
        # Find user's role
        login_rec = mongo.find_one("login", {"_id": user_oid})
        if not login_rec:
            return jsonify({"error": "User not found"}), 404
        
        notifications = []
        
        if login_rec.get("usertype") == "manager":
            # For managers: show batches needing review
            pending = mongo.find_all("production_batches", {
                "status": {"$in": ["Completed", "Sent to Packing"]}
            })
            for batch in pending[-5:]:  # Last 5
                notifications.append({
                    "type": "batch_update",
                    "message": f"Batch {batch.get('batch_id')} - {batch.get('status')}",
                    "timestamp": batch.get("created_at", "")
                })
        
        else:  # Staff
            # Show active batches needing work
            active = mongo.find_all("production_batches", {
                "status": {"$nin": ["Completed"]}
            })
            for batch in active[-3:]:
                notifications.append({
                    "type": "work_pending",
                    "message": f"Work needed on {batch.get('product_name')} - {batch.get('batch_id')}",
                    "timestamp": batch.get("created_at", "")
                })
        
        return jsonify(notifications), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
# --- ADD TO app.py ---

@app.route('/packing/ready-for-dispatch', methods=['GET'])
def get_ready_for_dispatch():
    try:
        # Fetch items from finished_goods where status is "Ready"
        records = mongo.find_all("finished_goods", {"status": "Ready"})
        for r in records:
            r['_id'] = str(r['_id'])
            # Formatting for frontend display
            r['batchId'] = r.get('batch_id')
            r['packedQty'] = r.get('total_units')
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dispatch/order/<id>', methods=['POST'])
def dispatch_order(id):
    try:
        # Update the status to 'Dispatched'
        updated = mongo.update_one(
            "finished_goods", 
            {"_id": ObjectId(id)}, 
            {"status": "Dispatched", "dispatched_at": datetime.utcnow()}
        )
        if updated:
            return jsonify({"message": "Order dispatched successfully"}), 200
        return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400    
    

    # --- NEW ADMIN ROUTES MUST BE HERE ---
@app.route("/admin/profile/<login_id>", methods=["GET"])
def get_admin_profile(login_id):
    try:
        login_oid = ObjectId(login_id)
    except InvalidId:
        return jsonify({"error": "Invalid login ID"}), 400

    login_rec = mongo.find_one("login", {"_id": login_oid})
    if not login_rec:
        return jsonify({"error": "Admin login not found"}), 404

    admin_user = mongo.find_one("user", {"login_id": login_oid})

    return jsonify({
        "name": admin_user.get("name", "Admin") if admin_user else "Admin",
        "email": admin_user.get("email", "") if admin_user else "",
        "phone": admin_user.get("contact", "") if admin_user else "",
        "role": login_rec.get("usertype", "admin").capitalize()
    }), 200




@app.route("/admin/profile/<login_id>", methods=["PATCH"])
def update_admin_profile(login_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        login_oid = ObjectId(login_id)
    except InvalidId:
        return jsonify({"error": "Invalid login ID"}), 400

    update_data = {}
    if "name" in data: update_data["name"] = data["name"]
    if "email" in data: update_data["email"] = data["email"]
    if "phone" in data: update_data["contact"] = data["phone"]

    if update_data:
        mongo.update_one("user", {"login_id": login_oid}, update_data)

    return jsonify({
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "role": "Admin"
    }), 200
        
if __name__ == "__main__":
    app.run( host="0.0.0.0", port=5000, debug=True)