(function(){
let coins = 0;
let levels = {Torpedo:1, Sonar:1, Bombs:1, Strike:1};

function launchGame(){
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#111;z-index:9999;font-family:sans-serif;color:#fff;padding:20px;overflow:auto';

  const status = document.createElement('div');
  status.textContent = 'Power-Up Mode: Player 1';
  status.style = 'margin-bottom:10px;font-size:16px';
  overlay.appendChild(status);

  const coinDisplay = document.createElement('div');
  coinDisplay.textContent = `Coins: ${coins}`;
  coinDisplay.style = 'margin-bottom:10px;font-size:14px';
  overlay.appendChild(coinDisplay);

  const layout = document.createElement('div');
  layout.style = 'display:flex;gap:20px';
  overlay.appendChild(layout);

  const size = 11, ships = 10;
  const grid = document.createElement('div');
  grid.style = `display:grid;grid-template-columns:repeat(${size},30px);grid-gap:3px`;
  layout.appendChild(grid);

  const board = [], cells = [], cooldowns = {Torpedo:0, Sonar:0, Bombs:0, Strike:0};
  let placed = 0, turn = 0, activePower = null;

  while (placed < ships){
    const i = Math.floor(Math.random() * size * size);
    if (!board[i]){ board[i] = true; placed++; }
  }

  function reveal(i){
    if (board[i]){
      cells[i].textContent = '🔥';
      cells[i].style.background = '#e00';
    } else {
      cells[i].textContent = '💦';
      cells[i].style.background = '#555';
    }
  }

  function updateCooldowns(){
    for (const [name, time] of Object.entries(cooldowns)){
      const btn = powerButtons[name];
      const ready = turn >= time;
      btn.style.background = ready ? '#0ff' : '#e00';
      btn.title = ready ? 'Ready' : `Cooldown: ${time - turn} turns`;
    }
  }

  const powerPanel = document.createElement('div');
  powerPanel.style = 'display:flex;flex-direction:column;align-items:flex-start';
  layout.appendChild(powerPanel);

  const powerButtons = {};
  ['Torpedo','Sonar','Bombs','Strike'].forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = p;
    btn.style = 'margin:5px;padding:5px 10px;background:#0ff;color:#000;border:none;cursor:pointer;border-radius:5px;font-size:14px';
    btn.onclick = () => {
      if (turn < cooldowns[p]){
        status.textContent = `${p} is on cooldown (${cooldowns[p] - turn} turns left)`;
        return;
      }
      coins++;
      coinDisplay.textContent = `Coins: ${coins}`;
      if (p === 'Bombs'){
        let r = 0, max = 10 + 5 * (levels[p] - 1);
        while (r < max){
          const i = Math.floor(Math.random() * size * size);
          if (cells[i].textContent === '🌊'){ reveal(i); r++; }
        }
        cooldowns[p] = turn + 15;
        turn++;
        updateCooldowns();
      } else if (p === 'Strike'){
        let r = 0, max = levels[p];
        for (let i = 0; i < size * size && r < max; i++){
          if (board[i] && cells[i].textContent === '🌊'){ reveal(i); r++; }
        }
        cooldowns[p] = turn + 15;
        turn++;
        updateCooldowns();
      } else {
        activePower = p;
        status.textContent = `Tap a cell to use ${p}`;
      }
    };
    powerPanel.appendChild(btn);
    powerButtons[p] = btn;
  });

  for (let i = 0; i < size * size; i++){
    const cell = document.createElement('button');
    cell.textContent = '🌊';
    cell.style = 'width:30px;height:30px;font-size:16px;cursor:pointer;background:#444;color:#fff;border:none;border-radius:3px';
    cell.onclick = () => {
      if (activePower === 'Torpedo'){
        const col = i % size;
        for (let r = -levels.Torpedo + 1; r < levels.Torpedo; r++){
          const c = col + r;
          if (c >= 0 && c < size){
            for (let rr = 0; rr < size; rr++) reveal(rr * size + c);
          }
        }
        cooldowns.Torpedo = turn + 15;
        activePower = null;
        turn++;
        updateCooldowns();
      } else if (activePower === 'Sonar'){
        const x = i % size, y = Math.floor(i / size), r = levels.Sonar + 1;
        for (let dy = -r; dy <= r; dy++){
          for (let dx = -r; dx <= r; dx++){
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < size && ny < size){
              reveal(ny * size + nx);
            }
          }
        }
        cooldowns.Sonar = turn + 15;
        activePower = null;
        turn++;
        updateCooldowns();
      } else {
        if (cell.textContent !== '🌊') return;
        reveal(i);
        turn++;
        updateCooldowns();
      }
    };
    grid.appendChild(cell);
    cells.push(cell);
  }

  updateCooldowns();

  const shopBtn = document.createElement('button');
  shopBtn.textContent = '🛒 Shop';
  shopBtn.style = 'margin-top:10px;background:#0ff;color:#000;padding:5px 10px;border:none;cursor:pointer;border-radius:5px';
  shopBtn.onclick = () => { overlay.remove(); launchShop(); };
  overlay.appendChild(shopBtn);

  const resetBtn = document.createElement('button');
  resetBtn.textContent = '🔄 Reset';
  resetBtn.style = 'margin-top:10px;background:#ff0;color:#000;padding:5px 10px;border:none;cursor:pointer;border-radius:5px';
  resetBtn.onclick = () => { overlay.remove(); launchGame(); };
  overlay.appendChild(resetBtn);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖ Exit';
  closeBtn.style = 'margin-top:10px;background:#fff;color:#000;padding:5px 10px;border:none;cursor:pointer;border-radius:5px';
  closeBtn.onclick = () => overlay.remove();
  overlay.appendChild(closeBtn);

  document.body.appendChild(overlay);
}

function launchShop(){
  const s = document.createElement('div');
  s.style = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#111;padding:20px;border:2px solid #fff;font-family:sans-serif;color:#fff;text-align:center';
  s.innerHTML = `<h2>🛒 Power-Up Shop</h2><p>Coins: ${coins}</p>`;
  ['Torpedo','Sonar','Bombs','Strike'].forEach(p => {
    const lvl = levels[p], cost = lvl === 1 ? 3 : lvl === 2 ? 10 : null;
    if (cost){
      const btn = document.createElement('button');
      btn.textContent = `Upgrade ${p} to Level ${lvl+1} (${cost} coins)`;
      btn.style = 'display:block;margin:10px auto;padding:10px 20px;background:#0ff;color:#000;border:none;cursor:pointer;border-radius:5px';
      btn.onclick = () => {
        if (coins >= cost){
          coins -= cost;
          levels[p]++;
          s.remove();
          launchShop();
        } else {
          alert('Not enough coins');
        }
      };
      s.appendChild(btn);
    } else {
      s.innerHTML += `<p>${p} is max level</p>`;
    }
  });
  const x = document.createElement('button');
  x.textContent = '✖';
  x.style = 'margin-top:10px;background:#fff;color:#000;padding:5px 10px;border:none;cursor:pointer';
  x.onclick = () => { s.remove(); launchGame(); };
  s.append
