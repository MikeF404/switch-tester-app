import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from './CartProvider';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string | null } | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: (callback: () => void) => void;
  createGuestUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem("token"),
  }));

  const { updateCart, clearCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    if (token && userId) {
      setAuthState({ isAuthenticated: true, user: { id: userId, email }, token });
    } else {
      createGuestUser();
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with email:", email);
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful, received data:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      setAuthState({ isAuthenticated: true, user: { id: data.user_id, email }, token: data.token });
      await updateCart(); // Update cart after successful login
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = (callback: () => void) => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setAuthState({ isAuthenticated: false, user: null, token: null });
    clearCart(); 
    callback(); 
  };

  const createGuestUser = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/create-guest-user", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to create guest user");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user_id);
      setAuthState({
        isAuthenticated: false,
        user: { id: data.user_id, email: null },
        token: data.token,
      });
    } catch (error) {
      console.error("Error creating guest user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, createGuestUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
