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
    initializeDragAndDrop();
    updateLivePreview();
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
    document.addEventListener('change', (e) => {
        if (e.target.matches('.button-label, .button-emoji, .button-roleId')) {
            showSaveBar();
            updateButtonPreview(e.target.closest('.role-button-item'));
            updateLivePreview();
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.matches('.button-label, .button-emoji')) {
            showSaveBar();
            updateButtonPreview(e.target.closest('.role-button-item'));
            updateLivePreview();
        }
    });
}

function initializeDragAndDrop() {
    const list = document.getElementById('role-buttons-list');
    if (!list) return;

    let draggedElement = null;

    list.addEventListener('dragstart', (e) => {
        if (e.target.closest('.role-button-item')) {
            draggedElement = e.target.closest('.role-button-item');
            draggedElement.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    list.addEventListener('dragend', (e) => {
        if (draggedElement) {
            draggedElement.style.opacity = '1';
            draggedElement = null;
        }
    });

    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = getDragAfterElement(list, e.clientY);
        const dragging = list.querySelector('.dragging');
        
        if (dragging) {
            if (afterElement == null) {
                list.appendChild(dragging);
            } else {
                list.insertBefore(dragging, afterElement);
            }
        }
    });

    list.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });

    // Make items draggable
    document.querySelectorAll('.role-button-item').forEach(item => {
        item.draggable = true;
        item.addEventListener('dragstart', function() {
            this.classList.add('dragging');
        });
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            showSaveBar();
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.role-button-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateButtonPreview(item) {
    if (!item) return;
    
    const label = item.querySelector('.button-label')?.value || '';
    const emoji = item.querySelector('.button-emoji')?.value || '';
    const previewEmoji = item.querySelector('.button-preview-emoji');
    const previewLabel = item.querySelector('.button-preview-label');
    
    if (previewEmoji) previewEmoji.textContent = emoji || '🔘';
    if (previewLabel) previewLabel.textContent = label || 'Button Label';
}

function updateLivePreview() {
    const container = document.getElementById('roles-preview-container');
    if (!container) return;

    const buttons = [];
    document.querySelectorAll('.role-button-item').forEach(item => {
        const label = item.querySelector('.button-label')?.value || '';
        const emoji = item.querySelector('.button-emoji')?.value || '';
        const roleId = item.querySelector('.button-roleId')?.value || '';
        const roleSelect = item.querySelector('.button-roleId');
        const roleOption = roleSelect?.options[roleSelect.selectedIndex];
        const roleName = roleOption?.text || '';
        const roleColor = roleOption?.dataset.color || '#5865F2';

        if (label && roleId) {
            buttons.push({ label, emoji, roleName, roleColor });
        }
    });

    if (buttons.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Add buttons to see preview</p>';
        return;
    }

    container.innerHTML = buttons.map(btn => `
        <div class="discord-button-preview p-3 bg-[#1a2332] rounded-[8px] border border-white/10 flex items-center gap-3 hover:bg-[#2d3748] transition-all">
            <span class="text-2xl">${btn.emoji || '🔘'}</span>
            <div class="flex-1">
                <div class="text-white font-medium">${btn.label}</div>
                <div class="text-xs text-gray-400">Role: ${btn.roleName}</div>
            </div>
            <div class="w-3 h-3 rounded-full" style="background-color: ${btn.roleColor}"></div>
        </div>
    `).join('');
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
    newItem.className = 'role-button-item bg-[#2d3748] p-4 rounded-[12px] border border-white/10 hover:border-purple-500/50 transition-all cursor-move group';
    newItem.draggable = true;
    newItem.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
            <div class="drag-handle text-gray-400 hover:text-purple-400 cursor-grab active:cursor-grabbing">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        ${labelText}
                    </label>
                    <input type="text" class="button-label w-full px-3 py-2 bg-[#374151] border border-white/10 rounded-[12px] text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                           placeholder="${exampleLabel}">
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        ${emojiText}
                    </label>
                    <div class="flex gap-2">
                        <input type="text" class="button-emoji flex-1 px-3 py-2 bg-[#374151] border border-white/10 rounded-[12px] text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                               placeholder="${exampleEmoji}">
                        <button class="emoji-picker-btn px-3 py-2 bg-[#374151] border border-white/10 rounded-[12px] text-white hover:bg-[#4a5568] transition-all">
                            <i class="fas fa-smile"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        ${roleText}
                    </label>
                    <select class="button-roleId w-full px-3 py-2 bg-[#374151] border border-white/10 rounded-[12px] text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all">
                        <option value="">${selectRoleText}</option>
                        ${roleOptions}
                    </select>
                </div>
            </div>
            <button class="remove-button px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-[12px] transition-all group-hover:bg-red-500/30">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="preview-button mt-3 p-3 bg-[#1a2332] rounded-[8px] border border-white/5">
            <div class="flex items-center gap-2 text-sm text-gray-400">
                <span class="button-preview-emoji">🔘</span>
                <span class="button-preview-label">${labelText}</span>
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
            updateLivePreview();
        }
    });

    // Make draggable
    newItem.addEventListener('dragstart', function() {
        this.classList.add('dragging');
    });
    newItem.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        showSaveBar();
    });

    showSaveBar();
    updateLivePreview();
    
    // Reinitialize drag and drop
    initializeDragAndDrop();
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

