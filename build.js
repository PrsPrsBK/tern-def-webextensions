/**
 * @fileoverview anyway make tern-definition file.
 * @author PrsPrsBK
 */

const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const mdnData = require('@mdn/browser-compat-data').webextensions.api;

let mozillaRepo = '';
let channel = 'beta';
let goShrink = false;
const getOutputFileName = (prefix) => {
  return `${prefix}-${channel}`;
};
const summary = [];

/**
 * This script writes only one file, and utilizes mozilla repository.
 * When script can not those repositories, output file will not include data relevant APIs.
 * 1. mozilla - you get Firefox's APIs.
 */
const outputSpec = {
  prefix: 'webextensions-desktop',
  resultBase: {
    '!name': 'webextensions',
    '!define': {},
    'chrome': {
      '!type': '+browser',
    },
    browser: {},
  },
  groupList: [
    /** APIs reside within mozilla repository. */
    {
      name: 'mozilla-general',
      getRepository: () => { return mozillaRepo; },
      schemaDir: 'toolkit/components/extensions/schemas/',
      apiListFile: 'toolkit/components/extensions/ext-toolkit.json',
      useMdn: true,
      schemaList: [
        {
          name: 'events',
          schema: 'toolkit/components/extensions/schemas/events.json',
        },
        {
          name: 'types',
          schema: 'toolkit/components/extensions/schemas/types.json',
        },
      ],
    },
    {
      outputName: 'mozilla-desktop',
      getRepository: () => { return mozillaRepo; },
      schemaDir: 'browser/components/extensions/schemas/',
      apiListFile: 'browser/components/extensions/ext-browser.json',
      useMdn: true,
      schemaList: [],
    },
    //{
    //  name: 'mozilla-android',
    //  getRepository: () => { return mozillaRepo; },
    //  schemaDir: 'mobile/android/components/extensions/schemas/',
    //  // apiListFile: '',
    //  useMdn: true,
    //  schemaList: [
    //    {
    //      name: 'browserAction',
    //      schema: 'browser/components/extensions/schemas/browser_action.json',
    //    },
    //    {
    //      name: 'browsingData',
    //      schema: 'browser/components/extensions/schemas/browsing_data.json',
    //    },
    //    {
    //      name: 'pageAction',
    //      schema: 'browser/components/extensions/schemas/page_action.json',
    //    },
    //    {
    //      name: 'tabs',
    //      schema: 'browser/components/extensions/schemas/tabs.json',
    //    },
    //  ],
    //},
  ]
};

/**
 * distill from argments.
 * @returns {Object} report
 */
const numerateArgs = () => {
  const report = {
    isValid: true,
    message: [],
  };
  process.argv.forEach((arg, idx) => {
    if(arg === '--mozilla-repo') {
      if(idx + 1 < process.argv.length) {
        mozillaRepo = process.argv[idx + 1];
      }
      else {
        report.isValid = false;
        report.message.push(`please specify as ${arg} somevalue`);
      }
    }
    else if(arg === '--channel') {
      if(idx + 1 < process.argv.length) {
        channel = process.argv[idx + 1];
      }
      else {
        report.isValid = false;
        report.message.push(`please specify as ${arg} somevalue`);
      }
    }
    else if(arg === '--shrink') {
      goShrink = true;
    }
  });
  return report;
};

/**
 * Check the structure of repository.
 * @param {string} rootDir root directory of repository
 * @returns {{isValid: boolean, message: string}} the repository has assumed dirs or not
 */
const checkRepositoryDirs = (rootDir, apiGroup) => {
  const report = {
    isValid: true,
    message: [],
  };
  if(rootDir === '') {
    report.isValid = false;
    report.message.push('Lack of arg: --mozilla-repo foo --comm-repo bar');
  }
  else if(fs.existsSync(rootDir) === false) {
    report.isValid = false;
    report.message.push(`root dir does not exist: ${rootDir}`);
  }
  else {
    const schemaDirFull = path.join(rootDir, apiGroup.schemaDir);
    if(fs.existsSync(schemaDirFull) === false) {
      report.isValid = false;
      report.message.push(`schema dir does not exist: ${apiGroup.schemaDir}`);
    }
  }
  return report;
};

const chromeUri2Path = (chromeUri) => {
  const regexSchemaPath = /.+\/([^/]+json)$/;
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

/**
 * Distill JSON file names from API schema file's content.
 * @param {string} rootDir 
 * @param {Object[]} apiGroup
 */
const makeSchemaList = (rootDir, apiGroup) => {
  if(apiGroup.apiListFile !== undefined) {
    const apiListFileFull = path.join(rootDir, apiGroup.apiListFile);
    const apiItemList = JSON.parse(stripJsonComments(fs.readFileSync(apiListFileFull, 'utf8')));
    for(const apiName in apiItemList) {
      if(apiItemList[apiName].schema !== undefined) { //only background page of mozilla?
        const schema = chromeUri2Path(apiItemList[apiName].schema);
        if(schema !== '') {
          const apiItem = {
            name: apiName,
            schema,
          };
          apiGroup.schemaList.push(apiItem);
        }
        else {
          console.log(`skiped: irregular path for ${apiName}. ${apiItemList[apiName].schema}`);
        }
      }
    }
  }
};

const escapeTag = docText => {
  // return docText
  //   .replace(/<\/?(?:code|var)>/g, '`')
  //   .replace(/<\/?em>/g, '*');
  return docText;
};

const makeTernDefTree = (declaredAt, nameTree, curItem, useMdn, options = {}) => {
  const isDefZone = ('isDefZone' in options) ? options.isDefZone : false;
  const defZoneStep = ('defZoneStep' in options) ? options.defZoneStep : 0;

  const toTernAtom = (exprAtSchema) => {
    let ternAtom = exprAtSchema;
    if(exprAtSchema.type !== undefined) {
      if(exprAtSchema.type === 'boolean') {
        ternAtom = 'bool';
      }
      else if(exprAtSchema.type === 'integer') {
        ternAtom = 'number';
      }
      else if(exprAtSchema.type === 'any') {
        ternAtom = '?';
      }
      else if(exprAtSchema.type === 'array') { // array only exists in definition
        // array with choices may only in events.UrlFilter.ports
        // and "!type": "[number]?, [[number]]?" has no error...
        if(exprAtSchema.items.choices !== undefined) {
          const ternChoices = [];
          for(const cho of exprAtSchema.items.choices) {
            ternChoices.push(`[${toTernAtom(cho)}]?`);
          }
          ternAtom = `${ternChoices.join(', ')}`;
        }
        else {
          ternAtom = `[${toTernAtom(exprAtSchema.items)}]`;
        }
      }
      else if(exprAtSchema.type === 'function') {
        // you SHOULD TRIM param.name. 'fn( arg: string...)' result in error
        // and hard to notice.
        const paramArr = [];
        if(exprAtSchema.parameters !== undefined) {
          for(const param of exprAtSchema.parameters) {
            if(!param.name) {
              // thunderbird tree has nameless arguments for callback functions. firefox may not have.
              param.name = 'nameless';
            }
            if(param.choices !== undefined) {
              for(const cho of param.choices) {
                paramArr.push(`${param.name.trim()}?: ${toTernAtom(cho)}`);
              }
            }
            else {
              const atomString = toTernAtom(param);
              // anyway avoid "!type": "object". [object] is not problemsome.
              paramArr.push(`${param.name.trim()}: ${atomString}`);
            }
          }
        }
        ternAtom = `fn(${paramArr.join(', ')})`;
      }
      else {
        ternAtom = exprAtSchema.type;
      }
    }
    else if(exprAtSchema.choices !== undefined) {
      //browserUI has purely choices
      const ternChoices = [];
      for(const cho of exprAtSchema.choices) {
        ternChoices.push(`[${toTernAtom(cho)}]?`);
      }
      ternAtom = `${ternChoices.join(', ')}`;
    }
    else if(exprAtSchema.value !== undefined) {
      ternAtom = 'number';
    }
    else if(exprAtSchema['$ref'] !== undefined) {
      if(exprAtSchema['$ref'].indexOf('.') !== -1) {
        ternAtom = `+${exprAtSchema['$ref']}`; // tabs.Tab or so
      }
      else {
        ternAtom = `+${declaredAt}.${exprAtSchema['$ref']}`;
      }
    }
    return ternAtom;
  };

  const result = {};
  if(curItem.description !== undefined) {
    result['!doc'] = escapeTag(curItem.description);
  }

  const atomString = toTernAtom(curItem);
  // anyway avoid "!type": "object". [object] is not problemsome.
  if(atomString !== 'object') {
    result['!type'] = atomString;
  }

  if(useMdn) {
    let bcdTree = mdnData;
    for(const nd of nameTree) {
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
  }

  if(curItem.functions !== undefined) {
    for(const fun of curItem.functions) {
      result[fun.name] = makeTernDefTree(declaredAt, nameTree.concat(fun.name), fun, { isDefZone, defZoneStep: (defZoneStep + 1) });
    }
  }
  if(curItem.properties !== undefined) {
    for(const prop in curItem.properties) {
      result[prop] = makeTernDefTree(declaredAt, nameTree.concat(prop), curItem.properties[prop], { isDefZone, defZoneStep: (defZoneStep + 1) });
    }
  }
  return result;
};

const makeTernDefineZone = (declaredAt, nameTree, curItem, useMdn) => {
  return makeTernDefTree(declaredAt, nameTree, curItem, useMdn, { isDefZone: true, defZoneStep: 0});
};

const makeTernNonDefZone = (declaredAt, nameTree, curItem, useMdn) => {
  return makeTernDefTree(declaredAt, nameTree, curItem, useMdn, { isDefZone: false });
};

const build = (rootDir, apiGroup, result, summary) => {
  const subSummary = {
    name: apiGroup.name,
    schemaList: [],
  };
  makeSchemaList(rootDir, apiGroup);
  const ternDefineObj = result['!define'];
  const browserObj = result.browser;
  const useMdn = apiGroup.useMdn;
  for(const schemaItem of apiGroup.schemaList) {
    const apiSummary = {
      file: schemaItem.schema,
      namespaceList: [],
    };
    const schemaFileFull = path.join(rootDir, schemaItem.schema);
    try {
      const apiSpecList = JSON.parse(stripJsonComments(fs.readFileSync(schemaFileFull, 'utf8')));
      apiSpecList.forEach(apiSpec => {
        const nsSummary = {
          name: apiSpec.namespace,
          permissions: apiSpec.permissions,
        };
        // if namespace is 'manifest', Object.keys => ["namespace", "types"]
        // namespace is not common between files. except 'manifest'
        if(apiSpec.namespace !== 'manifest') {
          const ternApiObj = {};
          if(apiSpec.description !== undefined) {
            ternApiObj['!doc'] = escapeTag(apiSpec.description);
          }

          //privacy.xxx, devtools.xxx.... not match tern and not go straight with compat-table
          const nameTreeTop = apiSpec.namespace.split('.');

          if(apiSpec.types !== undefined) { // !define is common in specific apiGroup
            nsSummary.types = apiSpec.types.length;
            for(const typ of apiSpec.types) {
              const curDefObj = makeTernDefineZone(apiSpec.namespace, nameTreeTop.concat(typ.id), typ, useMdn);
              if(Object.keys(curDefObj).length !== 0) {
                ternDefineObj[`${apiSpec.namespace}.${typ.id}`] = curDefObj;
              }
            }
          }

          if(apiSpec.functions !== undefined) {
            nsSummary.functions = apiSpec.functions.length;
            for(const fun of apiSpec.functions) {
              ternApiObj[fun.name] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(fun.name), fun, useMdn);
            }
          }
          if(apiSpec.events !== undefined) {
            nsSummary.events = apiSpec.events.length;
            for(const evt of apiSpec.events) {
              ternApiObj[evt.name] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(evt.name), evt, useMdn);
            }
          }
          if(apiSpec.properties !== undefined) {
            nsSummary.properties = apiSpec.properties.length;
            for(const prop in apiSpec.properties) {
              ternApiObj[prop] = makeTernNonDefZone(apiSpec.namespace, nameTreeTop.concat(prop), apiSpec.properties[prop], useMdn);
            }
          }

          if(nameTreeTop.length === 1) {
            // case:split over not only one file: userScripts, menus
            if(browserObj[apiSpec.namespace] === undefined) {
              browserObj[apiSpec.namespace] = ternApiObj;
            }
            else {
              console.log(`WARN:split over some files ${apiSpec.namespace}`);
              for(const key of Object.keys(ternApiObj)) {
                if(browserObj[apiSpec.namespace][key] !== undefined) {
                  console.log(`  Problem:dup at ${apiSpec.namespace} ${key}`);
                }
                browserObj[apiSpec.namespace][key] = ternApiObj[key];
              }
            }
          }
          else {
            //console.log(`  namespace contains dot ${apiSpec.namespace}`);
            if(browserObj[nameTreeTop[0]][nameTreeTop[1]] === undefined) {
              browserObj[nameTreeTop[0]][nameTreeTop[1]] = ternApiObj; // length 2 is maybe enough
            }
            else {
              console.log(`WARN:split over some files ${apiSpec.namespace}`);
            }
          }
        }
        else {
          if(apiSpec.types !== undefined) {
            nsSummary.types = apiSpec.types.length;
          }
        }
        apiSummary.namespaceList.push(nsSummary);
      });
      const origContents = fs.readFileSync(schemaFileFull, 'utf8');
      if(origContents.includes('BSD-style')) {
        apiSummary.license = 'BSD';
      }
      else if(origContents.includes('MPL')) {
        apiSummary.license = 'MPL';
      }
      else {
        apiSummary.license = 'None';
      }
    } catch(err) {
      // e.g. comm-central does not have a file for pkcs11, so fs.readFileSync() fails.
      console.log(`(API: ${apiGroup.name}, Schema Name: ${schemaItem.name}): ${err}`);
      apiSummary.error = `${err.code}: ${err.syscall}`;
    }
    subSummary.schemaList.push(apiSummary);
  }
  summary.push(subSummary);
};

const isValidEnv = (report) => {
  report.message.forEach(m => {
    console.log(m);
  });
  return report.isValid;
};

const program = () => {
  if(isValidEnv(numerateArgs()) === false) {
    return;
  }
  const result = outputSpec.resultBase;
  outputSpec.groupList.forEach(apiGroup => {
    const tgtRepo = apiGroup.getRepository();
    if(tgtRepo !== '' && isValidEnv(checkRepositoryDirs(tgtRepo, apiGroup))) {
      build(tgtRepo, apiGroup, result, summary);
    }
  });
  if(fs.existsSync('defs') === false) {
    fs.mkdir('defs');
  }
  if(goShrink) {
    fs.writeFileSync(`defs/${getOutputFileName(outputSpec.prefix)}.json`, JSON.stringify(result));
  }
  fs.writeFileSync(`defs/${getOutputFileName(outputSpec.prefix)}.expand.json`, JSON.stringify(result, null, 2));
  if(fs.existsSync('docs') === false) {
    fs.mkdir('docs');
  }
  fs.writeFileSync(`docs/summary-${channel}.json`, JSON.stringify(summary, null, 2));
};

program();

// vim:expandtab ff=unix fenc=utf-8 sw=2
