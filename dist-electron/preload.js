"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/* Exposes the selectFile and openFile methods to the main window.
   These methods are responsible for opening and interacting with the file explorer, respectively. */
electron_1.contextBridge.exposeInMainWorld("apothecary", {
    selectFile: () => electron_1.ipcRenderer.invoke("books:select-file"),
    openFile: (filePath) => electron_1.ipcRenderer.invoke("books:open-file", filePath),
    copyFilePath: (filePath) => electron_1.ipcRenderer.invoke("books:copy-filepath", filePath),
    getFileSize: (filePath) => electron_1.ipcRenderer.invoke("books:file-size", filePath),
});
