import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/providers/CartProvider";
import StripeCheckout from "@/components/StripeCheckout";

export default function CheckoutPage() {
  const [zipCode, setZipCode] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [agreedToTOS, setAgreedToTOS] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
    setFormData((prev) => ({ ...prev, zipCode: e.target.value }));
    if (e.target.value.length === 5) {
      // Simulating API call to update shipping cost
      setTimeout(() => {
        setShippingCost(10.99);
      }, 500);
    }
  };

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(
          "http://10.0.0.216:5001/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token") || "",
            },
            body: JSON.stringify({
              cart_data: cartItems,
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              address: formData.address,
              city: formData.city,
              zipcode: formData.zipCode,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    if (
      agreedToTOS &&
      formData.email &&
      formData.firstName &&
      formData.lastName &&
      formData.address &&
      formData.city &&
      formData.zipCode
    ) {
      createPaymentIntent();
    }
  }, [agreedToTOS, formData, cartItems]);

  const subtotal = cartItems.reduce(
    (total: number, item) => total + item.price * item.quantity,
    0
  );
  const estimatedTax = subtotal * 0.1; // Assuming 10% tax rate
  const total = subtotal + shippingCost + estimatedTax;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email (required)</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Shipping Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="apartment">
                    Apartment, suite, etc. (optional)
                  </Label>
                  <Input
                    id="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={handleZipCodeChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Payment Information
              </h2>
              {clientSecret && <StripeCheckout clientSecret={clientSecret} />}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 lg:mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Delivery</span>
                  <span>
                    {zipCode.length === 5
                      ? `$${shippingCost.toFixed(2)}`
                      : "Enter address to calculate"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div>
                  <Label htmlFor="promoCode">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input id="promoCode" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Order Details</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Free shipping on orders over $50</li>
                <li>30-day return policy</li>
                <li>Secure checkout process</li>
              </ul>
              <Link to="/terms" className="text-blue-600 hover:underline">
                View full Terms of Service
              </Link>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTOS}
                onCheckedChange={(checked: boolean) => setAgreedToTOS(checked)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms of service
              </label>
            </div>
            <Button className="w-full" disabled={!agreedToTOS || !clientSecret}>
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
