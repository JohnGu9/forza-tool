# Forza Tool

A tool for display forza telemetry information.

# Ability

General engine power curve analysis from real time telemetry information.

<img src="./doc/0.png">

Reasonable recommendation for engine rpm control.

<img src="./doc/1.png">

# System requirement

Webview2 support.

# Build

Ensure `node` (with npm) and `rust` is already installed in your computer. And your network is ok for connecting `npmjs.com` and `crates.io`.

```console
# clone project
git https://github.com/JohnGu9/forza-tool.git
cd forza-tool

# build project
npm i
npm run tauri build
```

This project is cross-platform. You can set target-platform to `windows`/`linux`/`macOS` (as long as the platform support `webview2`).
