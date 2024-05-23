/* eslint-disable prettier/prettier */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '@jitsi');

fs.readdir(modulesDir, (err, folders) => {
    if (err) {
        console.error('Failed to read directory:', err);
        process.exit(1);
    }

    folders.forEach(folder => {
        const folderPath = path.join(modulesDir, folder);
        const packageJsonPath = path.join(folderPath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            console.log(`Installing dependencies for ${folder}...`);
            exec('yarn', { cwd: folderPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error installing dependencies for ${folder}:`, error);
                    return;
                }
                console.log(`Dependencies installed for ${folder}:\n${stdout}`);
            });
        }
    });
});
