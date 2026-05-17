const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImages() {
  const sourceDir = 'C:\\Users\\pc\\OneDrive\\PORTELIMCON\\Modelos';
  
  // 1. Processar a Logo (Apenas reduzir a altura para 120px para manter altíssima nitidez mas tamanho de arquivo pequeno)
  const logoInput = path.join(sourceDir, 'Logo_Portelimcon_nitidez_Menor_30.png');
  const logoOutput = 'logo.webp';
  
  if (fs.existsSync(logoInput)) {
    await sharp(logoInput)
      .resize({ height: 120, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(logoOutput);
    console.log('Gerado logo.webp com sucesso.');
  } else {
    console.error('Nao achou a logo original:', logoInput);
  }

  // 2. Processar Zelador (Corte 800x600)
  const zeladorInput = path.join(sourceDir, 'Zelador.png');
  const zeladorOutput = 'zelador.webp';
  
  if (fs.existsSync(zeladorInput)) {
    await sharp(zeladorInput)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(zeladorOutput);
    console.log('Gerado zelador.webp com sucesso.');
  } else {
    console.error('Nao achou a imagem do zelador:', zeladorInput);
  }
}

processImages().catch(console.error);
