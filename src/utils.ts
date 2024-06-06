import { file, spawnSync, sleep } from 'bun';
import { input } from '@inquirer/prompts';

export async function checkIfProcessIsRunning() {
    let { stdout } = spawnSync(['tasklist']);
    return stdout.includes('WutheringWaves');
}

export async function getGamePaths() {
    let dbPath = '';
    let tweakPath = '';

    let fp = await tryResolveExe();
    if (!fp) {
        console.log('Could not automatically find Wuthering Waves installed on your system.');
        fp = await input({
            message: 'Enter the path to the Wuthering Waves Game EXE file:',
            validate: async (value: any) => {
                if (!(await file(value).exists())) {
                    return 'File does not exist.';
                }
                return true;
            }
        });
    }

    dbPath = fp + '/../Client/Saved/LocalStorage/LocalStorage.db';
    if (!(await file(dbPath).exists())) {
        console.log('Error: LocalStorage.db not found. Please reinstall the game.');
        await exit();
    }
    tweakPath = fp + '/../Client/Saved/Config/WindowsNoEditor/Engine.ini';
    if (!(await file(tweakPath).exists())) {
        console.log('Error: Engine.ini not found. Please reinstall the game.');
        await exit();
    }
    return { dbPath, tweakPath };
}

export async function tryResolveExe() {
    let drivePaths = ['C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];
    let filePaths = [
        '/Epic Games/WutheringWavesj3oFh/Wuthering Waves Game/Wuthering Waves.exe',
        '/Epic Games/WutheringWaves/Wuthering Waves Game/Wutherin Waves.exe',
        '/Wuthering Waves/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files/Epic Games/WutheringWaves/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files/Epic Games/WutheringWavesj3oFh/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files/Wuthering Waves/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files (x86)/Epic Games/WutheringWaves/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files (x86)/Epic Games/WutheringWavesj3oFh/Wuthering Waves Game/Wuthering Waves.exe',
        '/Program Files (x86)/Wuthering Waves/Wuthering Waves Game/Wuthering Waves.exe'
    ];

    for (let drive of drivePaths) {
        for (let path of filePaths) {
            let fp = drive + path;
            if (await file(fp).exists()) {
                console.log('Found Wuthering Waves at:', fp);
                return fp;
            }
        }
    }
}

export async function exit() {
    console.log('Exiting in 10 seconds...');
    await sleep(10000);
    process.exit(0);
}
