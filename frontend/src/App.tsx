import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './router';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/toast';
import ServiceWorkerStatus from './components/ServiceWorkerStatus';
// import KeyboardShortcuts from './components/KeyboardShortcuts';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider position="top-right">
          {/* Skip to main content link for keyboard navigation */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <AppRouter />
          <ServiceWorkerStatus />
          {/* <KeyboardShortcuts /> */}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
