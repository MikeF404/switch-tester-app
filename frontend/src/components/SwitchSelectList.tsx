import { useState } from "react";
import ProductCard from "./SwitchCard";
import { Card, CardContent, CardTitle } from "./ui/card";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
}
const products: Product[] = [
  {
    id: 1,
    name: "C3 EQUALZ X TKC Kiwi",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 2,
    name: "C3 EQUALZ X TKC Tangerine",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 3,
    name: "Headphones",
    description: "Noise-cancelling wireless headphones",
    image: "https://placeholder.com/150",
  },
  {
    id: 4,
    name: "Smartwatch",
    description: "Track your fitness and stay connected",
    image: "https://placeholder.com/150",
  },
  {
    id: 5,
    name: "Camera",
    description: "Capture your memories in high resolution",
    image: "https://placeholder.com/150",
  },
  {
    id: 6,
    name: "Tablet",
    description: "Portable device for work and entertainment",
    image: "https://placeholder.com/150",
  },
  {
    id: 7,
    name: "C3 EQUALZ X TKC Kiwi",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 8,
    name: "C3 EQUALZ X TKC Tangerine",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 9,
    name: "Headphones",
    description: "Noise-cancelling wireless headphones",
    image: "https://placeholder.com/150",
  },
  {
    id: 10,
    name: "Smartwatch",
    description: "Track your fitness and stay connected",
    image: "https://placeholder.com/150",
  },
  {
    id: 11,
    name: "Camera",
    description: "Capture your memories in high resolution",
    image: "https://placeholder.com/150",
  },
  {
    id: 12,
    name: "Tablet",
    description: "Portable device for work and entertainment",
    image: "https://placeholder.com/150",
  },
  {
    id: 13,
    name: "C3 EQUALZ X TKC Kiwi",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 14,
    name: "C3 EQUALZ X TKC Tangerine",
    description: "Tactile 67g",
    image: "https://placeholder.com/150",
  },
  {
    id: 15,
    name: "Headphones",
    description: "Noise-cancelling wireless headphones",
    image: "https://placeholder.com/150",
  },
  {
    id: 16,
    name: "Smartwatch",
    description: "Track your fitness and stay connected",
    image: "https://placeholder.com/150",
  },
  {
    id: 17,
    name: "Camera",
    description: "Capture your memories in high resolution",
    image: "https://placeholder.com/150",
  },
  {
    id: 18,
    name: "Tablet",
    description: "Portable device for work and entertainment",
    image: "https://placeholder.com/150",
  },
];

const SwitchSelectList: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(products.map((p) => [p.id, 0]))
  );

  const incrementQuantity = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decrementQuantity = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const sortedProducts = [...products].sort(
    (a, b) => quantities[b.id] - quantities[a.id]
  );

  return (
    <Card className="flex flex-col w-full overflow-y-hidden">
      <CardTitle className="px-6 pt-6 pb-2">Available Switches</CardTitle>
      <CardContent className="w-full lg:px-6 pb-6 pt-2 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id]}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwitchSelectList;
