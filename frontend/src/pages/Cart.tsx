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
import { useNavigate } from "react-router-dom";


interface CartItem {
  id: string; 
  size: number;
  keycaps: string;
  switches: Array<{ id: number; name: string; quantity: number }>;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { updateCartCount, removeFromCart } = useCart();
  const ITEM_PRICE = 9.99; //TODO: get from backend
  const navigate = useNavigate();
  
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
    <div className="container mx-auto p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="flex flex-col items-center w-60">
                <div className="flex flex-col items-center">
                  <img
                    src="https://www.thockking.com/cdn/shop/products/keyboard-mechanical-switch-switches-tester-fidget-desk-toy-4_900x.jpg?v=1657354186"
                    alt="Custom Switch Tester"
                    className={"w-60 h-40 object-cover self-start rounded-t-xl"}
                  />
                  
                  <span className="mt-2">Custom Switch Tester</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>Details:</p>
                  <p>size: {item.size}</p>
                  <p>keycaps: {item.keycaps}</p>
                  <p>switches:</p>
                  <ul className="list-disc pl-5">
                    {item.switches.map((switch_item) => (
                      <li key={switch_item.id}>
                        {switch_item.name} x{switch_item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </TableCell>
              <TableCell>${ITEM_PRICE.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xl font-bold">
          Total: ${(ITEM_PRICE * cartItems.length).toFixed(2)}
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
          <Button>Purchase</Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;