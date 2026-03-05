import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import img3 from "../assets/img3.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // -------------------------------
  // ENTER KEY HANDLER
  // -------------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // -------------------------------
  // API BASED LOGIN
  // -------------------------------
  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ username, password });
      console.log("data",data)

      // Save login info
      localStorage.setItem("login_id", data.login_id);
      localStorage.setItem("usertype", data.usertype);
      localStorage.setItem("username", data.username);

      // Role-based navigation
      if (data.usertype === "admin") {
        navigate("/Adminhome");
      } else if (data.usertype === "manager") {
        navigate("/managerhome");
      } else if (data.usertype === "user") {
        navigate("/staffhome");
      } else {
        setError("Unknown user role");
      }

    } catch (err) {
      setError(err.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo">
          <h1>BlendMaster</h1>
          <p>Smart Solutions for Modern Business</p>
        </div>

        <h2>Login to Your Account</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input
            type="text"
            // placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <span className="floating-label">Username</span>
        </div>

        <div className="input-group">
          <input
            type="password"
            // placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="floating-label">Password</span>
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="signup-link">
          <p>
            Don't have an account?{" "}
            <span className="link" onClick={() => navigate("/signup")}>
              Create one
            </span>
          </p>
        </div>

      </div>

      {/* ---------- STYLES ---------- */}
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url(${img3});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          font-family: 'Segoe UI', sans-serif;
          padding: 20px;
        }

        .login-card {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 40px 50px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .logo h1 {
          font-size: 2.6rem;
          background: linear-gradient(90deg, #fff, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        h2 {
          margin: 25px 0;
        }

        .error-message {
          background: rgba(255, 80, 80, 0.25);
          border: 1px solid rgba(255, 100, 100, 0.4);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .input-group {
          position: relative;
          margin: 25px 0;
        }

        .input-group input {
          width: 94%;
          padding: 15px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          outline: none;
        }

        .floating-label {
          position: absolute;
          top: 15px;
          left: 15px;
          transition: 0.3s;
          pointer-events: none;
          color: rgba(255, 255, 255, 0.7);
        }

        .input-group input:focus ~ .floating-label,
        .input-group input:not(:placeholder-shown) ~ .floating-label {
          top: -10px;
          font-size: 0.8rem;
          background: rgba(80, 60, 120, 0.8);
          padding: 2px 8px;
          border-radius: 5px;
          color: #ffd700;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          margin-top: 20px;
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          border-radius: 12px;
          border: none;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signup-link {
          margin-top: 20px;
        }

        .signup-link .link {
          color: #ffd700;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default Login;
