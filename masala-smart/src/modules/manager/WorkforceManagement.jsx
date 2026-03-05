import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";
import { getAllUsers, createTask, fetchTasks, deleteTask, updateTaskStatus, updateStaffProfile } from "../../services/api";

const SESSION_TABS = ["All", "Blending", "Packing", "Machine Operation", "Cleaning", "Quality Check", "Dispatch"];

const WorkforceManagement = () => {
  // State
  const [allStaff, setAllStaff] = useState([]);   // full unfiltered list
  const [staffList, setStaffList] = useState([]);  // filtered by active tab
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState("Blending"); // default to Blending

  // Form State
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  // Re-filter staff whenever active session tab changes
  useEffect(() => {
    if (activeSession === "All") {
      setStaffList(allStaff);
    } else {
      setStaffList(allStaff.filter(s => s.session === activeSession));
    }
    // Reset the assigned_to if the previously selected staff is no longer in the filtered list
    setNewTask(prev => ({ ...prev, assigned_to: "" }));
  }, [activeSession, allStaff]);

  const loadData = async () => {
    try {
      const [users, taskData] = await Promise.all([getAllUsers(), fetchTasks()]);

      const activeStaff = users.filter(u =>
        u.login_details?.usertype === "user" &&
        u.login_details?.status === "Active"
      ).map(u => ({
        id: u.login_id,
        name: u.name,
        session: u.assigned_session || "Unassigned",
        // ✅ Capture the session completion status assigned from StaffManagement
        sessionStatus: u.session_status || "Pending"
      }));

      setAllStaff(activeStaff);
      setTasks(taskData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Session assignments from StaffManagement become tasks here
  // Staff with a real session (not Unassigned) are shown as session tasks
  const sessionTasks = allStaff
    .filter(s => s.session && s.session !== "Unassigned")
    .map(s => ({
      _id: `session_${s.id}`,     // unique synthetic id
      isSessionTask: true,         // flag to distinguish from regular tasks
      staffId: s.id,
      title: `${s.session} Session`,
      description: `Assigned session from Staff Management`,
      staff_name: s.name,
      staff_session: s.session,
      priority: "Medium",
      status: s.sessionStatus === "Completed"
        ? "Completed"
        : s.sessionStatus === "Active"
          ? "In Progress"
          : "Pending",
      due_date: "—"
    }));

  // Combined for stat boxes
  const combinedTasks = [...sessionTasks, ...tasks];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.assigned_to) return alert("Please select a staff member");

    try {
      await createTask(newTask);
      alert("Task Assigned Successfully!");
      setNewTask({ title: "", description: "", assigned_to: "", priority: "Medium", due_date: "" });
      loadData();
    } catch (err) {
      alert("Failed to assign task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this task?")) {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    }
  };

  // ✅ Update task status — handles both regular tasks and session tasks
  const handleStatusChange = async (taskId, newStatus) => {
    const isSession = String(taskId).startsWith("session_");
    try {
      if (isSession) {
        // Session task: update via staff profile (session_status field)
        const staffId = String(taskId).replace("session_", "");
        const backendStatus = newStatus === "Completed" ? "Completed"
          : newStatus === "In Progress" ? "Active"
            : "Pending";
        await updateStaffProfile(staffId, { session_status: backendStatus });
        // Optimistic update on allStaff
        setAllStaff(prev => prev.map(s =>
          s.id === staffId ? { ...s, sessionStatus: backendStatus } : s
        ));
      } else {
        await updateTaskStatus(taskId, newStatus);
        // Optimistic update on tasks
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  return (
    <>
      <div className="manager-layout">
        <ManagerSidebar activePage="workforce" />

        <div className="main-content">
          <ManagerNavbar />

          <div className="dashboard">

            {/* Header Stats */}
            <div className="stats-row">
              <div className="stat-box total">
                <h3>{combinedTasks.length}</h3>
                <p>Total Tasks</p>
              </div>
              <div className="stat-box pending">
                <h3>{combinedTasks.filter(t => t.status === "Pending").length}</h3>
                <p>Pending</p>
              </div>
              <div className="stat-box progress">
                <h3>{combinedTasks.filter(t => t.status === "In Progress").length}</h3>
                <p>In Progress</p>
              </div>
              <div className="stat-box completed">
                <h3>{combinedTasks.filter(t => t.status === "Completed").length}</h3>
                <p>Completed</p>
              </div>
            </div>

            {/* ✅ SESSION FILTER TABS */}
            <div className="session-tabs">
              {SESSION_TABS.map(tab => (
                <button
                  key={tab}
                  className={`session-tab ${activeSession === tab ? "active" : ""}`}
                  onClick={() => setActiveSession(tab)}
                >
                  {tab}
                  {tab !== "All" && (
                    <span className="tab-count">
                      {allStaff.filter(s => s.session === tab).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="content-grid">
              {/* LEFT: ASSIGNMENT FORM */}
              <div className="section-card form-card">
                <h2>Assign New Task</h2>
                <p className="subtitle">
                  Assign to{" "}
                  <span className="session-highlight">
                    {activeSession === "All" ? "all sessions" : activeSession}
                  </span>{" "}
                  staff
                </p>

                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Blend 50kg Chicken Masala"
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Assign To (Staff)</label>
                    <select
                      value={newTask.assigned_to}
                      onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="">
                        {staffList.length === 0
                          ? `-- No staff in ${activeSession} session --`
                          : "-- Select Staff --"}
                      </option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.session})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="form-group half">
                      <label>Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="form-group half">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={newTask.due_date}
                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Details about the batch or machine..."
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary">Assign Task</button>
                </form>
              </div>

              {/* RIGHT: TASK TRACKER TABLE */}
              <div className="section-card table-card">
                <h2>Task Tracker</h2>
                <div className="table-container">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Assigned To</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedTasks.map(task => (
                        <tr key={task._id} className={task.isSessionTask ? "session-task-row" : ""}>
                          <td>
                            <div className="task-title">
                              {task.isSessionTask && (
                                <span className="session-task-label">SESSION</span>
                              )}
                              {task.title}
                            </div>
                            <div className="task-desc">{task.description}</div>
                          </td>
                          <td>
                            <div className="staff-name">{task.staff_name}</div>
                            <div className="staff-role">{task.staff_session}</div>
                          </td>
                          <td>
                            <span className={`badge priority-${task.priority?.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`status-select status-${task.status?.toLowerCase().replace(" ", "")}`}
                              value={task.status}
                              onChange={e => handleStatusChange(task._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td>{task.due_date}</td>
                          <td>
                            {/* Only allow delete on regular tasks */}
                            {!task.isSessionTask && (
                              <button className="del-btn" onClick={() => handleDelete(task._id)}>×</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {combinedTasks.length === 0 && (
                        <tr><td colSpan="6" className="text-center">No tasks assigned yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ✅ COMPLETED TASKS SECTION */}
            {combinedTasks.filter(t => t.status === "Completed").length > 0 && (
              <div className="section-card completed-section">
                <div className="completed-header">
                  <div>
                    <h2>✅ Completed Tasks</h2>
                    <p className="subtitle">Staff who have finished their assigned work</p>
                  </div>
                  <span className="completed-count">
                    {combinedTasks.filter(t => t.status === "Completed").length} Done
                  </span>
                </div>

                <div className="completed-grid">
                  {combinedTasks
                    .filter(t => t.status === "Completed")
                    .map(task => (
                      <div key={task._id} className="completed-card">
                        <div className="completed-card-top">
                          <div className="check-icon">✓</div>
                          <div className="staff-info">
                            <div className="completed-staff-name">{task.staff_name}</div>
                            <span className="completed-session-badge">{task.staff_session}</span>
                          </div>
                          <span className={`badge priority-${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="completed-task-title">{task.title}</div>
                        {task.description && (
                          <div className="completed-task-desc">{task.description}</div>
                        )}
                        <div className="completed-due">Due: {task.due_date}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
          <Footer />
        </div>
      </div>

      <style jsx>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          font-family: "Inter", sans-serif;
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
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .dashboard {
          padding: 40px 40px 60px;
          flex: 1;
          color: white;
        }

        /* Stats Row */
        .stats-row {
            display: flex;
            gap: 20px;
            margin-bottom: 24px;
        }
        .stat-box {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-box h3 { font-size: 2rem; margin: 0; font-weight: 700; }
        .stat-box p { margin: 5px 0 0; color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; }
        .stat-box.pending h3 { color: #fbbf24; }
        .stat-box.progress h3 { color: #3b82f6; }
        .stat-box.completed h3 { color: #4ade80; }

        /* ✅ SESSION FILTER TABS */
        .session-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .session-tab {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .session-tab:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }
        .session-tab.active {
          background: rgba(249, 115, 22, 0.25);
          border-color: rgba(249, 115, 22, 0.5);
          color: #fdba74;
          font-weight: 600;
        }
        .tab-count {
          background: rgba(255,255,255,0.15);
          padding: 1px 7px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .session-tab.active .tab-count {
          background: rgba(249, 115, 22, 0.4);
          color: #fed7aa;
        }
        .session-highlight {
          color: #fdba74;
          font-weight: 600;
        }

        /* Grid Layout */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        h2 { margin-bottom: 10px; font-size: 1.5rem; }
        .subtitle { color: #94a3b8; margin-bottom: 25px; font-size: 0.9rem; }

        /* Form Styles */
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #cbd5e1; font-size: 0.9rem; }
        input, select, textarea {
            width: 100%;
            padding: 10px;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: white;
        }
        select option {
            background: #1e293b;
            color: white;
        }

        .row { display: flex; gap: 15px; }
        .half { flex: 1; }
        .btn-primary {
            width: 100%;
            padding: 12px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn-primary:hover { background: #2563eb; }

        /* Table Styles */
        .table-container { overflow-x: auto; }
        .task-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .task-table th { text-align: left; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; }
        .task-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }

        /* Session task row styling */
        .session-task-row { background: rgba(249, 115, 22, 0.04); }
        .session-task-row:hover { background: rgba(249, 115, 22, 0.08) !important; }
        .session-task-label {
          display: inline-block;
          background: rgba(249, 115, 22, 0.2);
          color: #fdba74;
          border: 1px solid rgba(249, 115, 22, 0.35);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          margin-right: 6px;
          vertical-align: middle;
          letter-spacing: 0.5px;
        }
        .task-title { font-weight: 600; color: white; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .task-desc { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }

        .staff-name { color: #e2e8f0; }
        .staff-role { font-size: 0.75rem; color: #64748b; background: rgba(255,255,255,0.1); display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 2px; }

        /* Badges */
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }

        .priority-high { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .priority-medium { background: rgba(234, 179, 8, 0.2); color: #fde047; }
        .priority-low { background: rgba(34, 197, 94, 0.2); color: #86efac; }

        /* ✅ Inline Status Dropdown */
        .status-select {
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          width: auto;
        }
        .status-select.status-pending {
          background: rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          border-color: rgba(148,163,184,0.3);
        }
        .status-select.status-inprogress {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          border-color: rgba(59,130,246,0.3);
        }
        .status-select.status-completed {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
          border-color: rgba(34, 197, 94, 0.4);
        }

        .del-btn { background: none; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer; }
        .text-center { text-align: center; color: #64748b; padding: 30px; }

        /* ✅ COMPLETED SECTION */
        .completed-section {
          margin-top: 30px;
          border: 1px solid rgba(74, 222, 128, 0.2);
          background: rgba(34, 197, 94, 0.05);
        }
        .completed-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .completed-count {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
          padding: 6px 16px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .completed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .completed-card {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s;
        }
        .completed-card:hover { transform: translateY(-2px); }
        .completed-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .check-icon {
          width: 32px;
          height: 32px;
          background: rgba(34, 197, 94, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ade80;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .staff-info { flex: 1; min-width: 0; }
        .completed-staff-name {
          font-weight: 700;
          color: #e2e8f0;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .completed-session-badge {
          font-size: 0.72rem;
          background: rgba(255,255,255,0.1);
          color: #94a3b8;
          padding: 2px 7px;
          border-radius: 4px;
          margin-top: 2px;
          display: inline-block;
        }
        .completed-task-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #86efac;
          border-top: 1px solid rgba(74, 222, 128, 0.15);
          padding-top: 8px;
        }
        .completed-task-desc {
          font-size: 0.8rem;
          color: #64748b;
        }
        .completed-due {
          font-size: 0.78rem;
          color: #475569;
          margin-top: auto;
        }

        @media (max-width: 1024px) {
            .content-grid { grid-template-columns: 1fr; }
            .session-tabs { gap: 6px; }
        }
        @media (max-width: 768px) {
            .main-content { margin-left: 0; }
            .dashboard { padding: 20px; }
            .stats-row { flex-wrap: wrap; }
        }
      `}</style>
    </>
  );
};

export default WorkforceManagement;