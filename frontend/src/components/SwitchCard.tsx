import React, { useState } from "react";
import { Trash, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";

interface Switch {
  id: number;
  brand: string;
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card
      className={`  w-full h-fit rounded-xl shadow-lg ${
        quantity > 0 ? "border-black  " : ""
      } transition-all duration-300`}
    >
      <CardHeader className="p-0">
        <div 
          className="aspect-square relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={`../../img/primary_${product.image}`}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-400 rounded-t-xl absolute top-0 left-0
            ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />
          <img
            src={`../../img/secondary_${product.image}`}
            alt={product.name}
            className={`w-full h-full object-cover rounded-t-xl transition-opacity duration-400 absolute top-0 left-0
            ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{product.brand}</span>
          <Badge variant="secondary">{product.type}</Badge>
        </div>
        <h2 className=" font-semibold max-h-4">{product.name}</h2>
      </CardContent>
      <CardFooter className="flex justify-between p-3 items-center">
        <span className="text-sm text-gray-600">{product.force}</span>
        <div className="w-[100px]">
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
              <span className="min-w-[1rem] text-center">{quantity}</span>
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
