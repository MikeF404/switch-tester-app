import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturedItemCardProps {
  image: string;
  title: string;
  description: string;
  link: string;
  price: string;
}

const FeaturedItemCard: React.FC<FeaturedItemCardProps> = ({
  image,
  title,
  description,
  link,
  price,
}) => {
  return (
    <Link to={link}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-hidden aspect-[5/4] bg-gray-50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-contain transition-transform duration-300 transform hover:scale-110"
            />
          </div>
          <div className="px-4 py-2 space-y-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="">{description}</p>
            <p className="font-bold">{price}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FeaturedItemCard;

