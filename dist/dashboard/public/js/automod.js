document.addEventListener('DOMContentLoaded', () => {
    if (window.utils && window.utils.onPage) {
        utils.onPage('/automod', () => {
            initializeAutoModPage();
        });
    } else {
        if (window.location.pathname === '/automod') {
            initializeAutoModPage();
        }
    }
});

function initializeAutoModPage() {
    console.log('Initializing automod page...');
    initializeAutoModToggles();
    initializeSaveBar();
}

function initializeAutoModToggles() {
    const toggles = [
        'automod-enabled',
        'automod-antiLink-enabled',
        'automod-antiSpam-enabled',
        'autolines-enabled'
    ];

    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', () => {
                showSaveBar();
            });
        }
    });
}

function initializeSaveBar() {
    const saveButton = document.getElementById('save-automod');
    const cancelButton = document.getElementById('cancel-automod');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            await saveAutoModSettings();
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

function collectAutoModSettings() {
    const settings = {
        autoMod: {
            enabled: document.getElementById('automod-enabled')?.checked || false,
            antiLink: {
                enabled: document.getElementById('automod-antiLink-enabled')?.checked || false
            },
            antiSpam: {
                enabled: document.getElementById('automod-antiSpam-enabled')?.checked || false
            }
        },
        autoLines: {
            enabled: document.getElementById('autolines-enabled')?.checked || false
        }
    };

    return settings;
}

async function saveAutoModSettings() {
    console.log('Saving automod settings...');
    try {
        const settings = collectAutoModSettings();
        
        const response = await fetch('/api/automod/settings', {
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
            utils.showToast('AutoMod settings saved successfully', 'success');
        } else {
            alert('AutoMod settings saved successfully');
        }
    } catch (error) {
        console.error('Error saving automod settings:', error);
        if (window.utils && window.utils.showToast) {
            utils.showToast('Failed to save automod settings', 'error');
        } else {
            alert('Failed to save automod settings');
        }
    }
}

