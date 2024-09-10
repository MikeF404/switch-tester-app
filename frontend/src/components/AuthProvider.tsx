import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, token: string) => void;
  logout: () => void;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      setAuthState({ isAuthenticated: true, user: { email }, token });
    }
  }, []);

  const login = (email: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    setAuthState({ isAuthenticated: true, user: { email }, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setAuthState({ isAuthenticated: false, user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
