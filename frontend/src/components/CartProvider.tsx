import React, { createContext, useState, useContext, useEffect } from "react";

interface CartContextType {
  cartCount: number;
  addToCart: (tester: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
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
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/cart/count", {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch cart count:", errorData);
        if (response.status === 401) {
          console.error("Unauthorized. Redirecting to login...");
          // Implement your logout/redirect logic here
        }
        return;
      }
      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const addToCart = async (tester: any) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(tester),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to add to cart:", errorData);
        if (response.status === 401) {
          console.error("Unauthorized. Redirecting to login...");
          // Implement your logout/redirect logic here
        }
        throw new Error("Failed to add to cart");
      }
      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:5000/api/cart/remove/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, addToCart, removeFromCart, updateCartCount }}
    >
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
