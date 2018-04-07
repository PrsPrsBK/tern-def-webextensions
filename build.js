const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
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

console.log(`${process.argv}===${process.argv.length}`);

const repositoryDir = 'd:/foo/code/mozilla-beta';

let hasError = false;
if(fs.existsSync(repositoryDir) === false) {
  console.log('repository does not exists.');
  hasError = true;
}
else {
  targetJsons.forEach((targetUnit) => {
    const fromDirFull = path.join(repositoryDir, targetUnit.fromDir);
    if(fs.existsSync(fromDirFull) === false) {
      console.log(`repository does not have ${targetUnit.fromDir} directory.`);
      hasError = true;
    }
    else {
      targetUnit.fromDirFull = fromDirFull;
    }
  });
}
if(hasError) {
  return;
}

let result = { "!name": "webextensions" };
targetJsons.forEach((targetUnit) => {
  const files = fs.readdirSync(path.join(repositoryDir, targetUnit.schemaDir));
  console.log(files.length);
  files.filter(name => name.endsWith('.json')).forEach((jsonName, i, a) => {
    const jsonNameFull = path.join(repositoryDir, targetUnit.fromDir, jsonName);
    if(i === 0) {
      console.log(`${a.length}`);
      //console.log(fs.readFileSync(curPath).toString());
    }
    const orig = JSON.parse(stripJsonComments(fs.readFileSync(jsonNameFull, 'utf8')));
    console.log(`${jsonNameFull}: ${orig[0].namespace}`);
    let converted = {};
    //abstract and convert
  });
});

//fs.writeFileSync('outPath here', JSON.stringify(result, null, 2));

// vim:expandtab ff=unix fenc=utf-8 sw=2

