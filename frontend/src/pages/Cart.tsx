import React, { useEffect, useState } from "react";
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
  size: number;
  keycaps: string;
  switches: Array<{ id: number; name: string; quantity: number }>;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { updateCartCount } = useCart();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/cart",
          {
            headers: {
              Authorization: localStorage.getItem("token") || "",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setCartItems(data.cart_data);
        updateCartCount();
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [updateCartCount]);

  return (
    <div>
      <p className="text-4xl font-semibold p-4">Your Cart</p>
      {cartItems.map((item, index) => (
        <div key={index}>
          <h2>Tester {index + 1}</h2>
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
        </div>
      ))}
      {/* <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Product</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <div className="aspect-square relative">
                <img
                  src="https://www.thockking.com/cdn/shop/products/keyboard-mechanical-switch-switches-tester-fidget-desk-toy-4_900x.jpg?v=1657354186"
                  alt="switch tester image"
                  className={`w-full h-full object-cover rounded-t-xl
            }`}
                />
              </div>
            </TableCell>
            <TableCell>
              <p>Custom Switch Tester</p>
              <p>Number of switches: 10</p>
              <p>Keycaps: none</p>
              <p>Selected switches:</p>
              <p>Kailh Box White x3</p>
              <p>Kailh Box Red x2</p>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDecrement(product.id)}
                  aria-label={
                    quantity ? "Remove from cart" : "Decrease quantity"
                  }
                >
                  {quantity === 1 ? (
                    <Trash className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                <span className="mx-1 min-w-[1.5rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onIncrement(product.id)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table> */}
    </div>
  );
};

export default Cart;
