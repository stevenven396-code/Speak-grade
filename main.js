const { app, BrowserWindow, ipcMain, safeStorage, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let win;
const keyFile = () => path.join(app.getPath('userData'), 'claude-api-key.enc');

function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 900, minWidth: 820, minHeight: 650,
    backgroundColor: '#f4f3ff',
    title: 'IELTS Speaking Auto-Grader',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('key:status', () => ({ configured: fs.existsSync(keyFile()) }));
ipcMain.handle('key:save', async (_event, key) => {
  if (typeof key !== 'string' || !/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(key.trim())) {
    throw new Error('That does not look like a valid Anthropic API key.');
  }
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure key storage is unavailable on this computer.');
  fs.mkdirSync(path.dirname(keyFile()), { recursive: true });
  fs.writeFileSync(keyFile(), safeStorage.encryptString(key.trim()), { mode: 0o600 });
  return { saved: true };
});
ipcMain.handle('key:delete', () => { try { fs.unlinkSync(keyFile()); } catch {} return { deleted: true }; });

ipcMain.handle('claude:grade', async (_event, prompt) => {
  if (!fs.existsSync(keyFile())) throw new Error('Add your Anthropic API key in Settings before grading.');
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure key storage is unavailable.');
  const apiKey = safeStorage.decryptString(fs.readFileSync(keyFile()));
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `Anthropic API request failed (${response.status}).`;
    throw new Error(detail);
  }
  const text = (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n').trim();
  if (!text) throw new Error('Claude returned an empty response. Please try again.');
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); }
  catch { throw new Error('Claude returned a response that could not be read as JSON. Please try again.'); }
});

ipcMain.handle('app:about', () => ({ version: app.getVersion() }));
