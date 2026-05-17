const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="navOverlay"')) {
  html = html.replace('<header>', '<div class="nav-overlay" id="navOverlay" onclick="closeMenu()"></div>\n<header>');
  fs.writeFileSync('index.html', html);
  console.log('Added navOverlay');
} else {
  console.log('navOverlay already exists');
}
