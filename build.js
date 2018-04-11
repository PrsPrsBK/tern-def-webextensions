/**
 * @fileoverview anyway make tern-definition files, or survey about mozilla source tree.
 * @author PrsPrsBK
 */

const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const bcd = require('mdn-browser-compat-data').webextensions.api;

let repositoryDir = '';
let isSurvey = false;
let releaseChannel = 'beta';
let isPublish = false;
const apiGroups = [
  {
    outputName: `webextensions-general-${releaseChannel}.json`,
    schemaDir: 'toolkit/components/extensions/schemas/',
    apiListFile: 'toolkit/components/extensions/ext-toolkit.json',
  },
  {
    outputName: `webextensions-firefox-desktop-${releaseChannel}.json`,
    schemaDir: 'browser/components/extensions/schemas/',
    apiListFile: 'browser/components/extensions/ext-browser.json',
  },
  {
    outputName: `webextensions-firefox-android-${releaseChannel}.json`,
    schemaDir: 'mobile/android/components/extensions/schemas/',
    schemaList: [
      {
        name: 'browserAction',
        schema: 'browser/components/extensions/schemas/browser_action.json',
      },
      {
        name: 'browsingData',
        schema: 'browser/components/extensions/schemas/browsing_data.json',
      },
      {
        name: 'pageAction',
        schema: 'browser/components/extensions/schemas/page_action.json',
      },
      {
        name: 'tabs',
        schema: 'browser/components/extensions/schemas/tabs.json',
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
    else if(arg === '--publish') {
      isPublish = true;
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
    apiGroups.forEach((aGroup) => {
      const schemaDirFull = path.join(repositoryDir, aGroup.schemaDir);
      if(fs.existsSync(schemaDirFull) === false) {
        console.log(`repository does not have ${aGroup.schemaDir} directory.`);
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
  apiGroups.forEach((aGroup) => {
    const schemaFiles = fs.readdirSync(path.join(repositoryDir, aGroup.schemaDir))
                        .filter(name => name.endsWith('.json'));
    console.log(`## ${aGroup.schemaDir}: ${schemaFiles.length} json files.`);
    schemaFiles.forEach((jsonName) => {
      console.log(` * ${jsonName}`);
      const jsonNameFull = path.join(repositoryDir, aGroup.schemaDir, jsonName);
      const origContents = fs.readFileSync(jsonNameFull, 'utf8');
      if(origContents.includes('BSD-style')) {
        BsdFiles.push(path.join(aGroup.schemaDir, jsonName));
      }
      else if(origContents.includes('MPL')) {
        MplFiles.push(path.join(aGroup.schemaDir, jsonName));
      }
      else {
        NeitherFiles.push(path.join(aGroup.schemaDir, jsonName));
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

const chromeUri2Path = (chromeUri) => {
  const regexSchemaPath = /.+\/([^\/]+json)$/;
  //identity is in browser-ui api, and its schema is in toolkit dir. only-one case.
  if(chromeUri.startsWith('chrome://extensions/content/schemas/')) {
    return `toolkit/components/extensions/schemas/${regexSchemaPath.exec(chromeUri)[1]}`;
  }
  else if(chromeUri.startsWith('chrome://browser/content/schemas/')) {
    return `browser/components/extensions/schemas/${regexSchemaPath.exec(chromeUri)[1]}`;
  }
  else {
    return '';
  }
};

const makeSchemaList = () => {
  apiGroups.forEach((aGroup) => {
    if(aGroup.schemaList === undefined
      || Array.isArray(aGroup.schemaList) === false) {
      const targetApiList = [];
      const apiListFileFull = path.join(repositoryDir, aGroup.apiListFile);
      const apiItemList = JSON.parse(stripJsonComments(fs.readFileSync(apiListFileFull, 'utf8')));
      for(let apiName in apiItemList) {
        if(apiItemList[apiName].schema !== undefined) { //only background page?
          const schema = chromeUri2Path(apiItemList[apiName].schema);
          if(schema !== '') {
            const apiItem = {
              name: apiName,
              schema,
            }
            targetApiList.push(apiItem);
          }
          else {
            console.log(`skiped: irregular path for ${apiName}. ${apiItemList[apiName].schema}`);
          }
        }
      }
      aGroup.schemaList = targetApiList;
    }
  });
};

const makeTernDefTree = (declaredAt, nameTree, curItem, options = {}) => {
  const isDefZone = ('isDefZone' in options) ? options.isDefZone : false;
  const defZoneStep = ('defZoneStep' in options) ? options.defZoneStep : 0;
  let result = {};
  if(curItem.description !== undefined) {
    result['!doc'] = curItem.description;
  }
  // top level can not have tern !type. knowing need for long hours.
  if(isDefZone === false || defZoneStep > 0) {
    if(curItem.type === 'function') {
      let paramArr = [];
      if(curItem.parameters !== undefined) {
        for(let param of curItem.parameters) {
          if(param.type === 'boolean') {
            paramArr.push(`${param.name}: bool`);
          }
          else if(param.type === 'integer') {
            paramArr.push(`${param.name}: number`);
          }
          else if(param.type !== undefined) {
            paramArr.push(`${param.name}: ${param.type}`);
          }
          else if(param['$ref'] !== undefined) {
            if(param['$ref'].indexOf('.') !== -1) {
              paramArr.push(`${param.name}: +${param['$ref']}`); // events.Event or so
            }
            else {
              paramArr.push(`${param.name}: +${declaredAt}.${param['$ref']}`);
            }
          }
        }
      }
      result['!type'] = `fn(${paramArr.join(', ')})`;
    }
    else if(curItem.type === 'any') {
      //result['!type'] = curItem.type; // for data shrink
    }
    else if(curItem.type === 'array') {
      result['!type'] = '[object]'; // temporary ope
    }
    else if(curItem.type === 'boolean') {
      result['!type'] = 'bool';
    }
    else if(curItem.type === 'integer') {
      result['!type'] = 'number';
    }
    else if(curItem.type === 'number') {
      result['!type'] = curItem.type;
    }
    else if(curItem.type === 'object') {
      //result['!type'] = curItem.type; // for data shrink
    }
    else if(curItem.type === 'string') {
      result['!type'] = curItem.type;
    }
    else if(curItem.type !== undefined) {
      console.log(`----${curItem.type}`);
    }
    else if(curItem['$ref'] !== undefined) {
      if(curItem['$ref'].indexOf('.') !== -1) {
        result['!type'] = `+${curItem['$ref']}`; // tabs.Tab or so
      }
      else {
        result['!type'] = `+${declaredAt}.${curItem['$ref']}`;
      }
    }
  }
  let bcdTree = bcd;
  for(let nd of nameTree) {
    if(bcdTree === undefined) {
      break;
    }
    bcdTree = bcdTree[nd];
  }
  if(bcdTree !== undefined) {
    if(bcdTree.__compat !== undefined) {
      result['!url'] = bcdTree.__compat.mdn_url;
    }
  }

  if(curItem.functions !== undefined) {
    for(let fun of curItem.functions) {
      result[fun.name] = makeTernDefTree(declaredAt, nameTree.concat(fun.name), fun, { isDefZone, defZoneStep: (defZoneStep + 1) });
    }
  }
  if(curItem.properties !== undefined) {
    for(let prop in curItem.properties) {
      result[prop] = makeTernDefTree(declaredAt, nameTree.concat(prop), curItem.properties[prop], { isDefZone, defZoneStep: (defZoneStep + 1) });
    }
  }
  return result;
};

const makeTernDefineZone = (declaredAt, nameTree, curItem) => {
  return makeTernDefTree(declaredAt, nameTree, curItem, { isDefZone: true, defZoneStep: 0});
};

const makeTernNonDefZone = (declaredAt, nameTree, curItem) => {
  return makeTernDefTree(declaredAt, nameTree, curItem, { isDefZone: false });
};

const build = () => {
  makeSchemaList();
  apiGroups.forEach((aGroup) => {
    let result = {
      '!name': 'webextensions',
      '!define': {},
      'chrome': {
        '!type': '+browser',
      },
    };
    let browserObj = {};
    let ternDefineObj = {};
    for(let schemaItem of aGroup.schemaList) {
      console.log(`=== process ${schemaItem.schema}`);
      const schemaFileFull = path.join(repositoryDir, schemaItem.schema);
      const apiSpecList = JSON.parse(stripJsonComments(fs.readFileSync(schemaFileFull, 'utf8')));
      apiSpecList.forEach((apiSpec) => {
        // if namespace is 'manifest', Object.keys => ["namespace", "types"]
        // namespace is not common between files. except 'manifest'
        if(apiSpec.namespace !== 'manifest') {
          let ternApiObj = {};
          if(apiSpec.description !== undefined) {
            ternApiObj['!doc'] = apiSpec.description;
          }

          //privacy.xxx, devtools.xxx.... not match tern and not go straight with compat-table
          const nameTreeTop = apiSpec.namespace.split('.');

          if(apiSpec.types !== undefined) { // !define is common in specific apiGroup
            for(let typ of apiSpec.types) {
              const curDefObj = makeTernDefineZone(apiSpec.namespace, nameTreeTop.concat(typ.id), typ);
              if(Object.keys(curDefObj).length !==0) {
                ternDefineObj[`${apiSpec.namespace}.${typ.id}`] = curDefObj;
              }
            }
          }

          if(apiSpec.functions !== undefined) {
            for(let fun of apiSpec.functions) {
              ternApiObj[fun.name] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(fun.name), fun);
            }
          }
          if(apiSpec.events !== undefined) {
            for(let evt of apiSpec.events) {
              ternApiObj[evt.name] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(evt.name), evt);
            }
          }
          if(apiSpec.properties !== undefined) {
            for(let prop in apiSpec.properties) {
              ternApiObj[prop] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(prop), apiSpec.properties[prop]);
            }
          }

          if(nameTreeTop.length === 1) {
            browserObj[apiSpec.namespace] = ternApiObj;
          }
          else {
            console.log(`  namespace contains dot ${apiSpec.namespace}`);
            browserObj[nameTreeTop[0]][nameTreeTop[1]] = ternApiObj; // length 2 is maybe enough
          }
        }
      });
    }
    result['!define'] = ternDefineObj;
    result.browser = browserObj;
    if(fs.existsSync('defs') === false) {
      fs.mkdir('defs');
    }
    if(isPublish) {
      fs.writeFileSync(`defs/${aGroup.outputName}`, JSON.stringify(result));
    }
    else {
      fs.writeFileSync(`defs/${aGroup.outputName}`, JSON.stringify(result, null, 2));
    }
  });
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

