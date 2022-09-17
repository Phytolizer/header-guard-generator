# Header Guard Generator

A simple generator for C-style header guards.

## Usage

The extension provides two commands ("Generate Header Guard" and "Update Header Guard").
- "Generate Header Guard" will generate a snippet containing by default the name of your header guard,
and insert it at your cursor's position.
- "Update Header Guard" will find an existing header guard (with comment following the \#endif), and change the identifier to match the file's location.

## Extension Settings


This extension contributes the following settings:

- `header-guard-generator.stopDirs`: A list of directories that will be treated as the "root".
  The last matching directory found will be used.
  Use this to prevent leaking, for example, the name of your home directory.

## Known Issues

The update command requires a matching comment after the #endif currently.

## Release Notes

### 1.0.0

Initial release of Header Guard Generator.
