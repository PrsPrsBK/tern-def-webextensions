const readline = require('readline');
const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const lisenceRegex = /licen[cs]{1}e/i;
const targetJsons = [
  {
    toFile: 'webextensions-general.json',
    fromDir: 'toolkit/components/extensions/schemas/',
  },
  {
    toFile: 'webextensions-firefox-desktop.json',
    fromDir: 'browser/components/extensions/schemas/',
  },
  {
    toFile: 'webextensions-firefox-android.json',
    fromDir: 'mobile/android/components/extensions/schemas/',
  },
];

let repositoryDir = '';
let isSurvey = false;

const processArgs = () => {
  process.argv.forEach((arg, idx, a) => {
    if(arg === '--repo') {
      repositoryDir = process.argv[idx + 1];
    }
    else if(arg === '--survey') {
      isSurvey = true;
    }
  });
  if(repositoryDir === '') {
    console.log('please specify: npm run build -- --repo actual-your-repository-path');
    return false;
  }
  else {
    return true;
  }
};

const hasDirs = () => {
  let notError = true;
  if(fs.existsSync(repositoryDir) === false) {
    console.log(`repository ${repositoryDir} does not exists.`);
    notError = false;
  }
  else {
    targetJsons.forEach((targetUnit) => {
      const fromDirFull = path.join(repositoryDir, targetUnit.fromDir);
      if(fs.existsSync(fromDirFull) === false) {
        console.log(`repository does not have ${targetUnit.fromDir} directory.`);
        notError = false;
      }
    });
  }
  return notError;
};

let BSDfiles = [];
let MPLfiles = [];
let NeitherFiles = [];
/*
 * json files: 31 + 22 + 4 : 57 files.
 * regex /licen[cs]{1}e/i matches 42 files.
 *   BSD-style: 37 files.
 *   MPL: 5 files.
 *   neither included: 15 files.
 */
const survey = () => {
  targetJsons.forEach((targetUnit) => {
    const files = fs.readdirSync(path.join(repositoryDir, targetUnit.fromDir));
    //console.log(`files at ${targetUnit.fromDir}: ${files.length}`);
    files.filter(name => name.endsWith('.json')).forEach((jsonName, i, a) => {
      const jsonNameFull = path.join(repositoryDir, targetUnit.fromDir, jsonName);
      if(i === 0) {
        console.log(`## ${targetUnit.fromDir}: ${a.length} json files.`);
      }
      const origContents = fs.readFileSync(jsonNameFull, 'utf8');
      if(origContents.includes('BSD-style')) {
        BSDfiles.push(path.join(targetUnit.fromDir, jsonName));
      }
      else if(origContents.includes('MPL')) {
        MPLfiles.push(path.join(targetUnit.fromDir, jsonName));
      }
      else {
        NeitherFiles.push(path.join(targetUnit.fromDir, jsonName));
      }
    });
    console.log(``);
  });
  console.log(`\n## 3-Clause BSD-Style: ${BSDfiles.length}`);
  BSDfiles.forEach((f) => {
    console.log(` * ${f}`);
  });
  console.log(`\n## MPL 2.0: ${MPLfiles.length}`);
  MPLfiles.forEach((f) => {
    console.log(` * ${f}`);
  });
  console.log(`\n## Neither included: ${NeitherFiles.length}`);
  MPLfiles.forEach((f) => {
    console.log(` * ${f}`);
  });
};

const build = () => {
  let result = { "!name": "webextensions" };
  targetJsons.forEach((targetUnit) => {
    const files = fs.readdirSync(path.join(repositoryDir, targetUnit.fromDir));
    console.log(files.length);
    files.filter(name => name.endsWith('.json')).forEach((jsonName, i, a) => {
      const jsonNameFull = path.join(repositoryDir, targetUnit.fromDir, jsonName);
      const orig = JSON.parse(stripJsonComments(fs.readFileSync(jsonNameFull, 'utf8')));
      console.log(`${jsonNameFull}: ${orig[0].namespace}`);
      let converted = {};
      //abstract and convert
    });
  });

  //fs.writeFileSync('outPath here', JSON.stringify(result, null, 2));
};

if(processArgs() === false) {
  return;
}
if(hasDirs()) {
  if(isSurvey) {
    survey();
  }
  else {
    build();
  }
}

// vim:expandtab ff=unix fenc=utf-8 sw=2

