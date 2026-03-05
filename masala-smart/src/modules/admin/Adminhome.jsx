import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";

// Import the image from src/assets
import backgroundImg from "../../assets/img.png";  // Adjust path if needed (e.g., ../assets/img.png)

function AdminHome() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <AdminNavbar />

        <div className="dashboard">
          <h1>Welcome to BlendMaster Admin Dashboard</h1>
          <p className="subtitle">
            Manage your masala production with intelligent blend planning and zero expiry loss.
          </p>

          <div className="cards-grid">
            <div className="card">
              <h3>⚙️ Master Setup</h3>
              <p>Configure raw materials, products, expiry rules & system settings</p>
            </div>
            <div
              className="card"
              // 3. Add onClick handler and visual cue style
              onClick={() => navigate("/admin/UserSetup")}
              style={{ cursor: "pointer" }}
            >
              <h3>👥 User Management</h3>
              <p>Create and assign roles: Admin, Manager, Staff</p>
            </div>
            <div className="card">
              <h3>📋 BOM Creation</h3>
              <p>Define Bill of Materials for Garam Masala, Chicken Masala, Biryani Masala etc.</p>
            </div>
            <div className="card">
              <h3>🔄 Blend Plans</h3>
              <p>Auto-generate optimal production plans using near-expiry stock</p>
            </div>
            <div className="card">
              <h3>⚠️ Expiry Alerts</h3>
              <p>Real-time monitoring of stock age and expiry risks</p>
            </div>
            <div className="card">
              <h3>📊 Reports</h3>
              <p>Production efficiency, waste reduction, and profitability analytics</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .admin-layout {
          position: relative;
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          animation: fadeIn 1s ease-out;
        }

        /* Dark overlay for better readability */
        .admin-layout::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .main-content {
          margin-left: 280px;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .dashboard {
          padding: 100px 40px 60px;
          flex: 1;
          color: white;
        }

        .dashboard h1 {
          font-size: 3rem;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #ffffff, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .subtitle {
          font-size: 1.4rem;
          opacity: 0.95;
          max-width: 900px;
          margin-bottom: 60px;
          line-height: 1.6;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .card {
          background: rgba(121, 107, 107, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          transition: all 0.4s ease;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          animation: cardFadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }
        .card:nth-child(5) { animation-delay: 0.5s; }
        .card:nth-child(6) { animation-delay: 0.6s; }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px rgba(255, 215, 0, 0.3);
          border-color: #ffd700;
          background: rgba(255, 255, 255, 0.25);
        }

        .card h3 {
          font-size: 1.7rem;
          margin-bottom: 16px;
          color: #ffd700;
          font-weight: 600;
        }

        .card p {
          line-height: 1.7;
          font-size: 1.05rem;
          opacity: 0.95;
        }

        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 80px;
          }
          .dashboard {
            padding: 90px 20px 40px;
          }
          .dashboard h1 {
            font-size: 2.4rem;
          }
          .subtitle {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .dashboard h1 {
            font-size: 2.1rem;
          }
          .cards-grid {
            gap: 20px;
          }
          .card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminHome;