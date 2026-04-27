import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })));
const CompanyPage = lazy(() => import('@/pages/Company').then((m) => ({ default: m.CompanyPage })));
const AdvertisePage = lazy(() => import('@/pages/Advertise').then((m) => ({ default: m.AdvertisePage })));
const LoginPage = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('@/pages/dashboard/Dashboard').then((m) => ({ default: m.DashboardPage })));

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-neutral-500">Carregando...</p>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
      },
      {
        path: 'buscar',
        element: <SuspenseWrapper><SearchPage /></SuspenseWrapper>,
      },
      {
        path: 'empresa/:id',
        element: <SuspenseWrapper><CompanyPage /></SuspenseWrapper>,
      },
      {
        path: 'anunciar',
        element: <SuspenseWrapper><AdvertisePage /></SuspenseWrapper>,
      },
      {
        path: 'auth/login',
        element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
      },
      {
        path: 'auth/registro',
        element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper>,
      },
      {
        path: 'dashboard',
        element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>,
      },
    ],
  },
]);
