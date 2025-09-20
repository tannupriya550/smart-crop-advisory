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
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-8 rounded shadow w-80">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button
          onClick={handleLogin}
          className="bg-green-600 text-white px-4 py-2 w-full rounded"
        >
          Login
        </button>

        {/* 👇 FIX: Use wouter Link */}
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link href="/signup">
            <span className="text-green-700 underline cursor-pointer">
              Sign up
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
