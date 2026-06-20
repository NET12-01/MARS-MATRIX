// ========================================================================
// MARS MATRIX PRO - VERSIÓN COMPLETA CON TAMAÑOS OPTIMIZADOS
// ========================================================================

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 640,
    PLAYER_SPEED: 4.5,
    BULLET_SPEED: 10,
    ENEMY_BULLET_SPEED: 2.8,
    INITIAL_LIVES: 3,
    ABSORB_ENERGY_MAX: 100,
    ABSORB_ENERGY_COST: 25,
    ABSORB_RADIUS: 90,
    ENEMY_SHOOT_DELAY: 120,
    MAX_ENEMY_BULLETS: 30,
    MAX_PARTICLES: 120,
    ENEMIES_PER_WAVE: 3,
    BOSS_HEALTH: [4000, 6500, 9000, 12000, 15000, 19000, 23000, 28000, 34000, 42000, 60000],
    ADMIN_USER: 'admin12',
    ADMIN_PASS: 'mars000',
    SUPPORT_SHIP: { fireRate: 100, bulletSpeed: 7, damage: 2, offsetX: 25, offsetY: -20, color: '#44FF88', maxUses: 3, duration: 600 },
    SHIELD: { maxUses: 2, duration: 300 },
    SPECIAL_ABILITY: { maxUses: 3, cooldown: 600, damage: 50, radius: 150 },
    DIFFICULTY: {
        easy: { label: '🌙 FÁCIL', livesBonus: 2, enemySpeed: 0.7, enemyShootChance: 0.08, bossHealthMult: 0.7 },
        normal: { label: '🌞 NORMAL', livesBonus: 0, enemySpeed: 1.0, enemyShootChance: 0.12, bossHealthMult: 1.0 },
        hard: { label: '☠️ DIFÍCIL', livesBonus: -1, enemySpeed: 1.3, enemyShootChance: 0.20, bossHealthMult: 1.4 }
    },
    SHOP: {
        SHIPS: {
            'player': { name: 'Nave Base', cost: 0, damage: 1, speed: 5, health: 0, img: 'player' },
            'nave1': { name: 'Nave Ágil', cost: 500, damage: 1, speed: 6, health: 0, img: 'nave1', desc: '⚡ +Velocidad' },
            'nave2': { name: 'Nave Tanque', cost: 1000, damage: 1, speed: 4, health: 2, img: 'nave2', desc: '❤️ +2 Vidas' },
            'nave3': { name: 'Nave Élite', cost: 2000, damage: 2, speed: 6, health: 1, img: 'nave3', desc: '⚡ +Daño +Velocidad' }
        },
        UPGRADES: {
            'damage': { name: '⚔️ Daño +1', cost: 300, maxLevel: 5 },
            'speed': { name: '💨 Velocidad +0.5', cost: 200, maxLevel: 5 },
            'lives': { name: '❤️ Vida Extra', cost: 400, maxLevel: 3 },
            'absorb': { name: '🛡️ Absorción +10', cost: 350, maxLevel: 5 },
            'support': { name: '🔫 Apoyo +Daño', cost: 500, maxLevel: 3 },
            'shield': { name: '🛡️ Escudo +1s', cost: 600, maxLevel: 3 },
            'special': { name: '💥 Habilidad Especial', cost: 700, maxLevel: 3 }
        }
    },
    ACHIEVEMENTS: {
        FIRST_BLOOD: { name: 'Primera Sangre', desc: 'Destruye tu primer enemigo', icon: '🔪' },
        CHAIN_MASTER: { name: 'Maestro de Cadenas', desc: 'Logra una cadena de 10', icon: '⛓️' },
        BOSS_SLAYER: { name: 'Matabosses', desc: 'Derrota a tu primer boss', icon: '👾' },
        PERFECT_RUN: { name: 'Carrera Perfecta', desc: 'Completa un nivel sin perder vidas', icon: '⭐' },
        SPEED_DEMON: { name: 'Demonio de Velocidad', desc: 'Completa el nivel 1 en menos de 2 min', icon: '⚡' },
        COLLECTOR: { name: 'Coleccionista', desc: 'Recoge 50 gemas', icon: '💎' },
        SURVIVOR: { name: 'Superviviente', desc: 'Sobrevive 5 oleadas', icon: '🏆' },
        PERFECT_CHAIN: { name: 'Cadena Perfecta', desc: 'Logra una cadena de 20', icon: '🔥' },
        LEGEND: { name: 'Leyenda', desc: 'Completa los 10 niveles', icon: '🌟' },
        ELITE_SLAYER: { name: 'Cazador Élite', desc: 'Derrota 5 jefes', icon: '⚔️' }
    }
};

// ==================== VARIABLES GLOBALES ====================
let canvas, ctx;
let gameState = 'LOGIN';
let score = 0;
let highScore = 0;
let bestLevel = 1;
let lives = 3;
let level = 1;
let wave = 1;
let currentUser = null;
let users = {};
let soundEnabled = true;
let gameLoopId = null;

let player = null;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let gems = [];
let particles = [];
let boss = null;
let bossSupportShips = [];

let chainCount = 0;
let chainTimer = 0;
let maxChain = 0;
let waveTimer = 0;
let enemiesRemaining = 0;

let keys = {};
let levelStartTime = 0;
let noDamageRun = true;
let shootCooldown = 0;
let frameCount = 0;
let difficulty = 'normal';
let comboCount = 0;
let comboDisplayTimer = 0;

let stats = {
    enemiesKilled: 0,
    bossesDefeated: 0,
    gemsCollected: 0,
    levelsCompleted: [],
    damageTaken: 0,
    maxCombo: 0
};

let screenShake = { active: false, intensity: 0, duration: 0 };
let isBossDefeated = false;
let specialMode = null;
let bossRushQueue = [];
let currentBossRushIndex = 0;
let bossPlayerType = 'BOSS1';
let bossPlayerWeapon = { damage: 3, speed: 8, color: '#FF4444', spread: 1 };
let achievements = {};
let shopData = {
    coins: 0,
    selectedShip: 'player',
    ownedShips: ['player'],
    upgrades: { damage: 0, speed: 0, lives: 0, absorb: 0, support: 0, shield: 0, special: 0 }
};

// ===== NAVE DE APOYO (28x28) =====
let supportShip = {
    active: false,
    x: 0, y: 0,
    width: 28,
    height: 28,
    usesLeft: CONFIG.SUPPORT_SHIP.maxUses,
    timer: 0,
    maxTimer: CONFIG.SUPPORT_SHIP.duration,
    bullets: [],
    shootTimer: 0
};

// ===== ESCUDO (radio 45) =====
let shield = {
    active: false,
    usesLeft: CONFIG.SHIELD.maxUses,
    timer: 0,
    maxTimer: CONFIG.SHIELD.duration,
    radius: 45,
    x: 0, y: 0
};

// ===== HABILIDAD ESPECIAL =====
let specialAbility = {
    active: false,
    usesLeft: CONFIG.SPECIAL_ABILITY.maxUses,
    cooldown: 0,
    maxCooldown: CONFIG.SPECIAL_ABILITY.cooldown,
    timer: 0,
    damage: CONFIG.SPECIAL_ABILITY.damage,
    radius: CONFIG.SPECIAL_ABILITY.radius,
    isReady: true
};

// ==================== IMÁGENES ====================
const images = {
    player: new Image(),
    enemy: new Image(),
    boss: new Image(),
    boss2: new Image(),
    boss3: new Image(),
    boss4: new Image(),
    boss5: new Image(),
    navedeapoyo: new Image(),
    nave1: new Image(),
    nave2: new Image(),
    nave3: new Image(),
    muro1: new Image(),
    muro2: new Image(),
    muro3: new Image()
};

const sounds = {};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Mars Matrix PRO');
    initGame();
});

function initGame() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) { setTimeout(initGame, 100); return; }
    
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    
    loadUsers();
    initAudio();
    loadImages();
    setupControls();
    setupUI();
    initAchievements();
    
    showScreen('loginScreen');
    updateSoundButtons();
    requestAnimationFrame(gameLoop);
    console.log('✅ Mars Matrix PRO iniciado');
}

// ==================== AUDIO ====================
function initAudio() {
    try {
        const s = new Audio('sound/soundtrack.mp3');
        s.loop = true;
        s.volume = 0.15;
        sounds.soundtrack = s;
    } catch(e) {}
    
    const soundFiles = {
        shoot: 'shoot.wav',
        enemyshoot: 'enemyshoot.wav',
        explosion: 'explosion.wav',
        powerup: 'powerup.wav',
        gameovervoice: 'gameovervoice.wav',
        victory: 'victory.wav'
    };
    
    Object.entries(soundFiles).forEach(([key, file]) => {
        try {
            sounds[key] = new Audio('sound/' + file);
            sounds[key].volume = 0.25;
        } catch(e) {}
    });
    
    // Sonidos adicionales
    try {
        sounds.bossWarning = new Audio('sound/bossWarning.mp3');
        sounds.bossWarning.volume = 0.35;
        sounds.bossAppear = new Audio('sound/bossAppear.mp3');
        sounds.bossAppear.volume = 0.3;
        sounds.bossPhase = new Audio('sound/bossPhase.mp3');
        sounds.bossPhase.volume = 0.3;
        sounds.specialAbility = new Audio('sound/specialAbility.wav');
        sounds.specialAbility.volume = 0.35;
        sounds.shieldActivate = new Audio('sound/shieldActivate.wav');
        sounds.shieldActivate.volume = 0.25;
        sounds.shieldDeactivate = new Audio('sound/shieldDeactivate.wav');
        sounds.shieldDeactivate.volume = 0.2;
        sounds.levelComplete = new Audio('sound/levelComplete.wav');
        sounds.levelComplete.volume = 0.3;
        sounds.achievement = new Audio('sound/achievement.wav');
        sounds.achievement.volume = 0.35;
        sounds.support = new Audio('sound/powerup.wav');
        sounds.support.volume = 0.2;
        sounds.shield = new Audio('sound/powerup.wav');
        sounds.shield.volume = 0.2;
    } catch(e) {
        createFallbackSounds();
    }
}

function createFallbackSounds() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        sounds.bossWarning = {
            play: function() {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.5);
                    osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 1);
                    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 1.5);
                } catch(e) {}
            },
            volume: 0.35
        };
        sounds.specialAbility = {
            play: function() {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.4);
                } catch(e) {}
            },
            volume: 0.35
        };
        sounds.shieldActivate = {
            play: function() {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                    osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.2);
                } catch(e) {}
            },
            volume: 0.25
        };
        sounds.levelComplete = {
            play: function() {
                try {
                    const notes = [523, 659, 784, 1047];
                    notes.forEach((freq, i) => {
                        setTimeout(() => {
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.type = 'sine';
                            osc.frequency.value = freq;
                            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.start();
                            osc.stop(audioCtx.currentTime + 0.2);
                        }, i * 100);
                    });
                } catch(e) {}
            },
            volume: 0.3
        };
        sounds.achievement = {
            play: function() {
                try {
                    const notes = [523, 659, 784];
                    notes.forEach((freq, i) => {
                        setTimeout(() => {
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.type = 'sine';
                            osc.frequency.value = freq;
                            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.start();
                            osc.stop(audioCtx.currentTime + 0.15);
                        }, i * 80);
                    });
                } catch(e) {}
            },
            volume: 0.35
        };
    } catch(e) {}
}

function playSound(name, volume = 0.25) {
    if (!soundEnabled) return;
    if (!sounds[name]) return;
    try {
        if (sounds[name].play && typeof sounds[name].play === 'function') {
            sounds[name].play();
        } else if (sounds[name].cloneNode) {
            const s = sounds[name].cloneNode();
            s.volume = volume || sounds[name].volume || 0.25;
            s.play().catch(() => {});
        }
    } catch(e) {}
}

function playSoundtrack() {
    if (!soundEnabled || !sounds.soundtrack) return;
    try { sounds.soundtrack.play().catch(() => {}); } catch(e) {}
}

function pauseSoundtrack() {
    if (!sounds.soundtrack) return;
    try { sounds.soundtrack.pause(); } catch(e) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) pauseSoundtrack();
    else playSoundtrack();
    updateSoundButtons();
    saveUsers();
}

function updateSoundButtons() {
    const b = document.getElementById('soundToggle');
    if (b) b.innerHTML = soundEnabled ? '🔊 ON' : '🔇 OFF';
    const m = document.getElementById('muteGameBtn');
    if (m) m.innerHTML = soundEnabled ? '🔊' : '🔇';
}

// ==================== USUARIOS ====================
function loadUsers() {
    try {
        const saved = localStorage.getItem('marsMatrixUsers');
        users = saved ? JSON.parse(saved) : {};
        if (!users[CONFIG.ADMIN_USER]) {
            users[CONFIG.ADMIN_USER] = {
                password: CONFIG.ADMIN_PASS,
                highScore: 0,
                bestLevel: 1,
                coins: 0,
                difficulty: 'normal',
                shop: {
                    selectedShip: 'player',
                    ownedShips: ['player'],
                    upgrades: { damage: 0, speed: 0, lives: 0, absorb: 0, support: 0, shield: 0, special: 0 }
                }
            };
            saveUsers();
        }
    } catch(e) { users = {}; }
}

function saveUsers() {
    try { localStorage.setItem('marsMatrixUsers', JSON.stringify(users)); } catch(e) {}
}

function registerUser(u, p) {
    if (users[u]) return { success: false, message: 'Ya existe' };
    users[u] = {
        password: p,
        highScore: 0,
        bestLevel: 1,
        coins: 0,
        difficulty: 'normal',
        shop: {
            selectedShip: 'player',
            ownedShips: ['player'],
            upgrades: { damage: 0, speed: 0, lives: 0, absorb: 0, support: 0, shield: 0, special: 0 }
        }
    };
    saveUsers();
    return { success: true, message: 'Registrado' };
}

function loginUser(u, p) {
    if (!users[u]) return { success: false, message: 'No existe' };
    if (users[u].password !== p) return { success: false, message: 'Contraseña incorrecta' };
    currentUser = u;
    const user = users[u];
    highScore = user.highScore || 0;
    bestLevel = user.bestLevel || 1;
    difficulty = user.difficulty || 'normal';
    if (user.shop) shopData = user.shop;
    if (user.coins !== undefined) shopData.coins = user.coins;
    return { success: true, message: 'Login exitoso' };
}

function saveUserData() {
    if (currentUser && users[currentUser]) {
        users[currentUser].highScore = Math.max(users[currentUser].highScore || 0, score);
        users[currentUser].bestLevel = Math.max(users[currentUser].bestLevel || 1, level);
        users[currentUser].coins = shopData.coins;
        users[currentUser].difficulty = difficulty;
        users[currentUser].shop = shopData;
        saveUsers();
    }
}

function logout() {
    saveUserData();
    currentUser = null;
    showScreen('loginScreen');
}

// ==================== TIENDA ====================
function getShipStats(id) {
    return CONFIG.SHOP.SHIPS[id] || CONFIG.SHOP.SHIPS['player'];
}

function getUpgradeLevel(t) { return shopData.upgrades[t] || 0; }

function getTotalDamage() {
    return getShipStats(shopData.selectedShip).damage + getUpgradeLevel('damage');
}

function getTotalSpeed() {
    return getShipStats(shopData.selectedShip).speed + getUpgradeLevel('speed') * 0.5;
}

function getTotalLives() {
    const ship = getShipStats(shopData.selectedShip);
    const diffBonus = CONFIG.DIFFICULTY[difficulty]?.livesBonus || 0;
    return CONFIG.INITIAL_LIVES + ship.health + getUpgradeLevel('lives') + diffBonus;
}

function getTotalAbsorb() {
    return CONFIG.ABSORB_ENERGY_MAX + getUpgradeLevel('absorb') * 10;
}

function getSupportDamage() {
    return CONFIG.SUPPORT_SHIP.damage + getUpgradeLevel('support');
}

function getShieldDuration() {
    return CONFIG.SHIELD.duration + getUpgradeLevel('shield') * 60;
}

function getSpecialCooldown() {
    return Math.max(300, CONFIG.SPECIAL_ABILITY.cooldown - getUpgradeLevel('special') * 100);
}

function getSpecialUses() {
    return CONFIG.SPECIAL_ABILITY.maxUses + Math.floor(getUpgradeLevel('special') / 2);
}

function getEnemySpeedMult() {
    return CONFIG.DIFFICULTY[difficulty]?.enemySpeed || 1.0;
}

function getEnemyShootChance() {
    return CONFIG.DIFFICULTY[difficulty]?.enemyShootChance || 0.12;
}

function getBossHealthMult() {
    return CONFIG.DIFFICULTY[difficulty]?.bossHealthMult || 1.0;
}

function buyShip(id) {
    if (shopData.ownedShips.includes(id)) return { success: false, message: 'Ya tienes esta nave' };
    const s = CONFIG.SHOP.SHIPS[id];
    if (!s) return { success: false, message: 'Nave no encontrada' };
    if (shopData.coins < s.cost) return { success: false, message: '💰 Monedas insuficientes' };
    shopData.coins -= s.cost;
    shopData.ownedShips.push(id);
    shopData.selectedShip = id;
    saveUserData();
    updateShopUI();
    return { success: true, message: '✅ Nave comprada' };
}

function selectShip(id) {
    if (!shopData.ownedShips.includes(id)) return { success: false, message: 'No tienes esta nave' };
    shopData.selectedShip = id;
    saveUserData();
    updateShopUI();
    return { success: true, message: '✅ Nave seleccionada' };
}

function buyUpgrade(t) {
    const up = CONFIG.SHOP.UPGRADES[t];
    if (!up) return { success: false, message: 'Mejora no encontrada' };
    const lv = getUpgradeLevel(t);
    if (lv >= up.maxLevel) return { success: false, message: '⚠️ Nivel máximo' };
    const cost = Math.floor(up.cost * (1 + lv * 0.5));
    if (shopData.coins < cost) return { success: false, message: '💰 Insuficiente' };
    shopData.coins -= cost;
    shopData.upgrades[t] = lv + 1;
    saveUserData();
    updateShopUI();
    return { success: true, message: '✅ Mejorado' };
}

function updateShopUI() {
    const el = document.getElementById('shopCoins');
    if (el) el.textContent = '💰 ' + shopData.coins;
    
    document.querySelectorAll('.ship-item').forEach(el => {
        const id = el.dataset.ship;
        const owned = shopData.ownedShips.includes(id);
        const selected = shopData.selectedShip === id;
        const s = CONFIG.SHOP.SHIPS[id];
        const status = el.querySelector('.ship-status');
        const btn = el.querySelector('.ship-btn');
        if (status) {
            status.textContent = selected ? '✅ SELECCIONADA' : owned ? '🔓 PROPIEDAD' : '🔒 COMPRAR';
            status.style.color = selected ? '#00FF00' : owned ? '#00AAFF' : '#FF4444';
        }
        if (btn) {
            if (selected) { btn.textContent = '✅ SELECCIONADA'; btn.disabled = true; btn.style.opacity = '0.6'; }
            else if (owned) { btn.textContent = '🔓 SELECCIONAR'; btn.disabled = false; btn.style.opacity = '1'; }
            else { btn.textContent = '💰 COMPRAR (' + s.cost + ')'; btn.disabled = shopData.coins < s.cost; btn.style.opacity = shopData.coins < s.cost ? '0.5' : '1'; }
        }
    });
    
    document.querySelectorAll('.upgrade-item').forEach(el => {
        const t = el.dataset.upgrade;
        const up = CONFIG.SHOP.UPGRADES[t];
        const lv = getUpgradeLevel(t);
        const cost = Math.floor(up.cost * (1 + lv * 0.5));
        const maxed = lv >= up.maxLevel;
        const levelEl = el.querySelector('.upgrade-level');
        const costEl = el.querySelector('.upgrade-cost');
        const btn = el.querySelector('.upgrade-btn');
        if (levelEl) levelEl.textContent = 'Nivel: ' + lv + '/' + up.maxLevel;
        if (costEl) costEl.textContent = maxed ? '✅ MAX' : '💰 ' + cost;
        if (btn) {
            if (maxed) { btn.textContent = '✅ MAX'; btn.disabled = true; btn.style.opacity = '0.6'; }
            else { btn.textContent = '⬆️ MEJORAR'; btn.disabled = shopData.coins < cost; btn.style.opacity = shopData.coins < cost ? '0.5' : '1'; }
        }
    });
}

// ==================== PANTALLAS ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
    if (['loginScreen', 'registerScreen', 'startScreen', 'howToPlayScreen', 'shopScreen'].includes(id)) {
        playSoundtrack();
    } else {
        pauseSoundtrack();
    }
    if (id === 'shopScreen') updateShopUI();
}

function updateStartScreen() {
    if (!currentUser) return;
    document.getElementById('userDisplayName').textContent = currentUser;
    document.getElementById('highScoreDisplay').textContent = highScore || 0;
    document.getElementById('bestLevel').textContent = bestLevel || 1;
    document.getElementById('enemiesKilledDisplay').textContent = stats.enemiesKilled || 0;
    document.getElementById('userDifficultyDisplay').textContent = CONFIG.DIFFICULTY[difficulty]?.label || '🌞 NORMAL';
    updateLevelButtons();
    updateDifficultyButtons();
    updateAchievementDisplay();
}

function updateDifficultyButtons() {
    document.querySelectorAll('.difficulty-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.diff === difficulty);
    });
}

function updateLevelButtons() {
    const ub = bestLevel || 1;
    for (let i = 1; i <= 10; i++) {
        const btn = document.getElementById('playLevel' + i);
        const card = document.querySelector('.level-card[data-level="' + i + '"]');
        if (btn && card) {
            if (i <= ub) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
                btn.textContent = '🎯 JUGAR';
                btn.disabled = false;
            } else {
                card.classList.remove('unlocked');
                card.classList.add('locked');
                btn.textContent = '🔒 BLOQUEADO';
                btn.disabled = true;
            }
        }
    }
}

// ==================== LOGROS ====================
function initAchievements() {
    achievements = {};
    Object.keys(CONFIG.ACHIEVEMENTS).forEach(k => achievements[k] = false);
    loadAchievements();
}

function loadAchievements() {
    try {
        const saved = localStorage.getItem('marsMatrixAchievements_' + currentUser);
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(achievements).forEach(k => { if (data[k]) achievements[k] = true; });
        }
    } catch(e) {}
}

function saveAchievements() {
    if (!currentUser) return;
    try {
        localStorage.setItem('marsMatrixAchievements_' + currentUser, JSON.stringify(achievements));
    } catch(e) {}
}

function checkAchievements() {
    let unlocked = false;
    const checks = {
        FIRST_BLOOD: () => stats.enemiesKilled >= 1,
        CHAIN_MASTER: () => maxChain >= 10,
        BOSS_SLAYER: () => stats.bossesDefeated >= 1,
        PERFECT_RUN: () => noDamageRun && stats.damageTaken === 0,
        SPEED_DEMON: () => level === 1 && (Date.now() - levelStartTime) < 120000,
        COLLECTOR: () => stats.gemsCollected >= 50,
        SURVIVOR: () => wave >= 5,
        PERFECT_CHAIN: () => maxChain >= 20,
        LEGEND: () => stats.levelsCompleted.length >= 10,
        ELITE_SLAYER: () => stats.bossesDefeated >= 5
    };
    
    Object.entries(checks).forEach(([key, check]) => {
        if (!achievements[key] && check()) {
            achievements[key] = true;
            unlocked = true;
            showAchievementPopup(CONFIG.ACHIEVEMENTS[key]);
            playSound('achievement', 0.35);
        }
    });
    if (unlocked) {
        saveAchievements();
        updateAchievementDisplay();
    }
}

function showAchievementPopup(ach) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div><span class="icon">${ach.icon}</span></div>
        <div class="title">🏆 ¡LOGRO DESBLOQUEADO!</div>
        <div class="name">${ach.name}</div>
        <div class="desc">${ach.desc}</div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 50);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 3500);
}

function updateAchievementDisplay() {
    const total = Object.keys(CONFIG.ACHIEVEMENTS).length;
    const unlocked = Object.values(achievements).filter(a => a).length;
    const el = document.getElementById('achievementsDisplay');
    if (el) el.textContent = unlocked + '/' + total;
}

// ==================== UI EVENTOS ====================
function setupUI() {
    // Login
    document.getElementById('loginButton').addEventListener('click', function() {
        const u = document.getElementById('loginUsername').value.trim();
        const p = document.getElementById('loginPassword').value.trim();
        if (!u || !p) { alert('Completa todos los campos'); return; }
        const r = loginUser(u, p);
        if (r.success) {
            showScreen('startScreen');
            updateStartScreen();
            updateSoundButtons();
            updateShopUI();
            updateAchievementDisplay();
        } else {
            alert('❌ ' + r.message);
        }
    });

    document.getElementById('registerButton').addEventListener('click', function() {
        showScreen('registerScreen');
    });

    document.getElementById('registerSubmit').addEventListener('click', function() {
        const u = document.getElementById('registerUsername').value.trim();
        const p = document.getElementById('registerPassword').value.trim();
        const c = document.getElementById('confirmPassword').value.trim();
        if (!u || !p || !c) { alert('Completa todos los campos'); return; }
        if (p.length < 6) { alert('Mínimo 6 caracteres'); return; }
        if (p !== c) { alert('Las contraseñas no coinciden'); return; }
        const r = registerUser(u, p);
        alert(r.success ? '✅ Usuario registrado' : '❌ ' + r.message);
        if (r.success) showScreen('loginScreen');
    });

    document.getElementById('backToLogin').addEventListener('click', function() {
        showScreen('loginScreen');
    });

    document.getElementById('logoutButton').addEventListener('click', function() {
        logout();
    });

    document.getElementById('howToPlayBtn').addEventListener('click', function() {
        showScreen('howToPlayScreen');
    });

    document.getElementById('soundToggle').addEventListener('click', function() {
        toggleSound();
    });

    document.getElementById('backFromHowToPlay').addEventListener('click', function() {
        showScreen('startScreen');
        updateStartScreen();
    });

    document.getElementById('shopButton').addEventListener('click', function() {
        showScreen('shopScreen');
        updateShopUI();
    });

    document.getElementById('closeShop').addEventListener('click', function() {
        showScreen('startScreen');
        updateStartScreen();
    });

    // Pantalla completa
    document.getElementById('fullscreenBtn').addEventListener('click', function() {
        toggleFullscreen();
    });

    // Dificultad
    document.querySelectorAll('.difficulty-btn').forEach(b => {
        b.addEventListener('click', function() {
            difficulty = this.dataset.diff;
            if (currentUser && users[currentUser]) {
                users[currentUser].difficulty = difficulty;
                saveUsers();
            }
            updateStartScreen();
            playSound('powerup', 0.2);
        });
    });

    // Naves en tienda
    document.querySelectorAll('.ship-btn').forEach(b => {
        b.addEventListener('click', function() {
            const id = this.closest('.ship-item').dataset.ship;
            const r = shopData.ownedShips.includes(id) ? selectShip(id) : buyShip(id);
            alert(r.message);
            updateShopUI();
        });
    });

    // Mejoras en tienda
    document.querySelectorAll('.upgrade-btn').forEach(b => {
        b.addEventListener('click', function() {
            const t = this.closest('.upgrade-item').dataset.upgrade;
            const r = buyUpgrade(t);
            alert(r.message);
            updateShopUI();
        });
    });

    // Niveles
    for (let i = 1; i <= 10; i++) {
        document.getElementById('playLevel' + i).addEventListener('click', function() {
            specialMode = null;
            startGame(i);
        });
    }

    // Modos especiales
    document.getElementById('playBossRush').addEventListener('click', function() {
        startBossRush();
    });

    document.getElementById('playBossPlayer').addEventListener('click', function() {
        startBossPlayer();
    });

    document.querySelectorAll('.boss-select-btn').forEach(b => {
        b.addEventListener('click', function() {
            document.querySelectorAll('.boss-select-btn').forEach(x => x.classList.remove('selected'));
            this.classList.add('selected');
            bossPlayerType = this.dataset.boss;
            const bossWeapons = {
                'BOSS1': { damage: 3, speed: 8, color: '#FF4444', spread: 1 },
                'BOSS2': { damage: 4, speed: 10, color: '#44FF44', spread: 2 },
                'BOSS3': { damage: 5, speed: 12, color: '#AA44FF', spread: 3 },
                'BOSS4': { damage: 6, speed: 14, color: '#FFD700', spread: 4 },
                'BOSS5': { damage: 8, speed: 16, color: '#FF00FF', spread: 5 }
            };
            bossPlayerWeapon = bossWeapons[bossPlayerType] || bossWeapons['BOSS1'];
            document.getElementById('bossPlayerPreview').textContent = '👾 ' + this.querySelector('.boss-select-name').textContent + ' seleccionado';
        });
    });

    // Controles de juego
    document.getElementById('supportBtn').addEventListener('click', function() { activateSupportShip(); });
    document.getElementById('shieldBtn').addEventListener('click', function() { activateShield(); });
    document.getElementById('abilityBtn').addEventListener('click', function() { activateSpecialAbility(); });
    document.getElementById('pauseGameBtn').addEventListener('click', function() { togglePause(); });
    document.getElementById('muteGameBtn').addEventListener('click', function() { toggleSound(); });
    document.getElementById('resumeGameBtn').addEventListener('click', function() { togglePause(); });
    document.getElementById('restartFromPauseBtn').addEventListener('click', function() {
        if (specialMode === 'boss_rush') startBossRush();
        else if (specialMode === 'boss_player') startBossPlayer();
        else restartGame();
        togglePause();
    });
    document.getElementById('quitToMenuBtn').addEventListener('click', function() {
        gameState = 'IDLE';
        specialMode = null;
        showScreen('startScreen');
        updateStartScreen();
    });
    document.getElementById('restart-btn').addEventListener('click', function() {
        if (specialMode === 'boss_rush') startBossRush();
        else if (specialMode === 'boss_player') startBossPlayer();
        else restartGame();
    });
    document.getElementById('menu-btn').addEventListener('click', function() {
        gameState = 'IDLE';
        specialMode = null;
        showScreen('startScreen');
        updateStartScreen();
    });
    document.getElementById('continueBtn').addEventListener('click', function() {
        document.getElementById('level-complete').style.display = 'none';
        if (gameState === 'PLAYING') {
            level++;
            wave = 1;
            lives = Math.min(lives + 1, getTotalLives());
            supportShip.usesLeft = CONFIG.SUPPORT_SHIP.maxUses;
            shield.usesLeft = CONFIG.SHIELD.maxUses;
            specialAbility.usesLeft = getSpecialUses();
            specialAbility.cooldown = 0;
            supportShip.active = false;
            supportShip.bullets = [];
            shield.active = false;
            specialAbility.active = false;
            noDamageRun = true;
            stats.damageTaken = 0;
            startWave();
            updateHUD();
            createTextParticle(canvas.width / 2, canvas.height / 2, '🎯 NIVEL ' + level, '#00FFAA', 28);
            updateWaveProgress();
        }
    });

    setupTouchControls();
}

function toggleFullscreen() {
    const btn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            btn.innerHTML = '⛔ SALIR PANTALLA COMPLETA';
            btn.style.borderColor = '#FF4444';
        }).catch(() => {});
    } else {
        document.exitFullscreen().then(() => {
            btn.innerHTML = '🖥️ PANTALLA COMPLETA';
            btn.style.borderColor = '#4488FF';
        }).catch(() => {});
    }
}

document.addEventListener('fullscreenchange', function() {
    const btn = document.getElementById('fullscreenBtn');
    if (btn) {
        if (document.fullscreenElement) {
            btn.innerHTML = '⛔ SALIR PANTALLA COMPLETA';
            btn.style.borderColor = '#FF4444';
        } else {
            btn.innerHTML = '🖥️ PANTALLA COMPLETA';
            btn.style.borderColor = '#4488FF';
        }
    }
});

function setupTouchControls() {
    const map = {
        'moveLeft': 'ArrowLeft', 'moveRight': 'ArrowRight',
        'moveUp': 'ArrowUp', 'moveDown': 'ArrowDown',
        'shootBtn': ' ', 'specialBtn': 'Shift'
    };
    Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', function(e) { e.preventDefault(); keys[key] = true; }, { passive: false });
        el.addEventListener('touchend', function(e) { e.preventDefault(); keys[key] = false; }, { passive: false });
        el.addEventListener('touchcancel', function(e) { e.preventDefault(); keys[key] = false; }, { passive: false });
        el.addEventListener('mousedown', function() { keys[key] = true; });
        el.addEventListener('mouseup', function() { keys[key] = false; });
        el.addEventListener('mouseleave', function() { keys[key] = false; });
    });
}

function setupControls() {
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        if (gameState === 'PLAYING' && (e.key === 'p' || e.key === 'P')) togglePause();
        if (gameState === 'PLAYING' && (e.key === 'z' || e.key === 'Z' || e.key === 'Shift')) {
            if (player && player.absorbEnergy >= CONFIG.ABSORB_ENERGY_COST && !player.isAbsorbing) {
                player.isAbsorbing = true;
                playSound('powerup', 0.2);
            }
        }
        if (gameState === 'PLAYING' && (e.key === 'f' || e.key === 'F')) activateSupportShip();
        if (gameState === 'PLAYING' && (e.key === 'g' || e.key === 'G')) activateShield();
        if (gameState === 'PLAYING' && (e.key === 'x' || e.key === 'X')) activateSpecialAbility();
    });

    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
        if (gameState === 'PLAYING' && (e.key === 'z' || e.key === 'Z' || e.key === 'Shift')) {
            if (player && player.isAbsorbing) {
                player.isAbsorbing = false;
                player.absorbEnergy -= CONFIG.ABSORB_ENERGY_COST;
                player.weaponLevel = Math.min(3, player.weaponLevel + 1);
                player.powerTimer = 600;
                playSound('powerup', 0.2);
            }
        }
    });
}

// ==================== IMÁGENES ====================
function loadImages() {
    const paths = {
        player: 'img/player.png',
        enemy: 'img/enemy.png',
        boss: 'img/boss.png',
        boss2: 'img/boss2.png',
        boss3: 'img/boss3.png',
        boss4: 'img/boss4.png',
        boss5: 'img/boss5.png',
        navedeapoyo: 'img/navedeapoyo.png',
        nave1: 'img/nave1.png',
        nave2: 'img/nave2.png',
        nave3: 'img/nave3.png',
        muro1: 'img/muro1.png',
        muro2: 'img/muro2.png',
        muro3: 'img/muro3.png'
    };
    Object.entries(paths).forEach(([k, p]) => {
        images[k].src = p;
        images[k].onerror = function() {
            const c = document.createElement('canvas');
            c.width = 64;
            c.height = 64;
            const cx = c.getContext('2d');
            const colors = {
                player: '#00FFFF', enemy: '#FF4444',
                boss: '#FF0000', boss2: '#00AAFF', boss3: '#AA00FF', boss4: '#FFAA00', boss5: '#FF00FF',
                navedeapoyo: '#44FF88', nave1: '#44FF88', nave2: '#FF8844', nave3: '#FF44FF',
                muro1: '#4488FF', muro2: '#44FF88', muro3: '#FF8844'
            };
            cx.fillStyle = colors[k] || '#FFFFFF';
            cx.fillRect(0, 0, 64, 64);
            cx.fillStyle = '#000000';
            cx.font = 'bold 12px Arial';
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText(k.toUpperCase(), 32, 32);
            images[k].src = c.toDataURL();
        };
    });
}

// ==================== ENTIDADES (TAMAÑOS OPTIMIZADOS) ====================
function createPlayer() {
    const s = getShipStats(shopData.selectedShip);
    return {
        x: canvas.width / 2 - 18,
        y: canvas.height - 100,
        width: 36,
        height: 36,
        speed: getTotalSpeed(),
        absorbEnergy: getTotalAbsorb(),
        isAbsorbing: false,
        weaponType: 'NORMAL',
        weaponLevel: 0,
        powerTimer: 0,
        lastShot: 0,
        invincible: false,
        invincibleTimer: 0,
        shipId: shopData.selectedShip,
        trail: [],
        damageBonus: getUpgradeLevel('damage'),
        extraLives: s.health || 0
    };
}

function createBossPlayer() {
    const bossData = {
        'BOSS1': { img: 'boss', color: '#FF4444', size: 1.5, label: 'BOSS 1' },
        'BOSS2': { img: 'boss2', color: '#44FF44', size: 1.5, label: 'BOSS 2' },
        'BOSS3': { img: 'boss3', color: '#AA44FF', size: 1.5, label: 'BOSS 3' },
        'BOSS4': { img: 'boss4', color: '#FFD700', size: 1.5, label: 'BOSS 4' },
        'BOSS5': { img: 'boss5', color: '#FF00FF', size: 1.8, label: '🔥 FUSIÓN' }
    };
    const b = bossData[bossPlayerType] || bossData['BOSS1'];
    const size = 48 * b.size;
    return {
        x: canvas.width / 2 - size / 2,
        y: canvas.height - 100,
        width: size,
        height: size,
        speed: CONFIG.PLAYER_SPEED * 0.7,
        absorbEnergy: CONFIG.ABSORB_ENERGY_MAX,
        isAbsorbing: false,
        weaponType: 'BOSS',
        weaponLevel: 3,
        powerTimer: 0,
        lastShot: 0,
        invincible: false,
        invincibleTimer: 0,
        imgKey: b.img,
        color: b.color,
        label: b.label,
        isBoss: true,
        size: b.size,
        trail: []
    };
}

function createBullet(x, y, vx, vy, damage = 1, color = '#00FFFF', size = 1) {
    return { x, y, width: 4 * size, height: 12 * size, vx: vx || 0, vy: vy || -CONFIG.BULLET_SPEED, damage, color, active: true, size };
}

function createEnemy(type, x, y) {
    const types = {
        SMALL: { points: 100, health: 1, speed: 0.8, width: 28, height: 28 },
        MEDIUM: { points: 200, health: 2, speed: 0.6, width: 36, height: 36 },
        LARGE: { points: 500, health: 4, speed: 0.4, width: 52, height: 52 }
    };
    const t = types[type] || types.SMALL;
    const speedMult = getEnemySpeedMult();
    return {
        x, y,
        width: t.width, height: t.height,
        type: type,
        health: t.health + Math.floor((level - 1) * 0.2),
        maxHealth: t.health + Math.floor((level - 1) * 0.2),
        speed: (t.speed + (level - 1) * 0.02) * speedMult,
        points: t.points + (level - 1) * 20,
        shootTimer: 40 + Math.random() * 60,
        shootChance: getEnemyShootChance(),
        movePattern: Math.floor(Math.random() * 3),
        patternTimer: 0,
        active: true,
        hitFlash: 0,
        trail: []
    };
}

// ==================== BOSSES CON PODERES ÚNICOS ====================
function createBossEntity(levelIndex) {
    const lvl = levelIndex || level;
    
    const bossConfigs = {
        1: { 
            color: '#FF4444', desc: 'SEÑOR DE ENJAMBRES', 
            health: CONFIG.BOSS_HEALTH[0] * getBossHealthMult(), 
            img: 'boss', 
            phase2: 0.66, phase3: 0.33, phase4: 0.15,
            movePattern: 'zigzag',
            attackType: 'spread',
            special: 'summon_swarm',
            speed: 1.0,
            bulletSpeed: 2.5,
            bulletCount: 5
        },
        2: { 
            color: '#44FF44', desc: 'DESTRUCTOR GALÁCTICO', 
            health: CONFIG.BOSS_HEALTH[1] * getBossHealthMult(), 
            img: 'boss2', 
            phase2: 0.70, phase3: 0.35, phase4: 0.15,
            movePattern: 'horizontal',
            attackType: 'laser',
            special: 'laser_wall',
            speed: 1.2,
            bulletSpeed: 4.0,
            bulletCount: 3
        },
        3: { 
            color: '#AA44FF', desc: 'ARAÑA CÓSMICA', 
            health: CONFIG.BOSS_HEALTH[2] * getBossHealthMult(), 
            img: 'boss3', 
            phase2: 0.65, phase3: 0.30, phase4: 0.15,
            movePattern: 'circle',
            attackType: 'web',
            special: 'web_trap',
            speed: 1.3,
            bulletSpeed: 2.0,
            bulletCount: 8
        },
        4: { 
            color: '#FFAA00', desc: 'EMPERADOR OSCURO', 
            health: CONFIG.BOSS_HEALTH[3] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.60, phase3: 0.25, phase4: 0.15,
            movePattern: 'random',
            attackType: 'explosion',
            special: 'dark_absorb',
            speed: 1.5,
            bulletSpeed: 3.0,
            bulletCount: 12
        },
        5: { 
            color: '#FF44FF', desc: 'AVATAR DEL CAOS', 
            health: CONFIG.BOSS_HEALTH[4] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.65, phase3: 0.30, phase4: 0.15,
            movePattern: 'chaos',
            attackType: 'chaos',
            special: 'phase_shift',
            speed: 1.8,
            bulletSpeed: 3.5,
            bulletCount: 10
        },
        6: { 
            color: '#44FFFF', desc: 'SEÑOR DE TORMENTAS', 
            health: CONFIG.BOSS_HEALTH[5] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.60, phase3: 0.25, phase4: 0.15,
            movePattern: 'wave',
            attackType: 'lightning',
            special: 'storm_cloud',
            speed: 1.4,
            bulletSpeed: 5.0,
            bulletCount: 8
        },
        7: { 
            color: '#FF8844', desc: 'GUARDIÁN ÉLITE', 
            health: CONFIG.BOSS_HEALTH[6] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.55, phase3: 0.20, phase4: 0.15,
            movePattern: 'defensive',
            attackType: 'shield_orb',
            special: 'reflect',
            speed: 0.8,
            bulletSpeed: 2.0,
            bulletCount: 6
        },
        8: { 
            color: '#FF44AA', desc: 'EJECUTOR CÓSMICO', 
            health: CONFIG.BOSS_HEALTH[7] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.50, phase3: 0.20, phase4: 0.15,
            movePattern: 'aggressive',
            attackType: 'execution',
            special: 'mark',
            speed: 2.0,
            bulletSpeed: 4.5,
            bulletCount: 15
        },
        9: { 
            color: '#AAFF44', desc: 'SEÑOR DE LA NADA', 
            health: CONFIG.BOSS_HEALTH[8] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.50, phase3: 0.15, phase4: 0.15,
            movePattern: 'teleport',
            attackType: 'void',
            special: 'invisibility',
            speed: 1.0,
            bulletSpeed: 1.5,
            bulletCount: 4
        },
        10: { 
            color: '#FFD700', desc: '⭐⭐ LEGADO GALÁCTICO ⭐⭐', 
            health: CONFIG.BOSS_HEALTH[9] * getBossHealthMult(), 
            img: 'boss4', 
            phase2: 0.45, phase3: 0.15, phase4: 0.10,
            movePattern: 'all',
            attackType: 'legacy',
            special: 'final_fury',
            speed: 2.2,
            bulletSpeed: 3.5,
            bulletCount: 20
        },
        11: { 
            color: '#FF00FF', desc: '🔥 FUSIÓN SUPREMA 🔥', 
            health: CONFIG.BOSS_HEALTH[10] * getBossHealthMult(), 
            img: 'boss5', 
            phase2: 0.60, phase3: 0.25, phase4: 0.10,
            movePattern: 'all',
            attackType: 'fusion',
            special: 'supernova',
            speed: 2.5,
            bulletSpeed: 4.0,
            bulletCount: 25,
            isFusion: true
        }
    };
    
    const config = bossConfigs[lvl] || bossConfigs[1];
    
    const isFusion = lvl === 11;
    const width = isFusion ? 170 : 150;
    const height = isFusion ? 170 : 150;
    
    return {
        x: canvas.width / 2 - width / 2,
        y: -160,
        width: width,
        height: height,
        health: config.health,
        maxHealth: config.health,
        phase: 1,
        attackTimer: 60,
        moveTimer: 0,
        targetX: canvas.width / 2 - width / 2,
        targetY: 50,
        entering: true,
        enterY: 50,
        active: true,
        config: config,
        color: config.color,
        description: config.desc,
        imgKey: config.img,
        invincible: false,
        invincibleTimer: 0,
        supportShips: [],
        supportShipsSpawned: false,
        patternIndex: 0,
        phase2Health: config.phase2,
        phase3Health: config.phase3,
        phase4Health: config.phase4,
        isFusion: isFusion,
        attackSpeed: 1,
        specialTimer: 0,
        isInvisible: false,
        teleportTimer: 0,
        markTarget: null,
        reflectActive: false,
        spawnTimer: 0,
        rotation: 0,
        oscillation: 0
    };
}

// ==================== NAVE DE APOYO ====================
function activateSupportShip() {
    if (specialMode === 'boss_rush' || specialMode === 'boss_player') return;
    if (!player || gameState !== 'PLAYING') return;
    if (supportShip.active) return;
    if (supportShip.usesLeft <= 0) {
        createTextParticle(canvas.width / 2, canvas.height / 2 - 50, '⚠️ SIN USOS', '#FF4444', 20);
        return;
    }

    supportShip.active = true;
    supportShip.usesLeft--;
    supportShip.timer = supportShip.maxTimer;
    supportShip.x = player.x + player.width + CONFIG.SUPPORT_SHIP.offsetX;
    supportShip.y = player.y + CONFIG.SUPPORT_SHIP.offsetY;
    supportShip.bullets = [];

    playSound('support', 0.2);
    createTextParticle(player.x + player.width / 2, player.y - 30, '🚀 APOYO ACTIVADO!', '#44FF88', 18);
    updateSupportDisplay();
}

function updateSupportShip() {
    if (!player || !supportShip.active) {
        if (supportShip.active) {
            supportShip.active = false;
            supportShip.bullets = [];
        }
        return;
    }

    supportShip.timer--;
    if (supportShip.timer <= 0) {
        supportShip.active = false;
        supportShip.bullets = [];
        createTextParticle(player.x + player.width / 2, player.y - 30, '⏱️ APOYO TERMINADO', '#FF8844', 14);
        updateSupportDisplay();
        return;
    }

    supportShip.x += ((player.x + player.width + CONFIG.SUPPORT_SHIP.offsetX) - supportShip.x) * 0.1;
    supportShip.y += ((player.y + CONFIG.SUPPORT_SHIP.offsetY) - supportShip.y) * 0.1;

    supportShip.shootTimer = (supportShip.shootTimer || 0) - 1;
    if (supportShip.shootTimer <= 0) {
        let tx = player.x + player.width / 2;
        let ty = -50;
        let found = false;
        let minD = Infinity;

        for (const e of enemies) {
            const dx = e.x + e.width / 2 - supportShip.x;
            const dy = e.y + e.height / 2 - supportShip.y;
            const d = dx * dx + dy * dy;
            if (d < minD) {
                minD = d;
                tx = e.x + e.width / 2;
                ty = e.y + e.height / 2;
                found = true;
            }
        }

        if (boss && boss.active) {
            const dx = boss.x + boss.width / 2 - supportShip.x;
            const dy = boss.y + boss.height / 2 - supportShip.y;
            if (dx * dx + dy * dy < 400 * 400) {
                tx = boss.x + boss.width / 2;
                ty = boss.y + boss.height / 2;
                found = true;
            }
        }

        let angle = -Math.PI / 2;
        if (found) angle = Math.atan2(ty - supportShip.y, tx - supportShip.x);

        const speed = CONFIG.SUPPORT_SHIP.bulletSpeed + getUpgradeLevel('support') * 0.5;
        const damage = getSupportDamage();

        supportShip.bullets.push({
            x: supportShip.x + 8,
            y: supportShip.y + 4,
            width: 6,
            height: 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: damage,
            color: CONFIG.SUPPORT_SHIP.color,
            active: true
        });

        supportShip.shootTimer = CONFIG.SUPPORT_SHIP.fireRate - getUpgradeLevel('support') * 5;
        supportShip.shootTimer = Math.max(supportShip.shootTimer, 30);
    }

    for (let i = supportShip.bullets.length - 1; i >= 0; i--) {
        const b = supportShip.bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.y < -50 || b.x < -50 || b.x > canvas.width + 50) {
            supportShip.bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (rectCollision(b, enemies[j])) {
                enemies[j].health -= b.damage;
                hit = true;
                enemies[j].hitFlash = 4;
                if (enemies[j].health <= 0) {
                    const e = enemies[j];
                    const bonus = addToChain(e.points);
                    score += e.points + bonus;
                    stats.enemiesKilled++;
                    createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#44FF88', 12);
                    playSound('explosion', 0.15);
                    if (Math.random() < 0.15) spawnGem(e.x + e.width / 2, e.y + e.height / 2);
                    createTextParticle(e.x + e.width / 2, e.y - 5, '+' + (e.points + bonus), '#44FF88', 9);
                    enemies.splice(j, 1);
                    enemiesRemaining--;
                }
                break;
            }
        }

        if (!hit && boss && boss.active && !boss.invincible && rectCollision(b, boss)) {
            boss.health -= b.damage;
            hit = true;
            createExplosion(b.x, b.y, '#44FF88', 4);
        }

        if (hit) supportShip.bullets.splice(i, 1);
    }

    updateSupportDisplay();
}

function updateSupportDisplay() {
    const el = document.getElementById('support-display');
    if (!el) return;
    const uses = supportShip.usesLeft;
    const bars = '■'.repeat(Math.max(0, uses)) + '□'.repeat(Math.max(0, CONFIG.SUPPORT_SHIP.maxUses - uses));
    const status = supportShip.active ? ' [' + Math.ceil(supportShip.timer / 60) + 's]' : '';
    el.textContent = '🛸 APOYO: ' + bars + ' (' + uses + ')' + status;
    el.style.color = supportShip.active ? '#44FF88' : uses > 0 ? '#FFAA00' : '#FF4444';
}

// ==================== ESCUDO ====================
function activateShield() {
    if (specialMode === 'boss_rush' || specialMode === 'boss_player') return;
    if (!player || gameState !== 'PLAYING') return;
    if (shield.active) return;
    if (shield.usesLeft <= 0) {
        createTextParticle(canvas.width / 2, canvas.height / 2 - 50, '⚠️ SIN ESCUDOS', '#4488FF', 20);
        return;
    }

    shield.active = true;
    shield.usesLeft--;
    shield.timer = getShieldDuration();
    shield.x = player.x + player.width / 2;
    shield.y = player.y + player.height / 2;

    playSound('shieldActivate', 0.2);
    createTextParticle(player.x + player.width / 2, player.y - 30, '🛡️ ESCUDO ACTIVADO!', '#4488FF', 18);
    updateShieldDisplay();
}

function updateShield() {
    if (!player || !shield.active) {
        if (shield.active) {
            shield.active = false;
            playSound('shieldDeactivate', 0.15);
        }
        return;
    }

    shield.timer--;
    shield.x = player.x + player.width / 2;
    shield.y = player.y + player.height / 2;

    if (shield.timer <= 0) {
        shield.active = false;
        createTextParticle(player.x + player.width / 2, player.y - 30, '⏱️ ESCUDO TERMINADO', '#4488FF', 14);
        updateShieldDisplay();
        return;
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (distance(shield.x, shield.y, b.x + b.width / 2, b.y + b.height / 2) < shield.radius) {
            createExplosion(b.x, b.y, '#4488FF', 5);
            enemyBullets.splice(i, 1);
            playSound('absorb', 0.1);
        }
    }

    updateShieldDisplay();
}

function updateShieldDisplay() {
    const el = document.getElementById('shield-display');
    if (!el) return;
    const uses = shield.usesLeft;
    const bars = '■'.repeat(Math.max(0, uses)) + '□'.repeat(Math.max(0, CONFIG.SHIELD.maxUses - uses));
    const status = shield.active ? ' [' + Math.ceil(shield.timer / 60) + 's]' : '';
    el.textContent = '🛡️ ESCUDO: ' + bars + ' (' + uses + ')' + status;
    el.style.color = shield.active ? '#4488FF' : uses > 0 ? '#FFAA00' : '#FF4444';
}

// ==================== HABILIDAD ESPECIAL ====================
function activateSpecialAbility() {
    if (specialMode === 'boss_rush' || specialMode === 'boss_player') return;
    if (!player || gameState !== 'PLAYING') return;
    if (specialAbility.active) return;
    if (specialAbility.usesLeft <= 0) {
        createTextParticle(canvas.width / 2, canvas.height / 2 - 50, '⚠️ SIN HABILIDAD', '#FF44FF', 20);
        return;
    }
    if (specialAbility.cooldown > 0) {
        createTextParticle(canvas.width / 2, canvas.height / 2 - 50, '⏳ ENFRIAMIENTO', '#FF44FF', 16);
        return;
    }

    specialAbility.active = true;
    specialAbility.usesLeft--;
    specialAbility.timer = 20;
    specialAbility.cooldown = getSpecialCooldown();
    specialAbility.x = player.x + player.width / 2;
    specialAbility.y = player.y + player.height / 2;

    playSound('specialAbility', 0.35);
    createTextParticle(player.x + player.width / 2, player.y - 40, '💥 EXPLOSIÓN DE ENERGÍA!', '#FF44FF', 22);
    
    const radius = CONFIG.SPECIAL_ABILITY.radius + getUpgradeLevel('special') * 10;
    const damage = CONFIG.SPECIAL_ABILITY.damage + getUpgradeLevel('special') * 15;
    
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (distance(specialAbility.x, specialAbility.y, b.x + b.width / 2, b.y + b.height / 2) < radius) {
            createExplosion(b.x, b.y, '#FF44FF', 5);
            enemyBullets.splice(i, 1);
        }
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (distance(specialAbility.x, specialAbility.y, e.x + e.width / 2, e.y + e.height / 2) < radius) {
            e.health -= damage;
            e.hitFlash = 10;
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#FF44FF', 10);
            if (e.health <= 0) {
                const bonus = addToChain(e.points);
                score += e.points + bonus;
                stats.enemiesKilled++;
                createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#FF44FF', 20);
                playSound('explosion', 0.2);
                if (Math.random() < 0.2) spawnGem(e.x + e.width / 2, e.y + e.height / 2);
                enemies.splice(i, 1);
                enemiesRemaining--;
            }
        }
    }
    
    if (boss && boss.active && !boss.invincible) {
        const dist = distance(specialAbility.x, specialAbility.y, boss.x + boss.width / 2, boss.y + boss.height / 2);
        if (dist < radius + boss.width / 2) {
            boss.health -= damage * 0.5;
            createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#FF44FF', 30, 1.5);
            screenShake.active = true;
            screenShake.intensity = 10;
            screenShake.duration = 15;
        }
    }
    
    for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * radius;
        particles.push({
            x: specialAbility.x + Math.cos(a) * d,
            y: specialAbility.y + Math.sin(a) * d,
            vx: Math.cos(a) * 2,
            vy: Math.sin(a) * 2,
            radius: Math.random() * 4 + 2,
            color: '#FF44FF',
            life: 20 + Math.random() * 20,
            maxLife: 40,
            type: 'explosion',
            glow: true
        });
    }
    
    screenShake.active = true;
    screenShake.intensity = 15;
    screenShake.duration = 20;
    
    specialAbility.active = false;
    updateSpecialDisplay();
    checkAchievements();
}

function updateSpecialDisplay() {
    const el = document.getElementById('special-ability');
    if (!el) return;
    const uses = specialAbility.usesLeft;
    const bars = '■'.repeat(Math.max(0, uses)) + '□'.repeat(Math.max(0, getSpecialUses() - uses));
    const cooldown = specialAbility.cooldown > 0 ? ' [' + Math.ceil(specialAbility.cooldown / 60) + 's]' : ' [✅]';
    el.textContent = '💥 ESPECIAL: ' + bars + cooldown;
    el.style.color = specialAbility.cooldown > 0 ? '#FF8800' : uses > 0 ? '#FF44FF' : '#FF4444';
}

// ==================== BOSS SUPPORT SHIPS ====================
function spawnBossSupportShips() {
    if (specialMode === 'boss_rush' || specialMode === 'boss_player') return;
    if (!boss || !boss.active || boss.supportShipsSpawned) return;
    if (boss.health / boss.maxHealth > boss.phase2Health) return;

    boss.supportShipsSpawned = true;
    const count = 3 + Math.floor(level / 3);
    for (let i = 0; i < Math.min(count, 5); i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const d = 80 + Math.random() * 30;
        boss.supportShips.push({
            x: boss.x + boss.width / 2 + Math.cos(a) * d - 16,
            y: boss.y + boss.height / 2 + Math.sin(a) * d - 16,
            width: 32,
            height: 32,
            health: 3 + Math.floor(level / 2),
            maxHealth: 3 + Math.floor(level / 2),
            angle: a,
            dist: d,
            speed: 0.02 + Math.random() * 0.01,
            shootTimer: 60 + Math.random() * 60,
            active: true,
            hitFlash: 0,
            rotation: 0
        });
    }
    createTextParticle(boss.x + boss.width / 2, boss.y - 40, '🛸 ¡NAVES DE APOYO!', '#FF4444', 18);
}

function updateBossSupportShips() {
    if (!boss || !boss.active) {
        boss.supportShips = [];
        return;
    }

    const hp = boss.health / boss.maxHealth;
    if (hp < boss.phase2Health && !boss.supportShipsSpawned) {
        spawnBossSupportShips();
    }

    for (let i = boss.supportShips.length - 1; i >= 0; i--) {
        const s = boss.supportShips[i];
        if (!s.active) {
            boss.supportShips.splice(i, 1);
            continue;
        }

        s.rotation += 0.02;
        if (s.hitFlash > 0) s.hitFlash--;

        s.angle += s.speed;
        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height / 2;
        s.x = cx + Math.cos(s.angle) * s.dist - s.width / 2;
        s.y = cy + Math.sin(s.angle) * s.dist - s.height / 2;

        s.shootTimer--;
        if (s.shootTimer <= 0 && player) {
            const dx = player.x + player.width / 2 - (s.x + s.width / 2);
            const dy = player.y + player.height / 2 - (s.y + s.height / 2);
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0) {
                enemyBullets.push(createBullet(
                    s.x + s.width / 2 - 3,
                    s.y + s.height / 2 - 3,
                    (dx / d) * 2.5,
                    (dy / d) * 2.5,
                    1,
                    '#FF8844'
                ));
                playSound('enemyshoot', 0.1);
            }
            s.shootTimer = 80 + Math.random() * 60;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (rectCollision(bullets[j], s)) {
                s.health -= bullets[j].damage;
                s.hitFlash = 4;
                bullets.splice(j, 1);
                if (s.health <= 0) {
                    s.active = false;
                    score += 200;
                    createExplosion(s.x + s.width / 2, s.y + s.height / 2, '#FF8844', 20);
                    playSound('explosion', 0.2);
                    createTextParticle(s.x + s.width / 2, s.y - 10, '+200', '#FFD700', 14);
                    boss.supportShips.splice(i, 1);
                    break;
                }
            }
        }
    }
}

// ==================== PARTÍCULAS ====================
function createExplosion(x, y, color, count = 15, size = 1) {
    if (particles.length > CONFIG.MAX_PARTICLES) return;
    for (let i = 0; i < Math.min(count, CONFIG.MAX_PARTICLES - particles.length); i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (Math.random() * 4 + 1) * size;
        particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            radius: (Math.random() * 3 + 1) * size,
            color: color,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            type: 'explosion',
            glow: true
        });
    }
    if (size > 1.5) {
        screenShake.active = true;
        screenShake.intensity = 5 * size;
        screenShake.duration = 10;
    }
}

function createTextParticle(x, y, text, color = '#FFFFFF', size = 14) {
    particles.push({
        x, y,
        text,
        color,
        fontSize: size,
        vx: 0,
        vy: -1.5,
        life: 30,
        maxLife: 30,
        type: 'text'
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        if (p.type === 'text') p.vy = (p.vy || -1.5) * 0.96;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ==================== COLISIONES ====================
function rectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ==================== CADENAS ====================
function addToChain(points) {
    chainCount++;
    chainTimer = 90;
    if (chainCount > maxChain) maxChain = chainCount;
    if (chainCount > stats.maxCombo) stats.maxCombo = chainCount;

    const multipliers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const idx = Math.min(chainCount - 1, 9);
    const bonus = points * (multipliers[idx] - 1);

    if (chainCount >= 5) {
        comboCount = chainCount;
        comboDisplayTimer = 60;
        const comboColors = ['#FFAA00', '#FF8800', '#FF4400', '#FF00FF', '#FF0000'];
        const color = comboColors[Math.min(Math.floor(chainCount / 5), comboColors.length - 1)];
        createTextParticle(player.x + player.width / 2, player.y - 40,
            '🔥 COMBO x' + chainCount + '!', color, 16 + Math.min(chainCount, 10));
        if (chainCount % 10 === 0) {
            playSound('powerup', 0.3);
        }
    }

    if (bonus > 0 && player) {
        createTextParticle(player.x + player.width / 2, player.y - 15,
            '🔥 ' + chainCount + 'x +' + bonus, '#FFAA00', 12 + Math.min(chainCount, 10));
    }
    return bonus;
}

function updateChain() {
    if (chainTimer > 0) {
        chainTimer--;
        if (chainTimer <= 0) {
            if (chainCount >= 5) {
                playSound('powerup', 0.15);
            }
            chainCount = 0;
        }
    }
    if (comboDisplayTimer > 0) comboDisplayTimer--;
}

// ==================== OLEADAS ====================
function startWave() {
    enemies = [];
    const count = Math.min(CONFIG.ENEMIES_PER_WAVE + Math.floor((wave - 1) * 0.5), 5);
    const types = ['SMALL', 'MEDIUM'];
    if (level >= 2) types.push('LARGE');

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const x = 30 + Math.random() * (canvas.width - 60);
        const y = -30 - Math.random() * 60;
        const enemy = createEnemy(type, x, y);
        enemy.trail = [];
        enemies.push(enemy);
    }
    enemiesRemaining = enemies.length;
    waveTimer = 0;
    updateWaveProgress();
}

function updateWaveProgress() {
    const totalWaves = 5 + Math.floor(level / 2);
    const el = document.getElementById('levelProgress');
    if (el) {
        const progress = Math.min(wave, totalWaves);
        const emoji = boss ? '👾' : '🌊';
        el.textContent = emoji + ' ' + progress + '/' + totalWaves;
    }
}

function showBossWarning() {
    const w = document.getElementById('boss-warning');
    const nameEl = document.querySelector('.boss-name-display');
    if (w) {
        w.style.display = 'block';
        if (nameEl && boss) {
            nameEl.textContent = '👾 ' + boss.description;
        }
        playSound('bossWarning', 0.35);
        setTimeout(() => {
            w.style.display = 'none';
            if (boss) {
                playSound('bossAppear', 0.3);
                createTextParticle(canvas.width / 2, 30, '👾 ' + boss.description + ' APARECE!', boss.color, 24);
            }
        }, 2500);
    }
}

// ==================== DISPAROS ====================
function shoot() {
    if (!player || gameState !== 'PLAYING' || shootCooldown > 0) return;

    const now = Date.now();
    const rate = player.weaponType === 'RAPID' ? 80 : 160;
    if (now - (player.lastShot || 0) < rate) return;

    player.lastShot = now;
    shootCooldown = 3;
    playSound('shoot', 0.15);

    const px = player.x + player.width / 2;
    const py = player.y;
    const damage = getTotalDamage() + Math.min(player.weaponLevel, 3);

    if (player.isBoss) {
        const w = bossPlayerWeapon;
        for (let i = 0; i < w.spread; i++) {
            const angle = (i / w.spread) * 0.8 - 0.4;
            bullets.push(createBullet(px - 2, py, Math.sin(angle) * 2.5, -w.speed, w.damage, w.color, 1.2));
        }
        bullets.push(createBullet(px - 3, py - 5, 0, -w.speed * 1.2, w.damage + 2, '#FFFFFF', 1.5));
        return;
    }

    if (player.weaponType === 'SPREAD') {
        for (let i = -2; i <= 2; i++) {
            bullets.push(createBullet(px - 2 + i * 7, py, i * 1.0, -CONFIG.BULLET_SPEED * 0.85, damage, i === 0 ? '#FFFFFF' : '#00FF00'));
        }
    } else if (player.weaponType === 'RAPID') {
        for (let i = 0; i < 2; i++) {
            bullets.push(createBullet(px - 2 + i * 5, py, (i - 0.5) * 0.4, -CONFIG.BULLET_SPEED * 1.15, damage, '#FFAA00'));
        }
    } else {
        const colors = { nave3: '#FF44FF', nave2: '#FF8844', nave1: '#44FF88' };
        bullets.push(createBullet(px - 2, py, 0, -CONFIG.BULLET_SPEED, damage, colors[player.shipId] || '#00FFFF'));
    }
}

function enemyShoot(enemy) {
    if (enemyBullets.length >= CONFIG.MAX_ENEMY_BULLETS) return;

    const count = enemy.type === 'LARGE' ? 2 : 1;
    const colors = { SMALL: '#FF4444', MEDIUM: '#FF8844', LARGE: '#FFAA00' };
    const speedMult = getEnemySpeedMult();

    for (let i = 0; i < count; i++) {
        const vx = count > 1 ? (i - 0.5) * 0.4 : 0;
        enemyBullets.push(createBullet(
            enemy.x + enemy.width / 2 - 3,
            enemy.y + enemy.height,
            vx + (Math.random() - 0.5) * 0.2,
            CONFIG.ENEMY_BULLET_SPEED * speedMult + level * 0.02,
            1,
            colors[enemy.type] || '#FF4444'
        ));
    }
    playSound('enemyshoot', 0.1);
}

// ==================== GEMAS (18x18) ====================
function spawnGem(x, y) {
    const types = ['RED', 'GREEN', 'BLUE'];
    if (Math.random() < 0.1) {
        types.push('GOLD');
    }
    const type = types[Math.floor(Math.random() * types.length)];
    const effects = {
        RED: 'BURST',
        GREEN: 'RAPID',
        BLUE: 'SPREAD',
        GOLD: 'EXTRA_LIFE'
    };
    gems.push({
        x: x - 9,
        y: y - 9,
        width: 18,
        height: 18,
        type: type,
        effect: effects[type] || 'BURST',
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random(),
        coinBonus: Math.floor(Math.random() * 50) + 10
    });
}

function collectGem(index) {
    const g = gems[index];
    if (!g) return;

    const value = g.type === 'RED' ? 1000 : g.type === 'GREEN' ? 500 : g.type === 'BLUE' ? 200 : 2000;
    const bonus = addToChain(value);
    score += value + bonus;
    shopData.coins += g.coinBonus || 10;
    stats.gemsCollected++;

    if (g.effect === 'EXTRA_LIFE') {
        lives++;
        createTextParticle(g.x + 8, g.y - 5, '❤️ +1 VIDA!', '#FF0000', 18);
        playSound('powerup', 0.4);
    } else {
        createTextParticle(g.x + 8, g.y - 5, '+' + (value + bonus) + ' +' + (g.coinBonus || 10) + '💰 ' + g.effect, '#FFFF00');
        if (g.effect === 'BURST') createBurstShot();
        else if (g.effect === 'RAPID') { player.weaponType = 'RAPID'; player.powerTimer = 300; }
        else if (g.effect === 'SPREAD') { player.weaponType = 'SPREAD'; player.powerTimer = 300; }
        playSound('powerup', 0.25);
    }

    createExplosion(g.x + 8, g.y + 8, g.type === 'GOLD' ? '#FFD700' : '#FFFF00', 8);
    gems.splice(index, 1);
    saveUserData();
}

function createBurstShot() {
    if (!player) return;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const damage = getTotalDamage() + 1;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        bullets.push(createBullet(px - 2, py - 4, Math.cos(a) * 3, -CONFIG.BULLET_SPEED * 0.4 + Math.sin(a) * 3, damage, `hsl(${i * 45}, 100%, 55%)`));
    }
    playSound('powerup', 0.25);
}

// ==================== BOSS - ATAQUES ÚNICOS ====================
function updateBoss() {
    if (!boss || !boss.active) {
        if (boss && !boss.active && !isBossDefeated) {
            isBossDefeated = true;
            bossDefeated();
        }
        return;
    }

    if (boss.entering) {
        boss.y += 1.5;
        if (boss.y >= boss.enterY) {
            boss.entering = false;
            const msg = boss.isFusion ? '🔥 ¡FUSIÓN SUPREMA! 🔥' : '👾 ' + boss.description;
            createTextParticle(canvas.width / 2, 30, msg, boss.color, 22);
            if (boss.isFusion) {
                createTextParticle(canvas.width / 2, 60, '⚡ TODOS LOS PODERES COMBINADOS ⚡', '#FFFFFF', 16);
            }
            playSound('bossAppear', 0.3);
        }
        return;
    }

    boss.moveTimer++;
    boss.attackTimer--;
    boss.specialTimer++;
    boss.rotation += 0.01;

    const config = boss.config;
    const speed = config.speed || 1;
    
    switch(config.movePattern) {
        case 'zigzag':
            boss.x += Math.sin(boss.moveTimer * 0.03) * 1.5 * speed;
            boss.y += (boss.moveTimer % 120 < 60) ? 0.5 * speed : -0.5 * speed;
            break;
        case 'horizontal':
            if (boss.moveTimer % 120 === 0) {
                boss.targetX = 20 + Math.random() * (canvas.width - boss.width - 40);
            }
            boss.x += (boss.targetX - boss.x) * 0.04 * speed;
            boss.y += Math.sin(boss.moveTimer * 0.02) * 0.3 * speed;
            break;
        case 'circle':
            const radius = 80;
            const centerX = canvas.width / 2 - boss.width / 2;
            const centerY = boss.enterY + 40;
            boss.x = centerX + Math.cos(boss.moveTimer * 0.015 * speed) * radius;
            boss.y = centerY + Math.sin(boss.moveTimer * 0.015 * speed) * radius * 0.5;
            break;
        case 'random':
            if (boss.moveTimer % 100 === 0) {
                boss.targetX = 20 + Math.random() * (canvas.width - boss.width - 40);
                boss.targetY = 30 + Math.random() * 80;
            }
            boss.x += (boss.targetX - boss.x) * 0.025 * speed;
            boss.y += (boss.targetY - boss.y) * 0.025 * speed;
            break;
        case 'chaos':
            boss.x += Math.sin(boss.moveTimer * 0.04 + boss.moveTimer * 0.01) * 2 * speed;
            boss.y += Math.cos(boss.moveTimer * 0.03 + boss.moveTimer * 0.015) * 1.5 * speed;
            break;
        case 'wave':
            boss.x += Math.sin(boss.moveTimer * 0.02) * 1.2 * speed;
            boss.y += Math.sin(boss.moveTimer * 0.01) * 0.5 * speed;
            break;
        case 'defensive':
            boss.x += Math.sin(boss.moveTimer * 0.015) * 0.8 * speed;
            boss.y += Math.sin(boss.moveTimer * 0.02) * 0.3 * speed;
            break;
        case 'aggressive':
            if (player) {
                const dx = player.x + player.width / 2 - (boss.x + boss.width / 2);
                const dy = player.y + player.height / 2 - (boss.y + boss.height / 2);
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > 0) {
                    boss.x += (dx / d) * 0.8 * speed;
                    boss.y += (dy / d) * 0.8 * speed;
                }
            }
            break;
        case 'teleport':
            boss.teleportTimer = (boss.teleportTimer || 0) + 1;
            if (boss.teleportTimer > 180) {
                boss.teleportTimer = 0;
                boss.x = 20 + Math.random() * (canvas.width - boss.width - 40);
                boss.y = 30 + Math.random() * 100;
                createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#AAFF44', 30);
                playSound('powerup', 0.2);
            }
            break;
        case 'all':
            const patterns = ['zigzag', 'horizontal', 'circle', 'random', 'chaos'];
            const p = patterns[Math.floor(boss.moveTimer / 300) % patterns.length];
            if (p === 'zigzag') {
                boss.x += Math.sin(boss.moveTimer * 0.03) * 1.5 * speed;
                boss.y += (boss.moveTimer % 120 < 60) ? 0.5 * speed : -0.5 * speed;
            } else if (p === 'horizontal') {
                if (boss.moveTimer % 120 === 0) boss.targetX = 20 + Math.random() * (canvas.width - boss.width - 40);
                boss.x += (boss.targetX - boss.x) * 0.04 * speed;
                boss.y += Math.sin(boss.moveTimer * 0.02) * 0.3 * speed;
            } else if (p === 'circle') {
                const r2 = 80;
                const cx2 = canvas.width / 2 - boss.width / 2;
                const cy2 = boss.enterY + 40;
                boss.x = cx2 + Math.cos(boss.moveTimer * 0.015 * speed) * r2;
                boss.y = cy2 + Math.sin(boss.moveTimer * 0.015 * speed) * r2 * 0.5;
            } else if (p === 'random') {
                if (boss.moveTimer % 100 === 0) {
                    boss.targetX = 20 + Math.random() * (canvas.width - boss.width - 40);
                    boss.targetY = 30 + Math.random() * 80;
                }
                boss.x += (boss.targetX - boss.x) * 0.025 * speed;
                boss.y += (boss.targetY - boss.y) * 0.025 * speed;
            } else {
                boss.x += Math.sin(boss.moveTimer * 0.04 + boss.moveTimer * 0.01) * 2 * speed;
                boss.y += Math.cos(boss.moveTimer * 0.03 + boss.moveTimer * 0.015) * 1.5 * speed;
            }
            break;
        default:
            boss.x += Math.sin(boss.moveTimer * 0.02) * 1 * speed;
    }

    boss.x = Math.max(5, Math.min(canvas.width - boss.width - 5, boss.x));
    boss.y = Math.max(30, Math.min(canvas.height / 2 + 50, boss.y));

    const hp = boss.health / boss.maxHealth;
    if (hp < boss.phase4Health && boss.phase === 3) {
        boss.phase = 4;
        boss.invincible = true;
        boss.invincibleTimer = 90;
        boss.attackSpeed = 1.5;
        createTextParticle(canvas.width / 2, 60, '💀 FASE 4 - MODO FURIA!', '#FF0000', 22);
        createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#FF0000', 30, 1.5);
        playSound('bossPhase', 0.3);
    } else if (hp < boss.phase3Health && boss.phase === 2) {
        boss.phase = 3;
        boss.invincible = true;
        boss.invincibleTimer = 60;
        boss.attackSpeed = 1.2;
        createTextParticle(canvas.width / 2, 60, '🔥 FASE 3 - PODER TOTAL', '#FF8800', 20);
        playSound('bossPhase', 0.3);
    } else if (hp < boss.phase2Health && boss.phase === 1) {
        boss.phase = 2;
        boss.invincible = true;
        boss.invincibleTimer = 60;
        boss.attackSpeed = 1.0;
        createTextParticle(canvas.width / 2, 60, '⚡ FASE 2 - ENFURECIDO', '#FFFF00', 20);
        playSound('bossPhase', 0.3);
    }

    if (boss.specialTimer > 300 - level * 10 && boss.phase >= 2) {
        boss.specialTimer = 0;
        performBossSpecial(boss);
    }

    if (boss.invincible) {
        boss.invincibleTimer--;
        if (boss.invincibleTimer <= 0) boss.invincible = false;
    }

    updateBossSupportShips();

    if (boss.attackTimer <= 0) {
        performBossAttack(boss);
        boss.attackTimer = (60 + Math.random() * 30) / boss.attackSpeed;
        boss.patternIndex++;
    }

    if (boss.health <= 0) {
        boss.active = false;
    }
}

function performBossAttack(boss) {
    const config = boss.config;
    const bx = boss.x + boss.width / 2;
    const by = boss.y + boss.height / 2;
    const phase = boss.phase;
    const count = config.bulletCount + phase * 2;
    const bulletSpeed = config.bulletSpeed + phase * 0.3;
    
    playSound('enemyshoot', 0.15);

    switch(config.attackType) {
        case 'spread':
            for (let i = -count/2; i <= count/2; i++) {
                const angle = Math.PI / 2 + (i / count) * 0.8;
                const s = bulletSpeed;
                enemyBullets.push(createBullet(bx - 3, by, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.7));
            }
            break;
        case 'laser':
            if (player) {
                const angle = Math.atan2((player.y + player.height/2) - by, (player.x + player.width/2) - bx);
                const length = 300;
                for (let i = 0; i < length; i += 3) {
                    particles.push({
                        x: bx + Math.cos(angle) * i + (Math.random() - 0.5) * 3,
                        y: by + Math.sin(angle) * i + (Math.random() - 0.5) * 3,
                        vx: 0, vy: 0,
                        radius: Math.random() * 2 + 0.5,
                        color: config.color,
                        life: 5 + Math.random() * 5,
                        maxLife: 10,
                        type: 'explosion',
                        glow: true
                    });
                }
                const px = player.x + player.width/2;
                const py = player.y + player.height/2;
                if (distance(bx, by, px, py) < length) {
                    const distToLine = Math.abs((px - bx) * Math.sin(angle) - (py - by) * Math.cos(angle));
                    if (distToLine < 15 && !player.invincible) {
                        if (!shield.active) hitPlayer();
                    }
                }
            }
            break;
        case 'web':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + boss.moveTimer * 0.02;
                const s = bulletSpeed * 0.6;
                enemyBullets.push(createBullet(bx - 3, by - 3, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.5));
            }
            for (let i = 0; i < count/2; i++) {
                const angle = (i / (count/2)) * Math.PI * 2 + boss.moveTimer * 0.03 + 0.3;
                const s = bulletSpeed * 0.3;
                enemyBullets.push(createBullet(bx - 2, by - 2, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.3));
            }
            break;
        case 'explosion':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.1;
                const s = bulletSpeed * (0.5 + Math.random() * 0.5);
                enemyBullets.push(createBullet(bx - 3 + (Math.random() - 0.5) * 10, by - 3 + (Math.random() - 0.5) * 10, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.5 + Math.random() * 0.3));
            }
            break;
        case 'chaos':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + boss.moveTimer * 0.05 + Math.random() * 0.2;
                const s = bulletSpeed * (0.5 + Math.random() * 0.8);
                const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                enemyBullets.push(createBullet(bx - 2 + (Math.random() - 0.5) * 20, by - 2 + (Math.random() - 0.5) * 20, Math.cos(angle) * s, Math.sin(angle) * s, 1, color, 0.4 + Math.random() * 0.3));
            }
            break;
        case 'lightning':
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i / count - 0.5) * 0.6 + (Math.random() - 0.5) * 0.2;
                const s = bulletSpeed * (0.8 + Math.random() * 0.4);
                enemyBullets.push(createBullet(bx + (Math.random() - 0.5) * 30, by, Math.cos(angle) * s, Math.sin(angle) * s, 1, '#44FFFF', 0.5));
            }
            break;
        case 'shield_orb':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + boss.moveTimer * 0.01;
                const s = bulletSpeed * 0.5;
                enemyBullets.push(createBullet(bx + Math.cos(angle) * 50 - 3, by + Math.sin(angle) * 50 - 3, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.6));
            }
            break;
        case 'execution':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + boss.moveTimer * 0.03;
                const s = bulletSpeed * (0.6 + Math.random() * 0.6);
                enemyBullets.push(createBullet(bx - 3 + (Math.random() - 0.5) * 5, by - 3 + (Math.random() - 0.5) * 5, Math.cos(angle) * s, Math.sin(angle) * s, 1, config.color, 0.6 + Math.random() * 0.3));
            }
            if (player && phase >= 2) {
                const dx = player.x + player.width/2 - bx;
                const dy = player.y + player.height/2 - by;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d > 0) {
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.atan2(dy, dx) + (i - 1) * 0.15;
                        const s = bulletSpeed * 0.8;
                        enemyBullets.push(createBullet(bx - 3, by - 3, Math.cos(angle) * s, Math.sin(angle) * s, 1, '#FF0000', 0.8));
                    }
                }
            }
            break;
        case 'void':
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + boss.moveTimer * 0.01;
                const s = bulletSpeed * 0.2;
                enemyBullets.push(createBullet(bx - 4, by - 4, Math.cos(angle) * s, Math.sin(angle) * s, 2, '#000000', 1.2));
            }
            break;
        case 'legacy':
        case 'fusion':
            const attacks = ['spread', 'laser', 'web', 'explosion', 'chaos', 'lightning', 'execution'];
            const atk = attacks[boss.patternIndex % attacks.length];
            const savedType = config.attackType;
            config.attackType = atk;
            performBossAttack(boss);
            config.attackType = savedType;
            if (phase >= 3) {
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 + boss.moveTimer * 0.05;
                    const s = bulletSpeed * 0.5;
                    enemyBullets.push(createBullet(bx - 2, by - 2, Math.cos(angle) * s, Math.sin(angle) * s, 1, '#FFD700', 0.4));
                }
            }
            break;
    }
}

function performBossSpecial(boss) {
    const config = boss.config;
    const bx = boss.x + boss.width / 2;
    const by = boss.y + boss.height / 2;
    const phase = boss.phase;
    
    playSound('powerup', 0.25);
    
    switch(config.special) {
        case 'summon_swarm':
            const swarmCount = 3 + phase;
            for (let i = 0; i < swarmCount; i++) {
                const angle = (i / swarmCount) * Math.PI * 2 + Math.random() * 0.2;
                const dist = 60 + Math.random() * 30;
                const enemy = createEnemy('SMALL', bx + Math.cos(angle) * dist - 12, by + Math.sin(angle) * dist - 12);
                enemy.speed = 1.5 + phase * 0.3;
                enemy.health = 1 + phase;
                enemy.points = 150;
                enemies.push(enemy);
                enemiesRemaining++;
            }
            createTextParticle(bx, by - 30, '🔄 ENJAMBRE!', '#FF4444', 18);
            break;
        case 'laser_wall':
            for (let i = 0; i < 4 + phase; i++) {
                const x = 30 + i * (canvas.width - 60) / (3 + phase);
                for (let j = 0; j < 20; j++) {
                    particles.push({
                        x: x + (Math.random() - 0.5) * 8,
                        y: by + j * 15 + (Math.random() - 0.5) * 5,
                        vx: 0, vy: 0,
                        radius: Math.random() * 2 + 0.5,
                        color: '#44FF44',
                        life: 15 + Math.random() * 10,
                        maxLife: 25,
                        type: 'explosion',
                        glow: true
                    });
                }
                if (player && player.x < x + 20 && player.x + player.width > x - 20) {
                    if (!player.invincible && !shield.active) hitPlayer();
                }
            }
            createTextParticle(bx, by - 30, '🔄 PARED LÁSER!', '#44FF44', 18);
            screenShake.active = true;
            screenShake.intensity = 5;
            screenShake.duration = 10;
            break;
        case 'web_trap':
            for (let i = 0; i < 20 + phase * 5; i++) {
                const angle = (i / (20 + phase * 5)) * Math.PI * 2 + Math.random() * 0.1;
                const dist = Math.random() * (150 + phase * 30);
                const s = 0.5 + Math.random() * 0.5;
                enemyBullets.push(createBullet(bx + Math.cos(angle) * dist - 3, by + Math.sin(angle) * dist - 3, Math.cos(angle) * s, Math.sin(angle) * s, 1, '#AA44FF', 0.3));
            }
            createTextParticle(bx, by - 30, '🕸️ TRAMPA!', '#AA44FF', 18);
            break;
        case 'dark_absorb':
            if (player) {
                const dx = player.x + player.width/2 - bx;
                const dy = player.y + player.height/2 - by;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < 200) {
                    if (player.absorbEnergy > 0) {
                        player.absorbEnergy = Math.max(0, player.absorbEnergy - 20);
                        boss.health = Math.min(boss.maxHealth, boss.health + 50);
                        createExplosion(player.x + player.width/2, player.y + player.height/2, '#FFAA00', 15);
                        createTextParticle(bx, by - 30, '🔄 ABSORCIÓN!', '#FFAA00', 18);
                    }
                }
            }
            break;
        case 'phase_shift':
            boss.invincible = true;
            boss.invincibleTimer = 120;
            boss.attackSpeed = 0.5;
            createTextParticle(bx, by - 30, '🌀 CAMBIO DE FASE!', '#FF44FF', 22);
            createExplosion(bx, by, '#FF44FF', 30, 1.5);
            break;
        case 'storm_cloud':
            for (let i = 0; i < 8 + phase * 2; i++) {
                const x = 30 + i * (canvas.width - 60) / (7 + phase * 2);
                const y = 30 + Math.random() * 80;
                particles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    vx: 0, vy: 0.5,
                    radius: Math.random() * 5 + 2,
                    color: '#44FFFF',
                    life: 30 + Math.random() * 20,
                    maxLife: 50,
                    type: 'explosion',
                    glow: true
                });
                setTimeout(() => {
                    if (player) {
                        enemyBullets.push(createBullet(x, y + 20, (player.x + player.width/2 - x) / 100, 2 + phase * 0.3, 1, '#44FFFF', 0.5));
                    }
                }, i * 100);
            }
            createTextParticle(bx, by - 30, '⛈️ TORMENTA!', '#44FFFF', 18);
            break;
        case 'reflect':
            boss.reflectActive = true;
            createTextParticle(bx, by - 30, '🔄 REFLEJO!', '#FF8844', 18);
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                if (distance(bx, by, b.x + b.width/2, b.y + b.height/2) < 150) {
                    const angle = Math.atan2(b.vy, b.vx);
                    const newAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
                    const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
                    enemyBullets.push(createBullet(b.x, b.y, Math.cos(newAngle) * speed * 0.5, Math.sin(newAngle) * speed * 0.5, 1, '#FF8844', 0.6));
                    bullets.splice(i, 1);
                }
            }
            break;
        case 'mark':
            if (player) {
                boss.markTarget = { x: player.x + player.width/2, y: player.y + player.height/2, timer: 180 };
                createTextParticle(bx, by - 30, '🎯 MARCADO!', '#FF44AA', 18);
                for (let i = 0; i < 5 + phase; i++) {
                    const angle = (i / (5 + phase)) * Math.PI * 2 + Math.random() * 0.1;
                    const s = 2 + phase * 0.3;
                    enemyBullets.push(createBullet(bx + Math.cos(angle) * 30 - 3, by + Math.sin(angle) * 30 - 3, Math.cos(angle) * s, Math.sin(angle) * s, 1, '#FF44AA', 0.6));
                }
            }
            break;
        case 'invisibility':
            boss.isInvisible = true;
            boss.invincible = true;
            boss.invincibleTimer = 120;
            createTextParticle(bx, by - 30, '👻 INVISIBILIDAD!', '#AAFF44', 18);
            break;
        case 'final_fury':
            if (boss.phase === 4) {
                for (let i = 0; i < 30 + phase * 5; i++) {
                    const angle = (i / (30 + phase * 5)) * Math.PI * 2 + Math.random() * 0.1;
                    const s = 1 + Math.random() * 3 + phase * 0.3;
                    const color = `hsl(${i * 12 + 180}, 100%, 50%)`;
                    enemyBullets.push(createBullet(bx + (Math.random() - 0.5) * 40, by + (Math.random() - 0.5) * 40, Math.cos(angle) * s, Math.sin(angle) * s, 1, color, 0.4 + Math.random() * 0.3));
                }
                createTextParticle(bx, by - 30, '💥 FURIA FINAL!', '#FF0000', 22);
                screenShake.active = true;
                screenShake.intensity = 15;
                screenShake.duration = 20;
            }
            break;
        case 'supernova':
            for (let i = 0; i < 40 + phase * 10; i++) {
                const angle = (i / (40 + phase * 10)) * Math.PI * 2 + Math.random() * 0.05;
                const s = 0.5 + Math.random() * 3 + phase * 0.3;
                const color = `hsl(${i * 9 + 300}, 100%, 50%)`;
                enemyBullets.push(createBullet(bx + (Math.random() - 0.5) * 60, by + (Math.random() - 0.5) * 60, Math.cos(angle) * s, Math.sin(angle) * s, 1, color, 0.3 + Math.random() * 0.3));
            }
            createTextParticle(bx, by - 40, '💥 SUPERNOVA!', '#FF00FF', 26);
            screenShake.active = true;
            screenShake.intensity = 20;
            screenShake.duration = 30;
            playSound('explosion', 0.4);
            break;
    }
}

function bossDefeated() {
    const pts = 8000 * (boss.level || level);
    const bonus = addToChain(pts);
    const coinsBonus = Math.floor(pts / 100);
    score += pts + bonus;
    shopData.coins += coinsBonus;
    stats.bossesDefeated++;

    const color = boss.isFusion ? '#FF00FF' : boss.color;
    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, color, 60, 2);
    createExplosion(boss.x + boss.width / 2 - 50, boss.y + boss.height / 2 - 40, '#FF4444', 30, 1.5);
    createExplosion(boss.x + boss.width / 2 + 50, boss.y + boss.height / 2 + 40, '#44FF44', 30, 1.5);
    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2 - 30, '#AA44FF', 30, 1.5);
    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2 + 30, '#FFD700', 30, 1.5);

    const msg = boss.isFusion ? '🔥 ¡FUSIÓN SUPREMA DESTRUIDA! 🔥' : '👾 +' + (pts + bonus) + ' BOSS! +' + coinsBonus + '💰';
    createTextParticle(boss.x + boss.width / 2, boss.y, msg, '#FFFF00', boss.isFusion ? 28 : 24);
    playSound('victory', 0.4);

    for (let i = 0; i < (boss.isFusion ? 6 : 3); i++) {
        setTimeout(() => {
            spawnGem(boss.x + boss.width / 2 + (Math.random() - 0.5) * 100, boss.y + boss.height / 2 + (Math.random() - 0.5) * 80);
        }, i * 250);
    }

    boss = null;
    boss.supportShips = [];

    if (!stats.levelsCompleted.includes(level)) {
        stats.levelsCompleted.push(level);
    }

    checkAchievements();

    if (specialMode === 'boss_rush') {
        currentBossRushIndex++;
        if (currentBossRushIndex < bossRushQueue.length) {
            setTimeout(() => {
                level = bossRushQueue[currentBossRushIndex];
                boss = createBossEntity(level);
                showBossWarning();
                createTextParticle(canvas.width / 2, canvas.height / 2, '⚔️ BOSS ' + (currentBossRushIndex + 1) + '/' + bossRushQueue.length, '#FFAA00', 24);
                isBossDefeated = false;
                updateWaveProgress();
                boss.supportShipsSpawned = false;
                boss.supportShips = [];
            }, 2000);
        } else {
            setTimeout(() => {
                createTextParticle(canvas.width / 2, canvas.height / 2, '🏆 ¡BOSS RUSH COMPLETADO!', '#FFD700', 32);
                gameOver('BOSS_RUSH_VICTORY');
            }, 1500);
        }
        return;
    }

    if (level < 10) {
        showLevelComplete();
    } else {
        setTimeout(() => gameOver('VICTORIA'), 1500);
    }
}

// ==================== NIVEL COMPLETADO ====================
function showLevelComplete() {
    const statsEl = document.getElementById('levelStats');
    const bonusEl = document.getElementById('levelBonus');
    const container = document.getElementById('level-complete');

    const bonus = Math.floor(score * 0.1) + 1000;
    score += bonus;

    statsEl.innerHTML = `
        📊 <strong>RESUMEN NIVEL ${level}</strong><br>
        ├── Enemigos destruidos: ${stats.enemiesKilled}<br>
        ├── Cadena máxima: ${maxChain}x<br>
        ├── Daño recibido: ${stats.damageTaken || 0}<br>
        ├── Habilidad especial usada: ${CONFIG.SPECIAL_ABILITY.maxUses - specialAbility.usesLeft} veces<br>
        └── Tiempo: ${Math.floor((Date.now() - levelStartTime) / 1000)}s
    `;
    bonusEl.textContent = bonus;
    container.style.display = 'block';

    playSound('levelComplete', 0.3);
}

// ==================== JUEGO ====================
function startGame(lvl) {
    console.log('🎮 Iniciando nivel ' + lvl + ' - Dificultad: ' + difficulty);

    level = lvl;
    wave = 1;
    score = 0;
    lives = getTotalLives();
    chainCount = 0;
    chainTimer = 0;
    maxChain = 0;
    noDamageRun = true;
    stats.damageTaken = 0;
    stats.maxCombo = 0;
    levelStartTime = Date.now();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    gems = [];
    particles = [];
    boss = null;
    bossSupportShips = [];
    shootCooldown = 0;
    frameCount = 0;
    comboCount = 0;
    comboDisplayTimer = 0;

    supportShip.usesLeft = CONFIG.SUPPORT_SHIP.maxUses;
    supportShip.active = false;
    supportShip.bullets = [];
    supportShip.timer = 0;

    shield.usesLeft = CONFIG.SHIELD.maxUses;
    shield.active = false;
    shield.timer = 0;

    specialAbility.usesLeft = getSpecialUses();
    specialAbility.cooldown = 0;
    specialAbility.active = false;
    specialAbility.timer = 0;

    player = createPlayer();
    startWave();
    gameState = 'PLAYING';

    showScreen('gameScreen');
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-complete').style.display = 'none';
    updateHUD();
    updateSupportDisplay();
    updateShieldDisplay();
    updateSpecialDisplay();
    updateWaveProgress();

    const diffLabel = CONFIG.DIFFICULTY[difficulty]?.label || '';
    createTextParticle(canvas.width / 2, canvas.height / 2, '🚀 NIVEL ' + level + ' ' + diffLabel, '#00FFFF', 28);
}

function restartGame() {
    if (specialMode === 'boss_rush') startBossRush();
    else if (specialMode === 'boss_player') startBossPlayer();
    else startGame(level || 1);
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pauseCurrentScore').textContent = score;
        document.getElementById('pauseCurrentLevel').textContent = specialMode === 'boss_rush' ? 'BOSS RUSH' : level + '-' + wave;
        document.getElementById('pauseCurrentLives').textContent = lives;
        document.getElementById('pauseScreen').classList.add('active');
        pauseSoundtrack();
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        document.getElementById('pauseScreen').classList.remove('active');
        playSoundtrack();
    }
}

function hitPlayer() {
    if (!player || player.invincible) return;
    if (shield.active) {
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#4488FF', 15);
        playSound('shield', 0.2);
        return;
    }

    lives--;
    noDamageRun = false;
    stats.damageTaken++;
    player.invincible = true;
    player.invincibleTimer = 90;

    const flash = document.getElementById('damage-flash');
    if (flash) {
        flash.style.display = 'block';
        flash.classList.remove('active');
        setTimeout(() => {
            flash.classList.add('active');
            setTimeout(() => { flash.style.display = 'none'; }, 300);
        }, 10);
    }

    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#FF0000', 25, 1.2);
    screenShake.active = true;
    screenShake.intensity = 8;
    screenShake.duration = 10;

    playSound('explosion', 0.35);

    if (lives <= 0) gameOver('GAME_OVER');
}

function gameOver(reason) {
    gameState = 'GAMEOVER';
    saveUserData();
    checkAchievements();

    document.getElementById('final-score').textContent = '🏆 Puntuación: ' + score;
    document.getElementById('level-reached').textContent = specialMode === 'boss_rush' ? '⚔️ Bosses Derrotados: ' + currentBossRushIndex + '/11' : '🎯 Nivel: ' + level;
    document.getElementById('chain-record').textContent = '🔥 Cadena: ' + maxChain + 'x';

    const unlocked = Object.keys(CONFIG.ACHIEVEMENTS).filter(k => achievements[k]);
    const achEl = document.getElementById('achievements-unlocked');
    if (unlocked.length > 0) {
        achEl.textContent = '🏅 Logros: ' + unlocked.length + ' desbloqueados';
    } else {
        achEl.textContent = '';
    }

    document.getElementById('game-over').style.display = 'block';

    const title = document.getElementById('game-over').querySelector('h2');
    if (reason === 'VICTORIA' || reason === 'BOSS_RUSH_VICTORY') {
        title.textContent = reason === 'BOSS_RUSH_VICTORY' ? '🏆 ¡BOSS RUSH COMPLETADO!' : '🎉 ¡VICTORIA!';
        title.style.color = '#FFD700';
        playSound('victory', 0.4);
    } else {
        title.textContent = '💀 GAME OVER';
        title.style.color = '#FF0000';
        playSound('gameovervoice', 0.3);
    }
}

// ==================== ACTUALIZACIÓN ====================
function update() {
    if (gameState !== 'PLAYING') return;

    frameCount++;
    if (shootCooldown > 0) shootCooldown--;
    updateChain();
    updateSupportShip();
    updateShield();
    updateScreenShake();

    if (specialAbility.cooldown > 0) {
        specialAbility.cooldown--;
        updateSpecialDisplay();
    }

    const comboEl = document.getElementById('comboDisplay');
    if (comboEl) {
        if (comboDisplayTimer > 0 && chainCount >= 5) {
            comboEl.textContent = '🔥 ' + chainCount + 'x';
            comboEl.style.color = chainCount > 15 ? '#FF0000' : chainCount > 10 ? '#FF8800' : '#FFAA00';
        } else {
            comboEl.textContent = '';
        }
    }

    if (player) {
        let dx = 0, dy = 0;
        if (keys['ArrowLeft'] || keys['a']) dx = -1;
        if (keys['ArrowRight'] || keys['d']) dx = 1;
        if (keys['ArrowUp'] || keys['w']) dy = -1;
        if (keys['ArrowDown'] || keys['s']) dy = 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            player.x += (dx / len) * player.speed;
            player.y += (dy / len) * player.speed;
        }

        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

        if (frameCount % 2 === 0) {
            player.trail.push({ x: player.x + player.width / 2, y: player.y + player.height, life: 15 });
            if (player.trail.length > 15) player.trail.shift();
        }
        for (let i = player.trail.length - 1; i >= 0; i--) {
            player.trail[i].life--;
            if (player.trail[i].life <= 0) player.trail.splice(i, 1);
        }

        if (player.invincible) {
            player.invincibleTimer--;
            if (player.invincibleTimer <= 0) player.invincible = false;
        }

        if (player.powerTimer > 0) {
            player.powerTimer--;
            if (player.powerTimer <= 0) {
                player.weaponType = 'NORMAL';
                player.weaponLevel = 0;
            }
        }

        if (!player.isAbsorbing) {
            player.absorbEnergy = Math.min(CONFIG.ABSORB_ENERGY_MAX, player.absorbEnergy + 0.25);
        } else {
            player.absorbEnergy -= 0.35;
            if (player.absorbEnergy <= 0) {
                player.isAbsorbing = false;
                player.absorbEnergy = 0;
            }

            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                if (distance(player.x + player.width / 2, player.y + player.height / 2, b.x + b.width / 2, b.y + b.height / 2) < CONFIG.ABSORB_RADIUS) {
                    player.absorbEnergy = Math.min(CONFIG.ABSORB_ENERGY_MAX, player.absorbEnergy + 5);
                    createAbsorptionParticles(b.x, b.y, player.x + player.width / 2, player.y + player.height / 2);
                    enemyBullets.splice(i, 1);
                    playSound('powerup', 0.1);
                }
            }
        }

        if (keys[' ']) shoot();
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx || 0;
        b.y += b.vy || -CONFIG.BULLET_SPEED;

        if (b.y < -50 || b.x < -50 || b.x > canvas.width + 50) {
            bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (rectCollision(b, enemies[j])) {
                enemies[j].health -= b.damage;
                hit = true;
                enemies[j].hitFlash = 4;

                if (enemies[j].health <= 0) {
                    const e = enemies[j];
                    const bonus = addToChain(e.points);
                    score += e.points + bonus;
                    stats.enemiesKilled++;
                    createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#FFAA00', 15);
                    playSound('explosion', 0.15);
                    if (Math.random() < 0.15) spawnGem(e.x + e.width / 2, e.y + e.height / 2);
                    createTextParticle(e.x + e.width / 2, e.y - 5, '+' + (e.points + bonus), '#FFFFFF', 10);
                    enemies.splice(j, 1);
                    enemiesRemaining--;
                    checkAchievements();
                }
                break;
            }
        }

        if (!hit && boss && boss.active && !boss.invincible && rectCollision(b, boss)) {
            boss.health -= b.damage;
            hit = true;
            if (boss.reflectActive && Math.random() < 0.3) {
                const angle = Math.atan2(b.vy, b.vx) + Math.PI + (Math.random() - 0.5) * 0.5;
                const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
                enemyBullets.push(createBullet(b.x, b.y, Math.cos(angle) * speed * 0.5, Math.sin(angle) * speed * 0.5, 1, '#FF8844', 0.6));
                bullets.splice(i, 1);
                hit = true;
            }
        }

        if (hit) bullets.splice(i, 1);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx || 0;
        b.y += b.vy || CONFIG.ENEMY_BULLET_SPEED * getEnemySpeedMult() + level * 0.02;

        if (b.y > canvas.height + 50 || b.x < -50 || b.x > canvas.width + 50) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (player && !player.invincible && !player.isAbsorbing && rectCollision(b, player)) {
            hitPlayer();
            enemyBullets.splice(i, 1);
        }
    }

    if (!boss) {
        if (enemies.length === 0) {
            waveTimer++;
            const totalWaves = 5 + Math.floor(level / 2);
            if (waveTimer >= 180) {
                wave++;
                if (wave > totalWaves) {
                    boss = createBossEntity();
                    showBossWarning();
                    playSound('powerup', 0.3);
                    updateWaveProgress();
                } else {
                    startWave();
                }
            }
        } else {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.patternTimer++;
                if (e.hitFlash > 0) e.hitFlash--;

                if (e.type === 'LARGE' && frameCount % 3 === 0) {
                    e.trail.push({ x: e.x + e.width / 2, y: e.y + e.height, life: 10 });
                    if (e.trail.length > 10) e.trail.shift();
                }
                for (let t = e.trail.length - 1; t >= 0; t--) {
                    e.trail[t].life--;
                    if (e.trail[t].life <= 0) e.trail.splice(t, 1);
                }

                switch (e.movePattern) {
                    case 0: e.y += e.speed; break;
                    case 1: e.y += e.speed; e.x += Math.sin(e.patternTimer * 0.04) * 1; break;
                    case 2: e.y += e.speed; e.x += (e.patternTimer % 60 < 30) ? 0.8 : -0.8; break;
                }

                if (e.y > canvas.height + 100) {
                    enemies.splice(i, 1);
                    enemiesRemaining--;
                    continue;
                }

                e.shootTimer--;
                const shootChance = getEnemyShootChance();
                if (e.shootTimer <= 0 && e.y > 50 && enemyBullets.length < CONFIG.MAX_ENEMY_BULLETS && Math.random() < shootChance) {
                    enemyShoot(e);
                    e.shootTimer = 80 + Math.random() * 60;
                }

                if (player && !player.invincible && rectCollision(e, player)) {
                    hitPlayer();
                    e.health = 0;
                }

                if (e.health <= 0) {
                    const bonus = addToChain(e.points);
                    score += e.points + bonus;
                    stats.enemiesKilled++;
                    createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#FFAA00', 15);
                    playSound('explosion', 0.15);
                    if (Math.random() < 0.15) spawnGem(e.x + e.width / 2, e.y + e.height / 2);
                    createTextParticle(e.x + e.width / 2, e.y - 5, '+' + (e.points + bonus), '#FFFFFF', 10);
                    enemies.splice(i, 1);
                    enemiesRemaining--;
                    checkAchievements();
                }
            }
        }
    }

    updateBoss();

    for (let i = gems.length - 1; i >= 0; i--) {
        const g = gems[i];
        g.x += g.vx;
        g.y += g.vy;

        if (player) {
            const dx = (player.x + player.width / 2) - (g.x + 8);
            const dy = (player.y + player.height / 2) - (g.y + 8);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80) {
                g.vx += (dx / dist) * 0.5;
                g.vy += (dy / dist) * 0.5;
            }

            if (rectCollision(g, player)) {
                collectGem(i);
                continue;
            }
        }

        if (g.y > canvas.height + 50) gems.splice(i, 1);
    }

    updateParticles();
    updateHUD();

    const timerEl = document.getElementById('gameTimer');
    if (timerEl) {
        const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
        timerEl.textContent = '⏱️ ' + String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0');
    }
}

function createAbsorptionParticles(x, y, tx, ty) {
    for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * 10;
        particles.push({
            x: x + Math.cos(a) * d,
            y: y + Math.sin(a) * d,
            vx: 0,
            vy: 0,
            targetX: tx + (Math.random() - 0.5) * 10,
            targetY: ty + (Math.random() - 0.5) * 10,
            radius: 2 + Math.random() * 2,
            color: '#00FFFF',
            life: 20,
            maxLife: 20,
            type: 'absorb'
        });
    }
}

function updateScreenShake() {
    if (screenShake.active) {
        screenShake.duration--;
        if (screenShake.duration <= 0) {
            screenShake.active = false;
            screenShake.intensity = 0;
        }
    }
}

function updateHUD() {
    document.getElementById('score').textContent = '🏆 ' + score;
    document.getElementById('lives').textContent = '❤️ ' + lives;
    document.getElementById('level').textContent = specialMode === 'boss_rush' ? '⚔️ BOSS RUSH' : '🎯 ' + level + '-' + wave;
    document.getElementById('enemies-count').textContent = '👾 ' + enemiesRemaining;
    document.getElementById('chain-display').textContent = '🔥 CHAIN: ' + chainCount + 'x';
    document.getElementById('special-charge').textContent = '⚡ ' + Math.floor(player?.absorbEnergy || 0) + '%';

    let bossEl = document.getElementById('boss-health');
    if (boss && boss.active) {
        if (!bossEl) {
            const ui = document.getElementById('ui');
            bossEl = document.createElement('div');
            bossEl.id = 'boss-health';
            ui.appendChild(bossEl);
        }
        const phaseLabel = ['', 'FASE 1', 'FASE 2', 'FASE 3', '🔥 FASE 4'][boss.phase] || '';
        const fusionLabel = boss.isFusion ? '🔥 FUSIÓN' : '';
        const invisLabel = boss.isInvisible ? '👻' : '';
        bossEl.textContent = '👾 ' + fusionLabel + ' ' + boss.description + ' ' + invisLabel + ' [' + phaseLabel + ']: ' + Math.ceil(boss.health) + '/' + boss.maxHealth;
        bossEl.style.color = boss.phase === 4 ? '#FF0000' : boss.phase === 3 ? '#FF8800' : boss.phase === 2 ? '#FFFF00' : '#00FF00';
    } else if (bossEl) {
        bossEl.remove();
    }

    updateAchievementDisplay();
}

// ==================== DIBUJADO ====================
function draw() {
    ctx.save();

    if (screenShake.active) {
        const intensity = screenShake.intensity * (screenShake.duration / 20);
        ctx.translate((Math.random() - 0.5) * intensity * 2, (Math.random() - 0.5) * intensity * 2);
    }

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const t = Date.now() * 0.001;
    for (let i = 0; i < 80; i++) {
        const x = (i * 7.3 + t * 5) % canvas.width;
        const y = (i * 4.7 + t * 3) % canvas.height;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.sin(t + i) * 0.2) + ')';
        ctx.fillRect(x, y, 0.5 + Math.sin(t + i) * 0.3, 0.5 + Math.sin(t + i) * 0.3);
    }

    const gc = { RED: '#FF0000', GREEN: '#00FF00', BLUE: '#0088FF', GOLD: '#FFD700' };
    for (const g of gems) {
        ctx.fillStyle = gc[g.type] || '#FFFFFF';
        if (g.type === 'GOLD') {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            const spikes = 5;
            const outerR = 8;
            const innerR = 4;
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                if (i === 0) ctx.moveTo(g.x + 8 + Math.cos(a) * r, g.y + 8 + Math.sin(a) * r);
                else ctx.lineTo(g.x + 8 + Math.cos(a) * r, g.y + 8 + Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (g.type === 'RED') {
            ctx.beginPath();
            ctx.moveTo(g.x + 8, g.y);
            ctx.lineTo(g.x + 16, g.y + 8);
            ctx.lineTo(g.x + 8, g.y + 16);
            ctx.lineTo(g.x, g.y + 8);
            ctx.closePath();
            ctx.fill();
        } else if (g.type === 'GREEN') {
            ctx.beginPath();
            ctx.arc(g.x + 8, g.y + 8, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(g.x, g.y, 16, 16);
        }
    }

    for (const e of enemies) {
        for (const t2 of e.trail || []) {
            ctx.globalAlpha = t2.life / 10 * 0.3;
            ctx.fillStyle = '#FF8844';
            ctx.beginPath();
            ctx.arc(t2.x, t2.y, 3 * (t2.life / 10), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const img = images.enemy;
        if (img && img.complete && img.src) {
            ctx.drawImage(img, e.x, e.y, e.width, e.height);
        } else {
            ctx.fillStyle = e.hitFlash > 0 ? '#FFFFFF' : '#FF4444';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#000000';
            ctx.fillRect(e.x + 4, e.y + 4, e.width - 8, e.height - 8);
        }
    }

    for (const s of boss?.supportShips || []) {
        if (!s.active) continue;
        const img = images.enemy;
        if (img && img.complete && img.src) {
            ctx.save();
            ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
            ctx.rotate(s.rotation || 0);
            ctx.drawImage(img, -s.width / 2, -s.height / 2, s.width, s.height);
            ctx.restore();
        } else {
            ctx.fillStyle = s.hitFlash > 0 ? '#FFFFFF' : '#FF8844';
            ctx.fillRect(s.x, s.y, s.width, s.height);
            ctx.fillStyle = '#000000';
            ctx.fillRect(s.x + 4, s.y + 4, s.width - 8, s.height - 8);
        }
        const hp = s.health / s.maxHealth;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(s.x, s.y - 4, s.width, 3);
        ctx.fillStyle = hp > 0.5 ? '#00FF00' : hp > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(s.x, s.y - 4, s.width * hp, 3);
    }

    if (boss && boss.active) {
        const imgKey = boss.imgKey || 'boss';
        const img = images[imgKey];
        
        if (!boss.isInvisible || Math.floor(Date.now() / 200) % 2 === 0) {
            if (img && img.complete && img.src) {
                ctx.drawImage(img, boss.x, boss.y, boss.width, boss.height);
            } else {
                ctx.fillStyle = boss.color || '#FF0000';
                ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(boss.isFusion ? '🔥 FUSIÓN' : 'BOSS ' + (boss.level || level), boss.x + boss.width / 2, boss.y + boss.height / 2);
            }
        }

        if (boss.invincible) {
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
            ctx.globalAlpha = 1;
        }

        const hw = 260, hx = canvas.width / 2 - hw / 2, hy = 10;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(hx - 2, hy - 2, hw + 4, 18);
        const phaseColors = ['#00FF00', '#FFFF00', '#FF8800', '#FF0000'];
        ctx.fillStyle = boss.isFusion && boss.phase === 4 ? '#FF00FF' : phaseColors[boss.phase - 1] || '#00FF00';
        ctx.fillRect(hx, hy, hw * (boss.health / boss.maxHealth), 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const phases = ['', 'FASE 1', 'FASE 2', 'FASE 3', '🔥 FASE 4'];
        const fusionLabel = boss.isFusion ? '🔥 ' : '';
        const invisLabel = boss.isInvisible ? '👻 ' : '';
        ctx.fillText(invisLabel + fusionLabel + phases[boss.phase] + ' - ' + Math.ceil(boss.health) + '/' + boss.maxHealth, canvas.width / 2, hy + 7);

        if (boss.isFusion) {
            ctx.strokeStyle = '#FF00FF';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
            ctx.shadowColor = '#FF00FF';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.width * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        if (boss.markTarget) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            ctx.beginPath();
            ctx.arc(boss.markTarget.x, boss.markTarget.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(boss.markTarget.x - 20, boss.markTarget.y);
            ctx.lineTo(boss.markTarget.x + 20, boss.markTarget.y);
            ctx.moveTo(boss.markTarget.x, boss.markTarget.y - 20);
            ctx.lineTo(boss.markTarget.x, boss.markTarget.y + 20);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    for (const b of supportShip.bullets) {
        ctx.fillStyle = '#44FF88';
        ctx.shadowColor = '#44FF88';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
    }

    if (supportShip.active) {
        const img = images.navedeapoyo;
        if (img && img.complete && img.src) {
            ctx.drawImage(img, supportShip.x, supportShip.y, supportShip.width, supportShip.height);
        } else {
            ctx.fillStyle = '#44FF88';
            ctx.fillRect(supportShip.x, supportShip.y, 24, 24);
            ctx.fillStyle = '#228844';
            ctx.fillRect(supportShip.x + 4, supportShip.y + 4, 16, 16);
        }
    }

    if (shield.active) {
        ctx.strokeStyle = '#4488FF';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.005) * 0.2;
        ctx.shadowColor = '#4488FF';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, shield.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(68, 136, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, shield.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (const b of enemyBullets) {
        ctx.fillStyle = b.color || '#FF4444';
        ctx.shadowColor = b.color || '#FF4444';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    for (const b of bullets) {
        ctx.fillStyle = b.color || '#00FFFF';
        ctx.shadowColor = b.color || '#00FFFF';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
    }

    for (const p of particles) {
        if (p.type === 'text') {
            ctx.fillStyle = p.color || '#FFFFFF';
            ctx.font = 'bold ' + (p.fontSize || 12) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.shadowColor = p.color || '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.fillText(p.text, p.x, p.y);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else if (p.type === 'absorb') {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 5) continue;
            p.vx = (dx / d) * 6;
            p.vy = (dy / d) * 6;
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color || '#00FFFF';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else {
            if (p.glow) {
                ctx.shadowColor = p.color || '#FFFFFF';
                ctx.shadowBlur = 10;
            }
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color || '#FFFFFF';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    if (player) {
        for (const t2 of player.trail || []) {
            ctx.globalAlpha = t2.life / 15 * 0.3;
            ctx.fillStyle = '#00FFFF';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(t2.x, t2.y, 2 * (t2.life / 15), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    if (player) {
        if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) ctx.globalAlpha = 0.4;

        if (player.isBoss) {
            const imgKey = player.imgKey || 'boss';
            const img = images[imgKey];
            if (img && img.complete && img.src) {
                ctx.drawImage(img, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = player.color || '#FF0000';
                ctx.fillRect(player.x, player.y, player.width, player.height);
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('BOSS', player.x + player.width / 2, player.y + player.height / 2);
            }
            ctx.strokeStyle = player.color || '#FF0000';
            ctx.lineWidth = 3;
            ctx.shadowColor = player.color || '#FF0000';
            ctx.shadowBlur = 20;
            ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            ctx.shadowBlur = 0;
        } else {
            let imgKey = player.shipId || 'player';
            if (!images[imgKey]) imgKey = 'player';
            const img = images[imgKey];
            if (img && img.complete && img.src) {
                ctx.drawImage(img, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = player.shipId === 'nave3' ? '#FF44FF' :
                    player.shipId === 'nave2' ? '#FF8844' :
                    player.shipId === 'nave1' ? '#44FF88' : '#00FFFF';
                ctx.shadowColor = player.isAbsorbing ? '#FF00FF' : '#00FFFF';
                ctx.shadowBlur = 15;
                ctx.fillRect(player.x, player.y, player.width, player.height);
                ctx.fillStyle = '#000000';
                ctx.shadowBlur = 0;
                ctx.fillRect(player.x + 8, player.y + 8, player.width - 16, player.height - 16);
            }
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (player.isAbsorbing) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.2 + Math.sin(Date.now() * 0.005) * 0.15;
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, CONFIG.ABSORB_RADIUS, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    ctx.restore();
}

// ==================== MODOS ESPECIALES ====================
function startBossRush() {
    specialMode = 'boss_rush';
    level = 1;
    wave = 1;
    score = 0;
    lives = getTotalLives() + 1;
    chainCount = 0;
    chainTimer = 0;
    maxChain = 0;
    noDamageRun = true;
    levelStartTime = Date.now();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    gems = [];
    particles = [];
    boss = null;
    bossSupportShips = [];
    shootCooldown = 0;
    frameCount = 0;

    bossRushQueue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    currentBossRushIndex = 0;

    player = createPlayer();
    player.weaponLevel = 3;
    player.weaponType = 'RAPID';

    supportShip.usesLeft = 0;
    supportShip.active = false;
    supportShip.bullets = [];
    shield.usesLeft = 0;
    shield.active = false;
    specialAbility.usesLeft = 0;
    specialAbility.cooldown = 0;

    level = bossRushQueue[0];
    boss = createBossEntity(level);
    showBossWarning();

    gameState = 'PLAYING';
    showScreen('gameScreen');
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-complete').style.display = 'none';
    updateHUD();
    updateSupportDisplay();
    updateShieldDisplay();
    updateSpecialDisplay();
    createTextParticle(canvas.width / 2, canvas.height / 2, '⚔️ BOSS RUSH ⚔️', '#FF4444', 28);
    createTextParticle(canvas.width / 2, canvas.height / 2 + 40, '1/' + bossRushQueue.length, '#FFAA00', 20);
    updateWaveProgress();
}

function startBossPlayer() {
    specialMode = 'boss_player';
    level = 1;
    wave = 1;
    score = 0;
    lives = getTotalLives() + 2;
    chainCount = 0;
    chainTimer = 0;
    maxChain = 0;
    noDamageRun = true;
    levelStartTime = Date.now();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    gems = [];
    particles = [];
    boss = null;
    bossSupportShips = [];
    shootCooldown = 0;
    frameCount = 0;

    player = createBossPlayer();
    player.weaponType = 'BOSS';
    player.weaponLevel = 3;

    supportShip.usesLeft = 0;
    supportShip.active = false;
    supportShip.bullets = [];
    shield.usesLeft = 0;
    shield.active = false;
    specialAbility.usesLeft = 0;

    startWave();
    gameState = 'PLAYING';
    showScreen('gameScreen');
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-complete').style.display = 'none';
    updateHUD();
    createTextParticle(canvas.width / 2, canvas.height / 2, '👾 MODO BOSS: ' + player.label, player.color, 28);
    createTextParticle(canvas.width / 2, canvas.height / 2 + 40, '🔥 Destruye a todos!', '#FFFFFF', 18);
}

function gameLoop() {
    if (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') {
        if (gameState === 'PLAYING') update();
        draw();
        gameLoopId = requestAnimationFrame(gameLoop);
    } else {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}