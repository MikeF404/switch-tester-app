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
  selectedSwitches: Record<number, number>;
  onIncrementSwitch: (id: number) => void;
  onDecrementSwitch: (id: number) => void;
  totalSelected: number;
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
  onIncrementSwitch,
  onDecrementSwitch,
  totalSelected,
  switchLimit,
  filters,
}) => {
  const filteredSwitches = useMemo(() => {
    return switches.filter(switch_item => {
      // Brand filter - show switch only if its brand is in the selected brands
      if (!filters.brands.includes(switch_item.brand)) {
        return false;
      }

      // Type filter
      const switchTypes = switch_item.type.toLowerCase().split(' ');
      const isAnyTypeUnselected = switchTypes.some(switchType => 
        !filters.types.includes(switchType.toLowerCase())
      );
      if (isAnyTypeUnselected) {
        return false;
      }

      // Force filter
      const force = parseInt(switch_item.force.match(/\d+/)?.[0] || "0");
      if (force < filters.forceRange[0] || force > filters.forceRange[1]) {
        return false;
      }

      return true;
    });
  }, [switches, filters]);

  const sortedSwitches = [...filteredSwitches].sort(
    (a, b) => (selectedSwitches[b.id] || 0) - (selectedSwitches[a.id] || 0)
  );

  return (
    <Card className="flex flex-col w-full overflow-y-hidden">
      <CardTitle
        className={`px-6 pt-6 pb-2 ${
          totalSelected > switchLimit ? "text-red-500" : ""
        }`}
      >
        Select Switches ({totalSelected}/{switchLimit})
      </CardTitle>
      <CardContent className="w-full px-2 lg:px-6 pb-6 pt-2 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedSwitches.map((switch_item) => (
            <ProductCard
              key={switch_item.id}
              product={switch_item}
              quantity={selectedSwitches[switch_item.id] || 0}
              onIncrement={onIncrementSwitch}
              onDecrement={onDecrementSwitch}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwitchSelectList;
