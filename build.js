/**
 * @fileoverview anyway make tern-definition files, or survey about mozilla source tree.
 * @author PrsPrsBK
 */

const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

let repositoryDir = '';
let isSurvey = false;
let releaseChannel = 'beta';
const apiGroups = [
  {
    outputName: `webextensions-general-${releaseChannel}`,
    schemaDir: 'toolkit/components/extensions/schemas/',
    apiListFile: 'toolkit/components/extensions/ext-toolkit.json',
  },
  {
    outputName: `webextensions-firefox-desktop-${releaseChannel}`,
    schemaDir: 'browser/components/extensions/schemas/',
    apiListFile: 'browser/components/extensions/ext-browser.json',
  },
  {
    outputName: `webextensions-firefox-android-${releaseChannel}`,
    schemaDir: 'mobile/android/components/extensions/schemas/',
    fromJsons: [
      {
        name: 'browserAction',
        schema: 'browser_action.json',
      },
      {
        name: 'browsingData',
        schema: 'browsing_data.json',
      },
      {
        name: 'pageAction',
        schema: 'page_action.json',
      },
      {
        name: 'tabs',
        schema: 'tabs.json',
      },
    ],
  },
];

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
    console.log('please specify: npm run build -- --repo /path/to/mozilla-foo-repository-path');
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
    apiGroups.forEach((targetUnit) => {
      const fromDirFull = path.join(repositoryDir, targetUnit.schemaDir);
      if(fs.existsSync(fromDirFull) === false) {
        console.log(`repository does not have ${targetUnit.schemaDir} directory.`);
        notError = false;
      }
    });
  }
  return notError;
};

const surveyJson = () => {
  let BsdFiles = [];
  let MplFiles = [];
  let NeitherFiles = [];
  console.log('# Note: API JSON Files.\n');
  apiGroups.forEach((targetUnit) => {
    const jsonFiles = fs.readdirSync(path.join(repositoryDir, targetUnit.schemaDir))
                        .filter(name => name.endsWith('.json'));
    console.log(`## ${targetUnit.schemaDir}: ${jsonFiles.length} json files.`);
    jsonFiles.forEach((jsonName) => {
      console.log(` * ${jsonName}`);
      const jsonNameFull = path.join(repositoryDir, targetUnit.schemaDir, jsonName);
      const origContents = fs.readFileSync(jsonNameFull, 'utf8');
      if(origContents.includes('BSD-style')) {
        BsdFiles.push(path.join(targetUnit.schemaDir, jsonName));
      }
      else if(origContents.includes('MPL')) {
        MplFiles.push(path.join(targetUnit.schemaDir, jsonName));
      }
      else {
        NeitherFiles.push(path.join(targetUnit.schemaDir, jsonName));
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

const makeJsonList = () => {
  const regexJsonPath = /.+\/([^\/]+json)$/;
  apiGroups.forEach((targetUnit) => {
    if(targetUnit.fromJsons === undefined
      || Array.isArray(targetUnit.fromJsons) === false) {
      const targetApis = [];
      const regJsonNameFull = path.join(repositoryDir, targetUnit.apiListFile);
      const apiItemList = JSON.parse(stripJsonComments(fs.readFileSync(regJsonNameFull, 'utf8')));
      for(let apiName in apiItemList) {
        if(apiItemList[apiName].schema !== undefined) {
          const schema = regexJsonPath.exec(apiItemList[apiName].schema)[1];
          const apiItem = {
            name: apiName,
            schema,
          }
          targetApis.push(apiItem);
        }
      }
      targetUnit.fromJsons = targetApis;
    }
  });
};

const build = () => {
  makeJsonList();
  let result = { "!name": "webextensions" };
  apiGroups.forEach((targetUnit) => {
    const files = fs.readdirSync(path.join(repositoryDir, targetUnit.schemaDir));
    files.filter(name => name.endsWith('.json')).forEach((jsonName, i, a) => {
      const jsonNameFull = path.join(repositoryDir, targetUnit.schemaDir, jsonName);
      const orig = JSON.parse(stripJsonComments(fs.readFileSync(jsonNameFull, 'utf8')));
      //console.log(`${jsonName}: ${orig[0].namespace}: ${orig.length}`);
      orig.forEach((sth) => {
        //console.log(`  namespace: ${sth.namespace}`);
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

