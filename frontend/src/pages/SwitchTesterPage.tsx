import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react"; // Import the Loader2 icon from lucide-react

import SwitchTesterPricing from "@/components/SwitchTesterPricing";
import SwitchSelectList from "@/components/SwitchSelectList";
import { useCart } from "@/components/CartProvider";

type SwitchCount = "10" | "15" | "20";

const SwitchTesterPage: React.FC = () => {
  const [switchCount, setSwitchCount] = useState<SwitchCount>("10");
  const [selectedSwitches, setSelectedSwitches] = useState<
    Record<number, number>
  >({});
  const [keycapType, setKeycapType] = useState<
    "none" | "transparent" | "random"
  >("none");
  const { addToCart, cartCount } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const totalSelectedSwitches = Object.values(selectedSwitches).reduce(
    (a, b) => a + b,
     0
  );
  const isOverLimit = totalSelectedSwitches > parseInt(switchCount);

  let navigate = useNavigate();

  const routeChange = () => {
    let path = `/cart`;
    navigate(path);
  };

  const handleAddToCart = useCallback(async () => {
    if (isOverLimit) {
      toast.error(`Please select exactly ${switchCount} switches.`);
    } else if (totalSelectedSwitches < parseInt(switchCount)) {
      toast.error(
        `Please select ${switchCount} switches. You've only selected ${totalSelectedSwitches}.`
      );
    } else {
      setIsAddingToCart(true);
      try {
        const message: string = await addToCart({
          id: "", // This will be generated on the backend
          name: "Custom Switch Tester",
          size: parseInt(switchCount),
          keycaps: keycapType,
          switches: Object.entries(selectedSwitches).map(([id, quantity]) => ({
            id: parseInt(id),
            quantity,
          })),
          price: 0, // Price will be calculated on the backend
          quantity: 1,
        });
        toast.success(message, {
          duration: 5000,
          action: {
            label: "Go to Cart",
            onClick: () => routeChange(),
          },
        });
      } catch (error) {
        toast.error("Failed to add to cart. Please try again.");
      } finally {
        setTimeout(() => setIsAddingToCart(false), 1000);
      }
    }
  }, [isOverLimit, switchCount, totalSelectedSwitches, addToCart]);

  const handleIncrementSwitch = (id: number) => {
    setSelectedSwitches((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrementSwitch = (id: number) => {
    setSelectedSwitches((prev) => {
      const newQuantity = Math.max(0, (prev[id] || 0) - 1);
      if (newQuantity === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQuantity };
    });
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Tester Information Panel */}
      <div className="w-full lg:w-1/3 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tester Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SwitchTesterPricing
              switchCount={switchCount}
              setSwitchCount={setSwitchCount}
            />
            <div className="flex justify-between gap-2">
              <Button
                className="w-full"
                disabled={
                  isOverLimit || totalSelectedSwitches < parseInt(switchCount)
                }
              >
                Buy Now
              </Button>
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  isOverLimit ||
                  totalSelectedSwitches < parseInt(switchCount)
                }
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Scrollable Switch Grid Panel */}
      <div className="w-full p-4 lg: pt-6">
        <SwitchSelectList
          selectedSwitches={selectedSwitches}
          onIncrementSwitch={handleIncrementSwitch}
          onDecrementSwitch={handleDecrementSwitch}
          totalSelected={totalSelectedSwitches}
          switchLimit={parseInt(switchCount)}
        />
      </div>
    </div>
  );
};

export default SwitchTesterPage;
