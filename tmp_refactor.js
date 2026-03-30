const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/gokul/Documents/New folder/Project_Hub/Project Hub/server/src';
const appRepoDir = path.join(srcDir, 'application/interface/repositories');
const appServiceDir = path.join(srcDir, 'application/interface/services');
const infraRepoDir = path.join(srcDir, 'infrastructure/interface/repositories');
const infraServiceDir = path.join(srcDir, 'infrastructure/interface/services');

function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

// 1. Move directories
if (fs.existsSync(infraRepoDir)) {
  copyFolderSync(infraRepoDir, appRepoDir);
  try { fs.rmSync(infraRepoDir, { recursive: true, force: true }); } catch(e) { console.log('Could not rm', infraRepoDir); }
  console.log('Moved infra/interface/repositories to app/interface/repositories');
} else {
  console.log('infra/interface/repositories not found, may already be moved.');
}

if (fs.existsSync(infraServiceDir)) {
  copyFolderSync(infraServiceDir, appServiceDir);
  try { fs.rmSync(infraServiceDir, { recursive: true, force: true }); } catch(e) { console.log('Could not rm', infraServiceDir); }
  console.log('Moved infra/interface/services to app/interface/services');
}

// 2. Fix IBaseRepo.ts
const iBaseRepoPath = path.join(appRepoDir, 'IBaseRepo.ts');
if (fs.existsSync(iBaseRepoPath)) {
  let content = fs.readFileSync(iBaseRepoPath, 'utf8');
  content = content.replace('import { FilterQuery } from "mongoose";\n', '');
  content = content.replace(/FilterQuery<T>/g, 'Record<string, unknown>');
  fs.writeFileSync(iBaseRepoPath, content, 'utf8');
  console.log('Fixed Mongoose dependency in IBaseRepo.ts');
}

// 3. Scan and replace imports in all TS files
function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.git') && !dirFile.includes('dist')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (file.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const allFiles = walkSync(srcDir);
let filesUpdated = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Only target lines with import statements pointing to the old locations
    if (lines[i].includes('import ') && (lines[i].includes('/interface/repositories') || lines[i].includes('/interface/services'))) {

      // Application useCases / Domain services (using absolute or deep relative paths)
      if (lines[i].includes('../../infrastructure/interface/')) {
        lines[i] = lines[i].replace('../../infrastructure/interface/', '../../application/interface/');
        changed = true;
      }
      if (lines[i].includes('../../../infrastructure/interface/')) {
        lines[i] = lines[i].replace('../../../infrastructure/interface/', '../../../application/interface/');
        changed = true;
      }

      // Inside infrastructure components, they currently import from '../interface/repositories'
      if (lines[i].includes('../interface/') && !lines[i].includes('application/interface') && !lines[i].includes('presentation/interfaces')) {
        if (file.includes('infrastructure\\repositories') || file.includes('infrastructure/repositories') || file.includes('infrastructure\\services') || file.includes('infrastructure/services')) {
             lines[i] = lines[i].replace('../interface/', '../../application/interface/');
             changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Updated imports in:', path.basename(file));
    filesUpdated++;
  }
});

console.log('Phase 2 and 3 complete. Files updated: ' + filesUpdated);
