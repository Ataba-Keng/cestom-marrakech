import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import Board from "./pages/Board";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/galerie" component={Gallery} />
      <Route path="/actualites" component={News} />
      <Route path="/actualites/:id" component={NewsDetail} />
      <Route path="/bureau-executif" component={Board} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/galerie" component={Admin} />
      <Route path="/admin/actualites" component={Admin} />
      <Route path="/admin/bureau" component={Admin} />
      <Route path="/admin/administrateurs" component={AdminUsers} />
      <Route path="/404" component={NotFound} />
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
