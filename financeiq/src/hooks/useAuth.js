import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("financeiq_user")); } 
    catch { return null; }
  });

  const login = async (credentials) => {
    // Keep the demo button working for testing
    if (credentials.email === "demo@example.com") {
        const demoUser = { name: "Demo User", email: "demo@example.com", token: "demo", id: "demo-id" };
        localStorage.setItem("financeiq_user", JSON.stringify(demoUser));
        setUser(demoUser);
        return;
    }

    try {
      // 🚀 Call your Spring Boot Login API
      const res = await fetch("http://localhost:8080/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) throw new Error("Invalid email or password");

      const data = await res.json();
      
      // Format the returned data and JWT Token
      const loggedInUser = {
        id: data.userId,
        name: data.name,
        email: credentials.email,
        token: data.token
      };

      localStorage.setItem("financeiq_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  // --- 🚀 NEW SIGNUP LOGIC ---
  const signup = async (userData) => {
    try {
      // 1. Call your Spring Boot Register API
      const res = await fetch("http://localhost:8080/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed. Email might already exist.");
      }

      // 2. If registration is successful, log them in automatically!
      await login({ email: userData.email, password: userData.password });

    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

    const logout = () => {
    localStorage.removeItem("financeiq_user");
    setUser(null);
  };

return { user, login, signup, logout };
}