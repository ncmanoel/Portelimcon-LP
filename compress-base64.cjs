const fs = require('fs');
const sharp = require('sharp');

async function processHtml() {
    const htmlPath = 'index.html';
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Regex to match data URIs
    const regex = /src="data:image\/(jpeg|png|webp);base64,([^"]+)"/g;
    let match;
    const matches = [];
    
    while ((match = regex.exec(html)) !== null) {
        matches.push({
            fullMatch: match[0],
            mimeType: match[1],
            base64Data: match[2],
            index: match.index
        });
    }
    
    console.log(`Found ${matches.length} base64 images.`);
    
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        console.log(`Processing image ${i+1}/${matches.length}...`);
        
        try {
            const buffer = Buffer.from(m.base64Data, 'base64');
            const compressedBuffer = await sharp(buffer)
                .resize(800, 600, { fit: 'cover', position: 'centre' })
                .webp({ quality: 80 })
                .toBuffer();
                
            const newBase64 = compressedBuffer.toString('base64');
            const newSrc = `src="data:image/webp;base64,${newBase64}"`;
            
            html = html.replace(m.fullMatch, newSrc);
            console.log(`Image ${i+1} compressed. Old size: ${Math.round(m.base64Data.length/1024)} KB, New size: ${Math.round(newBase64.length/1024)} KB.`);
        } catch (e) {
            console.error(`Error processing image ${i+1}:`, e);
        }
    }
    
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('HTML updated successfully.');
}

processHtml();
