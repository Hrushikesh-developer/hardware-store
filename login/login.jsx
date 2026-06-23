import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLogin = localStorage.getItem("adminLoggedIn") === "true" ||
                    localStorage.getItem("is_login") === "true" ||
                    localStorage.getItem("isLogin") === "true" ||
                    localStorage.getItem("isLoggedIn") === "true";
    if (isLogin) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with your backend API later
      // const res = await fetch("http://localhost:5000/admin/login", {...});

      // Temporary demo login
      if (
        form.email === "admin@srisaihardware.com" &&
        form.password === "admin123"
      ) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("is_login", "true");
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("isLoggedIn", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sri Sai Hardware</h1>
        <h2>Owner Login</h2>
        <p>Authorized access only</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter owner email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;