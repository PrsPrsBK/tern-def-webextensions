# tern-def-webextensions
 * WebExtensions definition for tern.
 * all things are very rough, and not yet enough for use.
 * made of mozilla-beta repository.
 * github repository does not contain definition files.
 * npm package is planned (not yet published), and it will include only definition files.

## how to use
About vim, install tern-for-vim and add to `.tern-project` file.

```.tern-project
{
  "libs": [
    "browser",
    "path/to/webextensions-general-beta",
    "path/to/webextensions-firefox-desktop-beta"
    // or "path/to/webextensions-firefox-android-beta"
  ]
}
```

## make definition files

`npm run build -- --repository /path/to/local/repository`

create 3 definition-files.
  '3' means that
    - genaral API
    - browser UI API
    - android UI API

<!-- vim:expandtab ff=unix fenc=utf-8 sw=2 -->

