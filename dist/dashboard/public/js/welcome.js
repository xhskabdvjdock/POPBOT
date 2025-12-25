document.addEventListener('DOMContentLoaded', () => {
    if (window.utils && window.utils.onPage) {
        utils.onPage('/welcome', () => {
            initializeWelcomePage();
        });
    } else {
        if (window.location.pathname === '/welcome') {
            initializeWelcomePage();
        }
    }
});

function initializeWelcomePage() {
    console.log('Initializing welcome page...');
    initializeWelcomeToggles();
    initializeWelcomeInputs();
    initializeSaveBar();
}

function initializeWelcomeToggles() {
    const toggle = document.getElementById('welcome-enabled');
    if (toggle) {
        toggle.addEventListener('change', () => {
            showSaveBar();
        });
    }
}

function initializeWelcomeInputs() {
    const inputs = [
        'welcome-channel',
        'welcome-color',
        'welcome-title',
        'welcome-description',
        'welcome-message',
        'welcome-thumbnail',
        'welcome-image',
        'welcome-footer',
        'welcome-footerIcon',
        'welcome-timestamp'
    ];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', () => {
                showSaveBar();
            });
            input.addEventListener('input', () => {
                showSaveBar();
            });
        }
    });
}

function initializeSaveBar() {
    const saveButton = document.getElementById('save-welcome');
    const cancelButton = document.getElementById('cancel-welcome');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            await saveWelcomeSettings();
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideSaveBar();
            location.reload();
        });
    }
}

function showSaveBar() {
    const saveBar = document.getElementById('save-bar');
    if (saveBar) {
        saveBar.classList.remove('hidden');
    }
}

function hideSaveBar() {
    const saveBar = document.getElementById('save-bar');
    if (saveBar) {
        saveBar.classList.add('hidden');
    }
}

function collectWelcomeSettings() {
    const settings = {
        enabled: document.getElementById('welcome-enabled')?.checked || false,
        channelId: document.getElementById('welcome-channel')?.value || '',
        message: document.getElementById('welcome-message')?.value || '',
        embed: {
            title: document.getElementById('welcome-title')?.value || 'Welcome!',
            description: document.getElementById('welcome-description')?.value || 'Welcome to {server}, {user}!',
            color: document.getElementById('welcome-color')?.value || '#3498db',
            thumbnail: document.getElementById('welcome-thumbnail')?.value || '',
            image: document.getElementById('welcome-image')?.value || '',
            footer: {
                text: document.getElementById('welcome-footer')?.value || '',
                iconURL: document.getElementById('welcome-footerIcon')?.value || ''
            },
            timestamp: document.getElementById('welcome-timestamp')?.checked !== false
        }
    };

    return settings;
}

async function saveWelcomeSettings() {
    console.log('Saving welcome settings...');
    try {
        const settings = collectWelcomeSettings();
        
        const response = await fetch('/api/welcome/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to save settings');

        console.log('Settings saved successfully:', data);
        hideSaveBar();
        if (window.utils && window.utils.showToast) {
            utils.showToast('Welcome settings saved successfully', 'success');
        } else {
            alert('Welcome settings saved successfully');
        }
    } catch (error) {
        console.error('Error saving welcome settings:', error);
        if (window.utils && window.utils.showToast) {
            utils.showToast('Failed to save welcome settings', 'error');
        } else {
            alert('Failed to save welcome settings');
        }
    }
}

