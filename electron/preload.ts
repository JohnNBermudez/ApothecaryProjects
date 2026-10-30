import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("apothecary", {
  selectFile: () => ipcRenderer.invoke("books:select-file"),
  openFile: (filePath: string) => ipcRenderer.invoke("books:open-file", filePath),
});