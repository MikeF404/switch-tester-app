import { useEffect, useState } from "react";
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
  selectedSwitches: Record<number, number>;
  onIncrementSwitch: (id: number) => void;
  onDecrementSwitch: (id: number) => void;
  totalSelected: number;
  switchLimit: number;
}

const SwitchSelectList: React.FC<SwitchSelectListProps> = ({ 
  selectedSwitches, 
  onIncrementSwitch, 
  onDecrementSwitch,
  totalSelected,
  switchLimit
}) => {
  const [switches, setSwitches] = useState<Switch[]>([]);


    useEffect(() => {
    const fetchSwitches = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/switches", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok){
          throw new Error('HTTP error when loading switches '+ response.status);
        }
        const data = await response.json();
        setSwitches(data);
      } catch (error) {
        toast.error("Error when loading available switches :(");
        console.error('Error fetching switches:', error);
      }
    };

    fetchSwitches();
  }, []);
    const sortedSwitches = [...switches].sort(
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
      <CardContent className="w-full lg:px-6 pb-6 pt-2 overflow-y-auto">
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
