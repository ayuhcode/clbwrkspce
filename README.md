# 🌱 Club Workspace
 
**A Club Penguin–inspired pixel workspace for teams.**
 
Walk around, meet teammates, and hop into Google Meet with one click — all inside a playful pixel world.
 
---
 
## ✨ Features
 
| Feature | Description |
|---|---|
| 🕹️ Pixel character | Each member picks a name & colour — their own pixel avatar |
| 🏛️ Team hubs | Strategy Room, Creative Studio, Logistics HQ, Comms Centre, Chill Lounge + Main Plaza |
| 📹 Auto Google Meet | Click any hub → one-click creates a real Google Meet link |
| 🟢 Live indicators | Hubs with active meetings glow green with a **LIVE** badge and attendee dots |
| 💬 Chat bubbles | Type a message, it floats above your character |
| 👥 Online panel | See who's currently in the world |
| 📱 Mobile D-Pad | Touch-friendly controls on mobile |
 
---
 
## 🚀 Deploy on GitHub Pages (free, 2 minutes)
 
1. **Fork or create** a new GitHub repository
2. **Upload** the 3 files:
   - `index.html`
   - `style.css`
   - `game.js`
3. Go to **Settings → Pages**
4. Under *Branch*, choose `main` and `/ (root)` → click **Save**
5. GitHub gives you a free URL like `https://yourname.github.io/volunteer-world/`
Share that link with your whole team — no login, no server needed!
 
---
 
## 🎮 Controls
 
| Action | Keyboard | Mobile |
|---|---|---|
| Move | Arrow keys or WASD | D-pad buttons |
| Enter hub | Click hub or press ✦ | Tap hub or press ✦ |
| Chat | Type + Enter | Type + 💬 |
 
---
 
## 🛠️ Customise
 
### Change hub names / rooms
Edit the `HUBS` array in `game.js`:
```js
{
  id: "strategy",
  name: "Strategy Room",       // ← change this
  desc: "Plan campaigns...",    // ← and this
  icon: "📋",                   // ← any emoji
  color: "#58a6ff",             // ← hex colour
  x: 100, y: 110,              // ← position on map
  w: 110, h: 80,               // ← size
}
```
 
### Add real teammates (pre-populate online list)
To show specific teammate names on load, edit the `initOtherPlayers` function or
store a JSON array in `localStorage` under the key `vw_others`:
```json
[
  {"name":"Alex","color":"#4ECDC4","x":300,"y":250,"dir":1,"frame":0,"dx":0.3,"dy":0.1,"chat":"","chatTimer":0},
  {"name":"Jordan","color":"#DDA0DD","x":450,"y":310,"dir":-1,"frame":0,"dx":-0.2,"dy":0.2,"chat":"","chatTimer":0}
]
```
 
### Google Meet integration
Meet links are generated in `generateMeetLink()`. They produce real `meet.google.com` URLs — members just need to be signed into Google. The link format follows the standard Google Meet convention.
 
For a **persistent shared state** (so all members see the same live hubs), you can integrate a free service like [Firebase Realtime Database](https://firebase.google.com/) or [Supabase](https://supabase.com/) and replace the `sessionStorage` calls in `saveMeetLinks()` / `loadMeetLinks()`.
 
---
 
## 🗂️ File Structure
 
```
volunteer-world/
├── index.html    # App shell, screens, modals
├── style.css     # Pixel aesthetic, dark theme, responsive layout
├── game.js       # Canvas engine, character renderer, hub logic, Meet link generator
└── README.md
```
 
---
 
## 📄 License
 
MIT — use freely for your team!
