import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

import Home from "@/pages/home";
import Product from "@/pages/product";
import Pricing from "@/pages/pricing";
import Solutions from "@/pages/solutions";
import Plugins from "@/pages/plugins";
import CaseStudies from "@/pages/case-studies";
import Compare from "@/pages/compare";
import About from "@/pages/about";
import BookDemo from "@/pages/book-demo";
import Contact from "@/pages/contact";
import Docs from "@/pages/docs";
import Dashboard from "@/pages/dashboard";
import AccountSettings from "@/pages/account";
import AdminIndex from "@/pages/admin/index";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminInventory from "@/pages/admin/inventory";
import AdminPromoCodes from "@/pages/admin/promo-codes";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminMarketing from "@/pages/admin/marketing";
import AdminNotifications from "@/pages/admin/notifications";
import AdminBills from "@/pages/admin/bills";
import AdminMessages from "@/pages/admin/messages";
import AdminProfile from "@/pages/admin/profile";
import Billing from "@/pages/billing";
import BillingCallback from "@/pages/billing-callback";
import AdminUsers from "@/pages/admin-users";
import Checkout from "@/pages/checkout";

const queryClient = new QueryClient();

const FULLSCREEN_ROUTES = ["/dashboard", "/admin", "/billing", "/checkout"];

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => location === r || location.startsWith(r + "/")
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14]">
      <ScrollToTop />
      {!isFullscreen && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isFullscreen && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/compare" component={Compare} />
      <Route path="/about" component={About} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/contact" component={Contact} />
      <Route path="/docs" component={Docs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/account" component={AccountSettings} />
      <Route path="/admin" component={AdminIndex} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/promo-codes" component={AdminPromoCodes} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/marketing" component={AdminMarketing} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/bills" component={AdminBills} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/store-users" component={AdminUsers} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/billing" component={Billing} />
      <Route path="/billing/callback" component={BillingCallback} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <AuthProvider>
            <AppShell>
              <Router />
            </AppShell>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
