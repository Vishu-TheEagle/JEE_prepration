
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedLayout from './components/layout/RoleBasedLayout';

import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import DashboardPage from './components/dashboard/DashboardPage';
import DoubtSolverPage from './components/doubt-solver/DoubtSolverPage';
import TestGeneratorPage from './components/test-generator/TestGeneratorPage';
import NotesGeneratorPage from './components/notes-generator/NotesGeneratorPage';
import MistakeJournalPage from './components/mistake-journal/MistakeJournalPage';
import LearningPlanPage from './components/learning-plan/LearningPlanPage';
import ExamSimulationPage from './components/exam-simulation/ExamSimulationPage';
import CollaborationLobbyPage from './components/collaboration/CollaborationLobbyPage';
import CollaborationPage from './components/collaboration/CollaborationPage';
import CareerCounselingPage from './components/career-counseling/CareerCounselingPage';
import SettingsPage from './components/settings/SettingsPage';
import ParentDashboardPage from './components/parent/ParentDashboardPage';
import ParentMistakeJournalPage from './components/parent/ParentMistakeJournalPage';
import ParentLearningPlanPage from './components/parent/ParentLearningPlanPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import CommunityPage from './components/community/CommunityPage';
import CommunityQuestionPage from './components/community/CommunityQuestionPage';
import OcrPracticePage from './components/ocr-practice/OcrPracticePage';


const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <RoleBasedLayout 
                studentRoutes={
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="doubt-solver" element={<DoubtSolverPage />} />
                    <Route path="test-generator" element={<TestGeneratorPage />} />
                    <Route path="ocr-practice" element={<OcrPracticePage />} />
                    <Route path="notes-generator" element={<NotesGeneratorPage />} />
                    <Route path="learning-plan" element={<LearningPlanPage />} />
                    <Route path="mistake-journal" element={<MistakeJournalPage />} />
                    <Route path="exam-simulation" element={<ExamSimulationPage />} />
                    <Route path="collaboration" element={<CollaborationLobbyPage />} />
                    <Route path="collaboration/:roomId" element={<CollaborationPage />} />
                    <Route path="career-counseling" element={<CareerCounselingPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="community" element={<CommunityPage />} />
                    <Route path="community/:questionId" element={<CommunityQuestionPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                }
                parentRoutes={
                  <Routes>
                    <Route path="parent/dashboard" element={<ParentDashboardPage />} />
                    <Route path="parent/mistake-journal" element={<ParentMistakeJournalPage />} />
                    <Route path="parent/learning-plan" element={<ParentLearningPlanPage />} />
                    <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                  </Routes>
                }
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
