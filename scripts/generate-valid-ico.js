import fs from 'fs';
import path from 'path';

const iconDir = path.resolve('src-tauri', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 32x32 PNG base64
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACU4iMAAAAcSURBVFjD7cEBDQAAAMKg909tDwcUAAAAAOA1DRAAAae2v9cAAAAASUVORK5CYII=';
const pngBuffer = Buffer.from(samplePngBase64, 'base64');

fs.writeFileSync(path.join(iconDir, '32x32.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, '128x128.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, '128x128@2x.png'), pngBuffer);
fs.writeFileSync(path.join(iconDir, 'icon.png'), pngBuffer);

// Build valid Windows ICO containing the PNG
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 Image

const icoDirEntry = Buffer.alloc(16);
icoDirEntry.writeUInt8(32, 0); // Width
icoDirEntry.writeUInt8(32, 1); // Height
icoDirEntry.writeUInt8(0, 2);  // Colors
icoDirEntry.writeUInt8(0, 3);  // Reserved
icoDirEntry.writeUInt16LE(1, 4); // Planes
icoDirEntry.writeUInt16LE(32, 6); // Bit count
icoDirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image
icoDirEntry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

const validIco = Buffer.concat([icoHeader, icoDirEntry, pngBuffer]);
fs.writeFileSync(path.join(iconDir, 'icon.ico'), validIco);
console.log('Valid icon.ico generated successfully for Windows RC.exe!');
