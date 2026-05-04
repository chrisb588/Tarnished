import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLoginPage.css";
import { adminLogin } from "../../api/admin";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await adminLogin(username, password);

      navigate("/");
      console.log("Admin is authenticated");
    } catch (error) {
      alert(error);
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-form-container">
      <button className="adminlogin-backbtn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1 className="admin-login-label">Sign in as Admin</h1>
        <p>username</p>
        <input
          type="text"
          placeholder="Your username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <p>password</p>
        <input
          type="password"
          placeholder="Your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="admin-login-button"
        >
          {loading ? "Processing..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
