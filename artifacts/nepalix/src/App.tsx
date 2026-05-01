import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";

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
import StorePreviewPage from "@/pages/store-preview";
import AccountSettings from "@/pages/account";
import AdminIndex from "@/pages/admin/index";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import ProductEditPage from "@/pages/admin/products/ProductEditPage";
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
import AdminPosPage from "@/pages/admin/pos";
import AdminLogsPage from "@/pages/admin/logs";
import AdminImagesPage from "@/pages/admin/images";
import AdminBucketsPage from "@/pages/admin/buckets";
import AdminStorefrontImagesPage from "@/pages/admin/storefront-images";
import AdminLandingPage from "@/pages/admin/landing-page";
import AdminPageEditor from "@/pages/admin/page-editor";
import AdminCanvasPage from "@/pages/admin/canvas";
import AdminOrdersNewPage from "@/pages/admin/orders-new";
import AdminProductsLayoutPage from "@/pages/admin/products-layout";
import AdminPlatformPage from "@/pages/admin/platform";
import AdminPlatformAnalyticsPage from "@/pages/admin/platform-analytics";
import AdminPlatformSubscriptionsPage from "@/pages/admin/platform-subscriptions";
import AdminPlatformFeatureFlagsPage from "@/pages/admin/platform-feature-flags";
import AdminPlatformSupportPage from "@/pages/admin/platform-support";
import Billing from "@/pages/billing";
import BillingCallback from "@/pages/billing-callback";
import AdminUsers from "@/pages/admin-users";
import Checkout from "@/pages/checkout";
import OnboardingPage from "@/pages/onboarding";

const queryClient = new QueryClient();

const FULLSCREEN_ROUTES = ["/dashboard", "/admin", "/billing", "/checkout", "/store", "/onboarding"];

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, stopImpersonation } = useAuth();
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => location === r || location.startsWith(r + "/")
  );
  const impersonation = user?.impersonation;

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14]">
      <ScrollToTop />
      {impersonation?.active && (
        <div className="sticky top-0 z-[120] border-b border-amber-300/30 bg-amber-100 text-amber-900 px-4 py-2 text-sm">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <span className="font-medium">
              Impersonating store admin session. Expires at{" "}
              {new Date(impersonation.expiresAt).toLocaleTimeString()}.
            </span>
            <button
              type="button"
              onClick={() => void stopImpersonation()}
              className="rounded-md bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-950 transition-colors"
            >
              Return to platform
            </button>
          </div>
        </div>
      )}
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
      <Route path="/store/:slug" component={StorePreviewPage} />
      <Route path="/store/:slug/:pageSlug" component={StorePreviewPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/account" component={AccountSettings} />
      <Route path="/admin" component={AdminIndex} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={ProductEditPage} />
      <Route path="/admin/products/:id/edit" component={ProductEditPage} />
      <Route path="/admin/products/layout" component={AdminProductsLayoutPage} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/new" component={AdminOrdersNewPage} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/inventory/light" component={AdminInventory} />
      <Route path="/admin/inventory/platinum" component={AdminInventory} />
      <Route path="/admin/promo-codes" component={AdminPromoCodes} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/marketing" component={AdminMarketing} />
      <Route path="/admin/logs" component={AdminLogsPage} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/bills" component={AdminBills} />
      <Route path="/admin/pos" component={AdminPosPage} />
      <Route path="/admin/images" component={AdminImagesPage} />
      <Route path="/admin/buckets" component={AdminBucketsPage} />
      <Route path="/admin/storefront-images" component={AdminStorefrontImagesPage} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/platform" component={AdminPlatformPage} />
      <Route path="/admin/platform/analytics" component={AdminPlatformAnalyticsPage} />
      <Route path="/admin/platform/subscriptions" component={AdminPlatformSubscriptionsPage} />
      <Route path="/admin/platform/flags" component={AdminPlatformFeatureFlagsPage} />
      <Route path="/admin/platform/support" component={AdminPlatformSupportPage} />
      <Route path="/admin/landing-page" component={AdminLandingPage} />
      <Route path="/admin/page-editor/:id" component={AdminPageEditor} />
      <Route path="/admin/canvas" component={AdminCanvasPage} />
      <Route path="/admin/canvas/legacy" component={AdminCanvasPage} />
      <Route path="/admin/canvas/builder" component={AdminCanvasPage} />
      <Route path="/admin/canvas/branding" component={AdminCanvasPage} />
      <Route path="/admin/canvas/theme" component={AdminCanvasPage} />
      <Route path="/admin/dev-font" component={AdminProfile} />
      <Route path="/admin/store-users" component={AdminUsers} />
      <Route path="/admin/store-users/:id" component={AdminUsers} />
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
