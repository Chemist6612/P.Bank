const firebaseConfig = {
    apiKey: "AIzaSyD98VgtJlRZwyAqjfisscynyHJDU0yDCfM",
    authDomain: "bank-e648b.firebaseapp.com",
    databaseURL: "https://bank-e648b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bank-e648b",
    storageBucket: "bank-e648b.appspot.com",
    messagingSenderId: "26932429584",
    appId: "1:26932429584:web:49e5122c7b7066ce2ddb95"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const defaultUsers = {
    Adam: { pin: '2103', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Mhmd: { pin: '2708', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Jwd: { pin: '1006', admin: true, balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Ali: { pin: '2506', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Jawad: { pin: '3007', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Hsen: { pin: '1105', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Hanady: { pin: '3690', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Abbas: { pin: '1023', balance: 100, gold: 0, transactions: ['🎁 Welcome bonus +$100'] },
    Mr_Alireda: { pin: '1987', admin: true, displayName: 'Mr.Alireda' }
};

let users = { ...defaultUsers };
let currentUser = null;

const populateLoginUsers = () => {
    const loginSelect = document.getElementById('username');
    if (!loginSelect) return;
    while(loginSelect.options.length > 1) loginSelect.remove(1);
    Object.keys(users).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = (users[name].displayName || name) + (users[name].admin ? ' (Admin)' : '');
        loginSelect.appendChild(option);
    });
};

const connectDatabase = () => {
    populateLoginUsers(); 
    db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            users = data;
            populateLoginUsers();
            if (currentUser) {
                users[currentUser].admin ? refreshKidCards() : showUser();
            }
        } else {
            db.ref('users').set(defaultUsers);
        }
    });
};

const login = () => {
    const user = document.getElementById('username').value;
    const pin = document.getElementById('password').value;
    
    if (!users[user]) return alert('Select a user!');
    if (users[user].pin !== pin) return alert('Wrong PIN!');

    currentUser = user;
    document.getElementById('loginBox').classList.add('hidden');
    
    if (users[currentUser].admin) {
        document.getElementById('adminPanel').classList.remove('hidden');
        showAdmin();
    } else {
        document.getElementById('dashboard').classList.remove('hidden');
        showUser();
    }
};

const showUser = () => {
    const u = users[currentUser];
    document.getElementById('welcome').innerText = `Welcome ${u.displayName || currentUser}`;
    document.getElementById('balance').innerText = `$${u.balance}`;
    
    // --- TRANSACTION FIX ---
    const list = document.getElementById('transactionList');
    if (list) {
        list.innerHTML = '';
        const history = u.transactions || [];
        history.slice().reverse().forEach(t => {
            const d = document.createElement('div');
            d.className = 'transaction';
            d.innerText = t;
            list.appendChild(d);
        });
    }
};

const showAdmin = () => {
    const sel = document.getElementById('selectedKid');
    const rec = document.getElementById('receiverKid');
    sel.innerHTML = '';
    rec.innerHTML = '';
    
    Object.keys(users).forEach(n => {
        if (!users[n].admin) {
            const opt = `<option value="${n}">${users[n].displayName || n}</option>`;
            sel.innerHTML += opt;
            rec.innerHTML += opt;
        }
    });
    refreshKidCards();
};

const refreshKidCards = () => {
    const grid = document.getElementById('kidGrid');
    const adminHistory = document.getElementById('adminFullHistory');
    if (!grid) return;
    
    grid.innerHTML = '';
    if (adminHistory) adminHistory.innerHTML = '';

    Object.keys(users).forEach(n => {
        if (!users[n].admin) {
            const u = users[n];
            
            // Show Cards
            const card = document.createElement('div');
            card.className = 'kid-card';
            card.innerHTML = `<h3>${n}</h3><p>Balance: $${u.balance}</p>`;
            grid.appendChild(card);

            // Show History in Admin Panel
            if (adminHistory) {
                const section = document.createElement('div');
                section.innerHTML = `<h4>${n}</h4>`;
                const hist = u.transactions || [];
                hist.slice().reverse().forEach(t => {
                    section.innerHTML += `<div class="transaction">${t}</div>`;
                });
                adminHistory.appendChild(section);
            }
        }
    });
};

const applyAction = () => {
    const kid = document.getElementById('selectedKid').value;
    const type = document.getElementById('actionType').value;
    const amt = Number(document.getElementById('amount').value);
    const reason = document.getElementById('reason').value || "No reason provided";
    
    if (!users[kid]) return alert("Select a kid first!");
    if (!users[kid].transactions) users[kid].transactions = [];

    if (type === 'add') {
        users[kid].balance += amt;
        users[kid].transactions.push(`💰 +$${amt} | ${reason}`);
    } else if (type === 'remove') {
        users[kid].balance -= amt;
        users[kid].transactions.push(`😈 -$${amt} | ${reason}`);
    }

    db.ref('users').set(users);
    alert('Transaction Successful!');
};

document.addEventListener('DOMContentLoaded', () => {
    connectDatabase();
    document.getElementById('loginButton').onclick = login;
    document.getElementById('applyActionButton').onclick = applyAction;
    document.getElementById('toggleTheme').onclick = () => document.body.classList.toggle('dark');
});