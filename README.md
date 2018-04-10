# tern-def-webextensions
 * WebExtensions definition files for tern.
   * auto-complete
   * document look-up
 * all things are very rough.
 * github repository does not contain definition files.
 * npm package is planned (not yet published), and it will include only definition files.
   * made of mozilla-beta repository.

## how to use
I confirmed only with vim. install tern-for-vim and add to project's `.tern-project` file.

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

create 3 definition-files. '3' means following groups.

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

