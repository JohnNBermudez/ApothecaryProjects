import {app, BrowserWindow, dialog, ipcMain, shell} from "electron";
import { stat } from "node:fs/promises";
import * as path from "path";

/* This is the main process file for the ApothecaryProjects Electron application.
   It sets up the main application window, handles IPC events for file selection and opening,
   and manages the application's lifecycle events. */
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

  /* Handle the "before-input-event" to allow toggling full-screen mode with F11 and exiting full-screen mode with Escape. */
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    } else if (input.key === "Escape" && win.isFullScreen()) {
      win.setFullScreen(false);
      event.preventDefault();
    }
  });

  /* Handle the "before-input-event" to allow quitting the application with Ctrl + F4. */
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F4" && input.control) {
      app.quit();
      event.preventDefault();
    }
  });
}

/* Handle the "books:select-file" event to open a dialog to select a file. */
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

/* Handle the "books:open-file" event to open a file using the default application associated with its file type. */
ipcMain.handle("books:open-file", async (_event, filePath: unknown) => {
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("A valid file path is required.");
  }

  return shell.openPath(filePath);
});

/* Handle the "books:file-size" event to return the size of an associated file in bytes. */
ipcMain.handle("books:file-size", async (_event, filePath: unknown) => {
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("A valid file path is required.");
  }

  /* Get the file statistics to determine the file size */
  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) {
    throw new Error("The selected path is not a file.");
  }

  /* Return the file size in bytes */
  return fileStats.size;
});

/* Handle the "ready" event to create the main application window when the app is ready. */
app.whenReady().then(() => {
  createWindow();

  /* Handle the "activate" event to create a new window if no windows exist */
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/* Handle the "window-all-closed" event to quit the application when all windows are closed. */
app.on("window-all-closed", () => {
  app.quit();
});