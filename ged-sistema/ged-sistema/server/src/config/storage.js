const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function saveFile(buffer, originalname, mimetype) {
  const ext = path.extname(originalname);
  const fileId = uuidv4();
  const key = `documents/${fileId}${ext}`;

  const dir = path.join(UPLOADS_DIR, 'documents');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, key), buffer);
  return { key, url: `/uploads/${key}` };
}

async function saveVersionFile(buffer, documentId, version, originalname, mimetype) {
  const ext = path.extname(originalname);
  const key = `documents/${documentId}/v${version}${ext}`;

  const dir = path.join(UPLOADS_DIR, 'documents', documentId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, key), buffer);
  return key;
}

async function getFileUrl(key) {
  return `/uploads/${key}`;
}

function getFileBuffer(key) {
  const filePath = path.join(UPLOADS_DIR, key);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

function getStorageUsed() {
  let totalBytes = 0;
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) scanDir(fullPath);
      else totalBytes += fs.statSync(fullPath).size;
    }
  }
  scanDir(UPLOADS_DIR);
  return totalBytes;
}

module.exports = { saveFile, saveVersionFile, getFileUrl, getFileBuffer, UPLOADS_DIR, getStorageUsed };
