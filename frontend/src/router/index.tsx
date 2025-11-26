import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HauntedLayout from '../layouts/HauntedLayout';
import { PumpkinSpinner } from '../components/loading/PumpkinSpinner';

// Lazy load route components for code splitting
const Home = lazy(() => import('../pages/Home'));
const Feeds = lazy(() => import('../pages/Feeds'));
const Articles = lazy(() => import('../pages/Articles'));
const Digests = lazy(() => import('../pages/Digests'));
const Search = lazy(() => import('../pages/Search'));
const Settings = lazy(() => import('../pages/Settings'));

// Spooky page transition variants
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Wrapper component for lazy-loaded routes with loading fallback
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <PumpkinSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <HauntedLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyRoute>
            <Home />
          </LazyRoute>
        ),
      },
      {
        path: 'feeds',
        element: (
          <LazyRoute>
            <Feeds />
          </LazyRoute>
        ),
      },
      {
        path: 'articles',
        element: (
          <LazyRoute>
            <Articles />
          </LazyRoute>
        ),
      },
      {
        path: 'digests',
        element: (
          <LazyRoute>
            <Digests />
          </LazyRoute>
        ),
      },
      {
        path: 'search',
        element: (
          <LazyRoute>
            <Search />
          </LazyRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyRoute>
            <Settings />
          </LazyRoute>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
