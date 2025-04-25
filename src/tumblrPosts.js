import { Jimp, loadFont, intToRGBA, rgbaToInt, measureText, measureTextHeight } from 'jimp';
import { SANS_32_WHITE } from "jimp/fonts";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios'
import { generatePoem } from './generatePoem.js';

async function download(url, filepath) {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(filepath))
        .on('error', reject)
        .once('close', () => resolve(filepath))
    })
  }
async function lofiify() {
    const filePath = "image.jpg";
    const imagePath = await download('https://picsum.photos/800/600', filePath);
    const poem = await generatePoem(7);
    const image = await Jimp.read(filePath);
    // Apply lofi effects

    image.blur(1)                                 // Slight blur for dreaminess
    image.brightness(0.75)                       // Just a little dimming
    image.contrast(0.1)                           // Mild contrast bump
    image.color([{ apply: 'saturate', params: [1.5] }]); // Much lower saturation increase

    // // Add grain
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const grainIntensity = 2;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const pixel = intToRGBA(image.getPixelColor(x, y));

            const grain = () => Math.floor((Math.random() - 0.5) * 2 * grainIntensity);
      
            const r = Math.max(0, Math.min(255, pixel.r + grain()));
            const g = Math.max(0, Math.min(255, pixel.g + grain()));
            const b = Math.max(0, Math.min(255, pixel.b + grain()));
      
            image.setPixelColor(rgbaToInt(r, g, b, pixel.a), x, y);
        }
    }

    let message = poem;
    message = message.trim().replace(/^"(.*)"$/, '$1');

    const font = await loadFont(SANS_32_WHITE);

    const textWidth = measureText(font, message);
    const textHeight = measureTextHeight(font, message, image.bitmap.width);

    const x = (image.bitmap.width - textWidth) / 2;
    const y = (image.bitmap.height - textHeight) / 2;


    image.print({ font, x, y, text: message, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE });

    await image.write("lofi.jpg");
    console.log("✅ Lofi image saved as lofi.jpg");
}




lofiify();
