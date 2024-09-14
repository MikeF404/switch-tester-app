import React, { useState } from "react";
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

  const handleAddToCart = async () => {
    if (isOverLimit) {
      toast.error(`Please select exactly ${switchCount} switches.`);
    } else if (totalSelectedSwitches < parseInt(switchCount)) {
      toast.error(
        `Please select ${switchCount} switches. You've only selected ${totalSelectedSwitches}.`
      );
    } else {
      try {
        await addToCart({
          size: parseInt(switchCount),
          keycaps: keycapType,
          switches: Object.entries(selectedSwitches).map(([id, quantity]) => ({
            id: parseInt(id),
            quantity,
          })),
        });
        toast.success("Item added to the Cart", {
          description: `Items in the Cart: ${cartCount}`,
          action: {
            label: "Go to Cart",
            onClick: () => routeChange(),
          },
        });
      } catch (error) {
        toast.error("Failed to add to cart. Please try again.");
      }
    }
  };

  const handleIncrementSwitch = (id: number) => {
    setSelectedSwitches((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrementSwitch = (id: number) => {
    setSelectedSwitches((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Tester Information Panel */}
      <div className="w-full lg:w-1/3 p-4 lg:p-8">
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
                  isOverLimit || totalSelectedSwitches < parseInt(switchCount)
                }
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Scrollable Switch Grid Panel */}
      <div className="w-full p-4 lg: pt-8">
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
