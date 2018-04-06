const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');
const jsonDirs = [
  'toolkit/components/extensions/schemas/',
];

const repositoryDir = 'd:/path/to/mozilla-beta';

let hasError = false;
if(fs.existsSync(repositoryDir) === false) {
  console.log('repository does not exists.');
  hasError = true;
}
else {
  jsonDirs.forEach((dir) => {
    console.log(path.join(repositoryDir, dir));
    if(fs.existsSync(path.join(repositoryDir, dir)) === false) {
      console.log(`repository does not have ${dir} directory.`);
      hasError = true;
    }
  });
}
if(hasError) {
  return;
}

let result = { "!name": "webextensions" };
jsonDirs.forEach((dir) => {
  console.log(path.join(repositoryDir, dir));
  const files = fs.readdirSync(path.join(repositoryDir, dir));
  console.log(files.length);
  files.filter(name => name.endsWith('.json')).forEach((fileName, i, a) => {
    const curPath = path.join(repositoryDir, dir, fileName);
    if(i === 0) {
      console.log(`${a.length}`);
      //console.log(fs.readFileSync(curPath).toString());
    }
    const orig = JSON.parse(stripJsonComments(fs.readFileSync(curPath).toString()));
    console.log(`${fileName}: ${orig[0].namespace}`);
    let converted = {};
    //abstract and convert
  });
});

//fs.writeFileSync('outPath here', JSON.stringify(result, null, 2));

// vim:expandtab ff=unix fenc=utf-8 sw=2

