import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { ProfessorDashboard } from "./pages/ProfessorDashboard";
import { CreateReport } from "./pages/CreateReport";
import { ViewReport } from "./pages/ViewReport";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { ParentConfirmation } from "./pages/ParentConfirmation";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/professor",
    Component: ProfessorDashboard,
  },
  {
    path: "/coordinator",
    Component: CoordinatorDashboard,
  },
  {
    path: "/report/create/:studentId?",
    Component: CreateReport,
  },
  {
    path: "/report/view/:reportId",
    Component: ViewReport,
  },
  {
    path: "/confirm/:reportId",
    Component: ParentConfirmation,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
