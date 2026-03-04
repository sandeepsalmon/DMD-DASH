import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { ConversationalAgentsPage } from "./components/ConversationalAgentsPage";
import { EmailAgentPage } from "./components/EmailAgentPage";
import { DemandDashboardPage } from "./components/DemandDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DemandDashboardPage },
      { path: "old-dashboard", Component: DashboardPage },
      { path: "conversational-agents", Component: ConversationalAgentsPage },
      { path: "email-agent", Component: EmailAgentPage },
    ],
  },
]);
