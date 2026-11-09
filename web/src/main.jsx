import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router';

import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/lora/latin-600.css';
import './index.css';

import { SessionProvider, useSession } from './lib/session.jsx';
import { ToastProvider } from './components/ui.jsx';
import { Layout, PageSpinner } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import { BlogList, PostPage } from './pages/Blog.jsx';
import Links from './pages/Links.jsx';
import Members from './pages/Members.jsx';
import { Apply, VerifyEmail } from './pages/Apply.jsx';
import { Login, Forgot, Reset, Signup } from './pages/Auth.jsx';
import NotFound from './pages/NotFound.jsx';

// Member and admin screens load on demand, keeping the public pages light.
const Space = lazy(() => import('./pages/Space.jsx'));
const Quiz = lazy(() => import('./pages/Quiz.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const Applications = lazy(() => import('./pages/admin/Applications.jsx'));
const MembersAdmin = lazy(() => import('./pages/admin/MembersAdmin.jsx'));
const Questions = lazy(() => import('./pages/admin/Questions.jsx'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin.jsx'));
const PostsAdmin = lazy(() => import('./pages/admin/PostsAdmin.jsx'));
const PostEditor = lazy(() => import('./pages/admin/PostEditor.jsx'));
const LinksAdmin = lazy(() => import('./pages/admin/LinksAdmin.jsx'));

function RequireUser() {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <SessionProvider>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:slug" element={<PostPage />} />
              <Route path="liens" element={<Links />} />
              <Route path="membres" element={<Members />} />
              <Route path="adherer" element={<Apply />} />
              <Route path="candidature/verifier/:token" element={<VerifyEmail />} />
              <Route path="inscription/:token" element={<Signup />} />
              <Route path="connexion" element={<Login />} />
              <Route path="mot-de-passe-oublie" element={<Forgot />} />
              <Route path="reinitialiser/:token" element={<Reset />} />
              <Route element={<RequireUser />}>
                <Route path="espace" element={<Space />} />
                <Route path="questionnaire" element={<Quiz />} />
                <Route path="profil" element={<Profile />} />
                <Route path="gestion" element={<AdminLayout />}>
                  <Route path="candidatures" element={<Applications />} />
                  <Route path="membres" element={<MembersAdmin />} />
                  <Route path="questions" element={<Questions />} />
                  <Route path="parametres" element={<SettingsAdmin />} />
                  <Route path="articles" element={<PostsAdmin />} />
                  <Route path="articles/nouveau" element={<PostEditor />} />
                  <Route path="articles/:id" element={<PostEditor />} />
                  <Route path="liens" element={<LinksAdmin />} />
                </Route>
              </Route>
              {/* Addresses from the previous site */}
              <Route path="login" element={<Navigate to="/connexion" replace />} />
              <Route path="users-results" element={<Navigate to="/membres" replace />} />
              <Route path="account-creation-request" element={<Navigate to="/adherer" replace />} />
              <Route path="home-questionnaire" element={<Navigate to="/espace" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>
);
