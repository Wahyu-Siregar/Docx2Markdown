import { contextBridge, ipcRenderer } from 'electron';

export interface DocxFilePayload {
  path: string;
  name: string;
  size: number;
  modified: string;
  buffer: number[];
}

export interface Docx2MdAPI {
  openFile: () => Promise<DocxFilePayload | null>;
  selectFolder: () => Promise<string | null>;
  saveFile: (options: { defaultName: string; content: string; filters?: any[] }) => Promise<string | null>;
  saveBinary: (options: { defaultName: string; buffer: number[]; filters?: any[] }) => Promise<string | null>;
  exportFolderPackage: (options: {
    targetFolder: string;
    markdownName: string;
    markdownContent: string;
    images?: Array<{ filename: string; buffer: number[] }>;
    imageFolder?: string;
    report?: any;
  }) => Promise<string>;
  openFolder: (path: string) => Promise<void>;
  showInFolder: (path: string) => Promise<void>;
}

const api: Docx2MdAPI = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  saveFile: (opts) => ipcRenderer.invoke('file:saveFile', opts),
  saveBinary: (opts) => ipcRenderer.invoke('file:saveBinary', opts),
  exportFolderPackage: (opts) => ipcRenderer.invoke('file:exportFolderPackage', opts),
  openFolder: (p) => ipcRenderer.invoke('shell:openFolder', p),
  showInFolder: (p) => ipcRenderer.invoke('shell:showInFolder', p),
};

contextBridge.exposeInMainWorld('docx2mdApi', api);
