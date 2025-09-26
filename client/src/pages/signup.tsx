import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Signup() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Signup successful! Please log in." });
        setLocation("/login");
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
        <h1 className="auth-3d-title">Signup</h1>
        
        <div className="auth-3d-input">
          <Input 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="auth-3d-input">
          <Input 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="auth-3d-input">
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <Button 
          onClick={handleSignup} 
          disabled={loading}
          className="auth-3d-button w-full"
        >
          {loading ? "Signing up..." : "Signup"}
        </Button>
      </div>
    </div>
  );
}
