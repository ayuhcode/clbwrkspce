/* =====================================================================
VolunteerWorld – game.js
A Club-Penguin-style pixel world for volunteer teams.
===================================================================== */
"use strict";
// ─── State ─────────────────────────────────────────────────────────────
const STATE = {
  playerName: "",
  playerColor: "#FF6B6B",
  playerCharType: 0, // index into CHAR_TYPES
  playerX: 400,
  playerY: 290,
  playerDir: 1,
  playerAnim: 0,
  playerFrame: 0,
  chatMessage: "",
  chatTimer: 0,
  keys: {},
  others: [],
  meetLinks: {},
  hoveredHub: null,
  nearHub: null, // hub player is physically near
};
// ─── Hub Definitions (7 FTU teams + 1 main space) ────────────────────
const HUBS = [
  {
    id: "main",
    name: "Study Space FTU",
    desc: "Không gian chung cho cả nhóm — mở meeting bất cứ lúc nào!",
    x: 310, y: 195,
    w: 155, h: 105,
    color: "#3fb950",
    icon: "🏛️",
    type: "open",
  },
  {
    id: "to_chuc",
    name: "Mảng Tổ chức",
    desc: "Lên kế hoạch, phân công nhiệm vụ & điều phối sự kiện.",
    x: 90, y: 95,
    w: 120, h: 85,
    color: "#58a6ff",
    icon: "📋",
    type: "hub",
  },
  {
    id: "truyen_thong",
    name: "Mảng Truyền thông",
    desc: "Nội dung mạng xã hội, bài viết & chiến dịch truyền thông.",
    x: 565, y: 95,
    w: 135, h: 85,
    color: "#d29922",
    icon: "📢",
    type: "hub",
  },
  {
    id: "doi_noi",
    name: "Mảng Đối nội",
    desc: "Chăm sóc thành viên, nội bộ nhóm & tinh thần đội ngũ.",
    x: 90, y: 335,
    w: 120, h: 85,
    color: "#f85149",
    icon: "🤝",
    type: "hub",
  },
  {
    id: "van_nghe",
    name: "Mảng Văn nghệ",
    desc: "Tiết mục văn nghệ, biểu diễn & sáng tạo nghệ thuật.",
    x: 565, y: 335,
    w: 135, h: 85,
    color: "#FF9FF3",
    icon: "🎭",
    type: "hub",
  },
  {
    id: "trang_tri",
    name: "Mảng Trang trí",
    desc: "Thiết kế không gian, backdrop & trang trí sự kiện.",
    x: 90, y: 215,
    w: 120, h: 80,
    color: "#96CEB4",
    icon: "🎨",
    type: "hub",
  },
  {
    id: "gay_quy",
    name: "Mảng Gây quỹ",
    desc: "Chiến dịch gây quỹ, kêu gọi đóng góp & quản lý ngân sách.",
    x: 565, y: 215,
    w: 135, h: 80,
    color: "#DDA0DD",
    icon: "💰",
    type: "hub",
  },
  {
    id: "tt_gay_quy",
    name: "TT Gây quỹ",
    desc: "Truyền thông cho chiến dịch gây quỹ & lan toả thông điệp.",
    x: 310, y: 390,
    w: 155, h: 80,
    color: "#F0A500",
    icon: "📡",
    type: "hub",
  },
];
// ─── Character Types (matching the reference sprite sheet styles) ──────
// Each type is a set of drawing instructions for the pixel char renderer
const CHAR_TYPES = [
  { label: "Warrior", bodyColor: "#cc3333", helmetColor: "#888", accentColor: "#cc3333" },
  { label: "Wizard", bodyColor: "#3355cc", helmetColor: "#222266", accentColor: "#ccaa00" },
  { label: "Archer", bodyColor: "#3a8c2f", helmetColor: "#2a6020", accentColor: "#cc9900" },
  { label: "Knight", bodyColor: "#778899", helmetColor: "#556677", accentColor: "#aabbcc" },
  { label: "Robot", bodyColor: "#667788", helmetColor: "#445566", accentColor: "#00ccff" },
  { label: "Princess", bodyColor: "#ff80b0", helmetColor: "#ffcc00", accentColor: "#ff40a0" },
  { label: "Viking", bodyColor: "#4455aa", helmetColor: "#887755", accentColor: "#cc8800" },
  { label: "Ninja", bodyColor: "#222222", helmetColor: "#111111", accentColor: "#cc0000" },
  { label: "Alien", bodyColor: "#44bb44", helmetColor: "#228822", accentColor: "#00ffaa" },
  { label: "Astronaut", bodyColor: "#dddddd", helmetColor: "#bbbbbb", accentColor: "#4499ff" },
  { label: "Punk", bodyColor: "#334499", helmetColor: "#ff44aa", accentColor: "#22ccff" },
  { label: "Dragon", bodyColor: "#cc4400", helmetColor: "#882200", accentColor: "#ff8800" },
];
// ─── Canvas Setup ──────────────────────────────────────────────────────
const worldCanvas = document.getElementById("world-canvas");
const ctx = worldCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const WORLD_W = 820, WORLD_H = 530;
let SCALE = 1;
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
  worldCanvas.style.top = (ch - WORLD_H * SCALE) / 2 + "px";
}
// ─── Pixel Character Renderer (sprite-sheet inspired, 8×12 grid) ──────
function drawPixelCharacter(canvas, charType, dir, frame) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  const s = canvas.width / 8;
  const ct = CHAR_TYPES[charType % CHAR_TYPES.length];
  const bc = ct.bodyColor;
  const hc = ct.helmetColor;
  const ac = ct.accentColor;
  // Shadow
  c.fillStyle = "rgba(0,0,0,0.3)";
  c.fillRect(1*s, 11*s, 6*s, s);
  // Walking animation
  const legSwing = Math.round(Math.sin(frame * 0.45) * 1.4);
  const armSwing = Math.round(Math.sin(frame * 0.45) * 1);
  // Legs
  c.fillStyle = darkenColor(bc, 0.55);
  c.fillRect(2*s, (8+legSwing)*s, 2*s, 3*s);
  c.fillRect(4*s, (8-legSwing)*s, 2*s, 3*s);
  // Feet
  c.fillStyle = darkenColor(bc, 0.35);
  c.fillRect(2*s, (10+legSwing)*s, 2*s, s);
  c.fillRect(4*s, (10-legSwing)*s, 2*s, s);
  // Body
  c.fillStyle = bc;
  c.fillRect(1*s, 4*s, 6*s, 5*s);
  // Torso detail / emblem
  c.fillStyle = ac;
  c.fillRect(3*s, 5*s, 2*s, 2*s);
  // Arms
  c.fillStyle = bc;
  c.fillRect(0, (5+armSwing)*s, 2*s, 3*s);
  c.fillRect(6*s, (5-armSwing)*s, 2*s, 3*s);
  // Hands
  c.fillStyle = "#F5CBA7";
  c.fillRect(0, (7+armSwing)*s, 2*s, s);
  c.fillRect(6*s, (7-armSwing)*s, 2*s, s);
  // Neck
  c.fillStyle = "#F5CBA7";
  c.fillRect(3*s, 3*s, 2*s, s);
  // Head
  c.fillStyle = "#F5CBA7";
  c.fillRect(1*s, s, 6*s, 4*s);
  // Helmet / hair
  c.fillStyle = hc;
  c.fillRect(1*s, 0, 6*s, 2*s);
  c.fillRect(0, s, s, 2*s);
  c.fillRect(7*s, s, s, 2*s);
  // Helmet accent for some types
  c.fillStyle = ac;
  c.fillRect(2*s, 0, s, s);
  c.fillRect(5*s, 0, s, s);
  // Eyes (direction-aware)
  c.fillStyle = "#1a1a2e";
  if (dir >= 0) {
    c.fillRect(4*s, 2*s, s, s);
    c.fillRect(5*s, 2*s, s, s);
  } else {
    c.fillRect(2*s, 2*s, s, s);
    c.fillRect(3*s, 2*s, s, s);
  }
  // Eye shine
  c.fillStyle = "#ffffff";
  if (dir >= 0) {
    c.fillRect(Math.round(4.5*s), Math.round(2*s), Math.round(0.5*s), Math.round(0.5*s));
  } else {
    c.fillRect(Math.round(2.5*s), Math.round(2*s), Math.round(0.5*s), Math.round(0.5*s));
  }
  // Mouth
  c.fillStyle = darkenColor("#F5CBA7", 0.6);
  if (dir >= 0) c.fillRect(4*s, 4*s, 2*s, s);
  else c.fillRect(2*s, 4*s, 2*s, s);
  // Character-specific weapon/accessory
  drawAccessory(c, ct, s, dir, armSwing);
}
function drawAccessory(c, ct, s, dir, armSwing) {
  const label = ct.label;
  if (label === "Warrior") {
    // Sword (right side)
    c.fillStyle = "#aaaaaa";
    if (dir >= 0) {
      c.fillRect(7*s, (4-armSwing)*s, s, 4*s);
      c.fillStyle = ct.accentColor;
      c.fillRect(6*s, (4-armSwing)*s, 2*s, s);
    } else {
      c.fillRect(0, (4+armSwing)*s, s, 4*s);
      c.fillStyle = ct.accentColor;
      c.fillRect(0, (4+armSwing)*s, 2*s, s);
    }
  } else if (label === "Wizard") {
    // Staff
    c.fillStyle = "#886622";
    if (dir >= 0) c.fillRect(7*s, (2-armSwing)*s, s, 5*s);
    else c.fillRect(0, (2+armSwing)*s, s, 5*s);
    c.fillStyle = "#ffdd00";
    if (dir >= 0) c.fillRect(7*s, (2-armSwing)*s, s, s);
    else c.fillRect(0, (2+armSwing)*s, s, s);
  } else if (label === "Archer") {
    // Bow
    c.fillStyle = "#884400";
    if (dir >= 0) { c.fillRect(7*s, (3-armSwing)*s, s, 4*s); }
    else { c.fillRect(0, (3+armSwing)*s, s, 4*s); }
  } else if (label === "Princess") {
    // Crown accent already in helmet, add wand
    c.fillStyle = "#ffcc00";
    c.fillRect(Math.round(3.5*s), 0, s, s);
  } else if (label === "Viking") {
    // Axe
    c.fillStyle = "#888";
    if (dir >= 0) {
      c.fillRect(7*s, (4-armSwing)*s, s, 3*s);
      c.fillStyle = "#aaa";
      c.fillRect(6*s, (3-armSwing)*s, 2*s, 2*s);
    } else {
      c.fillRect(0, (4+armSwing)*s, s, 3*s);
      c.fillStyle = "#aaa";
      c.fillRect(0, (3+armSwing)*s, 2*s, 2*s);
    }
  } else if (label === "Robot" || label === "Astronaut") {
    // Visor
    c.fillStyle = ct.accentColor + "88";
    c.fillRect(2*s, s, 4*s, 2*s);
  } else if (label === "Ninja") {
    // Mask
    c.fillStyle = "#111";
    c.fillRect(1*s, 2*s, 6*s, 2*s);
  } else if (label === "Dragon") {
    // Wings (small)
    c.fillStyle = ct.accentColor;
    c.fillRect(0, 4*s, s, 3*s);
    c.fillRect(7*s, 4*s, s, 3*s);
  }
}
function darkenColor(hex, factor) {
  let r, g, b;
  if (hex.startsWith("#")) {
    r = parseInt(hex.slice(1,3),16);
    g = parseInt(hex.slice(3,5),16);
    b = parseInt(hex.slice(5,7),16);
  } else {
    const m = hex.match(/\d+/g);
    [r,g,b] = m.map(Number);
  }
  return `rgb(${Math.round(r*factor)},${Math.round(g*factor)},${Math.round(b*factor)})`;
}
// ─── World Rendering ───────────────────────────────────────────────────
function drawWorld() {
  // Background gradient
  const grd = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  grd.addColorStop(0, "#132038");
  grd.addColorStop(1, "#0b1e12");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  drawGrassTiles();
  drawPaths();
  drawDeco();
  HUBS.forEach(h => drawHub(h));
}
function drawGrassTiles() {
  const ts = 32;
  for (let y = 0; y < WORLD_H; y += ts) {
    for (let x = 0; x < WORLD_W; x += ts) {
      ctx.fillStyle = ((x/ts + y/ts) % 2 === 0) ? "#1f4d18" : "#1a4215";
      ctx.fillRect(x, y, ts, ts);
    }
  }
}
function drawPaths() {
  const cx0 = HUBS[0].x + HUBS[0].w/2;
  const cy0 = HUBS[0].y + HUBS[0].h/2;
  ctx.lineCap = "square";
  HUBS.slice(1).forEach(h => {
    ctx.strokeStyle = "#c9a96e";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(h.x + h.w/2, h.y + h.h/2);
    ctx.stroke();
    ctx.strokeStyle = "#b8925a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(h.x + h.w/2, h.y + h.h/2);
    ctx.stroke();
  });
}
function drawDeco() {
  const trees = [
    {x:22,y:30},{x:750,y:30},{x:22,y:450},{x:750,y:450},
    {x:230,y:38},{x:530,y:38},{x:230,y:460},{x:530,y:460},
    {x:22,y:240},{x:757,y:240},
  ];
  trees.forEach(t => drawTree(t.x, t.y));
}
function drawTree(x, y) {
  ctx.fillStyle = "#5D4037"; ctx.fillRect(x+8, y+18, 8, 10);
  ctx.fillStyle = "#2e7d32"; ctx.fillRect(x, y+10, 24, 12);
  ctx.fillStyle = "#388e3c"; ctx.fillRect(x+3, y+4, 18, 10);
  ctx.fillStyle = "#43a047"; ctx.fillRect(x+6, y, 12, 8);
}
function drawHub(hub) {
  const isActive = STATE.meetLinks[hub.id]?.active;
  const isNear = STATE.nearHub === hub.id;
  const isHover = STATE.hoveredHub === hub.id;
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(hub.x+4, hub.y+4, hub.w, hub.h);
  // Active glow ring (drawn BEFORE floor so it sits behind)
  if (isActive) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    ctx.fillStyle = `rgba(63,185,80,${0.1 + pulse * 0.18})`;
    ctx.fillRect(hub.x-6, hub.y-6, hub.w+12, hub.h+12);
  }
  // Near-player highlight
  if (isNear && !isHover) {
    ctx.strokeStyle = "#ffffff44";
    ctx.lineWidth = 2;
    ctx.strokeRect(hub.x-3, hub.y-3, hub.w+6, hub.h+6);
  }
  // Floor
  ctx.fillStyle = isHover ? hub.color + "55" : hub.color + "2a";
  ctx.strokeStyle = hub.color;
  ctx.lineWidth = isHover ? 3 : isNear ? 2.5 : 2;
  ctx.fillRect(hub.x, hub.y, hub.w, hub.h);
  ctx.strokeRect(hub.x, hub.y, hub.w, hub.h);
  // Inner border
  ctx.strokeStyle = hub.color + "66";
  ctx.lineWidth = 1;
  ctx.strokeRect(hub.x+4, hub.y+4, hub.w-8, hub.h-8);
  // Icon
  ctx.font = "22px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hub.icon, hub.x + hub.w/2, hub.y + hub.h/2 - 10);
  // Name — break into 2 lines if needed using VT323
  ctx.fillStyle = hub.color;
  ctx.font = "bold 7px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const words = hub.name.split(" ");
  if (words.length >= 2) {
    // Two-line: first word on line 1, rest on line 2
    const line1 = words[0];
    const line2 = words.slice(1).join(" ");
    ctx.fillText(line1, hub.x + hub.w/2, hub.y + hub.h - 18);
    ctx.fillText(line2, hub.x + hub.w/2, hub.y + hub.h - 8);
  } else {
    ctx.fillText(hub.name, hub.x + hub.w/2, hub.y + hub.h - 8);
  }
  // LIVE badge
  if (isActive) {
    const attendees = STATE.meetLinks[hub.id]?.attendees || 1;
    ctx.fillStyle = "#3fb950";
    ctx.fillRect(hub.x + hub.w - 32, hub.y - 9, 32, 14);
    ctx.fillStyle = "#0d1117";
    ctx.font = "bold 6px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("LIVE", hub.x + hub.w - 16, hub.y + 1);
    // Attendee dots
    for (let i = 0; i < Math.min(attendees, 5); i++) {
      ctx.fillStyle = "#3fb950";
      ctx.beginPath();
      ctx.arc(hub.x + 9 + i*11, hub.y + hub.h - 14, 3.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  // "Press ✦" hint when near
  if (isNear) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "6px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    const alpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.008);
    ctx.globalAlpha = alpha;
    ctx.fillText("▲ Enter", hub.x + hub.w/2, hub.y - 5);
    ctx.globalAlpha = 1;
  }
}
function lightenHex(hex, amt) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + Math.round(255*amt));
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + Math.round(255*amt));
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + Math.round(255*amt));
  return `rgb(${r},${g},${b})`;
}
// ─── Player Rendering ──────────────────────────────────────────────────
const CHAR_W = 24, CHAR_H = 36;
const playerCharCanvas = document.createElement("canvas");
playerCharCanvas.width = 8; playerCharCanvas.height = 12;
function drawPlayerOnWorld(px, py, charType, dir, frame, name, chat) {
  const sx = px - CHAR_W/2;
  const sy = py - CHAR_H;
  drawPixelCharacter(playerCharCanvas, charType, dir, frame);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(playerCharCanvas, sx, sy, CHAR_W, CHAR_H);
  // Name tag
  ctx.font = "7px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const tw = ctx.measureText(name).width + 8;
  ctx.fillStyle = "rgba(13,17,23,0.9)";
  ctx.fillRect(px - tw/2, sy - 13, tw, 12);
  ctx.fillStyle = CHAR_TYPES[charType % CHAR_TYPES.length].bodyColor;
  ctx.fillText(name, px, sy - 3);
  // Chat bubble
  if (chat) {
    ctx.font = "11px 'VT323', monospace";
    ctx.textAlign = "center";
    const cw = Math.min(ctx.measureText(chat).width + 14, 150);
    const ch = 19;
    const bx = px - cw/2, by = sy - 34;
    ctx.fillStyle = "rgba(13,17,23,0.95)";
    ctx.fillRect(bx, by, cw, ch);
    ctx.strokeStyle = "#3fb950";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, cw, ch);
    ctx.fillStyle = "#e6edf3";
    ctx.fillText(chat, px, by + ch - 5);
  }
}
// ─── Proximity Check (runs every frame) ──────────────────────────────
function updateNearHub() {
  const px = STATE.playerX, py = STATE.playerY;
  let found = null;
  for (const hub of HUBS) {
    const cx = hub.x + hub.w/2;
    const cy = hub.y + hub.h/2;
    if (Math.hypot(cx - px, cy - py) < 80) { found = hub.id; break; }
  }
  const changed = found !== STATE.nearHub;
  STATE.nearHub = found;
  // Show/hide proximity panel immediately
  if (changed) {
    if (found) {
      const hub = HUBS.find(h => h.id === found);
      showProximityPanel(hub);
    } else {
      hideProximityPanel();
    }
  }
}
// ─── Proximity Info Panel (shows when player walks near hub) ──────────
function showProximityPanel(hub) {
  const panel = document.getElementById("proximity-panel");
  const pTitle = document.getElementById("prox-title");
  const pDesc = document.getElementById("prox-desc");
  const pStatus = document.getElementById("prox-status");
  pTitle.textContent = hub.icon + " " + hub.name;
  pTitle.style.color = hub.color;
  pDesc.textContent = hub.desc;
  const isActive = STATE.meetLinks[hub.id]?.active;
  if (isActive) {
    const n = STATE.meetLinks[hub.id].attendees || 1;
    pStatus.innerHTML = `🟢 Đang có meeting · ${n} người`;
  } else {
    pStatus.innerHTML = `⚪ Chưa có meeting`;
  }
  panel.classList.remove("hidden");
  panel.style.borderColor = hub.color;
}
function hideProximityPanel() {
  document.getElementById("proximity-panel").classList.add("hidden");
}
// ─── Simulated Teammates ───────────────────────────────────────────────
const SAMPLE_NAMES = ["Minh","Linh","Huy","Trang","Nam","Anh","Thu","Đức"];
const SAMPLE_CHARS = [1, 2, 3, 5, 6, 8, 9, 10];
function initOtherPlayers() {
  STATE.others = [];
  for (let i = 0; i < 3; i++) {
    STATE.others.push({
      name: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
      charType: SAMPLE_CHARS[i % SAMPLE_CHARS.length],
      color: CHAR_TYPES[SAMPLE_CHARS[i % SAMPLE_CHARS.length]].bodyColor,
      x: 200 + Math.random()*420,
      y: 180 + Math.random()*210,
      dir: Math.random() > 0.5 ? 1 : -1,
      frame: Math.floor(Math.random()*20),
      dx: (Math.random()-0.5)*0.7,
      dy: (Math.random()-0.5)*0.4,
      chat: "",
      chatTimer: 0,
    });
  }
}
function updateOthers() {
  STATE.others.forEach(o => {
    o.frame++;
    if (Math.random() < 0.003) {
      o.dx = (Math.random()-0.5)*1.1;
      o.dy = (Math.random()-0.5)*0.55;
    }
    o.x += o.dx; o.y += o.dy;
    if (o.x < 28) { o.x = 28; o.dx = Math.abs(o.dx); }
    if (o.x > WORLD_W-28) { o.x = WORLD_W-28; o.dx = -Math.abs(o.dx); }
    if (o.y < 55) { o.y = 55; o.dy = Math.abs(o.dy); }
    if (o.y > WORLD_H-28) { o.y = WORLD_H-28; o.dy = -Math.abs(o.dy); }
    o.dir = o.dx >= 0 ? 1 : -1;
    if (o.chatTimer > 0) o.chatTimer--;
    if (o.chatTimer <= 0) o.chat = "";
  });
}
// ─── Input & Movement ─────────────────────────────────────────────────
const SPEED = 1.5; // Reduced from 2.5 for more natural feel
document.addEventListener("keydown", e => {
  STATE.keys[e.key] = true;
  if (e.key === "Enter") {
    const ci = document.getElementById("chat-input");
    if (document.activeElement !== ci) { ci.focus(); e.preventDefault(); }
  }
  if (e.key === " " || e.key === "e" || e.key === "E") {
    if (STATE.nearHub) {
      const hub = HUBS.find(h => h.id === STATE.nearHub);
      if (hub) openMeetModal(hub);
    }
  }
});
document.addEventListener("keyup", e => { STATE.keys[e.key] = false; });
["up","down","left","right"].forEach(dir => {
  const btn = document.getElementById(`btn-${dir}`);
  if (!btn) return;
  const km = {up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};
  btn.addEventListener("pointerdown", () => { STATE.keys[km[dir]] = true; });
  btn.addEventListener("pointerup", () => { STATE.keys[km[dir]] = false; });
  btn.addEventListener("pointercancel", () => { STATE.keys[km[dir]] = false; });
});
document.getElementById("btn-interact")?.addEventListener("click", () => {
  if (STATE.nearHub) {
    const hub = HUBS.find(h => h.id === STATE.nearHub);
    if (hub) openMeetModal(hub);
  }
});
function movePlayer() {
  const keys = STATE.keys;
  let moved = false;
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) { STATE.playerX -= SPEED; STATE.playerDir = -1; moved = true; }
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) { STATE.playerX += SPEED; STATE.playerDir = 1; moved = true; }
  if (keys["ArrowUp"] || keys["w"] || keys["W"]) { STATE.playerY -= SPEED; moved = true; }
  if (keys["ArrowDown"] || keys["s"] || keys["S"]) { STATE.playerY += SPEED; moved = true; }
  STATE.playerAnim = moved ? STATE.playerAnim + 1 : 0;
  STATE.playerFrame = moved ? Math.floor(STATE.playerAnim / 6) : 0;
  STATE.playerX = Math.max(16, Math.min(WORLD_W - 16, STATE.playerX));
  STATE.playerY = Math.max(50, Math.min(WORLD_H - 16, STATE.playerY));
}
// ─── Mouse Hover (cursor only, no tooltip — proximity panel does info) ─
worldCanvas.addEventListener("mousemove", e => {
  const rect = worldCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / SCALE;
  const my = (e.clientY - rect.top) / SCALE;
  const hit = HUBS.find(h => mx >= h.x && mx <= h.x+h.w && my >= h.y && my <= h.y+h.h);
  STATE.hoveredHub = hit ? hit.id : null;
  worldCanvas.style.cursor = hit ? "pointer" : "crosshair";
});
worldCanvas.addEventListener("click", e => {
  if (!STATE.hoveredHub) return;
  const hub = HUBS.find(h => h.id === STATE.hoveredHub);
  if (hub) openMeetModal(hub);
});
worldCanvas.addEventListener("mouseleave", () => { STATE.hoveredHub = null; });
// ─── Meet Modal ────────────────────────────────────────────────────────
let currentHub = null;
function openMeetModal(hub) {
  currentHub = hub;
  document.getElementById("meet-modal").classList.remove("hidden");
  document.getElementById("modal-hub-name").textContent = hub.icon + " " + hub.name;
  document.getElementById("modal-hub-desc").textContent = hub.desc;
  const mc = document.getElementById("modal-char");
  mc.width = 8; mc.height = 12;
  drawPixelCharacter(mc, STATE.playerCharType, 1, 0);
  mc.style.width = "40px"; mc.style.height = "60px";
  const activeUsers = document.getElementById("modal-active-users");
  const statusBar = document.getElementById("modal-status-bar");
  if (STATE.meetLinks[hub.id]?.active) {
    const n = STATE.meetLinks[hub.id].attendees || 1;
    activeUsers.textContent = `🟢 Đang có meeting · ${n} người tham gia`;
    statusBar.style.borderColor = "#3fb950";
  } else {
    activeUsers.textContent = "⚪ Chưa có meeting — hãy tạo một cái!";
    statusBar.style.borderColor = "#30363d";
  }
  document.getElementById("meet-link-box").classList.add("hidden");
  // FIX: Reset the input field for Meet link
  document.getElementById("meet-link-input").value = "";
  document.getElementById("create-meet-btn").textContent = "📹 Tạo & Tham gia Meet";
  document.getElementById("copy-link-btn").textContent = "🔗 Copy Link";
  document.getElementById("modal-box").style.borderColor = hub.color;
}
document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("meet-modal").classList.add("hidden");
  currentHub = null;
});
document.getElementById("proximity-join-btn").addEventListener("click", () => {
  if (STATE.nearHub) {
    const hub = HUBS.find(h => h.id === STATE.nearHub);
    if (hub) openMeetModal(hub);
  }
});
// FIX: Instead of generating fake meet links, use the real link the user pastes
document.getElementById("create-meet-btn").addEventListener("click", () => {
  if (!currentHub) return;
  // Read the link from the input field
  const linkInput = document.getElementById("meet-link-input");
  let link = linkInput.value.trim();
  // If the user didn't paste a link, prompt them
  if (!link) {
    linkInput.style.borderColor = "#f85149";
    linkInput.focus();
    linkInput.placeholder = "Paste your Meet link here first!";
    setTimeout(() => {
      linkInput.style.borderColor = "";
      linkInput.placeholder = "https://meet.google.com/xxx-xxx-xxx";
    }, 2000);
    return;
  }
  // Ensure it looks like a URL
  if (!link.startsWith("http")) {
    link = "https://" + link;
  }
  STATE.meetLinks[currentHub.id] = {
    active: true, link, attendees: 1,
    host: STATE.playerName, startedAt: Date.now(),
  };
  document.getElementById("create-meet-btn").textContent = "✅ Đã tạo meeting!";
  const lb = document.getElementById("meet-link-box");
  lb.classList.remove("hidden");
  const a = document.getElementById("meet-link-a");
  a.href = link; a.textContent = link;
  saveMeetLinks();
  updateOnlinePanel();
  window.open(link, "_blank");
});
document.getElementById("copy-link-btn").addEventListener("click", () => {
  if (!currentHub) return;
  const link = STATE.meetLinks[currentHub.id]?.link;
  if (!link) return;
  navigator.clipboard.writeText(link).catch(()=>{});
  document.getElementById("copy-link-btn").textContent = "✅ Đã copy!";
  setTimeout(() => { document.getElementById("copy-link-btn").textContent = "🔗 Copy Link"; }, 2000);
});
// FIX: Removed generateMeetLink() — it created fake URLs that don't work.
// Users now paste a real Google Meet link from meet.google.com or Google Calendar.
function saveMeetLinks() {
  sessionStorage.setItem("vw_meets", JSON.stringify(STATE.meetLinks));
}
function loadMeetLinks() {
  const s = sessionStorage.getItem("vw_meets");
  if (!s) return;
  const data = JSON.parse(s);
  const now = Date.now();
  Object.keys(data).forEach(k => {
    if (data[k].startedAt && now - data[k].startedAt > 4*3600*1000) delete data[k];
  });
  Object.assign(STATE.meetLinks, data);
}
// ─── Chat ─────────────────────────────────────────────────────────────
document.getElementById("chat-send").addEventListener("click", sendChat);
document.getElementById("chat-input").addEventListener("keydown", e => {
  if (e.key === "Enter") { sendChat(); e.stopPropagation(); }
});
function sendChat() {
  const inp = document.getElementById("chat-input");
  const msg = inp.value.trim();
  if (!msg) return;
  STATE.chatMessage = msg;
  STATE.chatTimer = 200;
  inp.value = "";
  if (STATE.others.length && Math.random() < 0.4) {
    const r = STATE.others[Math.floor(Math.random()*STATE.others.length)];
    const responses = ["👍","Đồng ý!","Hay đó!","Cùng nhau nào!","💪","Oke bạn!","👋","❤️","🌱","Tuyệt!"];
    setTimeout(() => {
      r.chat = responses[Math.floor(Math.random()*responses.length)];
      r.chatTimer = 160;
    }, 900 + Math.random()*1000);
  }
}
// ─── Online Panel ─────────────────────────────────────────────────────
function updateOnlinePanel() {
  const list = document.getElementById("online-list");
  const nEl = document.getElementById("n-online");
  list.innerHTML = "";
  const all = [
    { name: STATE.playerName, charType: STATE.playerCharType, isYou: true },
    ...STATE.others.map(o => ({ name: o.name, charType: o.charType })),
  ];
  nEl.textContent = all.length;
  all.forEach(p => {
    const div = document.createElement("div");
    div.className = "online-entry";
    const dot = document.createElement("div");
    dot.className = "online-dot";
    const cv = document.createElement("canvas");
    cv.width = 8; cv.height = 12;
    cv.style.width = "16px"; cv.style.height = "24px";
    cv.style.imageRendering = "pixelated";
    drawPixelCharacter(cv, p.charType, 1, 0);
    const nm = document.createElement("span");
    nm.textContent = p.name + (p.isYou ? " (bạn)" : "");
    nm.style.color = p.isYou ? "#3fb950" : "#e6edf3";
    div.appendChild(dot); div.appendChild(cv); div.appendChild(nm);
    list.appendChild(div);
  });
}
// ─── HUD Avatar ───────────────────────────────────────────────────────
function updateHudAvatar() {
  const cv = document.getElementById("hud-avatar");
  cv.width = 8; cv.height = 12;
  drawPixelCharacter(cv, STATE.playerCharType, 1, 0);
}
// ─── Character Selector on Login ──────────────────────────────────────
function buildCharSelector() {
  const grid = document.getElementById("char-grid");
  grid.innerHTML = "";
  CHAR_TYPES.forEach((ct, i) => {
    const item = document.createElement("div");
    item.className = "char-item" + (i===0 ? " selected" : "");
    item.dataset.idx = i;
    const cv = document.createElement("canvas");
    cv.width = 8; cv.height = 12;
    cv.style.width = "32px"; cv.style.height = "48px";
    cv.style.imageRendering = "pixelated";
    drawPixelCharacter(cv, i, 1, 0);
    const lbl = document.createElement("div");
    lbl.className = "char-label";
    lbl.textContent = ct.label;
    item.appendChild(cv);
    item.appendChild(lbl);
    item.addEventListener("click", () => {
      document.querySelectorAll(".char-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
      STATE.playerCharType = i;
      // Update preview
      const prev = document.getElementById("char-preview");
      if (prev) { prev.width=8; prev.height=12; drawPixelCharacter(prev, i, 1, 0); }
    });
    grid.appendChild(item);
  });
}
// ─── Login Logic ──────────────────────────────────────────────────────
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
  STATE.playerX = 385 + (Math.random()-0.5)*50;
  STATE.playerY = 260 + (Math.random()-0.5)*40;
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
  STATE.others = [];
  STATE.nearHub = null;
  hideProximityPanel();
});
// ─── Off-screen canvases for other chars ──────────────────────────────
const otherCharCanvases = Array.from({length:8}, () => {
  const cv = document.createElement("canvas");
  cv.width = 8; cv.height = 12;
  return cv;
});
// ─── Login Decoration ─────────────────────────────────────────────────
function initLoginDecoration() {
  // Stars
  const stars = document.getElementById("stars");
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random()*100+"%";
    s.style.top = Math.random()*100+"%";
    s.style.setProperty("--d", (1.5+Math.random()*2)+"s");
    s.style.animationDelay = Math.random()*2+"s";
    stars.appendChild(s);
  }
  // Deco chars
  const decoIdx = [5, 6, 10];
  ["deco1","deco2","deco3"].forEach((id, i) => {
    const cv = document.getElementById(id);
    if (!cv) return;
    cv.style.setProperty("--bd", (1.3+i*0.4)+"s");
    drawPixelCharacter(cv, decoIdx[i], i%2===0?1:-1, 0);
  });
  buildCharSelector();
}
// ─── Game Loop ────────────────────────────────────────────────────────
function startGameLoop() { requestAnimationFrame(gameLoop); }
function gameLoop() {
  requestAnimationFrame(gameLoop);
  movePlayer();
  updateNearHub();
  updateOthers();
  if (STATE.chatTimer > 0) STATE.chatTimer--;
  else STATE.chatMessage = "";
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  drawWorld();
  // Other players
  STATE.others.forEach((o, i) => {
    const cv = otherCharCanvases[i % otherCharCanvases.length];
    drawPixelCharacter(cv, o.charType, o.dir, Math.floor(o.frame/6));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cv, o.x-CHAR_W/2, o.y-CHAR_H, CHAR_W, CHAR_H);
    // Name tag
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const tw = ctx.measureText(o.name).width + 8;
    ctx.fillStyle = "rgba(13,17,23,0.88)";
    ctx.fillRect(o.x-tw/2, o.y-CHAR_H-13, tw, 12);
    ctx.fillStyle = CHAR_TYPES[o.charType].bodyColor;
    ctx.fillText(o.name, o.x, o.y-CHAR_H-3);
    if (o.chat) {
      ctx.font = "11px 'VT323', monospace";
      const cw = ctx.measureText(o.chat).width+14;
      const bx = o.x-cw/2, by = o.y-CHAR_H-34;
      ctx.fillStyle = "rgba(13,17,23,0.95)";
      ctx.fillRect(bx, by, cw, 19);
      ctx.strokeStyle = CHAR_TYPES[o.charType].bodyColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, cw, 19);
      ctx.fillStyle = "#e6edf3";
      ctx.fillText(o.chat, o.x, by+14);
    }
  });
  // Player
  drawPlayerOnWorld(
    STATE.playerX, STATE.playerY,
    STATE.playerCharType, STATE.playerDir,
    STATE.playerFrame, STATE.playerName,
    STATE.chatTimer > 0 ? STATE.chatMessage : ""
  );
}
// ─── Resize ───────────────────────────────────────────────────────────
window.addEventListener("resize", resizeCanvas);
// ─── Init ─────────────────────────────────────────────────────────────
initLoginDecoration();
