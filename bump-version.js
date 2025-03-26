const fs = require("fs");
const path = require("path");

function bump(file, newVersion, key = "version") {
  const manifestPath = path.join(__dirname, file);

  try {
    const manifestData = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestData);

    // Update the version field
    manifest[key] = newVersion;

    // Write the updated manifest back to disk
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Updated ${file} version to ${newVersion}`);
  } catch (err) {
    console.error(`Error updating manifest: ${err.message}`);
    process.exit(1);
  }
}

const newVersion = process.argv[2];
if (!newVersion) {
  console.error("Error: No new version provided. Pass the version as an argument.");
  process.exit(1);
}

const strippedVersion = newVersion.replace(/^v/, "");

bump("package.json", newVersion);
bump("public/manifest.firefox.json", strippedVersion);
bump("public/manifest.chrome.json", strippedVersion);
