import React, { createContext, useState, useContext, useEffect } from "react";

interface CartContextType {
  cartCount: number;
  addToCart: (tester: any) => Promise<void>;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartCount, setCartCount] = useState(0);

  const getToken = () => localStorage.getItem("token");

  const updateCartCount = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "http://127.0.0.1:5000/api/cart/count",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch cart count");
      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const addToCart = async (tester: any) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "http://127.0.0.1:5000/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(tester),
        }
      );
      if (!response.ok) throw new Error("Failed to add to cart");
      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
