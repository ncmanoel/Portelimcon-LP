const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

// Replace line 543 which currently has servente.webp for Zeladoria
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<h3') && lines[i].includes('Zeladoria')) {
    // Look above for the img
    for (let j = i; j >= i - 5; j--) {
      if (lines[j].includes('img-wrap')) {
        lines[j] = '      <div class="img-wrap"><img src="zelador.webp" alt="Zelador Portelimcon" loading="lazy"></div>';
      }
    }
  }

  // Replace the image for Auxiliar de Serviços Gerais or Servente
  // Let's find "Auxiliar" or "Servente" in the h3 or p
  if (lines[i].includes('<h3') && (lines[i].includes('Servente') || lines[i].includes('Auxiliar'))) {
    // Look above for the img
    for (let j = i; j >= i - 5; j--) {
      if (lines[j].includes('img-wrap')) {
        lines[j] = '      <div class="img-wrap"><img src="servente.webp" alt="Auxiliar de Serviços Gerais Portelimcon" loading="lazy"></div>';
      }
    }
  }
}

fs.writeFileSync('index.html', lines.join('\n'));
console.log('HTML updated');
