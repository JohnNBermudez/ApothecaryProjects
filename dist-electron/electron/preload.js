/* This is the preload script for the ApothecaryProjects Electron application.
   It exposes the selectFile and openFile methods to the main window, allowing 
   the renderer process to interact with the file system through IPC. */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    ping: () => "pong"
});
