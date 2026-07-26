import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'Docx2Markdown',
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Word Documents', extensions: ['docx'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const fileBuffer = await fs.readFile(filePath);
  const stats = await fs.stat(filePath);

  return {
    path: filePath,
    name: path.basename(filePath),
    size: stats.size,
    modified: stats.mtime.toISOString(),
    buffer: Array.from(new Uint8Array(fileBuffer)),
  };
});

ipcMain.handle('dialog:selectFolder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('file:saveFile', async (_, { defaultName, content, filters }) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: filters || [{ name: 'Markdown File', extensions: ['md'] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  await fs.writeFile(result.filePath, content, 'utf-8');
  return result.filePath;
});

ipcMain.handle('file:saveBinary', async (_, { defaultName, buffer, filters }) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: filters || [{ name: 'ZIP Archive', extensions: ['zip'] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  await fs.writeFile(result.filePath, Buffer.from(buffer));
  return result.filePath;
});

ipcMain.handle('file:exportFolderPackage', async (_, { targetFolder, markdownName, markdownContent, images, imageFolder, report }) => {
  try {
    const mdPath = path.join(targetFolder, markdownName);
    await fs.writeFile(mdPath, markdownContent, 'utf-8');

    if (images && images.length > 0) {
      const imgDir = path.join(targetFolder, imageFolder || 'images');
      await fs.mkdir(imgDir, { recursive: true });

      for (const img of images) {
        const imgPath = path.join(imgDir, img.filename);
        await fs.writeFile(imgPath, Buffer.from(img.buffer));
      }
    }

    if (report) {
      const reportPath = path.join(targetFolder, 'conversion-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    }

    return targetFolder;
  } catch (err: any) {
    throw new Error(`Gagal menyimpan folder paket: ${err.message}`);
  }
});

ipcMain.handle('shell:openFolder', async (_, folderPath: string) => {
  await shell.openPath(folderPath);
});

ipcMain.handle('shell:showInFolder', async (_, filePath: string) => {
  shell.showItemInFolder(filePath);
});
