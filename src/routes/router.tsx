import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExplorePage } from '../pages/ExplorePage';
import { SavedPage } from '../pages/SavedPage';
import { BudgetPage } from '../pages/BudgetPage';
import { ChecklistPage } from '../pages/ChecklistPage';
import { ChatbotPage } from '../pages/ChatbotPage';
import { AdminAddListingPage } from '../pages/AdminAddListingPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <AppShell>
                <OnboardingPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <AppShell>
                <ExplorePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <AppShell>
                <SavedPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <AppShell>
                <BudgetPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist"
          element={
            <ProtectedRoute>
              <AppShell>
                <ChecklistPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <AppShell>
                <ChatbotPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/listings/new"
          element={
            <ProtectedRoute requireAdmin>
              <AppShell>
                <AdminAddListingPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
