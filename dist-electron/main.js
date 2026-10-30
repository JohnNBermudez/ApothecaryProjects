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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 758,
        minHeight: 696,
        backgroundColor: "#3b2415",
        fullscreenable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
    win.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F11") {
            win.setFullScreen(!win.isFullScreen());
            event.preventDefault();
        }
        else if (input.key === "Escape" && win.isFullScreen()) {
            win.setFullScreen(false);
            event.preventDefault();
        }
    });
    win.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F4" && input.control) {
            electron_1.app.quit();
            event.preventDefault();
        }
    });
}
electron_1.ipcMain.handle("books:select-file", async (event) => {
    const parentWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    const result = parentWindow
        ? await electron_1.dialog.showOpenDialog(parentWindow, { properties: ["openFile"] })
        : await electron_1.dialog.showOpenDialog({ properties: ["openFile"] });
    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
    }
    const filePath = result.filePaths[0];
    return { canceled: false, filePath, fileName: path.basename(filePath) };
});
electron_1.ipcMain.handle("books:open-file", async (_event, filePath) => {
    if (typeof filePath !== "string" || filePath.length === 0) {
        throw new Error("A valid file path is required.");
    }
    return electron_1.shell.openPath(filePath);
});
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    electron_1.app.quit();
});
