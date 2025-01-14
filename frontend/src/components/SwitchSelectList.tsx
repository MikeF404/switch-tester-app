import { useMemo } from "react";
import ProductCard from "./SwitchCard";
import { Card, CardContent, CardTitle } from "./ui/card";
import { toast } from "sonner";

interface Switch {
  id: number;
  name: string;
  type: string;
  force: string;
  image: string;
  brand: string;
}

interface SwitchSelectListProps {
  switches: Switch[];
  selectedSwitches: number[];
  onToggleSwitch: (id: number) => void;
  switchLimit: number;
  filters: {
    brands: string[];
    types: string[];
    forceRange: [number, number];
  };
}

const SwitchSelectList: React.FC<SwitchSelectListProps> = ({
  switches,
  selectedSwitches,
  onToggleSwitch,
  filters,
  switchLimit,
}) => {
  const filteredSwitches = switches.filter((switch_) => {
    const forceValue = parseInt(switch_.force.match(/\d+/)?.[0] || "0");
    return (
      filters.brands.includes(switch_.brand) &&
      filters.types.some(type => 
        switch_.type.toLowerCase().includes(type.toLowerCase())
      ) &&
      forceValue >= filters.forceRange[0] &&
      forceValue <= filters.forceRange[1]
    );
  });

  return (
    <Card className="flex flex-col w-full overflow-y-hidden">
      <CardTitle
        className={`px-6 pt-6 pb-2 ${
          selectedSwitches.length > switchLimit ? "text-red-500" : ""
        }`}
      >
        Select Switches ({selectedSwitches.length}/{switchLimit})
      </CardTitle>
      <CardContent className="w-full px-2 lg:px-6 pb-6 pt-2 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSwitches.map((switch_) => (
            <ProductCard
              key={switch_.id}
              product={switch_}
              isSelected={selectedSwitches.includes(switch_.id)}
              onToggle={onToggleSwitch}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwitchSelectList;
