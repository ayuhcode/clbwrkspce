
/* =====================================================================
   VolunteerWorld – game.js
   A Club-Penguin-style pixel world for volunteer teams.
   ===================================================================== */
 
"use strict";
 
// ─── State ─────────────────────────────────────────────────────────────
const STATE = {
  playerName: "",
  playerColor: "#FF6B6B",
  playerX: 400,
  playerY: 320,
  playerDir: 1, // 1 = right, -1 = left
  playerAnim: 0,
  playerFrame: 0,
  chatMessage: "",
  chatTimer: 0,
  keys: {},
  // simulated team members (stored in localStorage as "other players")
  others: [],
  activeMeet: null, // hub id currently with a live meet
  meetLinks: {},    // hubId -> link
};
 
// ─── Hub Definitions ───────────────────────────────────────────────────
const HUBS = [
  {
    id: "main",
    name: "Main Plaza",
    desc: "Open space for the whole team — create a new meeting anytime!",
    x: 320, y: 200,
    w: 130, h: 100,
    color: "#3fb950",
    icon: "🏛️",
    type: "open",
  },
  {
    id: "strategy",
    name: "Strategy Room",
    desc: "Plan campaigns, set goals, discuss team roadmap.",
    x: 100, y: 110,
    w: 110, h: 80,
    color: "#58a6ff",
    icon: "📋",
    type: "hub",
  },
  {
    id: "creative",
    name: "Creative Studio",
    desc: "Design posters, social media content, visual assets.",
    x: 580, y: 110,
    w: 110, h: 80,
    color: "#d29922",
    icon: "🎨",
    type: "hub",
  },
  {
    id: "logistics",
    name: "Logistics HQ",
    desc: "Coordinate events, schedules & volunteer assignments.",
    x: 100, y: 360,
    w: 110, h: 80,
    color: "#f85149",
    icon: "📦",
    type: "hub",
  },
  {
    id: "comms",
    name: "Comms Centre",
    desc: "Media outreach, newsletters & community updates.",
    x: 580, y: 360,
    w: 110, h: 80,
    color: "#DDA0DD",
    icon: "📡",
    type: "hub",
  },
  {
    id: "lounge",
    name: "Chill Lounge",
    desc: "Relax, chat informally — no agenda required! 🍵",
    x: 340, y: 400,
    w: 100, h: 75,
    color: "#96CEB4",
    icon: "🛋️",
    type: "hub",
  },
];
 
// ─── Canvas Setup ──────────────────────────────────────────────────────
const worldCanvas = document.getElementById("world-canvas");
const ctx = worldCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
 
let WORLD_W = 800, WORLD_H = 520;
let SCALE = 1;
let CAM_X = 0, CAM_Y = 0;
 
function resizeCanvas() {
  const container = document.querySelector(".world-container");
  if (!container) return;
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  SCALE = Math.min(cw / WORLD_W, ch / WORLD_H);
  worldCanvas.width = WORLD_W;
  worldCanvas.height = WORLD_H;
  worldCanvas.style.width = WORLD_W * SCALE + "px";
  worldCanvas.style.height = WORLD_H * SCALE + "px";
  worldCanvas.style.position = "absolute";
  worldCanvas.style.left = (cw - WORLD_W * SCALE) / 2 + "px";
  worldCanvas.style.top  = (ch - WORLD_H * SCALE) / 2 + "px";
}
 
// ─── Pixel Character Renderer ──────────────────────────────────────────
// 8×12 pixel art character (drawn procedurally)
function drawPixelCharacter(canvas, color, dir, frame, name) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  const s = canvas.width / 8;
 
  // Shadow
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fillRect(1*s, 11*s, 6*s, 1*s);
 
  // Legs (walking animation)
  const legSwing = Math.sin(frame * 0.4) * 1.5;
  c.fillStyle = darkenColor(color, 0.5);
  // Left leg
  c.fillRect(2*s, (8 + Math.round(legSwing))*s, 2*s, 3*s);
  // Right leg
  c.fillRect(4*s, (8 - Math.round(legSwing))*s, 2*s, 3*s);
 
  // Body
  c.fillStyle = color;
  c.fillRect(1*s, 4*s, 6*s, 5*s);
 
  // Volunteer vest (darker stripe)
  c.fillStyle = darkenColor(color, 0.65);
  c.fillRect(3*s, 4*s, 2*s, 5*s);
 
  // Arms
  const armSwing = Math.sin(frame * 0.4) * 1;
  c.fillStyle = color;
  // Left arm
  c.fillRect(0, (5 + Math.round(armSwing))*s, 2*s, 3*s);
  // Right arm
  c.fillRect(6*s, (5 - Math.round(armSwing))*s, 2*s, 3*s);
 
  // Head
  c.fillStyle = "#F5CBA7";
  c.fillRect(1*s, 1*s, 6*s, 4*s);
 
  // Eyes (direction-aware)
  c.fillStyle = "#2c3e50";
  if (dir >= 0) {
    c.fillRect(4*s, 2*s, 1*s, 1*s);
    c.fillRect(5*s, 2*s, 1*s, 1*s);
  } else {
    c.fillRect(2*s, 2*s, 1*s, 1*s);
    c.fillRect(3*s, 2*s, 1*s, 1*s);
  }
 
  // Hair
  c.fillStyle = darkenColor(color, 0.45);
  c.fillRect(1*s, 0, 6*s, 2*s);
  c.fillRect(0, 1*s, 2*s, 1*s);
  c.fillRect(6*s, 1*s, 2*s, 1*s);
 
  // Smile
  c.fillStyle = "#e07b5c";
  if (dir >= 0) c.fillRect(4*s, 4*s, 2*s, 1*s);
  else          c.fillRect(2*s, 4*s, 2*s, 1*s);
 
  // Little heart badge on vest
  c.fillStyle = "#f85149";
  c.fillRect(3*s, 6*s, 1*s, 1*s);
  c.fillRect(4*s, 6*s, 1*s, 1*s);
  c.fillRect(3*s, 7*s, 2*s, 1*s);
}
 
function darkenColor(hex, factor) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.round(r*factor)},${Math.round(g*factor)},${Math.round(b*factor)})`;
}
 
// ─── World Rendering ───────────────────────────────────────────────────
function drawWorld() {
  // Sky / ground gradient
  const grd = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  grd.addColorStop(0, "#1a2c4a");
  grd.addColorStop(1, "#0a1a10");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
 
  // Grass tiles
  drawGrassTiles();
 
  // Paths between hubs
  drawPaths();
 
  // Decorative trees / bushes
  drawDeco();
 
  // Hubs
  HUBS.forEach(h => drawHub(h));
}
 
function drawGrassTiles() {
  const tileSize = 32;
  for (let y = 0; y < WORLD_H; y += tileSize) {
    for (let x = 0; x < WORLD_W; x += tileSize) {
      const checker = ((x/tileSize + y/tileSize) % 2 === 0);
      ctx.fillStyle = checker ? "#1f4d18" : "#1a4215";
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}
 
function drawPaths() {
  const centerX = HUBS[0].x + HUBS[0].w/2;
  const centerY = HUBS[0].y + HUBS[0].h/2;
  ctx.strokeStyle = "#c9a96e";
  ctx.lineWidth = 18;
  ctx.lineCap = "square";
  HUBS.slice(1).forEach(h => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(h.x + h.w/2, h.y + h.h/2);
    ctx.stroke();
  });
  // Darker edges on paths
  ctx.strokeStyle = "#b8925a";
  ctx.lineWidth = 2;
  HUBS.slice(1).forEach(h => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(h.x + h.w/2, h.y + h.h/2);
    ctx.stroke();
  });
}
 
function drawDeco() {
  const trees = [
    {x:40, y:40}, {x:730, y:40}, {x:40, y:440}, {x:730, y:440},
    {x:240, y:50}, {x:520, y:50}, {x:240, y:450}, {x:520, y:450},
    {x:40, y:230}, {x:740, y:230},
  ];
  trees.forEach(t => drawTree(t.x, t.y));
}
 
function drawTree(x, y) {
  // Trunk
  ctx.fillStyle = "#5D4037";
  ctx.fillRect(x+8, y+18, 8, 10);
  // Foliage layers
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x, y+10, 24, 12);
  ctx.fillStyle = "#388e3c";
  ctx.fillRect(x+3, y+4, 18, 10);
  ctx.fillStyle = "#43a047";
  ctx.fillRect(x+6, y, 12, 8);
}
 
function drawHub(hub) {
  const isActive = STATE.meetLinks[hub.id] && STATE.meetLinks[hub.id].active;
  const isHover  = STATE.hoveredHub === hub.id;
 
  // Hub shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(hub.x+4, hub.y+4, hub.w, hub.h);
 
  // Hub floor
  ctx.fillStyle = isHover ? lightenHex(hub.color, 0.2) : hub.color + "33";
  ctx.strokeStyle = hub.color;
  ctx.lineWidth = isHover ? 3 : 2;
  ctx.fillRect(hub.x, hub.y, hub.w, hub.h);
  ctx.strokeRect(hub.x, hub.y, hub.w, hub.h);
 
  // Inner darker border
  ctx.strokeStyle = hub.color + "88";
  ctx.lineWidth = 1;
  ctx.strokeRect(hub.x+3, hub.y+3, hub.w-6, hub.h-6);
 
  // Icon
  ctx.font = "24px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hub.icon, hub.x + hub.w/2, hub.y + hub.h/2 - 8);
 
  // Hub name
  ctx.fillStyle = hub.color;
  ctx.font = "bold 8px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const name = hub.name.length > 12 ? hub.name.substring(0,11)+"…" : hub.name;
  ctx.fillText(name, hub.x + hub.w/2, hub.y + hub.h - 8);
 
  // Active meet indicator
  if (isActive) {
    // Pulsing green glow
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
    ctx.fillStyle = `rgba(63,185,80,${0.15 + pulse*0.2})`;
    ctx.fillRect(hub.x-4, hub.y-4, hub.w+8, hub.h+8);
 
    // "LIVE" badge
    ctx.fillStyle = "#3fb950";
    ctx.fillRect(hub.x + hub.w - 30, hub.y - 8, 30, 14);
    ctx.fillStyle = "#0d1117";
    ctx.font = "bold 7px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("LIVE", hub.x + hub.w - 15, hub.y + 2);
 
    // Animated dots showing people inside
    const dotCount = STATE.meetLinks[hub.id]?.attendees || 1;
    for (let i = 0; i < Math.min(dotCount, 5); i++) {
      ctx.fillStyle = "#3fb950";
      ctx.beginPath();
      ctx.arc(hub.x + 10 + i*12, hub.y + hub.h - 16, 4, 0, Math.PI*2);
      ctx.fill();
    }
  }
}
 
function lightenHex(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + Math.round(255*amount));
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + Math.round(255*amount));
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + Math.round(255*amount));
  return `rgb(${r},${g},${b})`;
}
 
// ─── Player Rendering ──────────────────────────────────────────────────
const CHAR_W = 24, CHAR_H = 36;
const playerCharCanvas = document.createElement("canvas");
playerCharCanvas.width = 8; playerCharCanvas.height = 12;
 
function drawPlayerOnWorld(px, py, color, dir, frame, name, chat) {
  const sx = px - CHAR_W/2;
  const sy = py - CHAR_H;
 
  // Render char to offscreen canvas
  drawPixelCharacter(playerCharCanvas, color, dir, frame, name);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(playerCharCanvas, sx, sy, CHAR_W, CHAR_H);
 
  // Name tag
  ctx.font = "7px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const textW = ctx.measureText(name).width + 8;
  ctx.fillStyle = "rgba(13,17,23,0.85)";
  ctx.fillRect(px - textW/2, sy - 12, textW, 11);
  ctx.fillStyle = color;
  ctx.fillText(name, px, sy - 3);
 
  // Chat bubble (above name)
  if (chat) {
    ctx.font = "10px 'VT323', monospace";
    ctx.textAlign = "center";
    const cw = Math.min(ctx.measureText(chat).width + 12, 140);
    const ch = 18;
    const cx = px - cw/2;
    const cy = sy - 30;
    ctx.fillStyle = "rgba(13,17,23,0.95)";
    ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = "#3fb950";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, cy, cw, ch);
    ctx.fillStyle = "#e6edf3";
    ctx.fillText(chat, px, cy + ch - 5);
  }
}
 
// ─── Simulated Other Players ───────────────────────────────────────────
const SAMPLE_NAMES  = ["Alex","Sam","Jordan","Taylor","Morgan","Casey","Drew","Riley"];
const SAMPLE_COLORS = ["#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#F0A500","#FF9FF3","#FF6B6B"];
 
function initOtherPlayers() {
  STATE.others = [];
  const stored = localStorage.getItem("vw_others");
  if (stored) {
    const data = JSON.parse(stored);
    STATE.others = data.slice(0, 4);
    return;
  }
  // Generate 3 simulated teammates
  for (let i = 0; i < 3; i++) {
    const idx = (i + Math.floor(Math.random()*5)) % SAMPLE_NAMES.length;
    STATE.others.push({
      name: SAMPLE_NAMES[idx],
      color: SAMPLE_COLORS[i % SAMPLE_COLORS.length],
      x: 200 + Math.random() * 400,
      y: 180 + Math.random() * 200,
      dir: Math.random() > 0.5 ? 1 : -1,
      frame: Math.floor(Math.random() * 20),
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      chat: "",
      chatTimer: 0,
    });
  }
}
 
function updateOthers() {
  STATE.others.forEach(o => {
    o.frame++;
    if (Math.random() < 0.003) {
      o.dx = (Math.random()-0.5) * 1.2;
      o.dy = (Math.random()-0.5) * 0.6;
    }
    o.x += o.dx;
    o.y += o.dy;
    if (o.x < 30)  { o.x = 30;  o.dx = Math.abs(o.dx); }
    if (o.x > WORLD_W-30) { o.x = WORLD_W-30; o.dx = -Math.abs(o.dx); }
    if (o.y < 60)  { o.y = 60;  o.dy = Math.abs(o.dy); }
    if (o.y > WORLD_H-30) { o.y = WORLD_H-30; o.dy = -Math.abs(o.dy); }
    o.dir = o.dx >= 0 ? 1 : -1;
    if (o.chatTimer > 0) o.chatTimer--;
    if (o.chatTimer <= 0) o.chat = "";
  });
}
 
// ─── Input Handling ────────────────────────────────────────────────────
const SPEED = 2.5;
 
document.addEventListener("keydown", e => {
  STATE.keys[e.key] = true;
  if (e.key === "Enter") {
    const chatInput = document.getElementById("chat-input");
    if (document.activeElement !== chatInput) chatInput.focus();
  }
});
document.addEventListener("keyup", e => { STATE.keys[e.key] = false; });
 
// Mobile D-pad
["up","down","left","right"].forEach(dir => {
  const btn = document.getElementById(`btn-${dir}`);
  if (!btn) return;
  const keyMap = {up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};
  btn.addEventListener("pointerdown", () => { STATE.keys[keyMap[dir]] = true; });
  btn.addEventListener("pointerup",   () => { STATE.keys[keyMap[dir]] = false; });
});
document.getElementById("btn-interact")?.addEventListener("click", checkHubInteract);
 
function movePlayer() {
  let moved = false;
  const keys = STATE.keys;
  if (keys["ArrowLeft"]  || keys["a"] || keys["A"]) { STATE.playerX -= SPEED; STATE.playerDir = -1; moved = true; }
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) { STATE.playerX += SPEED; STATE.playerDir =  1; moved = true; }
  if (keys["ArrowUp"]    || keys["w"] || keys["W"]) { STATE.playerY -= SPEED; moved = true; }
  if (keys["ArrowDown"]  || keys["s"] || keys["S"]) { STATE.playerY += SPEED; moved = true; }
 
  if (moved) STATE.playerAnim++;
  else STATE.playerAnim = 0;
 
  STATE.playerFrame = moved ? Math.floor(STATE.playerAnim / 6) : 0;
 
  // Clamp
  STATE.playerX = Math.max(16, Math.min(WORLD_W - 16, STATE.playerX));
  STATE.playerY = Math.max(50, Math.min(WORLD_H - 16, STATE.playerY));
}
 
// ─── Hub Hover & Click ─────────────────────────────────────────────────
worldCanvas.addEventListener("mousemove", e => {
  const rect = worldCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / SCALE;
  const my = (e.clientY - rect.top) / SCALE;
  const hit = HUBS.find(h => mx >= h.x && mx <= h.x+h.w && my >= h.y && my <= h.y+h.h);
  STATE.hoveredHub = hit ? hit.id : null;
  if (hit) showTooltip(hit, e.clientX, e.clientY);
  else     hideTooltip();
  worldCanvas.style.cursor = hit ? "pointer" : "crosshair";
});
 
worldCanvas.addEventListener("click", e => {
  if (!STATE.hoveredHub) return;
  const hub = HUBS.find(h => h.id === STATE.hoveredHub);
  if (hub) openMeetModal(hub);
});
 
worldCanvas.addEventListener("mouseleave", () => {
  STATE.hoveredHub = null;
  hideTooltip();
});
 
function checkHubInteract() {
  const px = STATE.playerX, py = STATE.playerY;
  const hub = HUBS.find(h =>
    px >= h.x - 20 && px <= h.x + h.w + 20 &&
    py >= h.y - 20 && py <= h.y + h.h + 20
  );
  if (hub) openMeetModal(hub);
}
 
// ─── Tooltip ───────────────────────────────────────────────────────────
const tooltip = document.getElementById("hub-tooltip");
const tooltipTitle = document.getElementById("tooltip-title");
const tooltipDesc  = document.getElementById("tooltip-desc");
const tooltipStatus = document.getElementById("tooltip-status");
 
document.getElementById("tooltip-join-btn").addEventListener("click", () => {
  const hub = HUBS.find(h => h.id === STATE.hoveredHub);
  if (hub) openMeetModal(hub);
});
 
function showTooltip(hub, cx, cy) {
  tooltipTitle.textContent = hub.icon + " " + hub.name;
  tooltipDesc.textContent  = hub.desc;
  const isActive = STATE.meetLinks[hub.id]?.active;
  if (isActive) {
    const n = STATE.meetLinks[hub.id].attendees || 1;
    tooltipStatus.innerHTML = `<span class="status-online">🟢 Meet active · ${n} person${n>1?"s":""} inside</span>`;
  } else {
    tooltipStatus.innerHTML = `<span class="status-empty">⚪ No active meeting</span>`;
  }
  tooltip.classList.remove("hidden");
  const container = document.querySelector(".world-container");
  const rect = container.getBoundingClientRect();
  let lx = cx - rect.left + 12;
  let ly = cy - rect.top + 12;
  if (lx + 250 > rect.width)  lx = cx - rect.left - 254;
  if (ly + 120 > rect.height) ly = cy - rect.top  - 124;
  tooltip.style.left = lx + "px";
  tooltip.style.top  = ly + "px";
}
 
function hideTooltip() {
  tooltip.classList.add("hidden");
}
 
// ─── Meet Modal ────────────────────────────────────────────────────────
let currentHub = null;
 
function openMeetModal(hub) {
  currentHub = hub;
  document.getElementById("meet-modal").classList.remove("hidden");
  document.getElementById("modal-hub-name").textContent = hub.icon + " " + hub.name;
  document.getElementById("modal-hub-desc").textContent = hub.desc;
 
  const mc = document.getElementById("modal-char");
  mc.width = 8; mc.height = 12;
  drawPixelCharacter(mc, STATE.playerColor, 1, 0);
  mc.style.width = "40px"; mc.style.height = "60px";
 
  const statusBar = document.getElementById("modal-status-bar");
  const activeUsers = document.getElementById("modal-active-users");
  if (STATE.meetLinks[hub.id]?.active) {
    const n = STATE.meetLinks[hub.id].attendees || 1;
    activeUsers.textContent = `🟢 Meet in progress · ${n} teammate${n>1?"s":""} online`;
    statusBar.style.borderColor = "#3fb950";
  } else {
    activeUsers.textContent = "⚪ No active meeting – start one!";
    statusBar.style.borderColor = "#30363d";
  }
 
  document.getElementById("meet-link-box").classList.add("hidden");
  document.getElementById("create-meet-btn").textContent = "📹 Create & Join Meet";
  document.getElementById("copy-link-btn").style.display = "";
}
 
document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("meet-modal").classList.add("hidden");
  currentHub = null;
});
 
document.getElementById("create-meet-btn").addEventListener("click", () => {
  if (!currentHub) return;
  const link = generateMeetLink(currentHub.id);
  STATE.meetLinks[currentHub.id] = {
    active: true,
    link: link,
    attendees: 1,
    host: STATE.playerName,
    startedAt: Date.now(),
  };
 
  document.getElementById("create-meet-btn").textContent = "✅ Meeting Created!";
  const linkBox = document.getElementById("meet-link-box");
  linkBox.classList.remove("hidden");
  const anchor = document.getElementById("meet-link-a");
  anchor.href = link;
  anchor.textContent = link;
 
  saveMeetLinks();
  updateOnlinePanel();
 
  // Auto open in 3s
  let countdown = 3;
  const note = document.querySelector(".pixel-note");
  const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timer);
      window.open(link, "_blank");
      note.textContent = "Link opened in new tab!";
    } else {
      note.textContent = `Link auto-opens in ${countdown}s...`;
    }
  }, 1000);
});
 
document.getElementById("copy-link-btn").addEventListener("click", () => {
  if (!currentHub || !STATE.meetLinks[currentHub.id]) {
    // Create one first
    const link = generateMeetLink(currentHub.id);
    STATE.meetLinks[currentHub.id] = {
      active: true, link, attendees: 1,
      host: STATE.playerName, startedAt: Date.now(),
    };
    saveMeetLinks();
    navigator.clipboard.writeText(link).catch(() => {});
    const linkBox = document.getElementById("meet-link-box");
    linkBox.classList.remove("hidden");
    document.getElementById("meet-link-a").href = link;
    document.getElementById("meet-link-a").textContent = link;
    document.getElementById("copy-link-btn").textContent = "✅ Copied!";
  } else {
    navigator.clipboard.writeText(STATE.meetLinks[currentHub.id].link).catch(() => {});
    document.getElementById("copy-link-btn").textContent = "✅ Copied!";
    setTimeout(() => {
      document.getElementById("copy-link-btn").textContent = "🔗 Copy Link";
    }, 2000);
  }
});
 
function generateMeetLink(hubId) {
  // Google Meet links have the format meet.google.com/xxx-xxxx-xxx
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = n => Array.from({length:n}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}
 
function saveMeetLinks() {
  // Persist active meet links for this session
  sessionStorage.setItem("vw_meets", JSON.stringify(STATE.meetLinks));
}
 
function loadMeetLinks() {
  const stored = sessionStorage.getItem("vw_meets");
  if (stored) {
    const data = JSON.parse(stored);
    // Expire meets older than 4 hours
    const now = Date.now();
    Object.keys(data).forEach(k => {
      if (data[k].startedAt && now - data[k].startedAt > 4*3600*1000) delete data[k];
    });
    Object.assign(STATE.meetLinks, data);
  }
}
 
// ─── Chat ──────────────────────────────────────────────────────────────
document.getElementById("chat-send").addEventListener("click", sendChat);
document.getElementById("chat-input").addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});
 
function sendChat() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;
  STATE.chatMessage = msg;
  STATE.chatTimer = 180; // 3 seconds at 60fps
  input.value = "";
  // Random bot response from teammate
  if (STATE.others.length && Math.random() < 0.4) {
    const responder = STATE.others[Math.floor(Math.random()*STATE.others.length)];
    setTimeout(() => {
      const responses = ["👍","Nice!","Agree!","Let's go!","💪","On it!","👋","❤️","🌱"];
      responder.chat = responses[Math.floor(Math.random()*responses.length)];
      responder.chatTimer = 150;
    }, 800 + Math.random()*1200);
  }
}
 
// ─── Online Panel ──────────────────────────────────────────────────────
function updateOnlinePanel() {
  const list = document.getElementById("online-list");
  const nEl  = document.getElementById("n-online");
  list.innerHTML = "";
 
  const allPlayers = [
    { name: STATE.playerName, color: STATE.playerColor, isYou: true },
    ...STATE.others.map(o => ({ name: o.name, color: o.color })),
  ];
 
  nEl.textContent = allPlayers.length;
 
  allPlayers.forEach(p => {
    const div = document.createElement("div");
    div.className = "online-entry";
 
    const dot = document.createElement("div");
    dot.className = "online-dot";
 
    const cv = document.createElement("canvas");
    cv.width = 8; cv.height = 12;
    cv.style.width = "16px"; cv.style.height = "24px";
    cv.style.imageRendering = "pixelated";
    drawPixelCharacter(cv, p.color, 1, 0);
 
    const name = document.createElement("span");
    name.textContent = p.name + (p.isYou ? " (you)" : "");
    name.style.color = p.isYou ? "#3fb950" : "#e6edf3";
 
    div.appendChild(dot);
    div.appendChild(cv);
    div.appendChild(name);
    list.appendChild(div);
  });
}
 
// ─── HUD Avatar ────────────────────────────────────────────────────────
function updateHudAvatar() {
  const cv = document.getElementById("hud-avatar");
  cv.width = 8; cv.height = 12;
  drawPixelCharacter(cv, STATE.playerColor, 1, 0);
}
 
// ─── Login Screen Decoration ────────────────────────────────────────────
function initLoginDecoration() {
  const decoColors = ["#FF6B6B","#4ECDC4","#DDA0DD"];
  ["deco1","deco2","deco3"].forEach((id, i) => {
    const cv = document.getElementById(id);
    if (!cv) return;
    cv.style.setProperty("--bd", (1.3 + i*0.4) + "s");
    drawPixelCharacter(cv, decoColors[i], i%2===0 ? 1 : -1, 0);
  });
 
  // Stars
  const stars = document.getElementById("stars");
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random()*100 + "%";
    s.style.top  = Math.random()*100 + "%";
    s.style.setProperty("--d", (1.5 + Math.random()*2) + "s");
    s.style.animationDelay = Math.random()*2 + "s";
    stars.appendChild(s);
  }
}
 
// ─── Login Logic ───────────────────────────────────────────────────────
let selectedColor = "#FF6B6B";
 
document.querySelectorAll(".color-opt").forEach(opt => {
  opt.addEventListener("click", function() {
    document.querySelectorAll(".color-opt").forEach(o => o.classList.remove("selected"));
    this.classList.add("selected");
    selectedColor = this.dataset.color;
    STATE.playerColor = selectedColor;
    // Redraw deco chars with player color
    const cv = document.getElementById("deco1");
    if (cv) drawPixelCharacter(cv, selectedColor, 1, 0);
  });
});
 
document.getElementById("join-btn").addEventListener("click", joinWorld);
document.getElementById("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") joinWorld();
});
 
function joinWorld() {
  const name = document.getElementById("player-name").value.trim();
  if (!name) {
    document.getElementById("player-name").style.borderColor = "#f85149";
    return;
  }
  STATE.playerName = name;
  STATE.playerColor = selectedColor;
  STATE.playerX = 385 + (Math.random()-0.5)*60;
  STATE.playerY = 270 + (Math.random()-0.5)*40;
 
  document.getElementById("hud-name").textContent = name;
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");
 
  resizeCanvas();
  loadMeetLinks();
  initOtherPlayers();
  updateHudAvatar();
  updateOnlinePanel();
  startGameLoop();
}
 
document.getElementById("logout-btn").addEventListener("click", () => {
  document.getElementById("game-screen").classList.remove("active");
  document.getElementById("login-screen").classList.add("active");
});
 
// ─── Off-screen char canvases for others ───────────────────────────────
const otherCharCanvases = [];
for (let i = 0; i < 8; i++) {
  const cv = document.createElement("canvas");
  cv.width = 8; cv.height = 12;
  otherCharCanvases.push(cv);
}
 
// ─── Main Game Loop ─────────────────────────────────────────────────────
let lastTime = 0;
 
function startGameLoop() {
  requestAnimationFrame(gameLoop);
}
 
function gameLoop(ts) {
  requestAnimationFrame(gameLoop);
 
  // Player movement
  movePlayer();
 
  // Decrement chat timer
  if (STATE.chatTimer > 0) STATE.chatTimer--;
  else STATE.chatMessage = "";
 
  // Update simulated players
  updateOthers();
 
  // Clear
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
 
  // Draw world
  drawWorld();
 
  // Draw other players (behind player)
  STATE.others.forEach((o, i) => {
    const cv = otherCharCanvases[i % otherCharCanvases.length];
    drawPixelCharacter(cv, o.color, o.dir, Math.floor(o.frame/6));
    ctx.imageSmoothingEnabled = false;
    const sx = o.x - CHAR_W/2;
    const sy = o.y - CHAR_H;
    ctx.drawImage(cv, sx, sy, CHAR_W, CHAR_H);
    // Name tag
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const tw = ctx.measureText(o.name).width + 8;
    ctx.fillStyle = "rgba(13,17,23,0.85)";
    ctx.fillRect(o.x - tw/2, sy - 12, tw, 11);
    ctx.fillStyle = o.color;
    ctx.fillText(o.name, o.x, sy - 3);
    // Chat
    if (o.chat) {
      ctx.font = "10px 'VT323', monospace";
      const cw2 = ctx.measureText(o.chat).width + 12;
      ctx.fillStyle = "rgba(13,17,23,0.95)";
      ctx.fillRect(o.x - cw2/2, sy - 30, cw2, 18);
      ctx.strokeStyle = o.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x - cw2/2, sy - 30, cw2, 18);
      ctx.fillStyle = "#e6edf3";
      ctx.fillText(o.chat, o.x, sy - 16);
    }
  });
 
  // Draw player
  const chatMsg = STATE.chatTimer > 0 ? STATE.chatMessage : "";
  drawPlayerOnWorld(
    STATE.playerX, STATE.playerY,
    STATE.playerColor, STATE.playerDir,
    STATE.playerFrame, STATE.playerName,
    chatMsg
  );
 
  // Proximity indicator
  drawProximityHint();
}
 
function drawProximityHint() {
  const px = STATE.playerX, py = STATE.playerY;
  HUBS.forEach(hub => {
    const cx = hub.x + hub.w/2;
    const cy = hub.y + hub.h/2;
    const dist = Math.hypot(cx - px, cy - py);
    if (dist < 70) {
      // Arrow pointing to hub with "Press E" hint
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - dist/70);
      ctx.fillStyle = "#3fb950";
      ctx.font = "7px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("CLICK or ✦ to enter", cx, hub.y - 8);
      ctx.restore();
    }
  });
}
 
// ─── Resize Handling ──────────────────────────────────────────────────
window.addEventListener("resize", resizeCanvas);
 
// ─── Init ─────────────────────────────────────────────────────────────
initLoginDecoration();
