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
import { useCart } from "@/providers/CartProvider";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const CartPage: React.FC = () => {
  const { cartItems, updateItemQuantity, updateCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    updateCart();
  }, [updateCart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const renderItemDetails = (item: any) => {
    if (item.switches) {
      // Custom tester details
      return (
        <>
        <div className="font-bold">
        <p>{item.name}</p>
        
      </div>
          <div className="text-sm">
            <p>Details:</p>
            <p>size: {item.size || "N/A"}</p>
            <p>keycaps: {item.keycaps || "N/A"}</p>
            <p>switches:</p>
            <ul className="list-disc pl-5">
              {item.switches.map((switch_item: any) => (
                <li key={switch_item.id}>
                  {switch_item.name} x{switch_item.quantity}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    }
    
    // Simple item details
    return (
      <div className="font-bold">
        <p>{item.name}</p>
        
      </div>
    );
  };

  const total = cartItems ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  if (!cartItems) {
    return <div>Loading cart...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {cartItems.length === 0 ? (
        <div>Your cart is empty</div>
      ) : (
        <>
          <div>
            <div className="flex flex-col items-center">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl flex flex-row w-full justify-between p-2"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src="https://www.thockking.com/cdn/shop/products/keyboard-mechanical-switch-switches-tester-fidget-desk-toy-4_900x.jpg?v=1657354186"
                      alt={item.name || "Unknown item"}
                      className="w-40 h-20 object-cover self-start rounded-3xl"
                    />
                    <div>{renderItemDetails(item)}</div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div>${item.price.toFixed(2)}</div>
                    <div className="flex items-center justify-start w-full">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        aria-label={
                          item.quantity === 1
                            ? "Remove from cart"
                            : "Decrease quantity"
                        }
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-4 w-4" color="#cc0000" />
                        ) : (
                          <Minus className="h-4 w-4" strokeWidth={3.5} />
                        )}
                      </Button>
                      <span className="min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus strokeWidth={3.5} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
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