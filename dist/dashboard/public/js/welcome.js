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
    updateLivePreview(); // Initial preview
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
        'welcome-color-text',
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
                updateLivePreview();
            });
            input.addEventListener('input', () => {
                showSaveBar();
                updateLivePreview();
            });
        }
    });

    // Sync color picker and text input
    const colorPicker = document.getElementById('welcome-color');
    const colorText = document.getElementById('welcome-color-text');
    if (colorPicker && colorText) {
        colorPicker.addEventListener('input', (e) => {
            colorText.value = e.target.value;
            updateLivePreview();
        });
        colorText.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                colorPicker.value = e.target.value;
                updateLivePreview();
            }
        });
    }

    // Initialize image upload
    initializeImageUpload();
}

function initializeImageUpload() {
    const uploadArea = document.getElementById('welcome-card-upload-area');
    const fileInput = document.getElementById('welcome-card-background');
    const preview = document.getElementById('welcome-card-preview');
    const previewImg = document.getElementById('welcome-card-preview-img');
    const removeBtn = document.getElementById('welcome-card-remove');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-500', 'bg-blue-500/10');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-500', 'bg-blue-500/10');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-500', 'bg-blue-500/10');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            fileInput.value = '';
            preview.classList.add('hidden');
            showSaveBar();
        });
    }
}

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        if (window.utils && window.utils.showToast) {
            utils.showToast('Please select an image file', 'error');
        }
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        if (window.utils && window.utils.showToast) {
            utils.showToast('Image size must be less than 5MB', 'error');
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('welcome-card-preview');
        const previewImg = document.getElementById('welcome-card-preview-img');
        if (preview && previewImg) {
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');
            showSaveBar();
        }
    };
    reader.readAsDataURL(file);
}

function updateLivePreview() {
    const container = document.getElementById('welcome-preview-container');
    if (!container) return;

    const title = document.getElementById('welcome-title')?.value || 'Welcome!';
    const description = document.getElementById('welcome-description')?.value || 'Welcome to {server}, {user}!';
    const color = document.getElementById('welcome-color')?.value || '#3498db';
    const thumbnail = document.getElementById('welcome-thumbnail')?.value || '';
    const image = document.getElementById('welcome-image')?.value || '';
    const footerText = document.getElementById('welcome-footer')?.value || '';
    const footerIcon = document.getElementById('welcome-footerIcon')?.value || '';
    const showTimestamp = document.getElementById('welcome-timestamp')?.checked !== false;

    // Replace placeholders with example values
    const processedTitle = title.replace(/{user}/g, 'JohnDoe').replace(/{server}/g, 'My Server').replace(/{memberCount}/g, '1,234');
    const processedDescription = description.replace(/{user}/g, 'JohnDoe').replace(/{server}/g, 'My Server').replace(/{memberCount}/g, '1,234');

    const timestamp = showTimestamp ? new Date().toLocaleString() : '';

    container.innerHTML = `
        <div class="discord-embed" style="border-left: 4px solid ${color}; background: rgba(47, 49, 54, 0.95); border-radius: 4px; padding: 16px; max-width: 520px;">
            ${thumbnail ? `<img src="${thumbnail}" style="max-width: 80px; max-height: 80px; border-radius: 4px; margin-bottom: 8px;" onerror="this.style.display='none'">` : ''}
            <div class="embed-title" style="color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 8px;">
                ${processedTitle}
            </div>
            <div class="embed-description" style="color: #dcddde; font-size: 14px; line-height: 1.4; margin-bottom: 8px;">
                ${processedDescription}
            </div>
            ${image ? `<img src="${image}" style="max-width: 100%; border-radius: 4px; margin-top: 8px;" onerror="this.style.display='none'">` : ''}
            ${footerText || footerIcon ? `
                <div class="embed-footer" style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    ${footerIcon ? `<img src="${footerIcon}" style="width: 20px; height: 20px; border-radius: 50%;" onerror="this.style.display='none'">` : ''}
                    <span style="color: #72767d; font-size: 12px;">${footerText || ''}</span>
                    ${showTimestamp && timestamp ? `<span style="color: #72767d; font-size: 12px;">• ${timestamp}</span>` : ''}
                </div>
            ` : showTimestamp && timestamp ? `
                <div class="embed-footer" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #72767d; font-size: 12px;">${timestamp}</span>
                </div>
            ` : ''}
        </div>
    `;
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

function collectWelcomeSettings() {
    const previewImg = document.getElementById('welcome-card-preview-img');
    const cardBackground = previewImg && previewImg.src ? previewImg.src : '';

    const settings = {
        enabled: document.getElementById('welcome-enabled')?.checked || false,
        channelId: document.getElementById('welcome-channel')?.value || '',
        message: document.getElementById('welcome-message')?.value || '',
        cardBackground: cardBackground,
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

