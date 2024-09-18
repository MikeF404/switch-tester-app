import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
        updateCart();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      await updateCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const total = cartItems ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  if (!cartItems) {
    return <div>Loading cart...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-64px)]">
      {cartItems.length === 0 ? (
        <div>Your cart is empty</div>
      ) : (
        <>
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
                        alt={item.name || 'Unknown item'}
                        className={"w-60 h-40 object-cover self-start rounded-t-xl"}
                      />
                      <span className="mt-2">{item.name || 'Unknown item'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Details:</p>
                      <p>size: {item.size || 'N/A'}</p>
                      <p>keycaps: {item.keycaps || 'N/A'}</p>
                      <p>switches:</p>
                      <ul className="list-disc pl-5">
                        {item.switches && item.switches.map((switch_item) => (
                          <li key={switch_item.id}>
                            {switch_item.name || 'Unknown switch'} x{switch_item.quantity || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TableCell>
                  <TableCell>${(item.price || 0).toFixed(2)}</TableCell>
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
              Total: ${total.toFixed(2)}
            </div>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => navigate("/shop")}>
                Continue Shopping
              </Button>
              <Button onClick={() => navigate("/checkout")}>Purchase</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;