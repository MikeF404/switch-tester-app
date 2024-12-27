import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Mail, Speech, Twitter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const MESSAGE_MAX_LENGTH = 800;

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="h-min">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div
                className={`space-y-4 transition-all duration-500 ease-in-out ${
                  isAnonymous
                    ? "opacity-0 h-0 overflow-hidden"
                    : "opacity-100 h-auto"
                }`}
              >
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Mike" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Message subject" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message here..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
                  maxLength={MESSAGE_MAX_LENGTH}
                />
                {MESSAGE_MAX_LENGTH - message.length <= 100 ? (
                  <div className="text-sm text-right text-orange-500">
                    {MESSAGE_MAX_LENGTH - message.length} characters remaining
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={() => setIsAnonymous(!isAnonymous)}
                />
                <Label htmlFor="anonymous">
                  Send anonymously. It will be impossible to receive a response.
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>We'd love to hear from you!</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Name a switch or product you'd like to see</li>
                <li>Manage your order</li>
                <li>
                  Ask a question about our products (check out our{" "}
                  <Link className="underline" to="/faq">
                    FAQ
                  </Link>
                  )
                </li>
                <li>Discuss a specific product</li>
                <li>Report an issue with the website</li>
                <li>Suggest an improvement</li>
                <li>Provide feedback on your experience</li>
                <li>Inquire about partnerships or collaborations</li>
                <li>Or just say hi!</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Speech className="h-5 w-5" />
                <span>Mike</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>contact@example.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Facebook className="h-5 w-5" />
                <span>ExampleCompany</span>
              </div>
              <div className="flex items-center space-x-2">
                <Twitter className="h-5 w-5" />
                <span>@ExampleCompany</span>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-5 w-5" />
                <span>@example_company</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
