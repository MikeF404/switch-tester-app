import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Keyboard } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Star } from "lucide-react";
import FeaturedItemCard from "@/components/FeaturedItemCard";

const Home: React.FC = () => {
  return (
    <div>
      <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Custom Mechanical Switch Testers</h1>
            <p className="text-xl mb-8">Experience the perfect click before you commit</p>
            <Button size="lg" asChild>
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Custom Switch Tester",
                  description: "Perfect for beginners",
                  price: "Starting at $9.99",
                  image: "../../../img/tester_nobg_nokeycaps.png",
                  link: "/shop/custom-switch-tester",
                },
                {
                  title: "Ergonomic Layout Tester",
                  description: "Most popular choice",
                  price: "$5.99",
                  image: "/images/9-switch-tester.png",
                  link: "/shop/layout-tester",
                },
                {
                  title: "Mega Switch Tester",
                  description: "For the enthusiasts",
                  price: "$29.99",
                  image: "/images/16-switch-tester.png",
                  link: "/shop/mega-switch-tester",
                },
              ].map((product, index) => (
                <FeaturedItemCard
                  key={index}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  image={product.image}
                  link={product.link}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Find Your Perfect Switch?</h2>
            <p className="text-xl mb-8">Start your mechanical keyboard journey with our custom switch testers.</p>
            <Button size="lg" asChild>
              <Link to="/shop">Explore Switch Testers</Link>
            </Button>
          </div>
      </section>
    </div>
  );
};

export default Home;
