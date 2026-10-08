import { Routes, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LearningPathPage from "@/pages/LearningPathPage";
import TopicsPage from "@/pages/TopicsPage";
import ModulePage from "@/pages/ModulePage";
import SectionPage from "@/pages/SectionPage";
import ProjectsPage from "@/pages/ProjectsPage";
import QuizzesPage from "@/pages/QuizzesPage";
import QuizPage from "@/pages/QuizPage";
import ResourcesPage from "@/pages/ResourcesPage";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/learn" element={<LearningPathPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/:moduleId" element={<ModulePage />} />
        <Route path="/topics/:moduleId/:sectionId" element={<SectionPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quiz/:moduleId" element={<QuizPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
