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

const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
const moneySound = new Audio('https://www.soundjay.com/misc/sounds/cash-register-01.mp3');

let users = {};
let currentUser = null;
const goldPrice = 10;

// Default users (initialize immediately)
const defaultUsers = {
    Adam: { pin: '2103', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Mhmd: { pin: '2708', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Jwd: { pin: '1006', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Ali: { pin: '2506', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Jawad: { pin: '3007', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Hsen: { pin: '1105', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    Hanady: { pin: '3690', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
    'Mr.Alireda': { pin: '1987', admin: true }
};

// Set users immediately
users = { ...defaultUsers };

// DOM Element References
let elements = {};
let controls = {};
let buttons = {};

// Initialize after DOM is ready
function initializeDOM() {
    elements = {
        loginBox: document.getElementById('loginBox'),
        dashboard: document.getElementById('dashboard'),
        adminPanel: document.getElementById('adminPanel'),
        welcome: document.getElementById('welcome'),
        balance: document.getElementById('balance'),
        goldBalance: document.getElementById('goldBalance'),
        fakeCard: document.getElementById('fakeCard'),
        qrcode: document.getElementById('qrcode'),
        transactionList: document.getElementById('transactionList'),
        receipt: document.getElementById('receipt'),
        receiptContent: document.getElementById('receiptContent'),
        selectedKid: document.getElementById('selectedKid'),
        receiverKid: document.getElementById('receiverKid'),
        transferUser: document.getElementById('transferUser'),
        kidGrid: document.getElementById('kidGrid')
    };

    controls = {
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        transferAmount: document.getElementById('transferAmount'),
        goldAmount: document.getElementById('goldAmount'),
        appleAmount: document.getElementById('appleAmount'),
        amount: document.getElementById('amount'),
        actionType: document.getElementById('actionType'),
        reason: document.getElementById('reason')
    };

    buttons = {
        toggleTheme: document.getElementById('toggleTheme'),
        login: document.getElementById('loginButton'),
        claimReward: document.getElementById('claimReward'),
        applePay: document.getElementById('applePayButton'),
        transfer: document.getElementById('transferButton'),
        buyGold: document.getElementById('buyGoldButton'),
        printReceipt: document.getElementById('printReceiptButton'),
        logout: document.getElementById('logoutButton'),
        applyAction: document.getElementById('applyActionButton')
    };

    // Attach event listeners
    if (buttons.toggleTheme) buttons.toggleTheme.addEventListener('click', () => document.body.classList.toggle('dark'));
    if (buttons.login) buttons.login.addEventListener('click', login);
    if (buttons.claimReward) buttons.claimReward.addEventListener('click', claimDailyReward);
    if (buttons.applePay) buttons.applePay.addEventListener('click', applePay);
    if (buttons.transfer) buttons.transfer.addEventListener('click', transferMoney);
    if (buttons.buyGold) buttons.buyGold.addEventListener('click', buyGold);
    if (buttons.printReceipt) buttons.printReceipt.addEventListener('click', printReceipt);
    if (buttons.logout) buttons.logout.addEventListener('click', logout);
    if (buttons.applyAction) buttons.applyAction.addEventListener('click', applyAction);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    connectDatabase();
});

// Initialize Database
const initializeCloudData = () => {
    const initialUsers = {
        Adam: { pin: '2103', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Mhmd: { pin: '2708', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Jwd: { pin: '1006', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Ali: { pin: '2506', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Jawad: { pin: '3007', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Hsen: { pin: '1105', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        Hanady: { pin: '3690', balance: 100, gold: 0, photo: 'https://i.imgur.com/6VBx3io.png', transactions: ['🎁 Welcome bonus +$100'] },
        'Mr.Alireda': { pin: '1987', admin: true }
    };
    db.ref('users').set(initialUsers);
};

const saveData = () => db.ref('users').set(users);

// Load Transfer Users
const loadTransferUsers = () => {
    elements.transferUser.innerHTML = '';
    Object.keys(users).forEach(name => {
        if (name !== currentUser && !users[name].admin) {
            elements.transferUser.innerHTML += `<option value="${name}">${name}</option>`;
        }
    });
};

// Create Transaction Element
const createTransactionElement = (text) => {
    const div = document.createElement('div');
    div.className = 'transaction';
    div.innerText = text;
    return div;
};

// Show User Dashboard
const showUser = () => {
    elements.welcome.innerText = `Welcome ${currentUser}`;
    elements.balance.innerText = `$${users[currentUser].balance}`;
    elements.goldBalance.innerText = `🪙 Gold: ${users[currentUser].gold}`;
    elements.fakeCard.innerHTML = `
        <h3>💳 Kids Bank Card</h3>
        <div>4000 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}</div>
        <div>${currentUser}</div>
    `;
    elements.transactionList.innerHTML = '';

    if (users[currentUser].transactions) {
        users[currentUser].transactions.slice().reverse().forEach(t => {
            elements.transactionList.appendChild(createTransactionElement(t));
        });
    }

    loadTransferUsers();
    elements.qrcode.innerHTML = '';
    new QRCode(elements.qrcode, {
        text: `${currentUser} payment`,
        width: 120,
        height: 120
    });
};

// Show Admin Dashboard
const showAdmin = () => {
    elements.welcome.innerText = 'Welcome Boss 👑';
    elements.balance.innerText = 'ADMIN';
    elements.adminPanel.classList.remove('hidden');
    elements.selectedKid.innerHTML = '';
    elements.receiverKid.innerHTML = '';

    Object.keys(users).forEach(name => {
        if (!users[name].admin) {
            elements.selectedKid.innerHTML += `<option value="${name}">${name}</option>`;
            elements.receiverKid.innerHTML += `<option value="${name}">${name}</option>`;
        }
    });

    refreshKidCards();
};

// Refresh Kid Cards
const refreshKidCards = () => {
    elements.kidGrid.innerHTML = '';
    Object.keys(users).forEach(name => {
        if (!users[name].admin) {
            const card = document.createElement('div');
            card.className = 'kid-card';
            const lastTransaction = users[name].transactions ? users[name].transactions.slice(-1)[0] : 'No history';
            card.innerHTML = `
                <img class="profile" src="${users[name].photo}">
                <h3>${name}</h3>
                <div class="money">💵 $${users[name].balance}</div>
                <div>🪙 ${users[name].gold} Gold</div>
                <p>${lastTransaction}</p>
            `;
            elements.kidGrid.appendChild(card);
        }
    });
};

// Login Function
const login = () => {
    const username = controls.username.value;
    const password = controls.password.value;

    if (!users[username]) {
        alert('User not found');
        return;
    }

    if (users[username].pin !== password) {
        alert('Wrong PIN');
        return;
    }

    currentUser = username;
    clickSound.play();
    elements.loginBox.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');

    if (users[currentUser].admin) {
        showAdmin();
    } else {
        showUser();
        startScanner();
    }
};

// Apply Admin Action (Add, Remove, Tax, Transfer)
const applyAction = () => {
    const kid = elements.selectedKid.value;
    const receiver = elements.receiverKid.value;
    const amount = Number(controls.amount.value);
    const type = controls.actionType.value;
    const reason = controls.reason.value.trim() || 'No reason';

    if (amount <= 0) {
        alert('Invalid amount');
        return;
    }

    if (!users[kid].transactions) users[kid].transactions = [];

    if (type === 'add') {
        users[kid].balance += amount;
        users[kid].transactions.push(`💰 Reward +$${amount} | ${reason}`);
    } else if (type === 'remove') {
        users[kid].balance -= amount;
        users[kid].transactions.push(`😈 Taken -$${amount}`);
    } else if (type === 'tax') {
        users[kid].balance -= amount;
        users[kid].transactions.push(`💸 Tax -$${amount} | ${reason}`);
    } else if (type === 'transfer') {
        if (users[kid].balance < amount) {
            alert('Not enough money');
            return;
        }

        if (!users[receiver].transactions) users[receiver].transactions = [];
        users[kid].balance -= amount;
        users[receiver].balance += amount;
        users[kid].transactions.push(`🔄 Sent $${amount} to ${receiver}`);
        users[receiver].transactions.push(`🔄 Received $${amount} from ${kid}`);
    }

    moneySound.play();
    saveData();
    refreshKidCards();
};

// Transfer Money Between Users
const transferMoney = () => {
    const receiver = elements.transferUser.value;
    const amount = Number(controls.transferAmount.value);

    if (!receiver) {
        alert('Please select a receiver');
        return;
    }

    if (amount <= 0) {
        alert('Invalid amount');
        return;
    }

    if (users[currentUser].balance < amount) {
        alert('Not enough money');
        return;
    }

    if (!users[receiver].transactions) users[receiver].transactions = [];
    users[currentUser].balance -= amount;
    users[receiver].balance += amount;
    users[currentUser].transactions.push(`💸 Sent $${amount} to ${receiver}`);
    users[receiver].transactions.push(`💰 Received $${amount} from ${currentUser}`);
    moneySound.play();
    controls.transferAmount.value = '';
    saveData();
    showUser();
};

// Buy Gold
const buyGold = () => {
    const amount = Number(controls.goldAmount.value);
    const cost = amount * goldPrice;

    if (amount <= 0) {
        alert('Invalid amount');
        return;
    }

    if (users[currentUser].balance < cost) {
        alert('Not enough money');
        return;
    }

    users[currentUser].balance -= cost;
    users[currentUser].gold += amount;
    users[currentUser].transactions.push(`🪙 Bought ${amount} gold`);
    saveData();
    showUser();
};

// Claim Daily Reward
const claimDailyReward = () => {
    const today = new Date().toDateString();

    if (users[currentUser].lastClaim === today) {
        alert('Already claimed today');
        return;
    }

    users[currentUser].lastClaim = today;
    users[currentUser].balance += 20;
    users[currentUser].transactions.push('🎁 Daily reward +$20');
    saveData();
    showUser();
};

// Apple Pay
const applePay = () => {
    const amount = Number(controls.appleAmount.value);

    if (amount <= 0) {
        alert('Invalid amount');
        return;
    }

    if (users[currentUser].balance < amount) {
        alert('Not enough balance');
        return;
    }

    users[currentUser].balance -= amount;
    users[currentUser].transactions.push(`🍎 Apple Pay -$${amount}`);
    moneySound.play();
    saveData();
    showUser();
};

// Logout
const logout = () => {
    currentUser = null;
    elements.loginBox.classList.remove('hidden');
    elements.dashboard.classList.add('hidden');
    elements.adminPanel.classList.add('hidden');
    controls.password.value = '';
};

// Start QR Scanner
const startScanner = () => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 });
    scanner.render((result) => {
        alert('QR Scanned: ' + result);
        scanner.clear();
    });
};

// Print Receipt
const printReceipt = () => {
    elements.receiptContent.innerHTML = `
        <p><strong>User:</strong> ${currentUser}</p>
        <p><strong>Balance:</strong> $${users[currentUser].balance}</p>
        <p><strong>Gold:</strong> ${users[currentUser].gold}</p>
        <p><strong>Last action:</strong> ${users[currentUser].transactions.slice(-1)[0] || 'None'}</p>
    `;
    elements.receipt.classList.remove('hidden');
};

// Close Receipt
const closeReceipt = () => {
    elements.receipt.classList.add('hidden');
};

// Expose closeReceipt globally
window.closeReceipt = closeReceipt;

// Connect to Database
const connectDatabase = () => {
    db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();

        if (data) {
            users = data;
            if (currentUser) {
                if (users[currentUser].admin) {
                    refreshKidCards();
                } else {
                    showUser();
                }
            }
        } else {
            initializeCloudData();
        }
    });
};