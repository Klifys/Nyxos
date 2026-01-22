import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Wallet from "@/pages/Wallet";
import Orders from "@/pages/Orders";
import ProductDetail from "@/pages/ProductDetail";
import PaymentSlip from "@/pages/PaymentSlip";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import OrderDetail from "@/pages/OrderDetail";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/shop/:id"} component={ProductDetail} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/payment-slip"} component={PaymentSlip} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/orders/:id"} component={OrderDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
