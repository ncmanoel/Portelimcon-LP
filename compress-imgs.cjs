const sharp = require('sharp');
const path = require('path');

const src = 'C:\\Users\\pc\\OneDrive\\PORTELIMCON\\Modelos';
const dest = __dirname;

async function run() {
  // Porteiro 4:3 → 800x600 WebP ~q80
  const p1 = await sharp(path.join(src, 'Porteiro 4_3.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'porteiro.webp'));
  console.log('porteiro.webp:', Math.round(p1.size / 1024), 'KB');

  // Servente 4:3 → 800x600 WebP ~q80
  const p2 = await sharp(path.join(src, 'Servente 4_3.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'servente.webp'));
  console.log('servente.webp:', Math.round(p2.size / 1024), 'KB');
}

run().catch(console.error);
