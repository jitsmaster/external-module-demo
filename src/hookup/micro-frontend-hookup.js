/**
 * The script that hooks up the Micro Frontend Module to the host application
 */

class MicroFrontendHookup {
    _moduleUri;

    constructor(moduleUri) {
        try {
            this._moduleUri = moduleUri.toLowerCase();
            
            // Create an iframe to hold the Micro Frontend module
            this.iframe = document.createElement('iframe');
            this.iframe.style.position = "absolute";
            this.iframe.style.left = "-9999px";
            document.body.appendChild(this.iframe);
            console.info('[Micro-Frontend] - Module hooked up!');
        } catch (error) {
            console.error('[Micro-Frontend] - Hookup initialization failed:', error);
        }
    }

    async setup() {
        try {
            const scripts = [
                "browser/polyfills.js",
                "browser/main.js"
            ];

            // Get version from server with cache busting
            let ver;
            try {
                const resp = await fetch(`${this._moduleUri}/common/ver?_=${Date.now()}`, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                ver = await resp.text();
            } catch (error) {
                // Fallback to timestamp if version fetch fails
                ver = Date.now().toString();
                console.warn('[Micro-Frontend] - Failed to fetch version, using timestamp:', error);
            }

            // Add both version and timestamp for robust cache busting
            const scriptsFinal = scripts
                .map(s => `${s}?v=${ver}&t=${Date.now()}`)
                .join(";");

            const encodedUrl = btoa(window.location.href.split('#')[0]);

            this.iframe.src = `CMS/ExternalModule?root=app-root`
                + `&url=${encodeURIComponent(this._moduleUri)}`
                + `&refpointerer=${encodeURIComponent(encodedUrl)}`
                + `&scripts=${encodeURIComponent(scriptsFinal)}`;
        } catch (error) {
            console.error('[Micro-Frontend] - Setup failed:', error);
        }
    }

    createScriptElement(src) {
        try {
            const scriptEle = document.createElement("script");
            scriptEle.setAttribute("src", src);
            scriptEle.setAttribute("type", "module");

            this.iframe.contentWindow.document.body.appendChild(scriptEle);
        } catch (error) {
            console.error('[Micro-Frontend] - Failed to create script element:', error);
        }
    }
}

// Create hookup instance when body finished loading
document.addEventListener("DOMContentLoaded", async () => {
    try {
        let url = document.getElementById("MicroFrontendModule")?.getAttribute("src") || "";

        let pos = url.indexOf("/hookup/");
        if (pos > -1) {
            url = url.substring(0, pos);
        }

        if (!url) {
            console.error('[Micro-Frontend] - Hookup initialization failed: Module URL not found');
            return;
        }

        window.modules_MicroFrontendHookup = new MicroFrontendHookup(url);
        await window.modules_MicroFrontendHookup.setup();
    } catch (error) {
        console.error('[Micro-Frontend] - Hookup initialization failed:', error);
    }
}, false);