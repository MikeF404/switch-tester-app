import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Contact from "./pages/ContactPage";
import SwitchTester from "./pages/SwitchTesterPage";
import Cart from "./pages/Cart";
import "./index.css";
import TOSPage from "./pages/TOSPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { RootProvider } from "./providers/RootProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import CheckoutPage from "./pages/CheckoutPage";
import FAQPage from "./pages/FAQPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <RootProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="contact" element={<Contact />} />
              <Route path="shop/switch-tester" element={<SwitchTester />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="tos" element={<TOSPage />} />
              <Route path="faq" element={<FAQPage />} />
            </Route>
          </Routes>
        </RootProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
