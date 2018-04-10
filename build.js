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

const distillDefine = (sth, step) => {
  let result = {};
  if(sth.description !== undefined) {
    result['!doc'] = sth.description;
  }
  if(step > 0) { // top level can not have !type. knowing need for long hours.
    if(sth.type === 'function') {
      let paramArr = [];
      if(sth.parameters !== undefined) {
        for(let param of sth.parameters) {
          if(param.type !== undefined) {
            paramArr.push(`${param.name}: ${param.type}`);
          }
          else if(param['$ref'] !== undefined) {
            paramArr.push(`${param.name}: +${param['$ref']}`);
          }
        }
      }
      result['!type'] = `fn(${paramArr.join(', ')})`;
      //result['!type'] = `fn()`; // temporary ope
    }
    else if(sth.type === 'any') {
      //result['!type'] = sth.type; // for data shrink
    }
    else if(sth.type === 'array') {
      result['!type'] = '[number]'; // temporary ope
    }
    else if(sth.type === 'boolean') {
      result['!type'] = 'bool';
    }
    else if(sth.type === 'integer') {
      result['!type'] = 'number';
    }
    else if(sth.type === 'number') {
      result['!type'] = sth.type;
    }
    else if(sth.type === 'object') {
      //result['!type'] = sth.type; // for data shrink
    }
    else if(sth.type === 'string') {
      result['!type'] = sth.type;
    }
    else if(sth['$ref'] !== undefined) {
      result['!type'] = `+${sth['$ref']}`;
    }
    else if(sth.type !== undefined) {
      console.log(`----${sth.type}`);
    }
  }

  if(sth.functions !== undefined) {
    for(let fun of sth.functions) {
      result[fun.name] = distillDefine(fun, (step + 1));
    }
  }
  if(sth.properties !== undefined) {
    for(let prop in sth.properties) {
      result[prop] = distillDefine(sth.properties[prop], (step + 1));
    }
  }
  return result;
};

const distill = (sth) => {
  let result = {};
  if(sth.description !== undefined) {
    result['!doc'] = sth.description;
  }
  if(sth.type === 'function') {
    let paramArr = [];
    if(sth.parameters !== undefined) {
      for(let param of sth.parameters) {
        if(param.type !== undefined) {
          paramArr.push(`${param.name}: ${param.type}`);
        }
        else if(param['$ref'] !== undefined) {
          paramArr.push(`${param.name}: +${param['$ref']}`);
        }
      }
    }
    result['!type'] = `fn(${paramArr.join(', ')})`;
  }
  else {
    if(sth.type !== undefined) {
      result['!type'] = sth.type;
    }
    else if(sth['$ref'] !== undefined) {
      result['!type'] = `+${sth['$ref']}`;
    }
    //if(sth.functions !== undefined) {
    //  for(let fun of sth.functions) {
    //    result[fun.name] = distill(fun);
    //  }
    //}
    //if(sth.properties !== undefined) {
    //  for(let prop in sth.properties) {
    //    result[prop] = distill(sth.properties[prop]);
    //  }
    //}
  }
  return result;
};

const keySkipList = ['!doc', '!url', '!type', '!proto', '!effects'];
const setDocUrl = (routeStack, subTree) => {
  if(routeStack[routeStack.length - 1] === '!define') {
    for(let key in subTree) {
      if(keySkipList.includes(key) === false) {
        setDocUrl(routeStack.concat(key), subTree[key]);
      }
    }
  }
  else {
    let urlTree = bcd;
    for(let nd of routeStack) {
      if(urlTree === undefined) {
        break;
      }
      if(nd !== '!define') {
        urlTree = urlTree[nd];
      }
    }
    if(urlTree !== undefined) {
      if(urlTree.__compat !== undefined) {
        subTree['!url'] = urlTree.__compat.mdn_url;
      }
      for(let key in subTree) {
        if(keySkipList.includes(key) === false) {
          setDocUrl(routeStack.concat(key), subTree[key]);
        }
      }
    }
    else {
      if(routeStack[0] !== '!define') {
        console.log(`  err or not yet documented ${JSON.stringify(routeStack)}`);
      }
    }
  }
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
      const schemaFileFull = path.join(repositoryDir, schemaItem.schema);
      const apiSpecList = JSON.parse(stripJsonComments(fs.readFileSync(schemaFileFull, 'utf8')));
      apiSpecList.forEach((apiSpec) => {
        if(apiSpec.namespace !== 'manifest') { // namespace is not common between files. except 'manifest'
          let ternApiObj = {};
          if(apiSpec.description !== undefined) {
            ternApiObj['!doc'] = apiSpec.description;
          }
          if(apiSpec.types !== undefined) { //maybe only at top level
            for(let typ of apiSpec.types) {
              if(ternDefineObj[typ.id] !== undefined) {
                console.log(`  -- !define ${typ.id} is overwrited by ${apiSpec.namespace}`);
              }
              const curDefObj = distillDefine(typ, 0);
              if(Object.keys(curDefObj).length !==0) {
                ternDefineObj[typ.id] = curDefObj;
              }
            }
          }
          if(apiSpec.functions !== undefined) {
            for(let fun of apiSpec.functions) {
              ternApiObj[fun.name] = distill(fun);
            }
          }
          if(apiSpec.events !== undefined) {
            for(let evt of apiSpec.events) {
              ternApiObj[evt.name] = distill(evt);
            }
          }
          if(apiSpec.properties !== undefined) {
            for(let prop in apiSpec.properties) {
              ternApiObj[prop] = distill(apiSpec.properties[prop]);
            }
          }
          //privacy.xxx, devtools.xxx.... not match tern and not go straight with compat-table
          if(apiSpec.namespace.indexOf('.') === -1) {
            browserObj[apiSpec.namespace] = ternApiObj;
          }
          else {
            console.log(`  namespace contains dot ${apiSpec.namespace}`);
            const registerRoutes = apiSpec.namespace.split('.');
            browserObj[registerRoutes[0]][registerRoutes[1]] = ternApiObj;
          }
        }
      });
    }
    result['!define'] = ternDefineObj;
    for(let key in browserObj) {
      setDocUrl([key], browserObj[key]);
    }
    result.browser = browserObj;
    if(fs.existsSync('defs') === false) {
      fs.mkdir('defs');
    }
    fs.writeFileSync(`defs/${aGroup.outputName}`, JSON.stringify(result, null, 2));
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

