import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIWizard from "@/pages/ai-wizard";
import Backtesting from "@/pages/backtesting";
import DataManager from "@/pages/data-manager";
import StrategyEditor from "@/pages/strategy-editor";
import BotControl from "@/pages/bot-control";
import Alerts from "@/pages/alerts";
import Layout from "@/components/layout/layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/ai-wizard" component={AIWizard} />
        <Route path="/backtesting" component={Backtesting} />
        <Route path="/data-manager" component={DataManager} />
        <Route path="/strategy-editor" component={StrategyEditor} />
        <Route path="/bot-control" component={BotControl} />
        <Route path="/alerts" component={Alerts} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
