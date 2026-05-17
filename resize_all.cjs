const sharp = require('sharp');
const path = require('path');

const src = 'C:\\Users\\pc\\OneDrive\\PORTELIMCON\\Modelos';
const dest = __dirname;

async function run() {
  // 1. Logo
  const logo = await sharp(path.join(src, 'Logo_Portelimcon_nitidez_Menor_30.png'))
    .resize({ height: 80 })
    .webp({ quality: 90 })
    .toFile(path.join(dest, 'logo.webp'));
  console.log('logo.webp:', Math.round(logo.size / 1024), 'KB');

  // 2. Zelador
  const p1 = await sharp(path.join(src, 'Zelador.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'zelador.webp'));
  console.log('zelador.webp:', Math.round(p1.size / 1024), 'KB');

  // 3. Servente
  const p2 = await sharp(path.join(src, 'Servente 4_3.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'servente.webp'));
  console.log('servente.webp:', Math.round(p2.size / 1024), 'KB');

  // 4. Porteiro
  const p3 = await sharp(path.join(src, 'Porteiro 4_3.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'porteiro.webp'));
  console.log('porteiro.webp:', Math.round(p3.size / 1024), 'KB');

  // 5. Limpeza externa
  const p4 = await sharp(path.join(src, 'Limpeza - área externa 4_3.png'))
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(path.join(dest, 'limpeza-externa.webp'));
  console.log('limpeza-externa.webp:', Math.round(p4.size / 1024), 'KB');
}

run().catch(console.error);
