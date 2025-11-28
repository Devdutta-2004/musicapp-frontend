// scripts/start-with-lan.js
// Updated: bind CRA to 0.0.0.0 and auto-open browser to detected LAN IP.
// This avoids the webpack-dev-server "allowedHosts" error that occurs
// when setting HOST to a concrete IP in some CRA versions.

const os = require('os');
const { execSync } = require('child_process');

function detectLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // prefer IPv4, non-internal, non-loopback addresses
      if (net.family === 'IPv4' && !net.internal) {
        // Skip obvious docker/virtual addresses if you want; keep them for now
        candidates.push(net.address);
      }
    }
  }

  // return first candidate or fallback to localhost
  return candidates.length > 0 ? candidates[0] : '127.0.0.1';
}

const ip = detectLanIp();
const port = process.env.PORT || 3000;
const lanUrl = `http://${ip}:${port}`;

console.log('🌐 Will start React and open:', lanUrl);

// Instruct CRA to bind to all interfaces (0.0.0.0) instead of a single IP.
// Binding to 0.0.0.0 avoids the webpack-dev-server allowedHosts/options schema error.
process.env.HOST = '0.0.0.0';
process.env.PORT = String(port);

// Prevent CRA from opening the default localhost URL — we'll open the LAN URL ourselves.
process.env.BROWSER = 'none';

// Try to open the detected LAN URL in the default browser (best-effort).
try {
  if (process.platform === 'win32') execSync(`start "" "${lanUrl}"`);
  else if (process.platform === 'darwin') execSync(`open "${lanUrl}"`);
  else execSync(`xdg-open "${lanUrl}"`);
} catch (err) {
  console.log('Could not auto-open browser — copy/paste this URL to open:', lanUrl);
}

// Finally, start CRA (react-scripts will read HOST=0.0.0.0 and listen on all interfaces)
require('react-scripts/scripts/start');
