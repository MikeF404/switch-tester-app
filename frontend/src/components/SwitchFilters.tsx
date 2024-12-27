import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface Switch {
  brand: string;
  type: string;
  force: string;
}

interface SwitchFiltersProps {
  switches: Switch[];
  onFiltersChange: (filters: {
    brands: string[];
    types: string[];
    forceRange: [number, number];
  }) => void;
}

const SwitchFilters: React.FC<SwitchFiltersProps> = ({
  switches,
  onFiltersChange,
}) => {
  // Get unique brands
  const uniqueBrands = Array.from(new Set(switches.map((s) => s.brand)));

  // Predefined switch types
  const switchTypes = ["tactile", "linear", "silent", "clicky"];

  // Get force range with safe defaults
  const getForceValue = (force: string) =>
    parseInt(force.match(/\d+/)?.[0] || "0");
  const forceValues = switches.map((s) => getForceValue(s.force));
  const minForce = switches.length > 0
    ? Math.floor(Math.min(...forceValues) / 5) * 5
    : 45; // default min
  const maxForce = switches.length > 0
    ? Math.ceil(Math.max(...forceValues) / 5) * 5
    : 70; // default max

  // State for filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>(uniqueBrands);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(switchTypes);
  const [forceRange, setForceRange] = useState<[number, number]>([minForce, maxForce]);

  const areAllBrandsSelected = selectedBrands.length === uniqueBrands.length;
  const areAllTypesSelected = selectedTypes.length === switchTypes.length;

  const handleSelectAllBrands = (checked: boolean) => {
    setSelectedBrands(checked ? uniqueBrands : []);
  };

  const handleSelectAllTypes = (checked: boolean) => {
    setSelectedTypes(checked ? switchTypes : []);
  };

  // Update force range when switches load
  useEffect(() => {
    if (switches.length > 0) {
      const forceValues = switches.map((s) => getForceValue(s.force));
      const newMinForce = Math.floor(Math.min(...forceValues) / 5) * 5;
      const newMaxForce = Math.ceil(Math.max(...forceValues) / 5) * 5;
      setForceRange([newMinForce, newMaxForce]);
    }
  }, [switches]);

  // Update brands when switches change
  useEffect(() => {
    setSelectedBrands(uniqueBrands);
  }, [switches]);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange({
      brands: selectedBrands,
      types: selectedTypes,
      forceRange: forceRange,
    });
  }, [selectedBrands, selectedTypes, forceRange, onFiltersChange]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand filters */}
        <div className="space-y-2">
          <h3 className="font-medium">Brands</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Select All Brands */}
            <div className="col-span-2 ">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-brands"
                  checked={areAllBrandsSelected}
                  onCheckedChange={handleSelectAllBrands}
                />
                <Label htmlFor="select-all-brands" className="font-medium">Select All</Label>
              </div>
            </div>
            {/* Individual brand checkboxes */}
            {uniqueBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => {
                    setSelectedBrands((prev) =>
                      checked
                        ? [...prev, brand]
                        : prev.filter((b) => b !== brand)
                    );
                  }}
                />
                <Label htmlFor={`brand-${brand}`}>{brand}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Type filters */}
        <div className="space-y-2">
          <h3 className="font-medium">Types</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Select All Types */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-types"
                  checked={areAllTypesSelected}
                  onCheckedChange={handleSelectAllTypes}
                />
                <Label htmlFor="select-all-types" className="font-medium">Select All</Label>
              </div>
            </div>
            {/* Individual type checkboxes */}
            {switchTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setSelectedTypes((prev) =>
                      checked
                        ? [...prev, type]
                        : prev.filter((t) => t !== type)
                    );
                  }}
                />
                <Label htmlFor={`type-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Updated Force range slider */}
        <div className="space-y-2">
          <h3 className="font-medium">Force Range</h3>
          <Slider
            min={minForce}
            max={maxForce}
            step={5}
            value={forceRange}
            onValueChange={(value) => setForceRange(value as [number, number])}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{forceRange[0]}g</span>
            <span>{forceRange[1]}g</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwitchFilters;
