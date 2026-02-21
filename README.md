# VA Claim Status Viewer (Firefox port)

Firefox port of the [VA-Claim-Status](https://github.com/fa1sepr0phet/VA-Claim-Status) Chrome extension.

Not affiliated with VA.gov.

## what it does

When you're on VA.gov looking at your claim, the site makes API calls to `api.va.gov` behind the scenes. This extension watches for those calls, grabs the JSON response, and shows it to you in a readable popup instead of the bare-bones info VA.gov gives you.

It pulls the important stuff to the top: jurisdiction, phase, status, etc.

There's also a button to view your rated disabilities.

## privacy

Doesn't touch your pages, doesn't track anything, doesn't phone home. Everything stays in your browser.

## installing

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Pick the `manifest.json` from this folder
4. That's it, icon shows up in your toolbar

Note: temporary addons go away when you close Firefox. If you want it permanent you'd need to get it signed through addons.mozilla.org or use Firefox Developer Edition with `xpinstall.signatures.required` set to false in about:config.

## using it

1. Log into VA.gov
2. Go to your claim status page and click into a claim
3. Click the extension icon
4. Hit Refresh if you need updated data

## requires

Firefox 109+, gotta be logged into VA.gov

## license

GPL-3.0
