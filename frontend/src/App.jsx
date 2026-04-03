import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AcceptInvite from "@/pages/AcceptInvite";
import RepositorySelection from "@/pages/RepositorySelection";
import NotFound from "@/pages/NotFound";

import PMDashboard from "@/pages/pm/PMDashboard";
import PMJiraPage from "@/pages/pm/PMJiraPage";
import PMSlackPage from "@/pages/pm/PMSlackPage";
import PMGitHubPage from "@/pages/pm/PMGitHubPage";
import PMPerformancePage from "@/pages/pm/PMPerformancePage";
import PMAddMembers from "@/pages/pm/PMAddMembers";

import CollaboratorDashboard from "@/pages/collaborator/CollaboratorDashboard";
import CollaboratorJiraPage from "@/pages/collaborator/CollaboratorJiraPage";
import CollaboratorSlackPage from "@/pages/collaborator/CollaboratorSlackPage";
import CollaboratorGitHubPage from "@/pages/collaborator/CollaboratorGitHubPage";
import CollaboratorPerformancePage from "@/pages/collaborator/CollaboratorPerformancePage";
import CollaboratorGroupDashboard from "@/pages/collaborator/CollaboratorGroupDashboard";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/accept-invite" element={<AcceptInvite />} />
                        <Route path="/repository-selection" element={<RepositorySelection />} />

                        {/* PM Routes */}
                        <Route element={<ProtectedRoute requiredRole="pm"><AppLayout /></ProtectedRoute>}>
                            <Route path="/pm/dashboard" element={<PMDashboard />} />
                            <Route path="/pm/jira" element={<PMJiraPage />} />
                            <Route path="/pm/slack" element={<PMSlackPage />} />
                            <Route path="/pm/github" element={<PMGitHubPage />} />
                            <Route path="/pm/performance" element={<PMPerformancePage />} />
                            <Route path="/pm/members" element={<PMAddMembers />} />
                        </Route>

                        {/* Collaborator Routes */}
                        <Route element={<ProtectedRoute requiredRole="collaborator"><AppLayout /></ProtectedRoute>}>
                            <Route path="/collaborator/dashboard" element={<CollaboratorDashboard />} />
                            <Route path="/collaborator/jira" element={<CollaboratorJiraPage />} />
                            <Route path="/collaborator/slack" element={<CollaboratorSlackPage />} />
                            <Route path="/collaborator/github" element={<CollaboratorGitHubPage />} />
                            <Route path="/collaborator/performance" element={<CollaboratorPerformancePage />} />
                            <Route path="/collaborator/group" element={<CollaboratorGroupDashboard />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
