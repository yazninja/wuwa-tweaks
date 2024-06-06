# wuwa-tweaks

This is a project that makes it easy to tweak [Wuthering Waves](https://wutheringwaves.kurogames.com/en/main) (WuWa) game data.

## Usage

(Recommended) [Windows from Fast Server](https://cdn.yaz.ninja/wuwa-tweaks.exe)

Get the latest build in the [releases](https://github.com/yazninja/wuwa-tweaks/releases/lastest) page.
Or get the exe's directly : [Windows](https://github.com/yazninja/wuwa-tweaks/releases/latest/download/wuwa-tweaks.exe) | [Linux](https://github.com/yazninja/wuwa-tweaks/releases/latest/download/wuwa-tweaks-linux) | [MacOS](https://github.com/yazninja/wuwa-tweaks/releases/latest/download/wuwa-tweaks-mac) (MacOS and Linux builds are not tested yet, once game is released for the platforms I will tweak the code accordingly)

## Features

-   [x] Auto detect game path
-   [x] Uncap the FPS (Default cap was 60FPS)
-   [x] Optimize Game Shaders, Textures and Meshes
-   [x] Improve Quality of In Game Textures
-   [x] Improve Lighting thru shadow tweaks
-   [x] Improve Game Performance
-   [x] Backup Files before applying tweaks (Just in case)
-   [ ] Add custom screen scaling (Default was 100%)
-   [ ] Add advanced graphics settingstweaks for potato PC's
-   [ ] Automatic updates

## Build from source

To build from source, you need to have [Bun](https://bun.sh) installed.

1. Clone the repository:

```bash
git clone https://github.com/yazninja/wuwa-tweaks.git
cd wuwa-tweaks
```

2. Install dependencies:

```bash
bun install
```

3. Run the project:

```bash
bun run dev
```

4. Build the project:

```bash
bun run build-win # for windows
bun run build-linux # for linux
bun run build-mac # for macos
```

### Special Thanks

-   u/kenshinakh for the [original post](https://www.reddit.com/r/WutheringWaves/comments/1czgdsa/pc_ue4_engine_tweaks_and_stutter_improvements/) on tweaks.

-   github/dromzeh for [wuwa-fps-unlocker](https://github.com/dromzeh/wuwa-fps-unlocker) a rust project that unlocks the fps of the game.

-   [Bun](https://bun.sh) for the build system.

Made with ❤️ by [Yaz](https://yaz.ninja)
