const textElement = document.getElementById('text');
const optionsElement = document.getElementById('options');
const inventoryElement = document.getElementById('inventory-list');
const combatSection = document.getElementById('combat');
const enemyNameEl = document.getElementById('enemy-name');
const enemyHealthEl = document.getElementById('enemy-health');
const playerHealthEl = document.getElementById('player-health');

let state = {
  inventory: [],
  health: 100
};

let currentEnemy = null;
let returnAfterCombat = 0;

function startGame() {
  state = {
    inventory: [],
    health: 100
  };
  currentEnemy = null;
  showTextNode(1);
}

function showTextNode(nodeIndex) {
  const node = textNodes.find(n => n.id === nodeIndex);
  textElement.innerText = node.text;

  optionsElement.innerHTML = '';
  combatSection.style.display = 'none';

  node.options.forEach(option => {
    if (showOption(option)) {
      const button = document.createElement('button');
      button.innerText = option.text;
      button.onclick = () => selectOption(option);
      optionsElement.appendChild(button);
    }
  });

  updateInventoryDisplay();
}

function showOption(option) {
  return option.requiredState == null || option.requiredState(state);
}

function selectOption(option) {
  if (option.addItem && !state.inventory.includes(option.addItem)) {
    state.inventory.push(option.addItem);
  }

  if (option.removeItem) {
    state.inventory = state.inventory.filter(item => item !== option.removeItem);
  }

  if (option.combat) {
    startCombat(option.enemy, option.nextText);
    return;
  }

  const nextNodeId = option.nextText;
  if (nextNodeId <= 0) return startGame();
  showTextNode(nextNodeId);
}

function updateInventoryDisplay() {
  inventoryElement.innerText = state.inventory.length > 0 ? state.inventory.join(', ') : 'None';
}

function startCombat(enemy, nextTextNode) {
  currentEnemy = {
    name: enemy.name,
    health: enemy.health
  };
  returnAfterCombat = nextTextNode;

  textElement.innerText = `You are fighting ${enemy.name}!`;
  optionsElement.innerHTML = '';
  combatSection.style.display = 'block';

  updateCombatUI();
}

function updateCombatUI() {
  enemyNameEl.innerText = currentEnemy.name;
  enemyHealthEl.innerText = currentEnemy.health;
  playerHealthEl.innerText = state.health;
}

function attackEnemy() {
  const hasSword = state.inventory.includes('Sword');
  const damage = hasSword ? 30 : 10;
  currentEnemy.health -= damage;

  if (currentEnemy.health <= 0) {
    combatSection.style.display = 'none';
    showTextNode(returnAfterCombat);
    return;
  }

  // Enemy attacks back
  const enemyDamage = Math.floor(Math.random() * 15) + 5;
  state.health -= enemyDamage;

  if (state.health <= 0) {
    textElement.innerText = "You were defeated in battle...";
    optionsElement.innerHTML = `<button onclick="startGame()">Play Again</button>`;
    combatSection.style.display = 'none';
    return;
  }

  updateCombatUI();
}

function runFromCombat() {
  textElement.innerText = "You ran away!";
  optionsElement.innerHTML = `<button onclick="showTextNode(${returnAfterCombat})">Continue</button>`;
  combatSection.style.display = 'none';
}


const textNodes = [
  {
    id: 1,
    text: 'You wake up in a dark forest. A path lies ahead.',
    options: [
      { text: 'Take the path', nextText: 2 },
      { text: 'Search the area (find a sword)', addItem: 'Sword', nextText: 2 }
    ]
  },
  {
    id: 2,
    text: 'A goblin blocks your path!',
    options: [
      {
        text: 'Fight the goblin',
        combat: true,
        enemy: { name: 'Goblin', health: 50 },
        nextText: 3
      },
      {
        text: 'Run away',
        nextText: 4
      }
    ]
  },
  {
    id: 3,
    text: 'You defeated the goblin and continue your journey!',
    options: [{ text: 'Play Again', nextText: -1 }]
  },
  {
    id: 4,
    text: 'You flee into the woods. The adventure ends... for now.',
    options: [{ text: 'Play Again', nextText: -1 }]
  }
];


startGame();
