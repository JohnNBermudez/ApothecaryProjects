/* This is the main process file for the ApothecaryProjects Electron application.
   It handles the creation of the main window, IPC communication for file operations,
   and the application lifecycle events. */
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));

/* This is a helper function to set the default value of a module. 
   It is used to set the default value of the "default" export of a module. */
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});

/* This is a helper function to import a module.
   It is used to import modules in a way that is compatible with both CommonJS and ES modules. */
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };

    /* This function returns a function that imports a module and ensures it is compatible with both CommonJS and ES modules. */
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();

/* This is a helper function to import a module.
   It is used to import modules in a way that is compatible with both CommonJS and ES modules. */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));

/* This function creates the main application window.
   It sets the window size, background color, and web preferences, and loads the Vite dev server. */
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: "#d8c468",
        webPreferences: {
            preload: path.join(__dirname, "preload.ts"),
        },
    });
    /* Load Vite dev server */
    win.loadURL("http://localhost:5173");
    /* Optional: Open DevTools during development */
    win.webContents.openDevTools();
}
/* Handle the "ready" event to create the main application window when the app is ready. */
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
/* Handle the "window-all-closed" event to quit the application when all windows are closed. */
electron_1.app.on("window-all-closed", () => {
    if (process.platform != "darwin")
        electron_1.app.quit();
});
