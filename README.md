# Application Bookcase

A desktop project launcher with an old-library aesthetic. Add books from the utility column to select files on your computer; book names, file paths, metadata, and bookshelf positions are saved locally. Double-clicking a book opens its file with the operating system's default application.

## Development

Install dependencies and start the Vite and Electron development processes:

```powershell
npm ci
npm start
```

## Production build and Windows installer

Build the production renderer and Electron main process:

```powershell
npm run build
```

Create the Windows NSIS installer:

```powershell
npm run dist:win
```

The downloadable installer is written to `release/BookcaseInstaller.exe`. It installs **Application Bookcase** for the current Windows user, offers an installation-directory choice, creates a desktop shortcut and a Start Menu entry, and can launch the application when setup completes.

The installer uses Electron Builder's standard Windows NSIS packaging. For a future release, update the version in `package.json`, then run `npm ci` and `npm run dist:win` on Windows.

## Application icon

`assets/icons/bookshelf-empty.png` is the source artwork. `npm run generate:icon` uses `png2icons` to generate `build/icon.ico`, containing Windows icon images from 16px through 256px. The generated ICO is used for the Windows executable, installer, installed shortcuts, and the running window/taskbar. The production package also includes this ICO as an application resource.

The normal production build and installer command generate the icon automatically. To regenerate it after changing the source PNG, run:

```powershell
npm run generate:icon
```

## User data and persistence

Books, file associations and metadata, and shelf positions are persisted in the Electron profile's `localStorage`, separate from the installed application files. On Windows, the profile is stored under:

```text
%APPDATA%\Application Bookcase\Local Storage\leveldb
```

Updates and reinstalls do not include or overwrite this per-user profile. A new profile starts with one unassociated **Example Book**; a saved empty shelf remains empty on future launches. All saved user books and their positions are restored when the application is launched again.
