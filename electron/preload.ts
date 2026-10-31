import { contextBridge, ipcRenderer } from "electron";

/* Exposes the selectFile and openFile methods to the main window.
   These methods are responsible for opening and interacting with the file explorer, respectively. */
contextBridge.exposeInMainWorld("apothecary", {
  selectFile: () => ipcRenderer.invoke("books:select-file"),
  openFile: (filePath: string) => ipcRenderer.invoke("books:open-file", filePath),
});