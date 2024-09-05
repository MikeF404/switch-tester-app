import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type SwitchCount = "10" | "15" | "20";
type KeycapType = "none" | "random" | "transparent";

const SwitchTesterPricing: React.FC = () => {
  const [switchCount, setSwitchCount] = useState<SwitchCount>("10");
  const [keycapType, setKeycapType] = useState<KeycapType>("none");
  const [totalPrice, setTotalPrice] = useState<number>(9.99);

  const switchPrices: Record<SwitchCount, number> = {
    "10": 9.99,
    "15": 13.99,
    "20": 17.99,
  };

  const keycapPrices: Record<KeycapType, number> = {
    none: 0,
    random: 0.1,
    transparent: 0.2,
  };

  useEffect(() => {
    const baseSwitchPrice = switchPrices[switchCount];
    const keycapPrice = keycapPrices[keycapType] * parseInt(switchCount);
    const newTotalPrice = baseSwitchPrice + keycapPrice;
    setTotalPrice(Number(newTotalPrice.toFixed(2)));
  }, [switchCount, keycapType]);

  return (
    <div>
      <p>Number of Switches:</p>
      <ToggleGroup
        className="justify-start"
        type="single"
        value={switchCount}
        onValueChange={(value) => {
          if (value) setSwitchCount(value as SwitchCount);
        }}
      >
        <ToggleGroupItem value="10">10</ToggleGroupItem>
        <ToggleGroupItem value="15">15</ToggleGroupItem>
        <ToggleGroupItem value="20" disabled>
          20
        </ToggleGroupItem>
      </ToggleGroup>

      <p>Select Keycaps:</p>
      <ToggleGroup
        className="justify-start"
        type="single"
        value={keycapType}
        onValueChange={(value) => {
          if (value) setKeycapType(value as KeycapType);
        }}
      >
        <ToggleGroupItem value="none">none</ToggleGroupItem>
        <ToggleGroupItem value="random">random</ToggleGroupItem>
        <ToggleGroupItem value="transparent">transparent</ToggleGroupItem>
      </ToggleGroup>

      <p className="py-2 text-xl font-bold">
        Total Price: ${totalPrice.toFixed(2)}
      </p>
    </div>
  );
};

export default SwitchTesterPricing;
