import { checkbox, editor, input, select, Separator } from '@inquirer/prompts';
import { file, spawnSync, write } from 'bun';
import { Database } from 'bun:sqlite';
import { stringify, parse } from 'ini';
import { checkIfProcessIsRunning, getGamePaths, exit } from './utils';

process.on('SIGINT', () => {
    console.log('\nExiting...');
    process.exit(0);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    process.exit(1);
});

const isRunning = await checkIfProcessIsRunning();
if (isRunning) {
    console.log('Wuthering Waves is running. Please close the game before running this program.');
    await exit();
}

let { dbPath, tweakPath } = await getGamePaths();
console.log('\n\n\n --- Wuthering Waves Tweaks --- ');
console.log('Optimize your Wuthering Waves experience with these tweaks.\n\n');
let option = '';
while (true) {
    option = await select({
        message: 'Select what to do:',
        choices: [
            {
                name: 'FPS Unlocker',
                value: 'fpsUnlocker',
                description: 'Unlock the FPS cap of the game.'
            },
            {
                name: 'Optimize Graphics',
                value: 'optimizeGraphics',
                description: 'Optimize the Graphics for better performance and less stutters.'
            },
            {
                name: 'Clear Tweaks',
                value: 'clearTweaks',
                description: 'Clear all tweaks applied by this program.'
            },
            {
                name: 'Exit',
                value: 'exit',
                description: 'Exit the program.'
            }
        ]
    });

    if (option === 'fpsUnlocker') {
        await unlockFPS(dbPath);
    }
    if (option === 'optimizeGraphics') {
        await optimizeGraphics(tweakPath);
    }
    if (option === 'clearTweaks') {
        await clearTweaks(tweakPath);
    }
    if (option === 'exit') {
        await exit();
    }
    new Promise((resolvee) => {
        setTimeout(() => {
            resolvee('done');
        }, 1000);
    });
}

/** FUNCTIONS */
async function unlockFPS(dbPath: string) {
    let db = new Database(dbPath);
    let query = db.query("SELECT value FROM LocalStorage WHERE key = 'GameQualitySetting'");
    let data: any = query.get();
    data = JSON.parse(data.value);
    console.log('Current FPS Cap:', data.KeyCustomFrameRate);
    let newFPS = await select({
        message: 'New FPS Cap:',
        choices: [
            { name: '30 FPS', value: 30 },
            { name: '60 FPS', value: 60 },
            { name: '120 FPS', value: 120 },
            { name: '144 FPS', value: 144 },
            { name: '240 FPS', value: 240 },
            { name: 'Custom', value: -1 }
        ]
    });
    if (newFPS === -1) {
        newFPS = Number(
            await input({
                message: 'Enter custom FPS cap:',
                validate: (value: any) => {
                    if (isNaN(Number(value))) {
                        return 'Please enter a valid number.';
                    }
                    return true;
                }
            })
        );
    }
    data.KeyCustomFrameRate = newFPS;
    db.exec(`UPDATE LocalStorage SET value = '${JSON.stringify(data)}' WHERE key = 'GameQualitySetting'`);
    console.log('Successfully set FPS cap to', newFPS, '\n\n');
    db.close();
}

async function optimizeGraphics(tweakPath: string) {
    const tweaks = [
        // Stutter Fixes
        {
            'r.GTSyncType': 1,
            'r.OneFrameThreadLag': 1,
            'r.D3D11.UseAllowTearing': 1,
            'r.D3D12.UseAllowTearing': 1,
            'gc.TimeBetweenPurgingPendingKillObjects': 30,
            'gc.NumRetriesBeforeForcingGC': 5,
            'gc.MinDesiredObjectsPerSubTask': 20,
            's.ForceGCAfterLevelStreamedOut': 0,
            's.ContinuouslyIncrementalGCWhileLevelsPendingPurge': 0
        },
        // Compile Shaders
        {
            'r.Shadow.WholeSceneShadowCacheMb': 4096,
            'r.Shaders.FastMath': 1,
            'r.UseShaderCaching': 1,
            'r.UseShaderPredraw': 1,
            'r.UseAsyncShaderPrecompilation': 1,
            'r.Shaders.Optimize': 1,
            'r.ShaderPipelineCache.StartupMode': 3,
            'r.ShaderPipelineCache.Enabled': 1,
            'r.ShaderPipelineCache.ReportPSO': 1,
            'r.ShaderPipelineCache.GameFileMaskEnabled': 0,
            'r.ShaderPipelineCache.LazyLoadShadersWhenPSOCacheIsPresent': 1,
            'r.ShaderPipelineCache.BatchSize': 50,
            'r.CreateShadersOnLoad': 1,
            'D3D12.PSO.DiskCache': 1,
            'D3D12.PSO.DriverOptimizedDiskCache': 1,
            'r.XGEShaderCompile': 1,
            'r.XGEShaderCompile.Mode': 1,
            'r.XGEShaderCompile.Xml.BatchGroupSize': 256,
            'r.XGEShaderCompile.Xml.BatchSize': 16,
            'r.XGEShaderCompile.Xml.JobTimeout': '0.500000'
        },
        // Texture Streaming Tweaks
        {
            'r.Streaming.Boost': 1,
            'r.Streaming.HLODStrategy': 2,
            'r.Streaming.MinMipForSplitRequest': 0,
            'r.Streaming.FullyLoadUsedTextures': 1,
            'r.Streaming.AmortizeCPUToGPUCopy': 1,
            'r.Streaming.MaxNumTexturesToStreamPerFrame': 4,
            'r.Streaming.NumStaticComponentsProcessedPerFrame': 4,
            'r.Streaming.FramesForFullUpdate': 1,
            's.AsyncLoadingThreadEnabled': 1,
            's.AsyncLoadingTimeLimit': 4,
            's.LevelStreamingActorsUpdateTimeLimit': 4,
            's.UnregisterComponentsTimeLimit': 4,
            's.AsyncLoadingUseFullTimeLimit': 0
        },
        // Optimize Disk Operations
        {
            's.IoDispatcherCacheSizeMB': 2048,
            's.LevelStreamingComponentsRegistrationGranularity': 1,
            's.LevelStreamingComponentsUnregistrationGranularity': 1,
            's.MaxIncomingRequestsToStall': 1,
            's.MaxReadyRequestsToStallMB': 0,
            's.MinBulkDataSizeForAsyncLoading': 0,
            's.PriorityAsyncLoadingExtraTime': 0,
            's.PriorityLevelStreamingActorsUpdateExtraTime': 0
        },
        // Optimize Out of Focus
        {
            'r.Streaming.HiddenPrimitiveScale': 0.5
        },
        // Maximize Distance Scaling
        {
            'r.ViewDistanceScale': 10,
            'foliage.LODDistanceScale': 2
        },
        // Max+ Shadow Quality
        {
            'r.ShadowQuality': 5,
            'r.Shadow.CSM.MaxCascades': 50,
            'r.Shadow.MaxResolution': 4096,
            'r.Shadow.MaxCSMResolution': 4096,
            'r.Shadow.DistanceScale': 2
        },
        // Max+ Effects (Lens Flare, Scene Color Fringe, etc.)
        {
            'r.AmbientOcclusionLevels': 2,
            'r.DepthOfFieldQuality': 3,
            'r.LensFlareQuality': 2,
            'r.SceneColorFringeQuality': 1,
            'r.EyeAdaptationQuality': 2
        },
        // Max+ Post Processing
        {
            'r.Tonemapper.Quality': 5,
            'r.ToneMapper.Sharpen': 0.3,
            'r.RefractionQuality': 3,
            'r.MaxAnisotropy': 16,
            'r.VT.MaxAnisotropy': 16,
            'r.SSR.Quality': 3,
            'r.SSS.Quality': 3
        },
        // Disable Bloom
        {
            'r.BloomQuality': 0
        },
        // Maximize Bloom
        {
            'r.BloomQuality': 5
        },
        // Disable Motion Blur
        {
            'r.MotionBlurQuality': 0
        },
        // Maximize Motion Blur
        {
            'r.MotionBlurQuality': 4
        },
        // Improve TAAU Anti Aliasing (Fix Ghosting)
        {
            'r.TemporalAA.Upscaler': 1,
            'r.Upscale.Quality': 3,
            'r.Reflections.Denoiser': 2,
            'r.PostProcessAAQuality': 5,
            'r.TemporalAA.Algorithm': 1,
            'r.TemporalAASamples': 32,
            'r.TemporalAASharpness': 1,
            'r.ScreenPercentage': 90,
            'r.SecondaryScreenPercentage.GameViewport': 90
        },
        // Optimize DLSS
        {
            'r.NGX.DLSS.Quality': 2,
            'r.NGX.DLSS.EnableAutoExposure': 1,
            'r.BasePassForceOutputsVelocity': 1,
            'r.DefaultFeature.Antialiasing': 2,
            'r.Reflections.Denoiser': 2
        }
    ];

    const tweakFile = file(tweakPath);
    const bakFile = file('OriginalEngine.ini.bak');

    console.log(' --- Graphics Optimization --- ');
    console.log('NOTE: Changing in game settings may reset these tweaks.\n');
    let tweakChoices = await checkbox({
        loop: false,
        message: 'Select Tweaks to apply:',
        pageSize: 20,
        choices: [
            new Separator('=== Recommended Tweaks ==='),
            { name: 'Stutter Fixes', value: 1, checked: true },
            { name: 'Compile Shaders', value: 2, checked: true },
            { name: 'Texture Streaming Tweaks', value: 3, checked: true },
            { name: 'Optimize Disk Operations', value: 4, checked: true },
            { name: 'Optimize Out of Focus', value: 5, checked: false },
            new Separator('=== Advanced Tweaks ==='),
            { name: 'Maximize Distance Scaling', value: 6, checked: false },
            { name: 'Max+ Shadow Quality', value: 7, checked: false },
            { name: 'Max+ Effects (Lens Flare, Scene Color Fringe, etc.)', value: 8, checked: false },
            { name: 'Max+ Post Processing', value: 9, checked: false },
            new Separator('=== Bloom ==='),
            { name: 'Disable Bloom', value: 10, checked: false },
            { name: 'Maximize Bloom', value: 11, checked: false },
            new Separator('=== Motion Blur ==='),
            { name: 'Disable Motion Blur', value: 12, checked: false },
            { name: 'Maximize Motion Blur', value: 13, checked: false },
            new Separator('=== Anti-Aliasing (FSR) ==='),
            { name: 'Improve TAAU Anti Aliasing (Fix Ghosting)', value: 14, checked: false },
            new Separator('=== DLSS Tweaks ==='),
            { name: 'Optimize DLSS', value: 15, checked: false }
        ]
    });
    if (!(await bakFile.exists())) {
        console.log('Creating backup of Engine.ini...');
        await write('OriginalEngine.ini.bak', await tweakFile.text());
        console.log('Backup created successfully.\n\n');
    }
    let tweakData = await tweakFile.text();
    let config = parse(tweakData);

    if (config.SystemSettings === undefined) {
        config.SystemSettings = {};
        console.log('Creating [SystemSettings] section in Engine.ini...');
    } else {
        config = config.SystemSettings;
        console.log('Found [SystemSettings] section in Engine.ini...');
    }
    for (let tweak of tweakChoices) {
        config = { ...config, ...tweaks[tweak - 1] };
    }

    tweakData = tweakData.split('[SystemSettings]')[0] + '\n[SystemSettings]\n' + stringify(config);
    await write(tweakPath, tweakData).catch(async (e) => {
        console.log('Error:', e.name.startsWith('EPERM') ? 'Permission Denied. Remove read-only attribute\n(You can always add it back afterwards)' : e);
        console.log('Executing Manual Edit Mode\n\n');

        await editor({
            message: 'This is your new Engine.ini. Copy the whole file and paste them in the notepad window that opens after closing this window. Press Enter (2x) to continue.',
            postfix: '.ini',
            default: tweakData
        });
        console.log('\n\nOpening notepad with Engine.ini for you to manually edit...');
        spawnSync(['notepad', tweakPath]);
    });
}

async function clearTweaks(tweakPath: string) {
    let bakFile = file('OriginalEngine.ini.bak');
    if (!(await bakFile.exists())) {
        console.log('No tweaks applied yet. / OriginalEngine.ini.bak not found.\n\n');
        return;
    }
    console.log('Restoring original Engine.ini...');
    await write(tweakPath, await bakFile.text());
}
