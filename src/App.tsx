import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SitePage from './SitePage';

// The admin bundle only loads for people who navigate to /admin, so it never
// costs a visitor to the public site anything.
const AdminApp = lazy(() => import('./admin/AdminApp'));

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={basename || '/'}>
      <Routes>
        <Route path="/" element={<SitePage />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
      <p className="eyebrow" role="status">
        Loading editor…
      </p>
    </div>
  );
}
