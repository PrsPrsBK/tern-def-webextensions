# tern-def-webextensions
![Screenshot](images/2018-04-12_readme-img_01.jpg)

 * WebExtensions definition files for [tern](http://ternjs.net/).
   * auto-complete
   * open [MDN](https://developer.mozilla.org/en-US/Add-ons) document
 * all things are rough.
 * [github repository](https://github.com/PrsPrsBK/tern-def-webextensions) does not contain definition-files.
 * npm package is planned (not yet published), and it will include only definition-files.
   * data are made of mozilla-beta repository.
   * URLs of MDN come from [mdn-browser-compat-data](https://www.npmjs.com/package/mdn-browser-compat-data).

## how to use with tern
I confirmed only with vim. install [tern-for-vim](https://github.com/ternjs/tern_for_vim) 
and add to project's `.tern-project` file.

```.tern-project
{
  "libs": [
    "browser",
    "path/to/webextensions-desktop-beta"
  ]
}
```

## make definition files

`npm run build -- --repository /path/to/local/repository`

create 1 definition-file.
There are three API group, but I do not know how to refer between definition-files. 
So two groups are integrated, and android UI is dropped (but included in browser desktop ui).

 * genaral API
 * browser UI API
 * android UI API

# License
MPL-2.0.

npm package includes json files. These contains contents which come from 
json schema files of mozilla-beta repository. 
Some ones are under 3-Clause BSD License, others are under MPL-2.0 License. 
Both are in `LICENSE` directory.

<!-- vim:expandtab ff=unix fenc=utf-8 sw=2 -->

