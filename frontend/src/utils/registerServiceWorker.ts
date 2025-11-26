import { registerSW } from 'virtual:pwa-register';

/**
 * Register the service worker for offline functionality
 * This enables caching of static assets and API responses
 */
export function registerServiceWorker() {
  // Only register in production
  if (import.meta.env.PROD) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show a prompt to the user to refresh the app
        if (confirm('New content available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
        // Optionally show a notification that the app is ready for offline use
        showOfflineReadyNotification();
      },
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        console.log('Service Worker registered:', registration);
      },
      onRegisterError(error: Error) {
        console.error('Service Worker registration error:', error);
      },
    });
  }
}

/**
 * Show a notification that the app is ready for offline use
 */
function showOfflineReadyNotification() {
  // Create a custom event that can be listened to by the UI
  const event = new CustomEvent('sw-offline-ready', {
    detail: { message: 'App is ready to work offline!' },
  });
  window.dispatchEvent(event);
}

/**
 * Check if the service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterServiceWorkers() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('All service workers unregistered');
  }
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration() {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.getRegistration();
  }
  return null;
}

/**
 * Force update the service worker
 */
export async function updateServiceWorker() {
  const registration = await getServiceWorkerRegistration();
  if (registration) {
    await registration.update();
    console.log('Service worker update triggered');
  }
}
