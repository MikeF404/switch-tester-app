import React from "react";
import { Trash, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Switch {
  id: number;
  name: string;
  type: string;
  force: string;
  image: string;
}

interface SwitchCardProps {
  product: Switch;
  quantity: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

const ProductCard: React.FC<SwitchCardProps> = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <Card
      className={`  w-full h-fit rounded-xl relative pb-16 shadow-lg ${
        quantity > 0 ? "border-black  " : ""
      } transition-all duration-300`}
    >
      <CardHeader className="p-0">
        <div className="aspect-square relative">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover rounded-t-xl
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
      </CardContent>
      <CardFooter className="flex mt-auto absolute bottom-0 left-0 right-0 ">
        <p className="text-sm text-gray-600 w-full">{product.type + " " + product.force}</p>
        {quantity === 0 ? (
          <Button className="w-full" onClick={() => onIncrement(product.id)}>
            Add
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
            <span className="mx-1 min-w-[1.5rem] text-center">{quantity}</span>
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
