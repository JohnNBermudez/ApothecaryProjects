/* This is the main process file for the ApothecaryProjects Electron application.
   It sets up the main application window, handles IPC events for file selection and opening,
   and manages the application's lifecycle events. */
"use strict";

/* This function is used to create a binding between an object and a module's property.
    It checks if the module is an ES module and creates a property descriptor for the binding.
    If the module is not an ES module, it simply assigns the property value to the object. */
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

/* This function is used to create a binding between an object and a module's property.
   It checks if the module is an ES module and creates a property descriptor for the binding.
   If the module is not an ES module, it simply assigns the property value to the object. */
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});

/* This function is used to create a binding between an object and a module's property.
   It checks if the module is an ES module and creates a property descriptor for the binding.
   If the module is not an ES module, it simply assigns the property value to the object. */
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };

    /* This function is used to import all exports from a module and return them as an object.
       It checks if the module is an ES module and returns it directly if so.
       Otherwise, it creates a new object and copies all properties from the module to the new object,
       setting the default export to the module itself. */
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();

/* This is the main process file for the ApothecaryProjects Electron application.
   It sets up the main application window, handles IPC events for file selection and opening,
   and manages the application's lifecycle events. */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));

/* Create the main application window with specified dimensions, background color, and web preferences.
   It loads the application URL and sets up event listeners for keyboard shortcuts to toggle fullscreen and quit the app. */
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
    /* Load the application URL and open the DevTools for debugging. */
    win.loadURL("http://localhost:5173");
    /* Open the DevTools for debugging purposes. */
    win.webContents.openDevTools();
    /* Handle the "before-input-event" to allow toggling fullscreen mode with F11 and exiting fullscreen with Escape. */
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
    /* Handle the "before-input-event" to allow quitting the application with Ctrl + F4. */
    win.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F4" && input.control) {
            electron_1.app.quit();
            event.preventDefault();
        }
    });
}

/* Handle the 'books:select-file' IPC event to open a file selection dialog.
   It checks if the parent window is available and opens the dialog accordingly.
   If a file is selected, it returns the file path and name; otherwise, it indicates cancellation. */
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

/* Handle the 'books:open-file' IPC event to open a file using the default application.
   It checks if the provided file path is valid and then uses Electron's shell module to open the file. */
electron_1.ipcMain.handle("books:open-file", async (_event, filePath) => {
    if (typeof filePath !== "string" || filePath.length === 0) {
        throw new Error("A valid file path is required.");
    }
    return electron_1.shell.openPath(filePath);
});

/* Handle the 'ready' event to create the main application window when the app is ready. */
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});

/* Handle the 'window-all-closed' event to quit the application when all windows are closed. */
electron_1.app.on("window-all-closed", () => {
    electron_1.app.quit();
});
