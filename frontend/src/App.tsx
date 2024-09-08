import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import Header from "./components/Header";
import { Toaster } from "sonner";

export const description =
  "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";

export function App() {
  return (
    <div className="flex justify-center">
      <div className="flex min-h-screen max-w-[1480px] w-full flex-col">
        <Header />
        <Outlet />
        <Toaster richColors/>
      </div>
    </div>
  );
}
export default App;