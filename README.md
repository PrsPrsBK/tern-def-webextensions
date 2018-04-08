#tern-def-webextensions
 * WebExtensions definition for tern.
 * all things are very rough.
 * made of mozilla-beta repository.
 * npm package is under construction and includes only definition files.
 * github repository does not update definition files.

##how to use
About vim, install tern-for-vim and add to `.tern-project` file.
```.tern-project
{
  "libs": [
    "browser",
    "webextensionsi-general-beta",
    "webextensionsi-firefox-desktop-beta"
  ]
}
```

##make definition files

`npm run build -- --repository /path/to/your/repository`

create 3 definition-files.
  '3' means that
    - genaral API
    - browser UI API
    - android UI API

<!-- vim:expandtab ff=unix fenc=utf-8 sw=2 -->

