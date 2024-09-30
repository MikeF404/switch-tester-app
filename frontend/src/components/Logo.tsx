import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/providers/ThemeProvider";

const colorOptions = ["#FAEDCB", "#C9E4DE", "#C6DEF1", "#DBCDF0", "#F2C6DE", "#F7D9C4"];

const Logo: React.FC = () => {
  const { theme } = useTheme();
  const [color, setColor] = useState(colorOptions[0]);

  const changeColor = useCallback(() => {
    const currentIndex = colorOptions.indexOf(color);
    const nextIndex = (currentIndex + 1) % colorOptions.length;
    setColor(colorOptions[nextIndex]);
  }, [color]);

  useEffect(() => {
    const intervalId = setInterval(changeColor, 20000); 
    return () => clearInterval(intervalId);
  }, [changeColor]);

  const handleHover = () => {
    changeColor();
  };

  return (
    <div className="flex items-center gap-1">
      <div onMouseEnter={handleHover}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 22 22"
          shapeRendering="crispEdges"
          className="w-8 h-8 transition-all duration-300"
          fill="none"
          stroke={theme === "dark" ? "white" : "black"}
        >
          <path d="M0 0h8M14 0h8M0 1h22M0 2h2M20 2h2M0 3h2M20 3h2M0 4h2M20 4h2M1 5h1M20 5h1M1 6h1M4 6h4M14 6h4M20 6h1M4 7h1M17 7h1M4 8h1M10 8h2M17 8h1M4 9h1M10 9h2M17 9h1M4 10h1M8 10h6M17 10h1M4 11h1M8 11h6M17 11h1M4 12h1M10 12h2M17 12h1M4 13h1M10 13h2M17 13h1M4 14h1M17 14h1M1 15h1M4 15h4M14 15h4M20 15h1M1 16h1M20 16h1M0 17h2M20 17h2M0 18h2M20 18h2M0 19h2M20 19h2M0 20h22M0 21h8M14 21h8" />
          <path
            stroke={color}
            d="M5 7h12M5 8h5M12 8h5M5 9h5M12 9h5M5 10h3M14 10h3M5 11h3M14 11h3M5 12h5M12 12h5M5 13h5M12 13h5M5 14h12"
          />
        </svg>
      </div>
      <span
        className={`text-lg font-semibold transition-all duration-300`}
      >
        KBLab.shop
      </span>
    </div>
  );
};

export default Logo;
