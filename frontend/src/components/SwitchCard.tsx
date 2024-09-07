import React from "react";
import { Trash, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <Card
      className={`w-full ${
        quantity > 0 ? "rounded-xl shadow-lg" : "rounded-lg"
      } transition-all duration-300`}
    >
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover ${
              quantity > 0 ? "rounded-t-xl" : "rounded-t-lg"
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm text-gray-600">{product.description}</p>
      </CardContent>
      <CardFooter>
        {quantity === 0 ? (
          <Button className="w-full" onClick={() => onIncrement(product.id)}>
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDecrement(product.id)}
              aria-label={
                quantity === 1 ? "Remove from cart" : "Decrease quantity"
              }
            >
              {quantity === 1 ? (
                <Trash className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
            <span className="mx-2 min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onIncrement(product.id)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
