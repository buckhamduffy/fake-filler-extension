This was forked from calvinballing/fake-filler-extension, which was previously forked from FakeFiller/fake-filler-extension, which was developed by Hussein Shabbir under the MIT license.  The original FakeFiller is no longer actively maintained, so this version drops the free-version's restrictions on number of field inputs and ability to create profiles.  It does not have the ability to sync settings across devices.

# <img src="public/images/logo.svg" height="53" alt="Fake Filler 2" title="Fake Filler 2" />

This extension allows you to fill all form inputs (textboxes, textareas, radio buttons, dropdowns, etc.) with dummy data. It is a must for developers and testers who work with forms as it avoids the need for manually entering values in fields.

# Install 

Download the extension from the [Release Page](https://github.com/buckhamduffy/fake-filler-extension/releases) and install it in your browser.

### Firefox
1. Click the extensions icon in the toolbar, and click Manage Extensions
2. Click the gear icon in the top right corner, and select "Install Add-on From File..."
3. Navigate to the downloaded file (firefox.zip) and select it
### Chrome
TBD

## Default shortcut

Use **_CTRL+SHIFT+F_** on Windows and **_CMD+SHIFT+F_** on Mac to fire the extension. See the [Keyboard Shortcuts](https://github.com/calvinballing/fake-filler-extension/wiki/Keyboard-Shortcuts) page for more details.

## Developing (in Firefox)

1. `bun install`
2. `./build-extension.sh`
3. Goto extensions page
4. Click Debug Add-Ons in the gear icon menu
5. click "Load Temporary Add-On", loading fakefiller.zip from ~/Downloads
6. Click `reload` after everytime you run `./build-extension.sh`

## Building

1. `bun install`
2. `echo "VERSION=1.1.1 > .env.production`
3. `bun run build-chrome` or `bun run build-firefox`

### Enable extension debugging

1. open `about:config` in Firefox
1. as a search term, type `extensions.sdk.console.logLevel` and click the `+` button to add a new setting with the type "string".
1. set the value of the new setting to `all`.

### View extension console log

In the [this firefox](about:debugging#/runtime/this-firefox) page, next to the add-on, click the "inspect" button.
