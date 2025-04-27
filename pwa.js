// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Install (A2HS) functionality
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installButton = document.getElementById('installButton');

// Show the install prompt when the "beforeinstallprompt" event is fired
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    
    // Save the event for later
    deferredPrompt = e;
    
    // Show the install button
    installPrompt.classList.remove('hidden');
    installPrompt.classList.add('block');
});

// Add click event for install button
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // We no longer need the prompt
        deferredPrompt = null;
        
        // Hide the install button
        installPrompt.classList.add('hidden');
        installPrompt.classList.remove('block');
    });
}

// Handle installed scenario
window.addEventListener('appinstalled', (event) => {
    console.log('App was installed', event);
    // Hide the install button once installed
    if (installPrompt) {
        installPrompt.classList.add('hidden');
        installPrompt.classList.remove('block');
    }
});

// Check if the app is running in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    // App is running as installed PWA
    if (installPrompt) {
        installPrompt.classList.add('hidden');
    }
}

// Add offline sync capabilities
document.addEventListener('DOMContentLoaded', () => {
    // Initialize local storage if not exists
    if (!localStorage.getItem('savedSongs')) {
        localStorage.setItem('savedSongs', JSON.stringify([]));
    }
    
    // Save functionality with local storage backup
    const originalSaveButton = document.getElementById('saveButton');
    if (originalSaveButton) {
        const originalSaveFunction = originalSaveButton.onclick;
        
        originalSaveButton.onclick = function() {
            // Call the original save function if it exists
            if (typeof originalSaveFunction === 'function') {
                originalSaveFunction.call(this);
            }
            
            // Backup to local storage
            try {
                const currentSong = {
                    title: document.getElementById('title').value || 'Untitled',
                    artist: document.getElementById('artist').value || '',
                    bpm: document.getElementById('bpm').value || '',
                    key: document.getElementById('key').value || '',
                    timeSignature: document.getElementById('timeSignature').value || '',
                    lines: window.lines || []
                };
                
                // Get existing songs
                const savedSongs = JSON.parse(localStorage.getItem('savedSongs') || '[]');
                
                // Check if song with same title already exists
                const existingIndex = savedSongs.findIndex(song => song.title === currentSong.title);
                
                if (existingIndex !== -1) {
                    // Update existing song
                    savedSongs[existingIndex] = currentSong;
                } else {
                    // Add as new song
                    savedSongs.push(currentSong);
                }
                
                // Save back to local storage
                localStorage.setItem('savedSongs', JSON.stringify(savedSongs));
            } catch (error) {
                console.error('Error saving song to local storage:', error);
            }
        };
    }

    // Update CSS for mobile devices
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 768) {
        // Add more padding on mobile
        document.body.classList.add('p-2');
        document.querySelector('.song-container').classList.add('p-3');
    }
});
