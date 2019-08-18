# tern-def-webextensions
![Screenshot](images/2018-04-12_readme-img_01.jpg)

 * WebExtensions definition files for [tern](http://ternjs.net/).
   * for completion
   * open [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) document
 * all things are rough.
 * [github repository](https://github.com/PrsPrsBK/tern-def-webextensions) does not contain definition-files.
 * [npm package](https://www.npmjs.com/package/tern-def-webextensions) includes only definition-files.
   * data are made of mozilla-beta repository.
   * URLs of MDN come from [mdn-browser-compat-data](https://www.npmjs.com/package/mdn-browser-compat-data).


This was introduced as one of the tool by community, thanks.
[2018-04-12 Extension development tools - Add-ons / Development - Mozilla Discourse](https://discourse.mozilla.org/t/extension-development-tools/27608)


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

This create 1 definition-file.
There are three API group, but I do not know how to refer between definition-files. 
So two groups are integrated, and android UI is dropped (but included in browser desktop ui).

 * genaral API
 * browser UI API
 * android UI API

### use not mozilla-beta

In case of that you would like to use nightly.

`npm run build -- --mozilla-repo /path/to/local/nightly/repository --channel nightly`

This create `webextensions-desktop-nightly.json`. 
`--channel` option only effects to filename. 
Using this option is for switching files specified within `.tern-project`. 
If you don't need to switch, there is no need for this option.


# License
MPL-2.0.

npm package includes json files. These contains contents which come from 
json schema files of mozilla-beta repository. 
Some ones are under 3-Clause BSD License, others are under MPL-2.0 License. 
Both are in `License` directory.

# Release Note

* 2018-04-10 - ver. 0.1.0
* 2018-04-12 - ver. 0.2.0
* 2018-04-28 - ver. 0.3.0
* 2018-06-21 Firefox 61(Beta) - ver. 0.4.0
* 2018-07-20 Firefox 62(Beta) - ver. 0.5.0
* 2018-08-27 Firefox 62(Beta) - ver. 0.6.0
* 2018-09-08 Firefox 63(Beta) - ver. 0.6.1
* 2018-10-16 Firefox 64(Beta) - ver. 0.7.0
* 2018-12-14 Firefox 65(Beta) - ver. 0.8.0
* 2019-01-30 Firefox 66(Beta) - No Update
* 2019-02-19 Firefox 67(Beta) - No Update
* 2019-03-28 Firefox 67(Beta) - ver. 0.8.1
  fix: failed to pick up two functions (`userScript`, `menus`)
* 2019-05-14 Firefox 68(Beta) - ver.0.9.0
  * New: captivePortal API and 2 funcs, 2 events
  * `geckoProfiler` moved from `toolkit` to `browser`
  * `incognito` of `webRequest.RequestFilter`
* 2019-05-24 Firefox 68(Beta) - No Update
  Removed: `mozillaAddons` permission for `telemetry` API
* 2019-07-03 Firefox 69(Beta) - ver.0.10.0
  * New: `urlbar` API
    [1547285](https://bugzilla.mozilla.org/show_bug.cgi?id=1547285)
  * New: `getProfileAsGzippedArrayBuffer` function of geckoProfiler
    [1551992](https://bugzilla.mozilla.org/show_bug.cgi?id=1551992)
  * New: `normandyAddonStudy` API
    [1522214](https://bugzilla.mozilla.org/show_bug.cgi?id=1522214)
* 2019-07-05 Firefox 69(Beta) - ver.0.11.0
  * New: `dumpProfileToFile()` of `geckoProfiler` API
    [1552845](https://bugzilla.mozilla.org/show_bug.cgi?id=1552845)
  * `topSites` API moved from `toolkit/` to `browser`
  * New: `topSites.MostVisitedURL.type`
    [1547669](https://bugzilla.mozilla.org/show_bug.cgi?id=1547669)
* 2019-08-01 Firefox 69(Beta) - ver.0.11.1
  * Move: `topSites` API from `toolkit` to `browser`
    [1569366](https://bugzilla.mozilla.org/show_bug.cgi?id=1569366)
* 2019-08-02 Firefox 69(Beta) - ver.0.11.2
  * New: `networkStatus` API
    [1550605](https://bugzilla.mozilla.org/show_bug.cgi?id=1550605)
* 2019-08-03 Firefox 69(Beta) - ver.0.11.3
  * New: `engagementTelemetry` of `urlbar` API
    [1570434](https://bugzilla.mozilla.org/show_bug.cgi?id=1570434)


## Nightly (Not released to npm)

* 2019-08-11
  * New: `urlbar.contextualTi` API
    [1568708](https://bugzilla.mozilla.org/show_bug.cgi?id=1568708)
* 2019-08-13
  * New: onButtonClicked and onLinkClicked events of `urlbar` API
    [1559508](https://bugzilla.mozilla.org/show_bug.cgi?id=1559508)
* 2019-08-13
  * New: icon of ContextualTip of `urlbar` API
    [1559501](https://bugzilla.mozilla.org/show_bug.cgi?id=1559501)
* 2019-08-17
  * New: UrlClassification properties of `webRequest` API
    [1547140](https://bugzilla.mozilla.org/show_bug.cgi?id=1547140)
* 2019-08-19
  * New: `activityLog` permission and `onExtensionActivity` event
    [1542403](https://bugzilla.mozilla.org/show_bug.cgi?id=1542403)


[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)
