import fs from 'fs';
import path from 'path';

const iconDir = path.resolve('src-tauri', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Minimal 1x1 / 32x32 valid PNG buffer (base64)
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACU4iMAAAAcSURBVFjD7cEBDQAAAMKg909tDwcUAAAAAOA1DRAAAae2v9cAAAAASUVORK5CYII=';
const pngBuffer = Buffer.from(samplePngBase64, 'base64');

fs.writeFileSync(path.join(iconDir, '32x32.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, '128x128.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, '128x128@2x.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, 'icon.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, 'icon.ico'), pngBuffer);
console.log('Icons generated successfully in src-tauri/icons/');
