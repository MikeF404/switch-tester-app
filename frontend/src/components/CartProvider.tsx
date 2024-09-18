import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

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
  addToCart: (tester: any) => Promise<string>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartCount: () => Promise<void>;
  updateCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const getToken = useCallback(() => localStorage.getItem("token"), []);

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
          // TODO: redo this section - we don't need to redirect to login
        }
        return;
      }
      const data = await response.json();
      setCartCount(data.cart_count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const updateCart = useCallback(async () => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
       
      if (data.cart_data && Array.isArray(data.cart_data)) {
        setCartItems(data.cart_data);
        setCartCount(data.cart_count || data.cart_data.length);
      } else {
        console.error("Received invalid cart data:", data);
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartItems([]);
      setCartCount(0);
    }
  }, [getToken]);

  const addToCart = useCallback(async (item: CartItem) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        throw new Error("No token found");
      }

      const response = await fetch("http://127.0.0.1:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to add to cart:", errorData);
        if (response.status === 401) {
          console.error("Unauthorized. Redirecting to login...");
          // Implement logout/redirect logic here
        }
        throw new Error(errorData.message || "Failed to add to cart");
      }

      const data = await response.json();
      await updateCart();
      return data.message;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }, [getToken]);

  const removeFromCart = useCallback(async (itemId: string) => {
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
  }, [getToken]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartCount(0);
  }, []);

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartCount,
    updateCart,
    clearCart,
  };

  useEffect(() => {
    updateCart();
  }, []);

  return (
    <CartContext.Provider value={value}>
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

