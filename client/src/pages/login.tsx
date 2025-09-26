import { useState } from "react";
import { useLocation, Link } from "wouter";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setLocation("/"); // go to home after login
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="auth-3d-container flex flex-col items-center justify-center min-h-screen">
      {/* Floating Background Elements */}
      <div className="auth-floating-element"></div>
      <div className="auth-floating-element"></div>
      <div className="auth-floating-element"></div>
      <div className="auth-floating-element"></div>

      <div className="auth-3d-card">
        <h1 className="auth-3d-title">Login</h1>
        
        <div className="auth-3d-input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="auth-3d-input">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleLogin}
          className="auth-3d-button w-full"
        >
          Login
        </button>

        <div className="auth-3d-link">
          Don't have an account?{" "}
          <Link href="/signup">
            <span className="text-green-700 underline cursor-pointer">
              Sign up
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
