<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap" rel="stylesheet">
</head>
<body>
 
<!-- LOGIN SCREEN -->
<div id="login-screen" class="screen active">
  <div class="login-bg">
    <div class="pixel-stars" id="stars"></div>
    <div class="login-box">
      <div class="login-logo">
        <div class="logo-char">🌱</div>
        <h1>Club Workspace</h1>
        <p class="subtitle">Your team's pixel playground</p>
      </div>
      <div class="login-form">
        <label>Your name</label>
        <input type="text" id="player-name" placeholder="Enter your name..." maxlength="12" />
        <label>Pick your character color</label>
        <div class="color-picker">
          <div class="color-opt selected" data-color="#FF6B6B" style="background:#FF6B6B"></div>
          <div class="color-opt" data-color="#4ECDC4" style="background:#4ECDC4"></div>
          <div class="color-opt" data-color="#45B7D1" style="background:#45B7D1"></div>
          <div class="color-opt" data-color="#96CEB4" style="background:#96CEB4"></div>
          <div class="color-opt" data-color="#FFEAA7" style="background:#FFEAA7"></div>
          <div class="color-opt" data-color="#DDA0DD" style="background:#DDA0DD"></div>
          <div class="color-opt" data-color="#F0A500" style="background:#F0A500"></div>
          <div class="color-opt" data-color="#FF9FF3" style="background:#FF9FF3"></div>
        </div>
        <button id="join-btn" class="pixel-btn primary">▶ Enter World</button>
      </div>
    </div>
    <!-- Floating decorative pixel characters -->
    <div class="deco-chars">
      <canvas class="deco-char" id="deco1" width="32" height="48"></canvas>
      <canvas class="deco-char" id="deco2" width="32" height="48"></canvas>
      <canvas class="deco-char" id="deco3" width="32" height="48"></canvas>
    </div>
  </div>
</div>
 
<!-- GAME WORLD SCREEN -->
<div id="game-screen" class="screen">
  <!-- HUD Bar -->
  <div class="hud">
    <div class="hud-left">
      <canvas id="hud-avatar" width="32" height="48"></canvas>
      <span id="hud-name">Player</span>
    </div>
    <div class="hud-center">
      <span class="world-title">Workspace</span>
    </div>
    <div class="hud-right">
      <span id="online-count">👥 <span id="n-online">1</span> online</span>
      <button class="pixel-btn small" id="logout-btn">✖ Exit</button>
    </div>
  </div>
 
  <!-- World Canvas -->
  <div class="world-container">
    <canvas id="world-canvas"></canvas>
 
    <!-- Tooltip bubble -->
    <div id="hub-tooltip" class="hub-tooltip hidden">
      <div class="tooltip-title" id="tooltip-title">Hub Name</div>
      <div class="tooltip-desc" id="tooltip-desc">Description</div>
      <div class="tooltip-status" id="tooltip-status"></div>
      <button class="pixel-btn small green" id="tooltip-join-btn">📹 Join Meet</button>
    </div>
 
    <!-- Online players list -->
    <div class="online-panel">
      <div class="panel-header">👥 Team Online</div>
      <div id="online-list"></div>
    </div>
  </div>
 
  <!-- Mobile Controls -->
  <div class="mobile-controls" id="mobile-controls">
    <button class="dpad-btn" id="btn-up">▲</button>
    <div class="dpad-row">
      <button class="dpad-btn" id="btn-left">◀</button>
      <button class="dpad-btn center-btn" id="btn-interact">✦</button>
      <button class="dpad-btn" id="btn-right">▶</button>
    </div>
    <button class="dpad-btn" id="btn-down">▼</button>
  </div>
 
  <!-- Meet Modal -->
  <div id="meet-modal" class="modal-overlay hidden">
    <div class="modal-box">
      <div class="modal-header">
        <canvas id="modal-char" width="32" height="48"></canvas>
        <div>
          <h2 id="modal-hub-name">Hub Name</h2>
          <p id="modal-hub-desc">Hub description</p>
        </div>
      </div>
      <div class="modal-status-bar" id="modal-status-bar">
        <span id="modal-active-users"></span>
      </div>
      <div class="modal-actions">
        <button class="pixel-btn primary large" id="create-meet-btn">📹 Create & Join Meet</button>
        <button class="pixel-btn secondary" id="copy-link-btn">🔗 Copy Link</button>
      </div>
      <div class="meet-link-box hidden" id="meet-link-box">
        <p>Your Google Meet link:</p>
        <a id="meet-link-a" href="#" target="_blank" class="meet-link-text"></a>
        <div class="pixel-note">Link auto-opens in 3s...</div>
      </div>
      <button class="pixel-btn danger small modal-close" id="modal-close-btn">✖ Close</button>
    </div>
  </div>
 
  <!-- Chat bubble layer -->
  <div id="chat-layer"></div>
 
  <!-- Chat input -->
  <div class="chat-input-bar">
    <input type="text" id="chat-input" placeholder="Say something... (Enter)" maxlength="60" />
    <button class="pixel-btn small" id="chat-send">💬</button>
  </div>
</div>
 
<script src="game.js"></script>
</body>
</html>
