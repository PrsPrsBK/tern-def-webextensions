/**
 * @fileoverview anyway make tern-definition files, or survey about mozilla source tree.
 * @author PrsPrsBK
 */

const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const targetJsons = [
  {
    toFile: `webextensions-general-${releaseChannel}`,
    fromDir: 'toolkit/components/extensions/schemas/',
    registry: 'toolkit/components/extensions/ext-toolkit.json',
  },
  {
    toFile: `webextensions-firefox-desktop-${releaseChannel}`,
    fromDir: 'browser/components/extensions/schemas/',
    registry: 'browser/components/extensions/ext-browser.json',
  },
  {
    toFile: `webextensions-firefox-android-${releaseChannel}`,
    fromDir: 'mobile/android/components/extensions/schemas/',
    registry: 'mobile/android/components/extensions/extensions-mobile.manifest',
  },
];

let repositoryDir = '';
let isSurvey = false;
let releaseChannel = 'beta';

const processArgs = () => {
  process.argv.forEach((arg, idx, a) => {
    if(arg === '--repo') {
      repositoryDir = process.argv[idx + 1];
    }
    else if(arg === '--survey') {
      isSurvey = true;
    }
    else if(arg === '--channel') {
      releaseChannel = process.argv[idx + 1];
    }
  });
  if(repositoryDir === '') {
    console.log('please specify: npm run build -- --repo actual-your-mozilla-foo-repository-path');
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

/*
 * json files: 31 + 22 + 4 : 57 files.
 * regex /licen[cs]{1}e/i matches 42 files.
 *   BSD-style: 37 files.
 *   MPL: 5 files.
 *   neither included: 15 files.
 */
const surveyJson = () => {
  let BsdFiles = [];
  let MplFiles = [];
  let NeitherFiles = [];
  console.log('# Note: API JSON Files.\n');
  targetJsons.forEach((targetUnit) => {
    const jsonFiles = fs.readdirSync(path.join(repositoryDir, targetUnit.fromDir))
                        .filter(name => name.endsWith('.json'));
    console.log(`## ${targetUnit.fromDir}: ${jsonFiles.length} json files.`);
    jsonFiles.forEach((jsonName) => {
      console.log(` * ${jsonName}`);
      const jsonNameFull = path.join(repositoryDir, targetUnit.fromDir, jsonName);
      const origContents = fs.readFileSync(jsonNameFull, 'utf8');
      if(origContents.includes('BSD-style')) {
        BsdFiles.push(path.join(targetUnit.fromDir, jsonName));
      }
      else if(origContents.includes('MPL')) {
        MplFiles.push(path.join(targetUnit.fromDir, jsonName));
      }
      else {
        NeitherFiles.push(path.join(targetUnit.fromDir, jsonName));
      }
    });
    console.log(``);
  });
  console.log(`\n## 3-Clause BSD-Style: ${BsdFiles.length} files.`);
  BsdFiles.forEach((path) => {
    console.log(` * ${path}`);
  });
  console.log(`\n## MPL 2.0: ${MplFiles.length} files.`);
  MplFiles.forEach((path) => {
    console.log(` * ${path}`);
  });
  console.log(`\n## Neither included: ${NeitherFiles.length} files.`);
  NeitherFiles.forEach((path) => {
    console.log(` * ${path}`);
  });
};

const survey = () => {
  surveyJson();
};

const build = () => {
  let result = { "!name": "webextensions" };
  targetJsons.forEach((targetUnit) => {
    const files = fs.readdirSync(path.join(repositoryDir, targetUnit.fromDir));
    files.filter(name => name.endsWith('.json')).forEach((jsonName, i, a) => {
      const jsonNameFull = path.join(repositoryDir, targetUnit.fromDir, jsonName);
      const orig = JSON.parse(stripJsonComments(fs.readFileSync(jsonNameFull, 'utf8')));
      console.log(`${jsonName}: ${orig[0].namespace}: ${orig.length}`);
      orig.forEach((sth) => {
        console.log(`  namespace: ${sth.namespace}`);
      });
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

