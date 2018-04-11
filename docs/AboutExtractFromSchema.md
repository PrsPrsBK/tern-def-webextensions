# Extract contents from each schema files
We need for tern's "!doc", "!type" directives.
Except 'namespace: manifest', contents are extracted.

 * toolkit/components/extensions/schemas/extension_types.json
   * namespace: extensionTypes
     * presence of prop: ["namespace","description","types"]
 * toolkit/components/extensions/schemas/alarms.json
   * namespace: alarms
     * presence of prop: ["namespace","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/browser_settings.json
   * namespace: manifest
   * namespace: browserSettings
     * presence of prop: ["namespace","description","permissions","types","properties"]
 * toolkit/components/extensions/schemas/clipboard.json
   * namespace: clipboard
     * presence of prop: ["namespace","description","permissions","functions"]
 * toolkit/components/extensions/schemas/content_scripts.json
   * namespace: contentScripts
     * presence of prop: ["namespace","types","functions"]
 * toolkit/components/extensions/schemas/contextual_identities.json
   * namespace: manifest
   * namespace: contextualIdentities
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/cookies.json
   * namespace: manifest
   * namespace: cookies
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/dns.json
   * namespace: manifest
   * namespace: dns
     * presence of prop: ["namespace","description","permissions","types","functions"]
 * toolkit/components/extensions/schemas/downloads.json
   * namespace: manifest
   * namespace: downloads
     * presence of prop: ["namespace","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/extension.json
   * namespace: extension
     * presence of prop: ["namespace","allowedContexts","description","properties","types","functions","events"]
 * toolkit/components/extensions/schemas/i18n.json
   * namespace: manifest
   * namespace: i18n
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","types","functions","events"]
 * toolkit/components/extensions/schemas/idle.json
   * namespace: idle
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/management.json
   * namespace: manifest
   * namespace: management
     * presence of prop: ["namespace","description","types","functions","events"]
 * toolkit/components/extensions/schemas/notifications.json
   * namespace: notifications
     * presence of prop: ["namespace","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/permissions.json
   * namespace: permissions
     * presence of prop: ["namespace","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/privacy.json
   * namespace: manifest
   * namespace: privacy
     * presence of prop: ["namespace","permissions"]
   * namespace: privacy.network
     * presence of prop: ["namespace","description","permissions","types","properties"]
   * namespace: privacy.services
     * presence of prop: ["namespace","description","permissions","properties"]
   * namespace: privacy.websites
     * presence of prop: ["namespace","description","permissions","types","properties"]
 * toolkit/components/extensions/schemas/extension_protocol_handlers.json
   * namespace: manifest
 * toolkit/components/extensions/schemas/proxy.json
   * namespace: manifest
   * namespace: proxy
     * presence of prop: ["namespace","description","permissions","functions","events"]
 * toolkit/components/extensions/schemas/runtime.json
   * namespace: manifest
   * namespace: runtime
     * presence of prop: ["namespace","allowedContexts","description","types","properties","functions","events"]
 * toolkit/components/extensions/schemas/storage.json
   * namespace: storage
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","permissions","types","events","properties"]
 * toolkit/components/extensions/schemas/test.json
   * namespace: test
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","functions","types","events"]
 * toolkit/components/extensions/schemas/theme.json
   * namespace: manifest
   * namespace: theme
     * presence of prop: ["namespace","description","permissions","types","events","functions"]
 * toolkit/components/extensions/schemas/top_sites.json
   * namespace: manifest
   * namespace: topSites
     * presence of prop: ["namespace","description","permissions","types","functions"]
 * toolkit/components/extensions/schemas/web_navigation.json
   * namespace: manifest
   * namespace: webNavigation
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/web_request.json
   * namespace: manifest
   * namespace: webRequest
     * presence of prop: ["namespace","description","permissions","properties","types","functions","events"]
 * browser/components/extensions/schemas/bookmarks.json
   * namespace: manifest
   * namespace: bookmarks
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/browser_action.json
   * namespace: manifest
   * namespace: browserAction
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/browsing_data.json
   * namespace: manifest
   * namespace: browsingData
     * presence of prop: ["namespace","description","permissions","types","functions"]
 * browser/components/extensions/schemas/chrome_settings_overrides.json
     * presence of prop: namespace: manifest
 * browser/components/extensions/schemas/commands.json
   * namespace: manifest
   * namespace: commands
     * presence of prop: ["namespace","description","permissions","types","events","functions"]
 * browser/components/extensions/schemas/devtools.json
   * namespace: manifest
   * namespace: devtools
     * presence of prop: ["namespace","permissions","allowedContexts","defaultContexts"]
 * browser/components/extensions/schemas/devtools_inspected_window.json
   * namespace: devtools.inspectedWindow
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","nocompile","types","properties","functions","events"]
 * browser/components/extensions/schemas/devtools_network.json
   * namespace: devtools.network
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","types","functions","events"]
 * browser/components/extensions/schemas/devtools_panels.json
   * namespace: devtools.panels
     * presence of prop: ["namespace","allowedContexts","defaultContexts","description","nocompile","types","properties","functions","events"]
 * browser/components/extensions/schemas/find.json
   * namespace: manifest
   * namespace: find
     * presence of prop: ["namespace","description","permissions","functions"]
 * browser/components/extensions/schemas/history.json
   * namespace: manifest
   * namespace: history
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * toolkit/components/extensions/schemas/identity.json
   * namespace: manifest
   * namespace: identity
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/menus.json
   * namespace: manifest
   * namespace: contextMenus
     * presence of prop: ["namespace","permissions","description","$import","types"]
   * namespace: menus
     * presence of prop: ["namespace","permissions","description","properties","types","functions","events"]
 * browser/components/extensions/schemas/omnibox.json
   * namespace: manifest
   * namespace: omnibox
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/page_action.json
   * namespace: manifest
   * namespace: pageAction
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/pkcs11.json
   * namespace: manifest
   * namespace: pkcs11
     * presence of prop: ["namespace","description","permissions","functions"]
 * browser/components/extensions/schemas/geckoProfiler.json
   * namespace: manifest
   * namespace: geckoProfiler
     * presence of prop: ["namespace","description","permissions","types","functions","events"]
 * browser/components/extensions/schemas/sessions.json
   * namespace: manifest
   * namespace: sessions
     * presence of prop: ["namespace","description","permissions","types","functions","events","properties"]
 * browser/components/extensions/schemas/sidebar_action.json
   * namespace: manifest
   * namespace: sidebarAction
     * presence of prop: ["namespace","description","permissions","types","functions"]
 * browser/components/extensions/schemas/tabs.json
   * namespace: manifest
   * namespace: tabs
     * presence of prop: ["namespace","description","types","properties","functions","events"]
 * browser/components/extensions/schemas/url_overrides.json
   * namespace: manifest
 * browser/components/extensions/schemas/windows.json
   * namespace: windows
     * presence of prop: ["namespace","description","types","properties","functions","events"]

[//]: # ( vim:expandtab ff=unix fenc=utf-8 sw=2)

