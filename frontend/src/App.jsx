import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './config/clerk';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AboutUsPage from './pages/AboutUsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPropertiesListPage from './pages/admin/AdminPropertiesListPage';
import AdminPropertyFormPage from './pages/admin/AdminPropertyFormPage';
import AdminEnquiriesListPage from './pages/admin/AdminEnquiriesListPage';
import AdminEnquiryDetailPage from './pages/admin/AdminEnquiryDetailPage';
import AdminAmenitiesPage from './pages/admin/AdminAmenitiesPage';
import AdminPropertyTypesPage from './pages/admin/AdminPropertyTypesPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminProjectDetailPage from './pages/admin/AdminProjectDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSecurityEventsPage from './pages/admin/AdminSecurityEventsPage';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminSuperAdminRoute from './components/admin/AdminSuperAdminRoute';

function AppRoutes() {
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  return (
    <Routes>
      {/* Admin Authentication Login (Login Only) */}
      <Route path="/admin/login/*" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Redirect all registration/signup paths to /admin/login */}
      <Route path="/admin/signup" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/sign-up" element={<Navigate to="/admin/login" replace />} />
      <Route path="/signup" element={<Navigate to="/admin/login" replace />} />
      <Route path="/sign-up" element={<Navigate to="/admin/login" replace />} />

      {/* Protected Admin Routes wrapped in AdminProtectedRoute and AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminPropertiesListPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/new"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminPropertyFormPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/:id/edit"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminPropertyFormPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminEnquiriesListPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries/:id"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminEnquiryDetailPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/amenities"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminAmenitiesPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/property-types"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminPropertyTypesPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/tags"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminTagsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminProjectsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminProjectDetailPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminProtectedRoute>
            <AdminSuperAdminRoute>
              <AdminLayout>
                <AdminAuditLogsPage />
              </AdminLayout>
            </AdminSuperAdminRoute>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/security-events"
        element={
          <AdminProtectedRoute>
            <AdminSuperAdminRoute>
              <AdminLayout>
                <AdminSecurityEventsPage />
              </AdminLayout>
            </AdminSuperAdminRoute>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

      {/* Public Real-Estate Website Routes */}
      <Route
        path="/*"
        element={
          <MainLayout onOpenEnquiry={() => setEnquiryModalOpen(true)}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    enquiryModalOpen={enquiryModalOpen}
                    setEnquiryModalOpen={setEnquiryModalOpen}
                  />
                }
              />
              <Route
                path="/properties"
                element={
                  <PropertiesPage
                    enquiryModalOpen={enquiryModalOpen}
                    setEnquiryModalOpen={setEnquiryModalOpen}
                  />
                }
              />
              <Route
                path="/properties/:slug"
                element={
                  <PropertyDetailPage
                    enquiryModalOpen={enquiryModalOpen}
                    setEnquiryModalOpen={setEnquiryModalOpen}
                  />
                }
              />
              <Route
                path="/about-us"
                element={
                  <AboutUsPage
                    enquiryModalOpen={enquiryModalOpen}
                    setEnquiryModalOpen={setEnquiryModalOpen}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default function App() {
  if (isClerkConfigured) {
    return (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        signInUrl="/admin/login"
        signUpUrl="/admin/login"
        afterSignOutUrl="/admin/login"
      >
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ClerkProvider>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
