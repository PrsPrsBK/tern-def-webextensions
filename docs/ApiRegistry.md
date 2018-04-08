
About 'pick up or not each API'.

We have 3 definition-files.
  '3' means that
    - genaral API
    - browser UI API
    - android UI API
  each API has own manifest.
    - toolkit/components/extensions/extensions-toolkit.manifest
      - ext-toolkit.json
      - ignore
        - ext-toolkit.js
        - ext-tabs-base.js
        - ext-c-toolkit.js
        - events.json
        - native_manifest.json
        - types.json
    - browser/components/extensions/extensions-browser.manifest
      - ext-browser.json
      - ignore
        - ext-browser.js has no registerModules()
        - ext-c-browser.js has registerModules()
          - but ignore. covered by ext-browser
        - menus_internal.json
    - mobile/android/components/extensions/extensions-mobile.manifest
      - no json
      - ext-android.js has registerModules()
        - browserAction
        - pageAction
        - tabs
      - ext-utils.js has no registerModules()
      - ext-c-android.js has registerModules()
        - tabs

<!-- vim:expandtab ff=unix fenc=utf-8 sw=2 -->

