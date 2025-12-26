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
    initializeLineFormatting();
    updateLinePreview();
    loadChannels();
}

function initializeLineFormatting() {
    const styleSelect = document.getElementById('autolines-style');
    const customFormatDiv = document.getElementById('custom-line-format');
    const customInput = document.getElementById('autolines-custom');
    const colorPicker = document.getElementById('autolines-color');
    const colorText = document.getElementById('autolines-color-text');
    
    if (styleSelect && customFormatDiv) {
        styleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customFormatDiv.classList.remove('hidden');
            } else {
                customFormatDiv.classList.add('hidden');
            }
            updateLinePreview();
            showSaveBar();
        });
    }
    
    if (customInput) {
        customInput.addEventListener('input', () => {
            updateLinePreview();
            showSaveBar();
        });
    }
    
    if (colorPicker && colorText) {
        colorPicker.addEventListener('input', (e) => {
            colorText.value = e.target.value;
            updateLinePreview();
            showSaveBar();
        });
        colorText.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                colorPicker.value = e.target.value;
                updateLinePreview();
                showSaveBar();
            }
        });
    }
    
    const channelsSelect = document.getElementById('autolines-channels');
    if (channelsSelect) {
        channelsSelect.addEventListener('change', () => {
            showSaveBar();
        });
    }
}

function updateLinePreview() {
    const container = document.getElementById('autolines-preview');
    if (!container) return;
    
    const style = document.getElementById('autolines-style')?.value || 'solid';
    const customFormat = document.getElementById('autolines-custom')?.value || '';
    const color = document.getElementById('autolines-color')?.value || '#4a5568';
    
    let lineContent = '';
    if (style === 'custom' && customFormat) {
        lineContent = customFormat;
    } else if (style === 'dashed') {
        lineContent = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    } else if (style === 'dotted') {
        lineContent = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈';
    } else {
        lineContent = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    }
    
    container.innerHTML = `<div style="color: ${color}; font-family: monospace;">${lineContent}</div>`;
}

async function loadChannels() {
    try {
        const response = await fetch('/api/channels');
        const channels = await response.json();
        
        const select = document.getElementById('autolines-channels');
        if (!select) return;
        
        // Clear existing options except the first one
        while (select.options.length > 0) {
            select.remove(0);
        }
        
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading channels:', error);
    }
}

function initializeAutoModToggles() {
    const toggles = [
        'automod-enabled',
        'automod-antiLink-enabled',
        'automod-antiSpam-enabled',
        'automod-wordFilter-enabled',
        'autolines-enabled'
    ];

    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', () => {
                showSaveBar();
                if (id === 'autolines-enabled') {
                    updateLinePreview();
                }
            });
        }
    });
    
    // Input listeners for word filter and spam settings
    const inputs = [
        'automod-whitelisted-links',
        'automod-spam-count',
        'automod-spam-time',
        'automod-banned-words',
        'automod-wordFilter-caseSensitive'
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
        saveBar.classList.add('show');
    }
}

function hideSaveBar() {
    const saveBar = document.getElementById('save-bar');
    if (saveBar) {
        saveBar.classList.add('hidden');
        saveBar.classList.remove('show');
    }
}

function collectAutoModSettings() {
    const whitelistedLinksInput = document.getElementById('automod-whitelisted-links');
    const whitelistedLinks = whitelistedLinksInput?.value
        ? whitelistedLinksInput.value.split(',').map(link => link.trim()).filter(Boolean)
        : [];
    
    const bannedWordsInput = document.getElementById('automod-banned-words');
    const bannedWords = bannedWordsInput?.value
        ? bannedWordsInput.value.split('\n').map(word => word.trim()).filter(Boolean)
        : [];
    
    const channelsSelect = document.getElementById('autolines-channels');
    const targetChannels = Array.from(channelsSelect?.selectedOptions || [])
        .map(option => option.value);
    
    const settings = {
        autoMod: {
            enabled: document.getElementById('automod-enabled')?.checked || false,
            antiLink: {
                enabled: document.getElementById('automod-antiLink-enabled')?.checked || false,
                whitelistedLinks: whitelistedLinks
            },
            antiSpam: {
                enabled: document.getElementById('automod-antiSpam-enabled')?.checked || false,
                messageCount: parseInt(document.getElementById('automod-spam-count')?.value || '5'),
                timeWindow: parseInt(document.getElementById('automod-spam-time')?.value || '10')
            },
            wordFilter: {
                enabled: document.getElementById('automod-wordFilter-enabled')?.checked || false,
                bannedWords: bannedWords,
                caseSensitive: document.getElementById('automod-wordFilter-caseSensitive')?.checked || false
            }
        },
        autoLines: {
            enabled: document.getElementById('autolines-enabled')?.checked || false,
            style: document.getElementById('autolines-style')?.value || 'solid',
            customFormat: document.getElementById('autolines-custom')?.value || '',
            color: document.getElementById('autolines-color')?.value || '#4a5568',
            channels: targetChannels
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

