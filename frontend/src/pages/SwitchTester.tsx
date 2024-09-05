import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { log } from "console";
import SwitchTesterPricing from "@/components/SwitchTesterPricing";
interface Switch {
  id: number;
  name: string;
  image: string;
}

const switches: Switch[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Switch ${i + 1}`,
  image: `https://placeholder.com/150`,
}));

const SwitchTester: React.FC = () => {
  let navigate = useNavigate();
  toast("event");
  const routeChange = () => {
    let path = `/cart`;
    console.log(2);
    navigate(path);
  };

  const handleAddToCart = () => {
    console.log(1);
    toast("Item added to the Cart", {
      description: "Currently there are # items in the Cart",
      action: {
        label: "Go to Cart",
        onClick: () => routeChange(),
      },
    });
    //TODO: Add logic here to actually add the item to the cart
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Tester Information Panel */}
      <div className="w-full lg:w-1/3 p-4 lg:p-8 bg-gray-100">
        <Card>
          <CardHeader>
            <CardTitle>Tester Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SwitchTesterPricing />
            <div className="flex justify-between gap-2">
              <Button className="w-full">Buy Now</Button>{" "}
              <Button className="w-full" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrollable Switch Grid Panel */}
      <div className="w-full lg:w-2/3 p-4 lg:p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Available Switches</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {switches.map((switchItem) => (
            <Card
              key={switchItem.id}
              className="flex flex-col items-center p-4"
            >
              <img
                src={switchItem.image}
                alt={switchItem.name}
                className="w-24 h-24 object-cover mb-2"
              />
              <p className="text-center">{switchItem.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwitchTester;
