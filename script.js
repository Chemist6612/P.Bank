const firebaseConfig = {
    apiKey: "AIzaSyD98VgtJlRZwyAqjfisscynyHJDU0yDCfM",
    authDomain: "bank-e648b.firebaseapp.com",
    databaseURL: "https://bank-e648b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bank-e648b",
    storageBucket: "bank-e648b.firebasestorage.app",
    messagingSenderId: "26932429584",
    appId: "1:26932429584:web:49e5122c7b7066ce2ddb95"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let users = {};
let currentUser = null;

// --- AUTO-UNLOCK ON CONNECTION ---
db.ref('users').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        users = data;
        
        // Update UI to show we are ready
        const statusHeader = document.getElementById('loadingStatus');
        if (statusHeader) {
            statusHeader.innerText = "✅ Vault Connection Secure";
            statusHeader.style.background = "#e8f5e9";
            statusHeader.style.color = "#2e7d32";
        }
        
        // Enable inputs
        document.getElementById('username').disabled = false;
        document.getElementById('loginBtn').disabled = false;

        // Auto-refresh UI if logged in
        if (currentUser) {
            if (users[currentUser].admin) refreshKidCards();
            else showUserDashboard();
        }
    } else {
        // First time setup if DB is empty
        initializeDatabase();
    }
});

function initializeDatabase() {
    const defaultData = {
        Adam:{pin:'2103',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Mhmd:{pin:'2708',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Jwd:{pin:'1006',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Ali:{pin:'2506',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Jawad:{pin:'3007',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Hsen:{pin:'1105',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        Hanady:{pin:'3690',balance:100,gold:0,photo:'https://i.imgur.com/6VBx3io.png',transactions:['🎁 Welcome +$100']},
        'Mr.Alireda':{pin:'1987',admin:true}
    };
    db.ref('users').set(defaultData);
}

function login() {
    const name = document.getElementById('username').value;
    const pin = document.getElementById('password').value;

    if (!name) return alert("Select your name first!");
    
    // This check is now safe because the button is only enabled when data is ready
    if (!users[name]) return alert("Data error: User not synced. Refreshing...");

    if (users[name].pin !== pin) return alert("Incorrect PIN!");

    currentUser = name;
    document.getElementById('loginBox').classList.add('hidden');

    if (users[currentUser].admin) {
        document.getElementById('adminPanel').classList.remove('hidden');
        refreshKidCards();
    } else {
        document.getElementById('dashboard').classList.remove('hidden');
        showUserDashboard();
    }
}

function showUserDashboard() {
    const u = users[currentUser];
    document.getElementById('welcomeText').innerText = `Welcome, ${currentUser}`;
    document.getElementById('balanceDisplay').innerText = `$${u.balance}`;
    document.getElementById('goldDisplay').innerText = `🪙 Gold: ${u.gold || 0}`;

    const list = document.getElementById('transactionList');
    list.innerHTML = '';
    if (u.transactions) {
        u.transactions.slice().reverse().forEach(t => {
            const div = document.createElement('div');
            div.className = 'transaction';
            div.innerText = t;
            list.appendChild(div);
        });
    }
}

function refreshKidCards() {
    const grid = document.getElementById('kidGrid');
    grid.innerHTML = "";
    Object.keys(users).forEach(name => {
        if (!users[name].admin) {
            const u = users[name];
            grid.innerHTML += `
                <div class="kid-card" style="padding:15px; border:1px solid #ddd; border-radius:10px; margin:5px; text-align:center;">
                    <h3>${name}</h3>
                    <p>Balance: $${u.balance}</p>
                    <button onclick="db.ref('users/${name}/balance').set(${u.balance + 10})">Add $10</button>
                </div>`;
        }
    });
}

function claimDailyReward() {
    const today = new Date().toDateString();
    if (users[currentUser].lastClaim === today) return alert("Already claimed today!");

    const newBalance = users[currentUser].balance + 20;
    const newTransactions = [...(users[currentUser].transactions || []), `🎁 Daily Reward +$20` ];

    db.ref(`users/${currentUser}`).update({
        balance: newBalance,
        lastClaim: today,
        transactions: newTransactions
    });
}

function toggleDarkMode() { document.body.classList.toggle('dark'); }
function logout() { location.reload(); }