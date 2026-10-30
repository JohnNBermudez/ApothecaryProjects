import {app, BrowserWindow, dialog, ipcMain, shell} from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
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
    } else if (input.key === "Escape" && win.isFullScreen()) {
      win.setFullScreen(false);
      event.preventDefault();
    }
  });

  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F4" && input.control) {
      app.quit();
      event.preventDefault();
    }
  });
}

ipcMain.handle("books:select-file", async (event) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const result = parentWindow
    ? await dialog.showOpenDialog(parentWindow, { properties: ["openFile"] })
    : await dialog.showOpenDialog({ properties: ["openFile"] });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  return { canceled: false, filePath, fileName: path.basename(filePath) };
});

ipcMain.handle("books:open-file", async (_event, filePath: unknown) => {
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("A valid file path is required.");
  }

  return shell.openPath(filePath);
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});