import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/providers/CartProvider";
import { toast } from "sonner";

const Shop: React.FC = () => {
  const { addToCart } = useCart();
  const handleAddToCart = async () => {
    try {
      await addToCart({
        itemId: 1,
        quantity: 1
      });
      toast.success("Item added to cart");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Error adding item to cart");
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <img
            src="https://www.thockking.com/cdn/shop/products/keyboard-mechanical-switch-switches-tester-fidget-desk-toy-4_900x.jpg?v=1657354186"
            alt="Custom Switch Tester"
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Custom Switch Tester</CardTitle>
            <CardDescription>
              Create a unique tester that features only the switches you are
              interested in
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex justify-between items-center">
              <div className="text-xl">$10-$14</div>
              <Link to="/shop/switch-tester">
                <Button>Customize</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <img
            src="https://www.thockking.com/cdn/shop/products/keyboard-mechanical-switch-switches-tester-fidget-desk-toy-4_900x.jpg?v=1657354186"
            alt="Custom Switch Tester"
            className="w-full object-cover"
          />
          <CardHeader>
            <CardTitle>Layout Tester</CardTitle>
            <CardDescription>
              Try out 3 most popular layouts and see which one you like best
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex justify-between items-center">
              <div className="text-xl">$7.99</div>
              <div className="flex gap-2">
                <Link to="/shop/layout-tester">
                  <Button variant="outline">About</Button>
                </Link>
                <Button onClick={handleAddToCart}>Add to Cart</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="my-6 flex items-center justify-center text-4xl text-gray-500">
          More items soon!
        </div>
      </div>
    </div>
  );
};

export default Shop;
