const fs = require("node:fs");
const path = require("node:path");
const png2icons = require("png2icons");

const sourcePath = path.join(__dirname, "..", "assets", "icons", "bookshelf-empty.png");
const outputDirectory = path.join(__dirname, "..", "build");
const outputPath = path.join(outputDirectory, "icon.ico");

/* Create a Windows executable-compatible ICO containing sizes from 16px through 256px. */
const icon = png2icons.createICO(
  fs.readFileSync(sourcePath),
  png2icons.BICUBIC,
  0,
  false,
  true,
);

if (!icon) {
  throw new Error(`Could not create an ICO file from ${sourcePath}.`);
}

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, icon);
console.log(`Generated ${outputPath}`);
