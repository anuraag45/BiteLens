import fs from 'fs';

export function fixZipSlashes(filePath) {
  const buf = fs.readFileSync(filePath);
  let fixes = 0;

  // Search for Local File Headers: PK\x03\x04
  for (let i = 0; i <= buf.length - 30; i++) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x03 && buf[i + 3] === 0x04) {
      const nameLen = buf.readUInt16LE(i + 26);
      const nameStart = i + 30;
      for (let j = 0; j < nameLen && (nameStart + j) < buf.length; j++) {
        if (buf[nameStart + j] === 0x5c) { // '\'
          buf[nameStart + j] = 0x2f; // '/'
          fixes++;
        }
      }
    }
  }

  // Search for Central Directory Headers: PK\x01\x02
  for (let i = 0; i <= buf.length - 46; i++) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x01 && buf[i + 3] === 0x02) {
      const nameLen = buf.readUInt16LE(i + 28);
      const nameStart = i + 46;
      for (let j = 0; j < nameLen && (nameStart + j) < buf.length; j++) {
        if (buf[nameStart + j] === 0x5c) { // '\'
          buf[nameStart + j] = 0x2f; // '/'
          fixes++;
        }
      }
    }
  }

  fs.writeFileSync(filePath, buf);
  console.log(`Normalized ${fixes} backslash path separators to forward slashes in ${filePath}`);
}

const target = process.argv[2];
if (target) {
  fixZipSlashes(target);
}
