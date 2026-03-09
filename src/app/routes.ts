import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import { ProfessorDashboard } from "./pages/ProfessorDashboard";
import { CreateReport } from "./pages/CreateReport";
import { ViewReport } from "./pages/ViewReport";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { ParentConfirmation } from "./pages/ParentConfirmation";
import { NotFound } from "./pages/NotFound";
import GerenciarProfessores from "./pages/GerenciarProfessores";
import GerenciarHorarios from "./pages/GerenciarHorarios";
import GerenciarAlunos from "./pages/GerenciarAlunos";
import SecretariaDashboard from "./pages/Dashboard";

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  { path: "/professor", Component: ProfessorDashboard },
  { path: "/coordinator", Component: CoordinatorDashboard },
  { path: "/report/create/:studentId?", Component: CreateReport },
  { path: "/report/view/:reportId", Component: ViewReport },
  { path: "/confirm/:reportId", Component: ParentConfirmation },
  { path: "/secretaria", Component: SecretariaDashboard },
  { path: "/secretaria/professores", Component: GerenciarProfessores },
  { path: "/secretaria/alunos", Component: GerenciarAlunos },
  { path: "/secretaria/horarios", Component: GerenciarHorarios },
  { path: "*", Component: NotFound },
]);
