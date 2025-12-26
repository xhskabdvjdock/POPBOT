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
    initializeRankCardCustomizer();
    initializeLeaderboardPreview();
    updateRankCardPreview();
    updateLeaderboardPreview();
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
            updateRankCardPreview();
        });
    }
}

function initializeRankCardCustomizer() {
    const colorInputs = [
        { picker: 'rank-card-bg', text: 'rank-card-bg-text' },
        { picker: 'rank-card-progress', text: 'rank-card-progress-text' },
        { picker: 'rank-card-text', text: 'rank-card-text-color' }
    ];

    colorInputs.forEach(({ picker, text }) => {
        const pickerEl = document.getElementById(picker);
        const textEl = document.getElementById(text);
        
        if (pickerEl && textEl) {
            pickerEl.addEventListener('input', (e) => {
                textEl.value = e.target.value;
                updateRankCardPreview();
            });
            textEl.addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    pickerEl.value = e.target.value;
                    updateRankCardPreview();
                }
            });
        }
    });

    const bgUrl = document.getElementById('rank-card-background-url');
    if (bgUrl) {
        bgUrl.addEventListener('input', () => {
            updateRankCardPreview();
        });
    }
}

function updateRankCardPreview() {
    const container = document.getElementById('rank-card-preview');
    if (!container) return;

    const bgColor = document.getElementById('rank-card-bg')?.value || '#1a2332';
    const progressColor = document.getElementById('rank-card-progress')?.value || '#10b981';
    const textColor = document.getElementById('rank-card-text')?.value || '#ffffff';
    const bgUrl = document.getElementById('rank-card-background-url')?.value || '';
    
    const currentXP = 1250;
    const nextLevelXP = 2000;
    const progress = (currentXP / nextLevelXP) * 100;
    const level = 5;

    container.innerHTML = `
        <div class="rank-card" style="
            background: ${bgUrl ? `url('${bgUrl}') center/cover` : bgColor};
            border-radius: 12px;
            padding: 20px;
            color: ${textColor};
            position: relative;
            overflow: hidden;
            ${bgUrl ? 'background-blend-mode: overlay; background-color: rgba(26, 35, 50, 0.8);' : ''}
        ">
            <div class="flex items-center gap-4 mb-4">
                <div class="avatar" style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 3px solid ${progressColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                ">JD</div>
                <div class="flex-1">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">JohnDoe</div>
                    <div style="font-size: 14px; opacity: 0.8;">Level ${level}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; opacity: 0.8;">Rank</div>
                    <div style="font-size: 20px; font-weight: 600;">#1</div>
                </div>
            </div>
            <div class="progress-bar-container" style="margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; opacity: 0.9;">
                    <span>${currentXP.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div style="
                    width: 100%;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    overflow: hidden;
                ">
                    <div style="
                        width: ${progress}%;
                        height: 100%;
                        background: ${progressColor};
                        border-radius: 6px;
                        transition: width 0.3s ease;
                    "></div>
                </div>
            </div>
        </div>
    `;
}

function initializeLeaderboardPreview() {
    const toggle = document.getElementById('leaderboard-preview-toggle');
    const container = document.getElementById('leaderboard-preview');
    
    if (toggle && container) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                updateLeaderboardPreview();
            } else {
                container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Leaderboard preview disabled</p>';
            }
        });
    }
}

function updateLeaderboardPreview() {
    const container = document.getElementById('leaderboard-preview');
    const toggle = document.getElementById('leaderboard-preview-toggle');
    
    if (!container || !toggle?.checked) return;

    const leaderboardData = [
        { rank: 1, username: 'JohnDoe', level: 25, xp: 12500, avatar: 'JD' },
        { rank: 2, username: 'JaneSmith', level: 23, xp: 11200, avatar: 'JS' },
        { rank: 3, username: 'BobWilson', level: 20, xp: 9800, avatar: 'BW' },
        { rank: 4, username: 'AliceBrown', level: 18, xp: 8500, avatar: 'AB' },
        { rank: 5, username: 'CharlieLee', level: 15, xp: 7200, avatar: 'CL' }
    ];

    container.innerHTML = leaderboardData.map((user, index) => {
        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        const medalColor = medalColors[index] || '#4a5568';
        
        return `
            <div class="leaderboard-item flex items-center gap-3 p-3 bg-[#2d3748] rounded-[8px] border border-white/5 hover:border-green-500/30 transition-all">
                <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${medalColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    color: white;
                ">${user.rank}</div>
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                ">${user.avatar}</div>
                <div class="flex-1">
                    <div style="color: white; font-weight: 500; font-size: 14px;">${user.username}</div>
                    <div style="color: #9ca3af; font-size: 12px;">Level ${user.level} • ${user.xp.toLocaleString()} XP</div>
                </div>
            </div>
        `;
    }).join('');
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

    // Add level role functionality
    const addLevelRoleBtn = document.getElementById('add-level-role');
    if (addLevelRoleBtn) {
        addLevelRoleBtn.addEventListener('click', () => {
            // This would open a modal or add a form to add level roles
            console.log('Add level role clicked');
        });
    }
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

