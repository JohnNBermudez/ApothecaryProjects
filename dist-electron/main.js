"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: "#3b2415",
        fullscreenable: true
    });
    // Load Vite dev server
    win.loadURL("http://localhost:5173");
    //Optional: Open DevTools during development
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
