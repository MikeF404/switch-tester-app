import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Keyboard } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Star } from "lucide-react";
import FeaturedItemCard from "@/components/FeaturedItemCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Home: React.FC = () => {
  const items = [
    {
      title: "Make Your Own",
      description: "For the enthusiasts and DIYers",
      price: "Starting at $9.99",
      image: "../../../img/item_tester.jpg",
      link: "/shop/custom-switch-tester",
    },
    {
      title: "Ergonomic Layout Tester",
      description: "Most popular choice",
      price: "$5.99",
      image: "../../../img/layout_tester.jpg",
      link: "/shop/layout-tester",
    },
    {
      title: "Guilty Pleasure",
      description: "Who are we to judge?",
      price: "$29.99",
      image: "/images/16-switch-tester.png",
      link: "/shop/mega-switch-tester",
    },
  ];

  return (
    <div className="">
      <section className="pt-6">
        <div className="container mx-auto px-4 text-left">
          <h1 className="text-5xl font-bold mb-4 text-left">
            Find Your Perfect Keyboard
          </h1>
          <p className="text-xl text-left">
            We help you discover your ideal switches and ergonomic layout
            through hands-on testing. No more blind purchases and expensive
            mistakes. Pick from our themed testers or build your own.
          </p>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg border w-full ml-auto border-orange-200 lg:w-3/5 md:w-3/4">
            <h2 className="text-xl font-semibold mb-2 text-left">
              🎁 Looking for a Tech Gift?
            </h2>
            <p className="mb-3 text-left">
              You know someone who spends too much time with the computer? Our
              friendly guide will help you navigate the choices -
              <b>no technical knowledge required!</b>
            </p>
            <Button variant="secondary" size="lg" asChild className="ml-auto">
              <Link to="/friendly-guide">Friendly Gift Guide →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pt-12">
        <h2 className="text-3xl font-bold text-left px-8">Switch Testers</h2>
        <div className="container px-8 mx-auto">
          <Carousel
            opts={{
              align: "center",
            }}
            className="mt-4"
          >
            <CarouselContent className="px-4">
              {items.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="lg:basis-1/3 md:basis-1/2 basis-full"
                >
                  <FeaturedItemCard
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    image={product.image}
                    link={product.link}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="" />
            <CarouselNext className="" />
          </Carousel>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-left ">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Switch?
          </h2>
          <div className="relative">
            <p className="text-xl mb-8 w-9/12">
              Start your mechanical keyboard journey with our custom switch
              testers.
            </p>
            <Button size="lg" asChild>
              <Link to="/shop">Explore Switch Testers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
