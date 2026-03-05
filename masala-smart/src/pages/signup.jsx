import { useState } from "react";
import { useNavigate } from "react-router-dom";
import img4 from "../assets/img4.png";
import { registerUser } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔴 UPDATED FUNCTION
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      firstName,
      lastName,
      email,
      contact,
      address,
      username,
      password,
    } = formData;

    // -------- VALIDATION --------
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !address ||
      !username ||
      !password
    ) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email address");
      return;
    }

    if (contact.length !== 10) {
      setError("Contact number must be 10 digits");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // -------- API CALL --------
    try {
      setLoading(true);

      const res = await registerUser(formData); // ✅ BACKEND HIT

      setSuccess(res.message || "Account created successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <center>
          <h1>BlendMaster</h1>
          <p>Smart Solutions for Modern Business</p>
          </center>
        </div>

        <h2>Create Your Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSignup}>
          <div className="row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="basic-input"
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="basic-input"
              onChange={handleChange}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="basic-input"
            onChange={handleChange}
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            className="basic-input"
            onChange={handleChange}
          />

          <textarea
            name="address"
            placeholder="Address"
            rows="3"
            className="basic-input"
            onChange={handleChange}
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="basic-input"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="basic-input"
            onChange={handleChange}
          />

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="login-link">
          <p>
            <center>
            Already have an account?{" "}
            <span onClick={() => navigate("/")} className="link">
              Login here
            </span>
            </center>
          </p>
        </div>
      </div>

      <style>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          background-image: url(${img4});
          background-size: cover;
          background-position: center;
          padding: 50px;
          font-family: sans-serif;
        }

        .signup-card {
          background: rgba(255,255,255,0.96);
          max-width: 480px;
          width: 100%;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .basic-input {
          width: 95%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .signup-btn {
          width: 100%;
          padding: 14px;
          background: #007bff;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
        }

        .signup-btn:disabled {
          background: #9ec5fe;
          cursor: not-allowed;
        }

        .link{
          color: #2268b3;
          cursor: pointer;
        }

        .error-message {
          background: #ffcdd2;
          color: #c62828;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .success-message {
          background: #c8e6c9;
          color: #2e7d32;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
}

export default Signup;
