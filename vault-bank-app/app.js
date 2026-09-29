const transactions = [
  ['S','Spotify','Music & subscriptions','Today, 8:42 AM','- $10.99','spotify'],
  ['W','Whole Foods Market','Groceries','Yesterday, 6:18 PM','- $84.26','market'],
  ['N','Netflix','Entertainment','Jul 18, 2026','- $15.49','netflix'],
  ['↙','Acme Studio','Salary payment','Jul 16, 2026','+ $4,280.00','salary']
];
const list = document.getElementById('transactionList');
list.innerHTML = transactions.map(([icon,name,category,date,amount,style]) => `<article class="transaction"><div class="merchant-icon ${style}">${icon}</div><div class="transaction-info"><b>${name}</b><small>${category} · ${date}</small></div><div class="transaction-amount ${amount[0] === '+' ? 'positive' : ''}">${amount}<small>Personal account</small></div></article>`).join('');
const modal = document.getElementById('modalBackdrop');
const showModal = () => modal.classList.add('show');
document.getElementById('transferTop').onclick = showModal;
document.getElementById('sendAction').onclick = showModal;
document.getElementById('closeModal').onclick = () => modal.classList.remove('show');
modal.onclick = e => { if (e.target === modal) modal.classList.remove('show'); };
document.getElementById('transferForm').onsubmit = e => { e.preventDefault(); const btn=e.target.querySelector('button'); btn.textContent='Transfer ready ✓'; btn.style.background='#148270'; setTimeout(()=>{modal.classList.remove('show');btn.textContent='Continue transfer →';btn.style.background='';e.target.reset()},1100); };
document.querySelectorAll('.nav-item[data-page]').forEach(button => button.onclick = () => { document.querySelector('.nav-item.active').classList.remove('active'); button.classList.add('active'); document.getElementById('pageTitle').textContent = button.dataset.page; document.getElementById('sidebar').classList.remove('open'); });
document.getElementById('menuButton').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
document.getElementById('addFunds').onclick=()=>alert('Add money is ready to connect to your preferred payment provider.');
document.getElementById('customize').onclick=()=>alert('Your quick actions can be personalized here.');
