import toast from 'react-hot-toast';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          // Only show toast on first install or update
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // At this point, the updated precached content has been fetched,
                    // but the previous service worker will still serve the old
                    // content until all client tabs are closed.
                    toast('New content is available and will be used when all tabs for this page are closed.', { duration: 6000 });
                  } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a
                    // "Content is cached for offline use." message.
                    toast.success("App is ready for offline use!", { icon: '✅' });
                  }
                }
              };
            }
          };
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
};
