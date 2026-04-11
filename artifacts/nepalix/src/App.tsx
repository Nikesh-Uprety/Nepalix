import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070B14]">
      <Navbar />
      <main className="flex-1">
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
