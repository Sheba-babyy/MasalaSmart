import React, { useState } from 'react';
import Sidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png"; 

function FeedbackPage() {
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "General Update",
    workDetails: "",
    siteFeedback: "",
    urgency: "Normal",
    rating: 5 // 1 to 5 scale
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRating = (rate) => {
    setFormData({ ...formData, rating: rate });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback Submitted:", formData);
    alert("✅ Feedback sent to Manager successfully!");
    
    // Reset text fields only
    setFormData({ ...formData, workDetails: "", siteFeedback: "", rating: 5, category: "General Update" });
  };

  return (
    <div className="staff-layout-container">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content */}
      <div className="main-content-area">
        <StaffNavbar />

        <div className="page-content animate-fade-in">
          <div className="page-header center-text">
            <h1>Feedback & Daily Report</h1>
            <p>Submit your daily work summary and share feedback about the site.</p>
          </div>

          <div className="feedback-container">
            <div className="glass-card feedback-form-card">
                <div className="card-header">
                    <h3>✉️ Compose Report</h3>
                    <span className="date-display">{formData.date}</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Row 1: Category & Urgency */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Feedback Category</label>
                            <select 
                                name="category" 
                                value={formData.category}
                                onChange={handleInputChange}
                                className="staff-input"
                            >
                                <option>General Update</option>
                                <option>Machine Maintenance</option>
                                <option>Safety Issue</option>
                                <option>Raw Material Request</option>
                                <option>HR / Personal</option>
                                <option>Suggestion for Improvement</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Urgency Level</label>
                            <select 
                                name="urgency" 
                                value={formData.urgency}
                                onChange={handleInputChange}
                                className={`staff-input urgency-${formData.urgency.toLowerCase()}`}
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Critical">🔥 Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Daily Work Details */}
                    <div className="form-group">
                        <label>📝 Daily Work Summary</label>
                        <p className="helper-text">Briefly list tasks completed, batches handled, or specific outputs.</p>
                        <textarea
                            name="workDetails"
                            rows="4"
                            value={formData.workDetails}
                            onChange={handleInputChange}
                            placeholder="e.g. Completed packing for Batch BM-101 (500 units). Cleaned mixing area..."
                            className="staff-input"
                            required
                        ></textarea>
                    </div>

                    {/* Row 3: Site Feedback */}
                    <div className="form-group">
                        <label>🏗️ Site Feedback / Issues / Suggestions</label>
                        <p className="helper-text">Any issues with machines, safety concerns, or ideas for the manager?</p>
                        <textarea
                            name="siteFeedback"
                            rows="3"
                            value={formData.siteFeedback}
                            onChange={handleInputChange}
                            placeholder="e.g. The sealing machine is making a loud noise, needs checking..."
                            className="staff-input"
                        ></textarea>
                    </div>

                    {/* Row 4: Rating & Submit */}
                    <div className="bottom-row">
                        <div className="rating-group">
                            <label>How was your day?</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                                        onClick={() => handleRating(star)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button type="submit" className="submit-btn big-btn">
                                🚀 Submit Report
                            </button>
                        </div>
                    </div>
                </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
        /* --- Layout Structure --- */
        .staff-layout-container {
          position: relative;
          display: flex; 
          min-height: 100vh;
          width: 100vw;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          overflow: hidden;
        }

        .staff-layout-container::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75); 
          z-index: 0;
          pointer-events: none;
        }

        .main-content-area {
          flex: 1; 
          margin-left: 260px; /* FIXED: Respects Sidebar Width */
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          height: 100vh; 
          overflow-y: auto; 
        }

        .page-content {
          flex: 1;
          padding: 40px;
          color: white;
          width: 100%;
          box-sizing: border-box;
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* --- Header --- */
        .page-header { margin-bottom: 40px; }
        .page-header.center-text { text-align: center; }
        .page-header h1 {
          font-size: 2.8rem; margin-bottom: 10px; font-weight: 800;
          background: linear-gradient(90deg, #d4af37, #f1c40f, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-header p { font-size: 1.2rem; color: #b0bec5; }

        /* --- Container & Card --- */
        .feedback-container {
            display: flex;
            justify-content: center;
            width: 100%;
        }

        .glass-card.feedback-form-card {
            background: rgba(30, 25, 20, 0.9); 
            backdrop-filter: blur(15px);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(212, 175, 55, 0.25); 
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            color: #e0e0e0;
            width: 100%;
            max-width: 750px;
        }

        .card-header { 
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px; 
        }
        .card-header h3 { margin: 0; color: #d4af37; font-size: 1.6rem; }
        .date-display { 
            background: rgba(255,255,255,0.1); padding: 6px 12px; 
            border-radius: 6px; font-family: monospace; color: #f1c40f; 
        }

        /* --- Form Elements --- */
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
        }

        .form-group { margin-bottom: 25px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 1rem; color: #f1c40f; font-weight: 500; }
        .helper-text { font-size: 0.85rem; color: #95a5a6; margin-top: -5px; margin-bottom: 10px; }

        .staff-input {
            width: 100%; padding: 14px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #5d4037;
            border-radius: 8px;
            color: white; font-size: 1.05rem; box-sizing: border-box; transition: 0.3s;
        }
        .staff-input:focus { outline: none; border-color: #f1c40f; background: rgba(0,0,0,0.5); box-shadow: 0 0 8px rgba(241, 196, 15, 0.2); }
        
        textarea.staff-input { resize: vertical; }
        select.staff-input option { background-color: #2a221b; color: white; padding: 10px; }

        /* Urgency Colors in Dropdown */
        .urgency-critical { color: #e74c3c; border-color: #e74c3c; }

        /* --- Bottom Row (Rating & Button) --- */
        .bottom-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .rating-group label { display: block; color: #b0bec5; font-size: 0.9rem; margin-bottom: 5px; }
        .star-rating { display: flex; gap: 5px; }
        .star-btn {
            background: none; border: none; font-size: 2rem; color: #555; 
            cursor: pointer; transition: 0.2s; line-height: 1; padding: 0;
        }
        .star-btn:hover, .star-btn.active { color: #f1c40f; transform: scale(1.1); }

        .submit-btn {
            padding: 14px 40px;
            background: linear-gradient(135deg, #1f3a4d, #2c526d); 
            color: #d4af37; border: 1px solid #d4af37; border-radius: 8px;
            font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 1.1rem;
        }
        .submit-btn:hover { background: #d4af37; color: #1f3a4d; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); transform: translateY(-2px); }

        /* --- Responsive --- */
        @media (max-width: 1024px) {
            .main-content-area { margin-left: 0; }
        }

        @media (max-width: 768px) {
            .form-row { grid-template-columns: 1fr; gap: 20px; }
            .glass-card.feedback-form-card { padding: 25px; }
            .bottom-row { flex-direction: column; gap: 20px; align-items: stretch; }
            .rating-group { text-align: center; }
            .star-rating { justify-content: center; }
        }
      `}</style>
    </div>
  );
}

export default FeedbackPage;