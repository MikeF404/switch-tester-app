import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Minus, Trash } from "lucide-react";
import { useCart } from "@/components/CartProvider";


interface CartItem {
  id: string; 
  size: number;
  keycaps: string;
  switches: Array<{ id: number; name: string; quantity: number }>;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { updateCartCount, removeFromCart } = useCart();

  const fetchCart = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/cart", {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      setCartItems(data.cart_data);
      updateCartCount();
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [updateCartCount]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      await fetchCart(); // Refetch the cart after removing an item
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id}>
            <h2>Tester</h2>
            <p>Size: {item.size} switches</p>
            <p>Keycaps: {item.keycaps}</p>
            <h3>Switches:</h3>
            <ul>
              {item.switches.map((switchItem) => (
                <li key={switchItem.id}>
                  {switchItem.name}: {switchItem.quantity}
                </li>
              ))}
            </ul>
            <button onClick={() => handleRemoveItem(item.id)}>
              Remove from cart
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default CartPage;