# Show line endings in Visual Studio Code

This is a small extension that renderes `CR` and/or `LF` at the end of each line.

## Features

If `editor.renderControlCharacters` is true, at the end of each line there will be indicators showing which line ending is used in that line.
Note that this setting does come with Visual Studio Code, not with this extension.

## Known Issues

As of now, Visual Studio Code normalizes all line endings in a file when the file is opened.
Therefore, this extension won't give you more information than what you can already read in the status bar.
As soon as [this issue](https://github.com/Microsoft/vscode/issues/127) is dealt with, the extension might actually be useful.

## Release Notes

### 1.0.2

Change repository field in `package.json` to full url

### 1.0.0

Initial release of the extension
