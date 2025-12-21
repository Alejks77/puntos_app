
// STATE
let points = [];
let redeemed = [];

// INIT
function init() {
    points = JSON.parse(localStorage.getItem('koala_points_standalone')) || [];
    redeemed = JSON.parse(localStorage.getItem('koala_redeemed_standalone')) || [];
    renderPoints();
    renderTasks();
    renderRewards();
    scheduleCatWalk();
}

// CAT LOGIC
function scheduleCatWalk() {
    // Random interval between 10s and 60s
    const delay = Math.random() * 50000 + 10000;
    setTimeout(startCatWalk, delay);
}

function startCatWalk() {
    const cat = document.getElementById('cat-container');
    if (!cat) return;

    // Reset position
    cat.style.transition = 'none';
    cat.style.transform = 'translateX(100px)'; // Start off-screen right

    // Force reflow
    void cat.offsetWidth;

    // Animate across screen to left
    cat.style.transition = 'transform 15s linear';
    cat.style.transform = 'translateX(-120vw)'; // Walk all the way to left

    // Schedule next walk after animation finishes (15s + buffer)
    setTimeout(scheduleCatWalk, 16000);
}

// DATA
const POSITIVE_TASKS = [
    // RUTINAS BASICAS (+1)
    { title: "Ordenar mochila al llegar", icon: "🎒", points: 1 },
    { title: "Vestirse por la mañana", icon: "👕", points: 1 },
    { title: "Ponerse el pijama solo", icon: "🌙", points: 1 },
    { title: "Lavarse los dientes", icon: "🦷", points: 1 },
    { title: "Bañarse/Lavarse", icon: "🛁", points: 1 },
    { title: "Recoger juguetes", icon: "🧸", points: 1 },
    { title: "No dejar ropa suelo", icon: "👖", points: 1 },

    // COMIDA
    { title: "Comerse TODO el plato", icon: "🍽️", points: 2 },
    { title: "Comerse MEDIO plato", icon: "🥣", points: 1 },
    { title: "Probar comida nueva", icon: "👅", points: 1 },
    { title: "Comer comida nueva ENTERA", icon: "🥗", points: 3 },
    { title: "Comer fruta", icon: "🍎", points: 1 },

    // EXTRAS / RETOS (+3 a +8)
    { title: "Ayudar en cosas relevantes", icon: "🤝", points: 1 },
    { title: "Ir al parque a jugar", icon: "🌳", points: 3 },
    { title: "CERO Tablet en todo el día", icon: "📵", points: 8 },
    { title: "CERO Consolas en todo el día", icon: "🎮", points: 8 }
];

const NEGATIVE_TASKS = [
    { title: "NO comerse la comida", icon: "😤", points: -3 },
    { title: "Pegar / Hitting", icon: "🥊", points: -1 },
    { title: "Insultar / Hablar mal", icon: "🤬", points: -1 },
    { title: "Romper cosas", icon: "🔨", points: -1 },
    { title: "Chillar / Screaming", icon: "🗣️", points: -1 }
];

// RENDER
function renderTasks() {
    const posContainer = document.getElementById('positive-tasks-list');
    const negContainer = document.getElementById('negative-tasks-list');
    if (!posContainer || !negContainer) return;

    if (posContainer.innerHTML === '') {
        POSITIVE_TASKS.forEach((t) => {
            const div = document.createElement('div');
            div.className = 'task-card';
            // Show points in header e.g. "🎒 Ordenar mochila (+1)"
            div.innerHTML = `
                <div class="task-header">${t.icon} ${t.title} <span style="font-size:0.8em;opacity:0.7;">(+${t.points})</span></div>
                <div class="task-actions">
                    <button class="action-btn btn-oliver" onclick="addPoint('oliver', '${t.title}', ${t.points})">OLIVER</button>
                    <button class="action-btn btn-mateo" onclick="addPoint('mateo', '${t.title}', ${t.points})">MATEO</button>
                </div>
            `;
            posContainer.appendChild(div);
        });
    }

    if (negContainer.innerHTML === '') {
        NEGATIVE_TASKS.forEach((t) => {
            const div = document.createElement('div');
            div.className = 'task-card negative-task';
            div.innerHTML = `
                <div class="task-header">${t.icon} ${t.title} <span style="font-size:0.8em;opacity:0.7;">(${t.points})</span></div>
                <div class="task-actions">
                    <button class="action-btn btn-oliver" onclick="addPoint('oliver', '${t.title}', ${t.points})">OLIVER</button>
                    <button class="action-btn btn-mateo" onclick="addPoint('mateo', '${t.title}', ${t.points})">MATEO</button>
                </div>
            `;
            negContainer.appendChild(div);
        });
    }
}

function renderPoints() {
    const scores = calculateScores();

    updateText('score-oliver-total', scores.oliver);
    updateText('score-mateo-total', scores.mateo);

    // Assuming simple positive count (optional, sticking to requested total view)
    // We will just show current spendable balance in the big circle.

    // Historical
    updateText('hist-oliver', scores.historicalOliver);
    updateText('hist-mateo', scores.historicalMateo);

    renderPointsLog();
}

function updateText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function renderPointsLog() {
    const container = document.getElementById('points-log-container');
    if (!container || container.style.display === 'none') return;

    container.innerHTML = '';
    const recent = [...points].sort((a, b) => b.id - a.id).slice(0, 20);

    if (recent.length === 0) {
        container.innerHTML = '<p style="padding:10px;text-align:center;color:#666;">Sin actividad reciente.</p>';
        return;
    }

    recent.forEach(p => {
        const div = document.createElement('div');
        div.className = 'log-item';

        const color = p.child === 'oliver' ? 'var(--oliver-color)' : 'var(--mateo-color)';
        const sign = p.value > 0 ? '+' : '';
        const valColor = p.value > 0 ? 'green' : 'red';

        div.innerHTML = `
            <span><b style="color:${color}">${p.child.toUpperCase().slice(0, 1)}</b> ${p.rule}</span>
            <span style="color:${valColor}; font-weight:bold;">${sign}${p.value} <span onclick="undoPoint(${p.id})" style="color:#000;cursor:pointer;margin-left:10px;">🗑️</span></span>
        `;
        container.appendChild(div);
    });
}


// ACTIONS
function addPoint(child, rule, value) {
    points.push({
        id: Date.now(),
        date: new Date().toISOString(),
        child: child,
        rule: rule,
        value: value
    });
    saveData();
}

function undoPoint(id) {
    if (confirm('¿Borrar este punto?')) {
        points = points.filter(p => p.id !== id);
        saveData();
    }
}

function togglePointsLog() {
    const log = document.getElementById('points-log-container');
    if (log.style.display === 'none') {
        log.style.display = 'block';
        renderPointsLog();
    } else {
        log.style.display = 'none';
    }
}

const REWARDS = [
    { title: "Noche de cine", cost: 100, icon: "🎬" },
    { title: "Elige la cena", cost: 50, icon: "🍕" },
    { title: "Juegos en familia", cost: 40, icon: "🎲" },
    { title: "Acampada en el salón", cost: 150, icon: "⛺" },
    { title: "Mandar en casa por un día", cost: 150, icon: "👑" },
    { title: "Postre favorito", cost: 25, icon: "🍰" },
    { title: "Comprar tiempo tablet/consola", cost: 125, icon: "🎮" }
];

function renderRewards() {
    const list = document.getElementById('rewards-list-container');
    if (!list) return;
    list.innerHTML = '';

    const currentScores = calculateScores(); // { oliver: X, mateo: Y }

    REWARDS.forEach(r => {
        const div = document.createElement('div');
        div.className = 'reward-card-item';

        const canOliver = currentScores.oliver >= r.cost;
        const canMateo = currentScores.mateo >= r.cost;

        div.innerHTML = `
            <div class="reward-info">
                <span class="reward-icon">${r.icon}</span>
                <span class="reward-title">${r.title}</span>
                <span class="reward-cost">${r.cost} pts</span>
            </div>
            <div class="reward-actions">
                <button 
                    onclick="redeemReward('oliver', '${r.title}', ${r.cost})" 
                    class="redeem-btn ${canOliver ? 'can-buy-oliver' : 'locked'}" 
                    ${!canOliver ? 'disabled' : ''}>
                    OLIVER
                </button>
                <button 
                    onclick="redeemReward('mateo', '${r.title}', ${r.cost})" 
                    class="redeem-btn ${canMateo ? 'can-buy-mateo' : 'locked'}" 
                    ${!canMateo ? 'disabled' : ''}>
                    MATEO
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}

function redeemReward(child, title, cost) {
    if (confirm(`¿${child.toUpperCase()} quiere gastar ${cost} puntos en "${title}"?`)) {
        redeemed.push({
            id: Date.now(),
            child: child,
            reward: title,
            cost: cost,
            date: new Date().toISOString()
        });
        saveData();
    }
}

function calculateScores() {
    const scoreO = points.filter(p => p.child === 'oliver').reduce((a, c) => a + c.value, 0);
    const scoreM = points.filter(p => p.child === 'mateo').reduce((a, c) => a + c.value, 0);

    // Abstract redeemed costs
    const spentO = redeemed.filter(r => r.child === 'oliver').reduce((a, c) => a + c.cost, 0);
    const spentM = redeemed.filter(r => r.child === 'mateo').reduce((a, c) => a + c.cost, 0);

    return {
        oliver: scoreO - spentO,
        mateo: scoreM - spentM,
        historicalOliver: scoreO, // Cumulative positives + negatives (net total earned ever)
        historicalMateo: scoreM
    };
}

// TOGGLE REMOVED - PERMANENT LIST NOW


// REDEEMED HISTORY
function renderRedeemedHistory() {
    const container = document.getElementById('redeemed-history-list');
    if (!container) return;
    container.innerHTML = '';

    if (redeemed.length === 0) {
        container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem; text-align:center;">Ningún premio canjeado aún.</div>';
        return;
    }

    // Sort by date desc
    const sorted = [...redeemed].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(r => {
        const div = document.createElement('div');
        div.className = 'redeemed-item';
        const dateStr = new Date(r.date).toLocaleDateString();
        const color = r.child === 'oliver' ? 'var(--primary-cyan)' : 'var(--primary-pink)';

        div.innerHTML = `
            <span style="color:${color}; font-weight:bold;">${r.child.toUpperCase().slice(0, 1)}</span>
            <span style="flex:1; margin-left:10px; color:var(--text-dim);">${r.reward}</span>
            <span style="color:var(--text-dim); font-size:0.8em;">${dateStr}</span>
        `;
        container.appendChild(div);
    });
}

function saveData() {
    localStorage.setItem('koala_points_standalone', JSON.stringify(points));
    localStorage.setItem('koala_redeemed_standalone', JSON.stringify(redeemed));
    renderPoints();
    renderRewards();
    renderRedeemedHistory();
}

// START
window.onload = init;
