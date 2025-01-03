import React, { useState } from "react";
import { Trash, Minus, Plus, Trash2 } from "lucide-react";
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

const renderTypeBadges = (type: string) => {
  const types = type.toLowerCase().split(' ');
  
  return (
    <div className="flex gap-1">
      {types.map((t, index) => {
        // Check if the type is one of our known variants
        const validTypes = ['tactile', 'linear', 'silent', 'clicky'];
        const variant = validTypes.includes(t) ? t : 'default';
        
        return (
          <Badge key={index} variant={variant as any}>
            {t}
          </Badge>
        );
      })}
    </div>
  );
};

const ProductCard: React.FC<SwitchCardProps> = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card
      className={`bg-background w-full h-fit rounded-xl border-2 ${
        quantity > 0 ? "border-accent " : ""
      } 
      transition-all duration-300`}
    >
      <CardHeader className="p-0">
        <div
          className=" aspect-square relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={`../../img/${product.image}_transparent.png`}
            alt={product.name}
            className={`h-full object-cover transition-opacity duration-400 rounded-t-xl absolute top-0 left-0
            ${isHovered ? "opacity-0" : "opacity-100"}`}
          />
          <img
            src={`../../img/secondary_${product.image}`}
            alt={product.name}
            className={`w-full h-full object-cover rounded-t-xl transition-opacity duration-400 absolute top-0 left-0
            ${isHovered ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{product.brand}</span>
          {renderTypeBadges(product.type)}
        </div>
        <h2 className=" font-semibold max-h-4">{product.name}</h2>
      </CardContent>
      <CardFooter className="flex justify-between p-3 items-center">
        <span className="text-sm text-gray-600">{product.force}</span>
        <div className="w-[100px]">
          {quantity === 0 ? (
            <Button variant="outline" className="w-full" onClick={() => onIncrement(product.id)}>
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
                  <Trash2 className="h-4 w-4" color="#cc0000" />
                ) : (
                  <Minus className="h-4 w-4" strokeWidth={3.5} />
                )}
              </Button>
              <span className="min-w-[1rem] text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onIncrement(product.id)}
                aria-label="Increase quantity"
              >
                <Plus strokeWidth={3.5} className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
