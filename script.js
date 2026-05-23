const firebaseConfig={
apiKey:"AIzaSyD98VgtJlRZwyAqjfisscynyHJDU0yDCfM",
authDomain:"bank-e648b.firebaseapp.com",
databaseURL:"https://bank-e648b-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"bank-e648b",
storageBucket:"bank-e648b.appspot.com",
messagingSenderId:"26932429584",
appId:"1:26932429584:web:49e5122c7b7066ce2ddb95"
};

firebase.initializeApp(firebaseConfig);

const db=firebase.database();

const defaultUsers={
Adam:{pin:'2103',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Mhmd:{pin:'2708',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Jwd:{pin:'1006',admin:true,balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Ali:{pin:'2506',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Jawad:{pin:'3007',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Hsen:{pin:'1105',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Hanady:{pin:'3690',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Abbas:{pin:'1023',balance:100,gold:0,transactions:['🎁 Welcome bonus +$100']},
Mr_Alireda:{pin:'1987',admin:true,displayName:'Mr.Alireda'}
};

let users={...defaultUsers};
let currentUser=null;
let goldPrice=10;

const populateLoginUsers=()=>{

const loginSelect=document.getElementById('username');

if(!loginSelect)return;

while(loginSelect.options.length>1){
loginSelect.remove(1);
}

Object.keys(users).forEach(name=>{

if(users[name].approved===false&&!users[name].admin){
return;
}

const option=document.createElement('option');

option.value=name;

option.textContent=
(users[name].displayName||name)+
(users[name].admin?' (Admin)':'');

loginSelect.appendChild(option);

});

};

const connectDatabase=()=>{

populateLoginUsers();

db.ref('users').on('value',(snapshot)=>{

const data=snapshot.val();

if(data){

users=data;

populateLoginUsers();

if(currentUser){

users[currentUser].admin
?showAdmin()
:showUser();

}

}else{

db.ref('users').set(defaultUsers);

}

});

db.ref('settings/goldPrice').on('value',(snapshot)=>{

const data=snapshot.val();

if(data!==null){

goldPrice=data;

document.querySelectorAll('.live-gold-price')
.forEach(el=>{
el.innerText=goldPrice;
});

}else{

db.ref('settings/goldPrice').set(10);

}

});

};

const login=()=>{

const user=document.getElementById('username').value;
const pin=document.getElementById('password').value;

if(!users[user]){
return alert('Select a user!');
}

if(users[user].pin!==pin){
return alert('Wrong PIN!');
}

if(users[user].approved===false&&!users[user].admin){
return alert('Your account is waiting for admin approval!');
}

currentUser=user;

document.getElementById('loginBox')
.classList.add('hidden');

if(users[currentUser].admin){

document.getElementById('adminPanel')
.classList.remove('hidden');

showAdmin();

}else{

document.getElementById('dashboard')
.classList.remove('hidden');

showUser();

}

};

const registerUser=()=>{

const accountName=document.getElementById('regAccountName').value.trim();
const email=document.getElementById('regEmail').value.trim();
const pin=document.getElementById('regPassword').value.trim();
const firstName=document.getElementById('regName').value.trim();
const familyName=document.getElementById('regFamilyName').value.trim();
const dadName=document.getElementById('regDadName').value.trim();
const dob=document.getElementById('regDob').value;

const genderInput=document.querySelector('input[name="regGender"]:checked');

const gender=genderInput?genderInput.value:'';

if(!accountName||!email||!pin||!firstName||!familyName||!dadName||!dob||!gender){
return alert("Please fill in all fields!");
}

if(!/^\d{4}$/.test(pin)){
return alert("PIN must be exactly 4 digits!");
}

if(users[accountName]){
return alert("Account already exists!");
}

users[accountName]={
pin:pin,
email:email,
displayName:accountName,
firstName:firstName,
familyName:familyName,
dadName:dadName,
dob:dob,
gender:gender,
approved:false,
balance:100,
gold:0,
transactions:['⏳ Waiting for admin approval']
};

db.ref('users').set(users);

alert('Account created successfully! Wait for admin approval.');

document.getElementById('registerBox')
.classList.add('hidden');

document.getElementById('loginBox')
.classList.remove('hidden');

};

const approveUser=(username)=>{

if(!users[username])return;

users[username].approved=true;

users[username].transactions.push(
'✅ Account approved by admin'
);

db.ref('users').set(users);

alert(`${username} approved successfully!`);

};

const denyUser=(username)=>{

if(!users[username])return;

const confirmDelete=confirm(
`Are you sure you want to deny and delete ${username}'s request?`
);

if(!confirmDelete)return;

delete users[username];

db.ref('users').set(users);

alert(`${username}'s request was denied.`);

};

const showUser=()=>{

const u=users[currentUser];

document.getElementById('welcome').innerText=
`Welcome ${u.displayName||currentUser}`;

document.getElementById('balance').innerText=
`$${u.balance}`;

document.getElementById('goldBalance').innerHTML=
`🪙 Gold: ${u.gold||0}<br><small style="font-size:0.9rem;opacity:0.9;">(Current Market Value: $${goldPrice}/ea)</small>`;

const qrImg=document.getElementById('userQrCode');

if(qrImg){

qrImg.src=
`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser}`;

}

};

const showAdmin=()=>{

refreshKidCards();
refreshPendingAccounts();

};

const refreshKidCards=()=>{

const grid=document.getElementById('kidGrid');

if(!grid)return;

grid.innerHTML='';

Object.keys(users).forEach(n=>{

if(!users[n].admin){

const u=users[n];

const card=document.createElement('div');

card.className='kid-card';

card.innerHTML=`
<h3>${n}</h3>
<p>Balance: $${u.balance}</p>
<p>Gold: 🪙 ${u.gold||0}</p>
`;

grid.appendChild(card);

}

});

};

const refreshPendingAccounts=()=>{

const pendingBox=document.getElementById('pendingAccounts');

if(!pendingBox)return;

pendingBox.innerHTML='';

Object.keys(users).forEach(username=>{

const user=users[username];

if(user.admin)return;

if(user.approved!==false)return;

const div=document.createElement('div');

div.className='transaction';

div.style.padding='20px';

div.innerHTML=`
<h3 style="margin-bottom:15px;color:#ff69b4;">
⏳ Pending Account
</h3>

<p><b>Username:</b> ${username}</p>
<p><b>Email:</b> ${user.email||'N/A'}</p>
<p><b>First Name:</b> ${user.firstName||'N/A'}</p>
<p><b>Family Name:</b> ${user.familyName||'N/A'}</p>
<p><b>Dad Name:</b> ${user.dadName||'N/A'}</p>
<p><b>Date of Birth:</b> ${user.dob||'N/A'}</p>
<p><b>Gender:</b> ${user.gender||'N/A'}</p>
<p><b>PIN:</b> ${user.pin||'N/A'}</p>

<div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">

<button
onclick="approveUser('${username}')"
style="background:#2ecc71;flex:1;">
✅ Approve
</button>

<button
onclick="denyUser('${username}')"
style="background:#e74c3c;flex:1;">
❌ Deny
</button>

</div>
`;

pendingBox.appendChild(div);

});

};

document.addEventListener('DOMContentLoaded',()=>{

connectDatabase();

document.getElementById('loginButton').onclick=login;

document.getElementById('registerSubmitBtn').onclick=
registerUser;

document.getElementById('showRegisterBtn').onclick=
(e)=>{

e.preventDefault();

document.getElementById('loginBox')
.classList.add('hidden');

document.getElementById('registerBox')
.classList.remove('hidden');

};

document.getElementById('backToLoginBtn').onclick=
(e)=>{

e.preventDefault();

document.getElementById('registerBox')
.classList.add('hidden');

document.getElementById('loginBox')
.classList.remove('hidden');

};

const themeBtn=document.getElementById('toggleTheme');

if(themeBtn){

themeBtn.onclick=()=>{

document.body.classList.toggle('dark');

};

}

});