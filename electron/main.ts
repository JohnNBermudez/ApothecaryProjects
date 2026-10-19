import {app, BrowserWindow} from "electron";
import * as path from "path";

function createWindow()
{
    const win = new BrowserWindow
    ({
        width: 1280,
        height: 800,
        minWidth: 662,
        minHeight: 696,
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
        } else if (input.key === "Escape" && win.isFullScreen()) {
            win.setFullScreen(false);
            event.preventDefault();
        }
    });

    win.webContents.on("before-input-event", (event, input) => 
    {
        if(input.key === "F4" && input.control) 
        {
            app.quit();
            event.preventDefault();
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    app.quit();
});