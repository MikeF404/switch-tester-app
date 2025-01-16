import React, { useEffect, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const CartPage: React.FC = () => {
  const { cartItems, updateItemQuantity, updateCart } = useCart();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  
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
            <p>size: {item.size || "N/A"}</p>
            <p>keycaps: {item.keycaps || "N/A"}</p>
            <p>switches:</p>
            <ul className="list-disc pl-5">
              {item.switches.map((switch_item: any) => (
                <li key={switch_item.id}>
                  {switch_item.name} 
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

  const handleVerifyCart = async () => {
    if (isVerifying) return; // Prevent multiple clicks
    
    setIsVerifying(true);
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        toast.error("No cart found");
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/cart/${cartId}/verify`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (error.insufficientStock) {
          const items = Object.entries(error.insufficientStock)
            .map(([name, stock]) => `${name} (${stock} available)`)
            .join(', ');
          toast.error(`Insufficient stock for: ${items}`);
          return;
        }
        throw new Error('Failed to verify cart');
      }
      
      const data = await response.json();
      localStorage.setItem('pendingOrderId', data.orderId);
      navigate("/checkout");
      
    } catch (error) {
      console.error("Error verifying cart:", error);
      toast.error("Failed to process cart. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!cartItems) {
    return <div>Loading cart...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-center mb-8">Cart</h1>
      {cartItems.length === 0 ? (
        <div className="flex justify-center items-center space-x-4">
          <div className="text-center text-2xl">Nothing here yet! </div>
          <Link to="/shop"><p className="text-center underline">(fix it)</p></Link>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-col items-center space-y-4">
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
              <Button 
                onClick={handleVerifyCart}
                disabled={isVerifying || cartItems.length === 0}
              >
                {isVerifying ? (
                  <>
                    <span className="mr-2">Verifying</span>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </>
                ) : (
                  "Purchase"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;