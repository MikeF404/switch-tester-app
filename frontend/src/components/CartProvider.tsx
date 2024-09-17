import React, { createContext, useState, useContext, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  size: number;
  keycaps: string;
  switches: Array<{ id: number; name: string; quantity: number }>;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (tester: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartCount: () => Promise<void>;
  updateCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const updateCart = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/cart", {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch cart:", errorData);
        if (response.status === 401) {
          console.error("Unauthorized. Redirecting to login...");
          // Implement your logout/redirect logic here
        }
        return;
      }
      const data = await response.json();
      setCartItems(data.cart_data);
      setCartCount(data.cart_data.length);
    } catch (error) {
      console.error("Error fetching cart:", error);
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
      await updateCart();
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

      await updateCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  useEffect(() => {
    updateCart();
  }, []);

  return (
    <CartContext.Provider
      value={{ cartCount, cartItems, addToCart, removeFromCart, updateCartCount, updateCart }}
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
