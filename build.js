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

/*
 * {
 *   "!name": some,
 *   "!define": {
 *     deffoo: {
 *     },
 *   },
 *   "memberWithoutExclamation": {
 *     "!type": "fn(arg1: string, arg2: object)",
 *     "!url": "https://developer.mozilla.org/en/docs/DOM/something",
 *     "!doc": "some document. appear in auto-complete window of vim"
 *     "nestedMember": {
 *     }
 *   }
 * }
 * original scheme
 * [
 *   {
 *     "namespace": foo, // only one case of mandatory
 *     description,
 *     types,
 *     permissions,
 *     functions,
 *     events,
 *     properties,
 *     allowedContexts,
 *     defaultContexts,
 *     $import, // menu
 */
const distillDefine = (sth) => {
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
    if(sth.functions !== undefined) {
      for(let fun of sth.functions) {
        result[fun.name] = distillDefine(fun);
      }
    }
    if(sth.properties !== undefined) {
      for(let prop in sth.properties) {
        result[prop] = distillDefine(sth.properties[prop]);
      }
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

const build = () => {
  makeSchemaList();
  apiGroups.forEach((aGroup) => {
    let result = {
      '!name': 'webextensions',
      'chrome': {
        '!type': '+browser',
      },
      //insert later 'browser': {}
      //insert later '!define': {}
    };
    let browserObj = {
      //foo: {},...
    };
    let defineObj = {
      //foo: {},...
    };
    for(let schemaItem of aGroup.schemaList) {
      const schemaFileFull = path.join(repositoryDir, schemaItem.schema);
      const apiSpecList = JSON.parse(stripJsonComments(fs.readFileSync(schemaFileFull, 'utf8')));
      //console.log(`${schemaItem.schema}`);
      apiSpecList.forEach((sth) => {
        //console.log(`  namespace: ${sth.namespace}`);
        if(sth.namespace !== 'manifest') { // namespace is not same between files.
          let distilled = {};
          //console.log(`  ${JSON.stringify(Object.keys(sth))}`);
          if(sth.description !== undefined) {
            distilled['!doc'] = sth.description;
          }
          if(sth.types !== undefined) { //maybe only at top level
            for(let typ of sth.types) {
              defineObj[typ.id] = distillDefine(typ);
            }
          }
          if(sth.functions !== undefined) {
            for(let fun of sth.functions) {
              distilled[fun.name] = distill(fun);
            }
          }
          if(sth.properties !== undefined) {
            for(let prop in sth.properties) {
              distilled[prop] = distill(sth.properties[prop]);
            }
          }
          browserObj[sth.namespace] = distilled;
        }
      });
      result.browser = browserObj;
      //anyway, if "!define": {} is not empty, not work. existence itself is not problem.
      //result['!define'] = defineObj;
    }
    //console.log(JSON.stringify(result));
    fs.writeFileSync(`output/${aGroup.outputName}`, JSON.stringify(result, null, 2));
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

