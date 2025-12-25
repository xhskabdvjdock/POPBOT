document.addEventListener('DOMContentLoaded', () => {
    if (window.utils && window.utils.onPage) {
        utils.onPage('/selectroles', () => {
            initializeSelectRolesPage();
        });
    } else {
        if (window.location.pathname === '/selectroles') {
            initializeSelectRolesPage();
        }
    }
});

function initializeSelectRolesPage() {
    console.log('Initializing select roles page...');
    initializeSelectRolesToggles();
    initializeAddButton();
    initializeRemoveButtons();
    initializeSaveBar();
    initializeInputListeners();
}

function initializeSelectRolesToggles() {
    const toggle = document.getElementById('selectroles-enabled');
    if (toggle) {
        toggle.addEventListener('change', () => {
            showSaveBar();
        });
    }
}

function initializeAddButton() {
    const addButton = document.getElementById('add-role-button');
    if (addButton) {
        addButton.addEventListener('click', () => {
            addRoleButton();
        });
    }
}

function initializeRemoveButtons() {
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const item = e.target.closest('.role-button-item');
            if (item) {
                item.remove();
                showSaveBar();
                updateEmptyState();
            }
        });
    });
}

function initializeInputListeners() {
    document.querySelectorAll('.button-label, .button-emoji, .button-roleId').forEach(input => {
        input.addEventListener('change', () => {
            showSaveBar();
        });
        input.addEventListener('input', () => {
            showSaveBar();
        });
    });
}

function addRoleButton() {
    const list = document.getElementById('role-buttons-list');
    if (!list) return;

    // Get roles from the first select if available
    const firstSelect = list.querySelector('.button-roleId');
    let roleOptions = '';
    if (firstSelect) {
        Array.from(firstSelect.options).forEach(option => {
            if (option.value) {
                roleOptions += `<option value="${option.value}">${option.text}</option>`;
            }
        });
    }

    const isRTL = document.documentElement.dir === 'rtl';
    const addText = isRTL ? 'إضافة زر' : 'Add Button';
    const labelText = isRTL ? 'تسمية الزر' : 'Button Label';
    const emojiText = isRTL ? 'إيموجي' : 'Emoji';
    const roleText = isRTL ? 'معرف الرتبة' : 'Role ID';
    const selectRoleText = isRTL ? 'اختر الرتبة' : 'Select Role';
    const removeText = isRTL ? 'حذف' : 'Remove';
    const exampleLabel = isRTL ? 'مثال: رتبة VIP' : 'Example: VIP Role';
    const exampleEmoji = isRTL ? 'مثال: ⭐' : 'Example: ⭐';

    const newItem = document.createElement('div');
    newItem.className = 'role-button-item bg-gray-100 dark:bg-gray-700 p-4 rounded-lg';
    newItem.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ${labelText}
                </label>
                <input type="text" class="button-label w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg"
                       placeholder="${exampleLabel}">
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ${emojiText}
                </label>
                <input type="text" class="button-emoji w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg"
                       placeholder="${exampleEmoji}">
            </div>
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ${roleText}
                </label>
                <select class="button-roleId w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg">
                    <option value="">${selectRoleText}</option>
                    ${roleOptions}
                </select>
            </div>
            <div class="form-group flex items-end">
                <button class="remove-button w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                    <i class="fas fa-trash ${isRTL ? 'ml-2' : 'mr-2'}"></i>
                    ${removeText}
                </button>
            </div>
        </div>
    `;

    // Clear empty state if exists
    const emptyState = list.querySelector('p.text-gray-500');
    if (emptyState) {
        emptyState.remove();
    }

    list.appendChild(newItem);

    // Initialize listeners for new item
    newItem.querySelector('.remove-button').addEventListener('click', (e) => {
        const item = e.target.closest('.role-button-item');
        if (item) {
            item.remove();
            showSaveBar();
            updateEmptyState();
        }
    });

    newItem.querySelectorAll('.button-label, .button-emoji, .button-roleId').forEach(input => {
        input.addEventListener('change', () => {
            showSaveBar();
        });
        input.addEventListener('input', () => {
            showSaveBar();
        });
    });

    showSaveBar();
}

function updateEmptyState() {
    const list = document.getElementById('role-buttons-list');
    if (!list) return;

    const items = list.querySelectorAll('.role-button-item');
    if (items.length === 0) {
        const isRTL = document.documentElement.dir === 'rtl';
        const emptyText = isRTL 
            ? 'لا توجد أزرار رتب. اضغط على "إضافة زر" لإنشاء واحد.'
            : 'No role buttons. Click "Add Button" to create one.';
        
        const emptyP = document.createElement('p');
        emptyP.className = 'text-gray-500 text-center py-8';
        emptyP.textContent = emptyText;
        list.appendChild(emptyP);
    }
}

function initializeSaveBar() {
    const saveButton = document.getElementById('save-selectroles');
    const cancelButton = document.getElementById('cancel-selectroles');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            await saveSelectRolesSettings();
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

function collectSelectRolesSettings() {
    const buttons = [];
    document.querySelectorAll('.role-button-item').forEach(item => {
        const label = item.querySelector('.button-label')?.value || '';
        const emoji = item.querySelector('.button-emoji')?.value || '';
        const roleId = item.querySelector('.button-roleId')?.value || '';

        if (label && roleId) {
            buttons.push({
                label: label,
                emoji: emoji,
                roleId: roleId
            });
        }
    });

    const settings = {
        enabled: document.getElementById('selectroles-enabled')?.checked || false,
        buttons: buttons
    };

    return settings;
}

async function saveSelectRolesSettings() {
    console.log('Saving select roles settings...');
    try {
        const settings = collectSelectRolesSettings();
        
        const response = await fetch('/api/selectroles/settings', {
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
            utils.showToast('Select roles settings saved successfully', 'success');
        } else {
            alert('Select roles settings saved successfully');
        }
    } catch (error) {
        console.error('Error saving select roles settings:', error);
        if (window.utils && window.utils.showToast) {
            utils.showToast('Failed to save select roles settings', 'error');
        } else {
            alert('Failed to save select roles settings');
        }
    }
}

