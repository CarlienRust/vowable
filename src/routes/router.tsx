import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { LandingPage } from '../pages/LandingPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExplorePage } from '../pages/ExplorePage';
import { SavedPage } from '../pages/SavedPage';
import { BudgetPage } from '../pages/BudgetPage';
import { ChecklistPage } from '../pages/ChecklistPage';
import { ChatbotPage } from '../pages/ChatbotPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/onboarding"
          element={
            <AppShell>
              <OnboardingPage />
            </AppShell>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/explore"
          element={
            <AppShell>
              <ExplorePage />
            </AppShell>
          }
        />
        <Route
          path="/saved"
          element={
            <AppShell>
              <SavedPage />
            </AppShell>
          }
        />
        <Route
          path="/budget"
          element={
            <AppShell>
              <BudgetPage />
            </AppShell>
          }
        />
        <Route
          path="/checklist"
          element={
            <AppShell>
              <ChecklistPage />
            </AppShell>
          }
        />
        <Route
          path="/chatbot"
          element={
            <AppShell>
              <ChatbotPage />
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
