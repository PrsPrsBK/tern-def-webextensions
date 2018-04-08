/**
 * @fileoverview anyway make tern-definition files, or survey about mozilla source tree.
 * @author PrsPrsBK
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const targetJsons = [
  {
    toFile: 'webextensions-general',
    fromDir: 'toolkit/components/extensions/schemas/',
  },
  {
    toFile: 'webextensions-firefox-desktop',
    fromDir: 'browser/components/extensions/schemas/',
  },
  {
    toFile: 'webextensions-firefox-android',
    fromDir: 'mobile/android/components/extensions/schemas/',
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

/*
 * create 3 definition-files.
 *   '3' means that
 *     - genaral API
 *     - browser UI API
 *     - android UI API
 *   each API has own manifest.
 *     - toolkit/components/extensions/extensions-toolkit.manifest
 *       - ext-toolkit.json
 *       - ignore
 *         - ext-toolkit.js
 *         - ext-tabs-base.js
 *         - ext-c-toolkit.js
 *         - events.json
 *         - native_manifest.json
 *         - types.json
 *     - browser/components/extensions/extensions-browser.manifest
 *       - ext-browser.json
 *       - ignore
 *         - ext-browser.js has no registerModules()
 *         - ext-c-browser.js has registerModules()
 *           - but ignore. covered by ext-browser
 *         - menus_internal.json
 *     - mobile/android/components/extensions/extensions-mobile.manifest
 *       - no json
 *       - ext-android.js has registerModules()
 *         - browserAction
 *         - pageAction
 *         - tabs
 *       - ext-utils.js has no registerModules()
 *       - ext-c-android.js has registerModules()
 *         - tabs
 */
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

