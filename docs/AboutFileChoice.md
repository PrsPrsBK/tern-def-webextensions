# About 'pick up this schema file or not'

I have read [mozilla wiki: WebExtensions: Hacking](https://wiki.mozilla.org/WebExtensions/Hacking).
My understanding may not be perfect, but I could conclude that 3 API-groups are enough.
 * genaral API
 * browser UI API
 * android UI API

Each API has own manifest. 
I looked into referenced files and picked up ones seemed necessary.
 * toolkit/components/extensions/extensions-toolkit.manifest
   * ext-toolkit.json
   * not used
     * ext-toolkit.js
     * ext-tabs-base.js
     * ext-c-toolkit.js
     * events.json
     * native_manifest.json
     * types.json
 * browser/components/extensions/extensions-browser.manifest
   * ext-browser.json
   * not used
     * ext-browser.js has no registerModules()
     * ext-c-browser.js has registerModules()
       * but ignore. covered by ext-browser
     * menus_internal.json
 * mobile/android/components/extensions/extensions-mobile.manifest
   * no json
   * ext-android.js has registerModules()
     * browserAction
     * browsingData
     * pageAction
     * tabs
   * ext-utils.js has no registerModules()
   * ext-c-android.js has registerModules()
     * tabs

[//]: # ( vim:expandtab ff=unix fenc=utf-8 sw=2)

