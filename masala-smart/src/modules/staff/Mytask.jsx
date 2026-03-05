import React, { useState, useEffect } from "react";
import StaffSidebar from "./Sidebar"; 
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png"; // Using staff bg
import { fetchStaffTasks, updateTaskStatus } from "../../services/api";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchStaffTasks(loginId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      alert("Failed to update status");
      loadTasks(); // Revert on error
    }
  };

  return (
    <div className="staff-layout">
      <StaffSidebar />
      <div className="main-content">
        <StaffNavbar />
        
        <div className="dashboard">
          <div className="header-section">
            <h1>My Assignments</h1>
            <p className="subtitle">Track your daily production tasks and update their status.</p>
          </div>

          <div className="tasks-grid">
            {loading ? <p className="text-white">Loading tasks...</p> : tasks.length === 0 ? (
                <div className="empty-state">
                    <h3>🎉 No pending tasks!</h3>
                    <p>You are all caught up for today.</p>
                </div>
            ) : (
                tasks.map(task => (
                    <div key={task._id} className={`task-card border-${task.priority.toLowerCase()}`}>
                        <div className="task-header">
                            <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                                {task.priority} Priority
                            </span>
                            <span className="due-date">Due: {task.due_date}</span>
                        </div>
                        
                        <h3>{task.title}</h3>
                        <p className="desc">{task.description || "No additional details provided."}</p>
                        
                        <div className="task-footer">
                            <label>Status:</label>
                            <select 
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                className={`status-select ${task.status.toLowerCase().replace(" ","")}`}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
        <Footer />
      </div>

      <style jsx>{`
        .staff-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          font-family: "Inter", sans-serif;
          position: relative;
        }
        .staff-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: 0;
        }
        .main-content {
          margin-left: 280px;
          width: 100%;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .dashboard { padding: 40px 50px; flex: 1; color: white; }

        .header-section h1 { font-size: 2.5rem; margin-bottom: 10px; color: #ffd700; font-weight: 800; }
        .subtitle { color: #e0e0e0; margin-bottom: 40px; font-size: 1.1rem; }

        /* Grid */
        .tasks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
        }

        /* Card Styles */
        .task-card {
            background: rgba(30, 30, 30, 0.85);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.2s;
        }
        .task-card:hover { transform: translateY(-5px); }

        /* Priority Borders */
        .border-high { border-left: 5px solid #ef4444; }
        .border-medium { border-left: 5px solid #fbbf24; }
        .border-low { border-left: 5px solid #4ade80; }

        .task-header { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.85rem; }
        .priority-tag { padding: 4px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
        .priority-tag.high { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .priority-tag.medium { background: rgba(251, 191, 36, 0.2); color: #fde047; }
        .priority-tag.low { background: rgba(74, 222, 128, 0.2); color: #86efac; }
        .due-date { color: #94a3b8; }

        h3 { font-size: 1.4rem; margin-bottom: 10px; color: white; }
        .desc { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; min-height: 45px; }

        /* Footer / Select */
        .task-footer { display: flex; align-items: center; gap: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
        .status-select {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            border: none;
            color: white;
            font-weight: 600;
            cursor: pointer;
        }
        .status-select.pending { background: #475569; }
        .status-select.inprogress { background: #2563eb; }
        .status-select.completed { background: #16a34a; }

        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
        }

        @media (max-width: 768px) {
            .main-content { margin-left: 80px; }
            .dashboard { padding: 30px 20px; }
        }
      `}</style>
    </div>
  );
};

export default MyTasks;