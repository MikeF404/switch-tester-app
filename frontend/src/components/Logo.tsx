import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/providers/ThemeProvider";

const lightInnerColors = ["#FAEDCB", "#C9E4DE", "#C6DEF1", "#DBCDF0", "#F2C6DE", "#F7D9C4"];
const lightSquareColors = ["#FFE5E5", "#E5FFE5", "#E5E5FF", "#FFE5FF", "#FFFFE5", "#E5FFFF"];

const darkInnerColors = ["#2C3E50", "#34495E", "#2E4053", "#283747", "#212F3C", "#1B2631"];
const darkSquareColors = ["#1E272E", "#2C3A47", "#2F3640", "#353B48", "#2C3E50", "#273C75"];

const Logo: React.FC = () => {
  const { theme } = useTheme();
  const [innerColor, setInnerColor] = useState(lightInnerColors[0]);
  const [squareColor, setSquareColor] = useState(lightSquareColors[0]);

  const changeColors = useCallback(() => {
    const innerColors = theme === "dark" ? darkInnerColors : lightInnerColors;
    const squareColors = theme === "dark" ? darkSquareColors : lightSquareColors;

    // Sequential change for inner keyboard details
    const currentInnerIndex = innerColors.indexOf(innerColor);
    const nextInnerIndex = (currentInnerIndex + 1) % innerColors.length;
    setInnerColor(innerColors[nextInnerIndex]);

    // Random change for background square
    const randomIndex = Math.floor(Math.random() * squareColors.length);
    setSquareColor(squareColors[randomIndex]);
  }, [innerColor, theme]);

  // Reset colors when theme changes
  useEffect(() => {
    const innerColors = theme === "dark" ? darkInnerColors : lightInnerColors;
    const squareColors = theme === "dark" ? darkSquareColors : lightSquareColors;
    setInnerColor(innerColors[0]);
    setSquareColor(squareColors[0]);
  }, [theme]);

  useEffect(() => {
    const intervalId = setInterval(changeColors, 1000); 
    return () => clearInterval(intervalId);
  }, [changeColors]);

  return (
    <div className="flex items-center gap-1">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 22 22"
          shapeRendering="crispEdges"
          className="w-8 h-8 transition-all duration-300"
          fill="none"
          stroke={theme === "dark" ? "rgb(153, 153, 153)" : "rgb(50, 50, 50)"}
        >
          <rect x="2" y="2" width="18" height="18" fill={squareColor} />
          <path d="M0 0h8M14 0h8M0 1h22M0 2h2M20 2h2M0 3h2M20 3h2M0 4h2M20 4h2M1 5h1M20 5h1M1 6h1M4 6h4M14 6h4M20 6h1M4 7h1M17 7h1M4 8h1M10 8h2M17 8h1M4 9h1M10 9h2M17 9h1M4 10h1M8 10h6M17 10h1M4 11h1M8 11h6M17 11h1M4 12h1M10 12h2M17 12h1M4 13h1M10 13h2M17 13h1M4 14h1M17 14h1M1 15h1M4 15h4M14 15h4M20 15h1M1 16h1M20 16h1M0 17h2M20 17h2M0 18h2M20 18h2M0 19h2M20 19h2M0 20h22M0 21h8M14 21h8" />
          <path
            stroke={innerColor}
            d="M5 7h12M5 8h5M12 8h5M5 9h5M12 9h5M5 10h3M14 10h3M5 11h3M14 11h3M5 12h5M12 12h5M5 13h5M12 13h5M5 14h12"
          />
        </svg>
      </div>
      <span className={`text-lg font-semibold transition-all duration-300`}>
        KBLab.shop
      </span>
    </div>
  );
};

export default Logo;
