document.addEventListener('DOMContentLoaded', () => {
    if (window.utils && window.utils.onPage) {
        utils.onPage('/leveling', () => {
            initializeLevelingPage();
        });
    } else {
        if (window.location.pathname === '/leveling') {
            initializeLevelingPage();
        }
    }
});

function initializeLevelingPage() {
    console.log('Initializing leveling page...');
    initializeLevelingToggles();
    initializeLevelingInputs();
    initializeSaveBar();
    initializeSlider();
}

function initializeLevelingToggles() {
    const toggle = document.getElementById('leveling-enabled');
    if (toggle) {
        toggle.addEventListener('change', () => {
            showSaveBar();
        });
    }
}

function initializeSlider() {
    const slider = document.getElementById('leveling-xpRate');
    const valueDisplay = document.getElementById('leveling-xpRate-value');
    
    if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            showSaveBar();
        });
    }
}

function initializeLevelingInputs() {
    const inputs = [
        'leveling-cooldown',
        'leveling-levelUpChannel',
        'leveling-ignoredChannels'
    ];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', () => {
                showSaveBar();
            });
        }
    });
}

function initializeSaveBar() {
    const saveButton = document.getElementById('save-leveling');
    const cancelButton = document.getElementById('cancel-leveling');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            await saveLevelingSettings();
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

function collectLevelingSettings() {
    const ignoredChannelsSelect = document.getElementById('leveling-ignoredChannels');
    const ignoredChannels = Array.from(ignoredChannelsSelect?.selectedOptions || [])
        .map(option => option.value);

    const settings = {
        enabled: document.getElementById('leveling-enabled')?.checked || false,
        xpPerMessage: parseInt(document.getElementById('leveling-xpRate')?.value || '15'),
        cooldown: parseInt(document.getElementById('leveling-cooldown')?.value || '60'),
        levelUpChannel: document.getElementById('leveling-levelUpChannel')?.value || '',
        ignoredChannels: ignoredChannels
    };

    return settings;
}

async function saveLevelingSettings() {
    console.log('Saving leveling settings...');
    try {
        const settings = collectLevelingSettings();
        
        const response = await fetch('/api/leveling/settings', {
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
            utils.showToast('Leveling settings saved successfully', 'success');
        } else {
            alert('Leveling settings saved successfully');
        }
    } catch (error) {
        console.error('Error saving leveling settings:', error);
        if (window.utils && window.utils.showToast) {
            utils.showToast('Failed to save leveling settings', 'error');
        } else {
            alert('Failed to save leveling settings');
        }
    }
}

