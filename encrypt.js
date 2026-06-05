const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node encrypt.js "your-password"');
  process.exit(1);
}

const inputFile = path.join(__dirname, 'dashboard-hub.html');
const outputFile = path.join(__dirname, 'index.html');

const htmlContent = fs.readFileSync(inputFile, 'utf8');

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

let encrypted = cipher.update(htmlContent, 'utf8', 'base64');
encrypted += cipher.final('base64');
const authTag = cipher.getAuthTag().toString('base64');

const payload = JSON.stringify({
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  authTag: authTag,
  data: encrypted
});

const payloadB64 = Buffer.from(payload).toString('base64');

const outputHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>T-MART Finance &mdash; Dashboard Hub</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --orange: #FF5900;
    --orange-light: #ff7a33;
    --brown: #411517;
    --off-white: #F4EDE3;
    --lime: #CFFF00;
    --white: #FFFFFF;
    --border: #E8DFD2;
    --border-strong: #D6CABC;
    --text: #2D1A1C;
    --text-muted: #8B6B6E;
    --shadow: 0 2px 12px rgba(65,21,23,0.06);
  }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'DM Sans', -apple-system, sans-serif;
    background: var(--off-white);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-font-smoothing: antialiased;
  }
  .lock-screen {
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .lock-bg {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(65,21,23,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(65,21,23,0.03) 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
  }
  .lock-glow {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,89,0,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .lock-icon {
    width: 64px; height: 64px;
    margin: 0 auto 24px;
    background: var(--orange);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(255,89,0,0.3);
  }
  .lock-icon svg {
    width: 32px; height: 32px;
    fill: #fff;
  }
  .lock-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px;
    letter-spacing: 4px;
    color: var(--brown);
    line-height: 0.9;
    margin-bottom: 8px;
  }
  .lock-title span { color: var(--orange); }
  .lock-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 32px;
  }
  .lock-form {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
  }
  .lock-input {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    padding: 12px 20px;
    border: 2px solid var(--border-strong);
    border-radius: 8px;
    background: var(--white);
    color: var(--text);
    outline: none;
    width: 260px;
    transition: border-color 0.2s;
    letter-spacing: 2px;
  }
  .lock-input:focus {
    border-color: var(--orange);
  }
  .lock-input.error {
    border-color: #C62828;
    animation: shake 0.4s ease;
  }
  .lock-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 2px;
    padding: 12px 28px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    box-shadow: 0 4px 16px rgba(255,89,0,0.3);
  }
  .lock-btn:hover {
    background: var(--orange-light);
    transform: translateY(-1px);
  }
  .lock-btn:active { transform: translateY(0); }
  .lock-error {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #C62828;
    margin-top: 12px;
    letter-spacing: 1px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .lock-error.show { opacity: 1; }
  .lock-hint {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 24px;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  .fade-out {
    animation: fadeOut 0.4s ease forwards;
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: scale(0.97); }
  }
</style>
</head>
<body>
<div class="lock-bg"></div>
<div class="lock-glow"></div>

<div class="lock-screen" id="lockScreen">
  <div class="lock-icon">
    <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>
  </div>
  <div class="lock-title">T-MART<br><span>FINANCE</span></div>
  <div class="lock-subtitle">Dashboard Hub &middot; Protected</div>
  <form class="lock-form" id="lockForm">
    <input type="password" class="lock-input" id="lockInput" placeholder="Enter password" autocomplete="off" autofocus>
    <button type="submit" class="lock-btn">UNLOCK</button>
  </form>
  <div class="lock-error" id="lockError">Incorrect password. Please try again.</div>
</div>

<div id="encPayload" style="display:none">${payloadB64}</div>

<script>
(function() {
  var form = document.getElementById('lockForm');
  var input = document.getElementById('lockInput');
  var errorEl = document.getElementById('lockError');
  var lockScreen = document.getElementById('lockScreen');
  var payloadB64 = document.getElementById('encPayload').textContent.trim();

  function b64ToArr(b64) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  async function decrypt(pwd) {
    try {
      var payloadJson = atob(payloadB64);
      var payload = JSON.parse(payloadJson);

      var salt = b64ToArr(payload.salt);
      var iv = b64ToArr(payload.iv);
      var authTag = b64ToArr(payload.authTag);
      var encData = b64ToArr(payload.data);

      var combined = new Uint8Array(encData.length + authTag.length);
      combined.set(encData);
      combined.set(authTag, encData.length);

      var enc = new TextEncoder();
      var keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']
      );

      var key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      var decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        combined
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return null;
    }
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var pwd = input.value;
    if (!pwd) return;

    input.disabled = true;
    var result = await decrypt(pwd);

    if (result) {
      lockScreen.classList.add('fade-out');
      setTimeout(function() {
        document.open();
        document.write(result);
        document.close();
      }, 400);
    } else {
      input.disabled = false;
      input.classList.add('error');
      errorEl.classList.add('show');
      setTimeout(function() {
        input.classList.remove('error');
      }, 400);
      setTimeout(function() {
        errorEl.classList.remove('show');
      }, 3000);
      input.value = '';
      input.focus();
    }
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(outputFile, outputHtml, 'utf8');
console.log('Encrypted dashboard written to: ' + outputFile);
console.log('Password: ' + password);
console.log('Salt: ' + salt.toString('hex').substring(0, 16) + '...');
console.log('Done!');
