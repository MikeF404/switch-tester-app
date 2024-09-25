import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturedItemCardProps {
  image: string;
  backgroundColor: string;
  title: string;
  description: string;
  link: string;
  price: string;
}

const FeaturedItemCard: React.FC<FeaturedItemCardProps> = ({
  image,
  backgroundColor,
  title,
  description,
  link,
  price,
}) => {
  return (
    <Link to={link}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ backgroundColor }}>
        <CardContent className="p-0">
          <div className="p-6">
            <p className="text-lg mb-4">{description}</p>
          </div>
          <div className="overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover object-center transition-transform duration-300 transform scale-110 hover:scale-100"
            />
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">{title}</h3>
            <p className="text-lg font-bold">{price}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FeaturedItemCard;

