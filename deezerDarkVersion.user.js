/* JSHINT PARAMS  -   Useful for debugging the script, do not delete
 *         < see http://jshint.com/docs/options/ >  for more details. */

/* jslint             bitwise: true */
/* jslint             esnext: true */
/* jslint             moz: true */
/* jshint             expr: true */
/* jshint             sub:true*/
/* jshint             multistr: true */
/* globals            postMessage, self, aesjs, hex_md5, unsafeWindow, GM_info, opr, safari*/

/* jslint             ignore: start */
const W = window;
const D = document;    
const uW = unsafeWindow;
/* jslint             ignore: end   */

// START OF METADATAS ------------------------------------------------------------------------------------------------------------------------

// ==UserScript==
//
// @name              Deezer:Download [Revived]
// @description       Download music from Deezer in any chosen format. Supports HQ even without Premium subscription. Also recommend 'Deezer Premium Enabler' to have a better experience.
// @version           1.0.5
// @author            Deki Haker, Kawashi666 & some others.
// @namespace         Script from Original 'Deezer:Download', revisited by some developers & contributors.
// @id                13fbc8ca-c92d-4032-aa17-276e77cd8552-Deezer-Download-Revived
// @updateUrl         https://gist.githubusercontent.com/K-mikaZ/6876925fbe3c9e10973c44b9a220916c/raw/3f5c6faf9ee67ea5942d46ef42ac046e1be510e2/Deezer:Download.meta.js
// @downloadUrl       https://gist.githubusercontent.com/K-mikaZ/6876925fbe3c9e10973c44b9a220916c/raw/3f5c6faf9ee67ea5942d46ef42ac046e1be510e2/Deezer:Download.meta.js
//
// @domain            deezer.com
// @match             http*://*.deezer.com/*
// @run-at            document-end
// @delay             1000
// @priority          2
//
// @developer         Jonathan Tavares    [ Revisions, fixes, proofreading, compatibility ] ,
//                    K-mik@Z             [ Fixes, proofreading (code), style, translation, compatibility and 2 or 3 tricks ]     < cool2larime@yahoo.fr > ,
//                    [...]
//
// @licence           BEER-WARE Licence
/*                    < https://framabin.org/?34d387c34fbe5ac5#4AdsiBRoQGJ0JfW1ueKLMoC/Cn6yph5NxwyEfISQ24o= >
 */
// @icon              https://e-cdns-files.dzcdn.net/images/common/favicon/favicon-96x96-v00400107.png
//
// @screenshot        https://framapic.org/pBnowQP75uGT/6CnUCfbvFx7W.png
//
// @contributor       Jonathan Tavares, K-mik@Z,
//                    you [...] - `Try To Take Over The World`
//
// @name:en           Deezer:Download [Revived] - Download your music easily.
// @description:en    Download the currently playing song (or any song from the current tracklist) in any chosen format. Supports HQ even without Premium subscription.
//
// @name:fr           Deezer:Download [Revived] - Télécharger vos musiques facilement.
// @description:fr-FR Téléchargez la chanson en cours de lecture (ou n'importe quelle chanson de la liste en cours) dans n'importe quel format. Supporte le HQ même sans abonnement Premium.
//
// @name:pt           Deezer:Download [Revived] - Baixe sua música facilmente.
// @description:pt-BR Faz o download da música atual (ou qualquer musica na playlist atual) em qualquer formato escolhido. Suporta HQ mesmo sem ter assinatura Premium.
//
/* Compatibility & Security
 * ------------------------- < see https://www.chromium.org/developers/design-documents/user-scripts > */
//
// @include           http*://*.deezer.com/*
// @connect           self
//
// @grant             unsafeWindow
// @noframes
// @require           https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js
//
// @require           https://cdnjs.cloudflare.com/ajax/libs/aes-js/2.1.0/index.js
// @require           https://greasyfork.org/scripts/38763-pajhome-md5/code/PajHome%20MD5.js
//
// @compatible        chrom[e|ium]    TamperMonkey || ViolentMonkey
// @compatible        vivaldi         TamperMonkey || ViolentMonkey
// @compatible        opera           TamperMonkey || ViolentMonkey
// @compatible        firefox         TamperMonkey || ViolentMonkey || GreaseMonkey (+ FIXME)
//
// ==/UserScript==

// END METADATAS ------------------------------------------------------------------------------------------------------------------------------

/*
 * FIXME:             - GreaseMonkey ( Works, but you needs to reclick a second time on the link after the conversion is done. )
 *
 *
 * PERFORMED:         - Style :
 *                        (*) Resizing the min/max-width window and some other CSS tricks (spacing) for more readability.
 *                        (*) Put the name of the artist in capital letters and place it before the title.
 *                        (*) Changing Logo of Deezer.
 *                    - Accessibility :
 *                        (*) Reduction of the choice in the name proposition (redundancy).
 *                        (*) Reduction of the choice in the download links (redundancy).
 *                        (*) Adding an escape mode to quit the app.
 *                        (*) Adding a message on the GUI, for GreaseMonkey's users (only), explaining the FIXME.
 *                    - Codage :
 *                        (*) Integration `convert size script` to render the file size more `human readable` (in Mo).
 *                        (*) Reorder some lines in `Blowfish.prototype` and some others, `here and then`.
 *                        (*) Puting in the script the search for term in regex from the url.
 *                        (*) Replacement, where possible, 'single quote' instead of "double quote" in the code.
 *                        (*) Replace as soon as possible semicolons `;` with commas `,` without breaking the code.
 *                        (*) Create `two debug mode (GM_Debug & WORKER_Debug)` with two possible values, 0 or 1 (for having log only on `prod mode`).
 *                        (*) Added console.warn () and console.error () in addition to console.log () (better to debug).
 *                        (*) Creation of a function by stylesheet with its own Id, to facilitate integration.
 *                        (*) Internationalization: Create a translate fn with dictionary (dict) `_getI18N` to translate more easily (  Using translate(`wordToTranslate`)  ).
 *                            And assume `en` default when no supported lng are found.
 *                        (*) Reduce the content page loading by adding globals vars outside the code and a `;` at the beginning of the main function.
 *                    - Compatibility & Security :
 *                        (*) Use of the file grant-none-shim.js. This script is intended to be used with @require, for Greasemonkey scripts using `@grant none`.
 *                            It emulates the GM_ APIs as closely as possible, using modern browser features like DOM storage.
 *                            For explanation and license, see in the JS file itself.
 *                        (*) Emulate `unsafeWindow` with gm_win for browsers that don’t support it.
 *                        (*) Using `unsafeWindow.console.log()`, or rather `gm_win.console.log()` instead of `console.log()`. GreaseMonkey trick.
 *                        (*) Adding metadata delay and priority to avoid conflicts with a third-party script.
 *                        (*) Using `noframes` to support `non-frames` capable browsers
 *                        (*) Adding a function to determinate browser prefs lng and to propose GUI translated in case.
 *                        (*) Tested in different browsers (firefox, opera, vivaldi and chrom[e|ium]) with different script Managers (TamperMonkey, ViolentMonkey and GreaseMonkey).
 *                        (*) Adding `patch` to manually trigger deferred DOMContentLoaded.
 *
 * ABORT:             - Adding MD5, SHA1 & SHA-256 sums in externs links of metadatas.
 *                      (If the content of the external resource doesn't match the selected hash, then the resource is not delivered to the userscript).
 *                      ( It's not supported by chrome only).
 *
 * TODO:              - Getting the TrackList when the page change.
 *                    - Making new test with checksums in view of chrome.
 *
 * IDEAS:             - Have a return of test with ( edge || TamperMonkey   and perhaps  safari || GreaseKit ) - Maybe with user feedback.
 *                    - Improve my English ;)
 *
 * SPECIAL THANKS:    - Stack Overflow < https://stackoverflow.com/ > for the wealth of information and tips.
 * 
 */

// GLOBALS VARS ( /!\ WARNING ) ----------------------------------------------------------------------------------------------------------------------------------

const GM_Debug = 1;  //Possible values ( 0 =N || 1 =Y ).
                     //Write: if(GM_Debug) { gm_win.console.log(`yourMsg` + `whatYouWant`); };  where gm_win === unsafeWindow.

                     // Now all you have to change one character to enable/disable logging when debugging.
                     // For debugging set var(s) GM_Debug and/or WORKER_Debug value(s) to 1. (searching with CTRL-F, only 2 vars).
                     // Don't forget to return to 0 after. Logs are only useful in prod and slow down the operation.

const AcceptLngs = ['de', 'en', 'es', 'fr', 'it', 'pt', 'pt-BR'];

// LANGUAGES MAP         If you add new languages in the `LANGUAGES MAP`, add them in the var `AcceptLngs` too (see above).
//                       Try to respect alphabetical order.
const _getI18N = {
  'Click to open the app' : {
      'de'    : `Klicken Sie, um die Anwendung zu öffnen`,
      'en'    : `Click to open the app`,
      'es'    : `Haga clic para abrir la aplicación`,
      'fr'    : `Cliquer pour ouvrir l'application`,
      'it'    : `Clicca per aprire l'applicazione`,
      'pt'    : `Clique para abrir o aplicativo`,
      'pt-BR' : `Clique para abrir o aplicativo`
  },
  'Current track' : {
      'de'    : `Aktueller Titel`,
      'en'    : `Current track`,
      'es'    : `Pista actual`,
      'fr'    : `Piste actuelle`,
      'it'    : `Traccia corrente`,
      'pt'    : `Faixa atual`,
      'pt-BR' : `Faixa atual`
  },
  'Track list' : {
      'de'    : `Liste der Titel`,
      'en'    : `Track list`,
      'es'    : `Lista de canciones`,
      'fr'    : `Liste des pistes`,
      'it'    : `Elenco dei brani`,
      'pt'    : `Lista de trilhas`,
      'pt-BR' : `Lista de trilhas`
  },
  'refresh track list' : {
      'de'    : `aktualisiere die Liste der Tracks`,
      'en'    : `refresh track list`,
      'es'    : `actualizar la lista de pistas`,
      'fr'    : `actualiser la liste des pistes`,
      'it'    : `aggiorna la lista delle tracce`,
      'pt'    : `atualize a lista de faixas`,
      'pt-BR' : `atualize a lista de faixas`
  },
  'Choose' : {
      'de'    : `Wählen`,
      'en'    : `Choose`,
      'es'    : `Escoger`,
      'fr'    : `Choisir`,
      'it'    : `Scegliere`,
      'pt'    : `Escolher`,
      'pt-BR' : `Escolher`
  },
  'Choose the file name' : {
      'de'    : `Wählen Sie den Dateinamen`,
      'en'    : `Choose the file name`,
      'es'    : `Elige el nombre del archivo`,
      'fr'    : `Choisir le nom du fichier`,
      'it'    : `Scegli il nome del file`,
      'pt'    : `Escolha o nome do arquivo`,
      'pt-BR' : `Escolha o nome do arquivo`
  },
  'Title' : {
      'de'    : `Titel`,
      'en'    : `Title`,
      'es'    : `Título`,
      'fr'    : `Titre`,
      'it'    : `Titolo`,
      'pt'    : `Título`,
      'pt-BR' : `Título`
  },
  'Artist' : {
      'de'    : `Künstler`,
      'en'    : `Artist`,
      'es'    : `Artista`,
      'fr'    : `Artiste`,
      'it'    : `Artista`,
      'pt'    : `Artista`,
      'pt-BR' : `Artista`
  },
  'standard' : {
      'de'    : `standard`,
      'en'    : `standard`,
      'es'    : `estándar`,
      'fr'    : `standard`,
      'it'    : `standard`,
      'pt'    : `padrão`,
      'pt-BR' : `padrão`
  }
};

// Emulate `unsafeWindow` in browsers that don’t support it. ( http://mths.be/unsafewindow )
const gm_win = (function gmWin(W) {
    var a,
        e = D.createElement('p'),
        onclick = e.getAttribute('onclick'); // get old onclick attribute
    try {
        a = uW === W ? false : uW;
    } finally {
        return a || (function() {
            // if onclick is not a function, it's not IE7, so use setAttribute
            if(typeof(onclick) != 'function') {
                // for FF,IE8,Chrome
                e.setAttribute('onclick','return W;' + onclick);
            // if onclick is a function, use the IE7 method and call onclick() in the anonymous function
            } else {
                // for IE7
                e.onclick = function() {
                    onclick();
                    return W;
                };
            }
        }());
    }
})();
// You can now use `unsafeWindow`, ehm, safely.
//if(GM_Debug) { gm_win.console.log(gm_win); }
// If the current document uses a JavaScript library, you can use it in your user script like this:
//if(GM_Debug) { gm_win.console.log(gm_win.jQuery); }

// DETERMINING THE LANGUAGE OF THE GUI. (Thx to Paul S. - Stack Overflow)
const nav = W.navigator;
const clientLngs = [
    nav.language + '' ||
        nav.browserLanguage + '' ||    // Adding `+ ''` for suppress `TypeError: lang.split is not a function`
        nav.userLanguage + '',
    nav.languages + '',
    'en'+ ''
].filter(Boolean);
const getRoot = lng => lng.split('-')[0];
const lngRootIncludes = lng => {
    let root = getRoot(lng);
    return AcceptLngs.includes(root);
};
const candidateLng = clientLngs.find(
    lng => lngRootIncludes(lng)
);
const candidateLngRoot = getRoot(candidateLng);
const translate = content => {
    let dict = _getI18N[content];
    if (!dict) return content;
    return dict[candidateLng] ||      // e.g. first try ru-MD
           dict[candidateLngRoot] ||  // then fall back to ru
           content;                   // then fall back to input (if nothing found, default app lng `en`).
};
// END GLOBALS VARS ----------------------------------------------------------------------------------------------------------------------------------


// STARTING THE CODE NOW -----------------------------------------------------------------------------------------------------------------------------
;(function _main() { // Please, don't touch the `;` at the beginning.
    'use strict';

    // The following manual DOMContentLoaded triggering technique may be of interest for a fix in regards to DOMContentLoaded event being triggered too early.
    if( D.createEvent ) {  // < https://stackoverflow.com/questions/942921/lazy-loading-the-addthis-script-or-lazy-loading-external-js-content-dependent#answer-943315 >
        const evt = document.createEvent('MutationEvents'); 
        evt.initMutationEvent('DOMContentLoaded', true, true, document, '', '', '', 0); 
        D.dispatchEvent(evt);
    }

    if( GM_Debug ) {
        const arr = [];
        const ua = navigator.userAgent;
        arr.push( `---------------------------------------------------------------------------` );
            arr.push( `_Report date     [  ` + (new Date()) + `  > ` + (new Date().toLocaleDateString(candidateLngRoot)) + `  ]` );
            // Determining Browser type      // https://stackoverflow.com/questions/42015724/best-practice-for-browser-details-detection-should-i-do-it-in-client-side-usi
            const _wichBrwsr_ = (function _getBrwsr(){
                    let isOpera = ( !!W.opr && !!opr.addons ) || !!W.opera || ua.indexOf(' OPR/') >= 0,  // Opera 8.0+
                        isFirefox = typeof InstallTrigger !== 'undefined',  // Firefox 1.0+
                        isSafari =
                            /constructor/i.test( W.HTMLElement ) ||
                           (function (p) {
                                return p.toString() === '[object SafariRemoteNotification]';
                           })( !W['safari'] || (typeof safari !== 'undefined' && safari.pushNotification) ),  // Safari 3.0+ "[object HTMLElementConstructor]"
                        isIE = /*@cc_on!@*/false || !!D.documentMode,  // Internet Explorer 6-11
                        isEdge = !isIE && !!W.StyleMedia,  // Edge 20+
                        isChrome = !!W.chrome && !!W.chrome.webstore;  // Chrome 1+
                    if ( isOpera ) { return 'Opera'; }
                    if ( isFirefox ) { return 'Firefox'; }
                    if ( isSafari ) { return 'Safari'; }
                    if ( isIE ) { return 'IE'; }
                    if ( isEdge ) { return 'Edge'; }
                    if ( isChrome ) { return 'Chrome'; }
                    return 'Unknown';
                }()),
                _whichMajVer_ = (function getBrowserMajorVersion() {
                    let tem,
                        M = ua.match( /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [];
                    if ( /trident/i.test(M[1]) ) {
                        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                        return ( tem[1] || '' );
                    }
                    if ( M[1] === 'Chrome' ) {
                        tem = ua.match( /\b(OPR|Edge)\/(\d+)/ );
                        if ( tem !== null ) return tem[2];
                    }
                    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
                    if ( ( tem = ua.match( /version\/(\d+)/i ) ) !== null ) M.splice(1, 1, tem[1]);
                    return M[1];
                }());
            arr.push( `_Browser         [  ` + navigator.appCodeName + ` ` + _wichBrwsr_ +  ` ` + _whichMajVer_ + ` (` + candidateLng + `)  ]` );
            // What's your script manager?
            arr.push( `_Script Manager  [  ` + GM_info.scriptHandler + ` v.` + GM_info.version + `  ]` );
            for (var j = 0, count = arr.length; j < count; j++) {
                gm_win.console.log( arr[j] );
            }
            // Is script updated?
            let isUpdate = GM_info.scriptWillUpdate,
                msgScriptInfos = `_Infos script    [  ` + GM_info.script.name + ` v.` + GM_info.script.version;
            if ( GM_info.scriptWillUpdate == 1 ) {
                gm_win.console.log(
                    msgScriptInfos += ` ( is updated: ` + isUpdate + `, last update: ` + GM_info.script.lastUpdated + ` ) ]`
                );
            }
            else { gm_win.console.log( msgScriptInfos += ` ( is updated: ` + isUpdate + ` ) ]` ); }
        gm_win.console.log( `---------------------------------------------------------------------------` );  gm_win.console.log(  );  // Line break
    }
    // For metadatas of the script:
    //if(GM_Debug) { gm_win.console.info(`UserScript Metadatas: ` + `%s`, GM_info.scriptMetaStr); } //unsafeWindow is not defined here, use gm_win instead.
    //if(GM_Debug) { gm_win.console.info(`UserScript Metadatas: ` + `%s`, JSON.stringify(GM_info.script)); } //unsafeWindow is not defined here, use gm_win instead.

/*
    // DETERMINING THE LANGUAGE OF THE GUI.
    nav = window.navigator,
    navLng = nav.language || nav.browserLanguage || nav.userLanguage,
    prefs = nav.languages,
    navPrefLng = prefs[0],
    defaultLng = 'en',
    lng = navLng, //It must be set for translation

    // CHECK THE LANGUAGE OF THE NAVIGATOR.
    checkLng = function checkLng() {
        // isL10nAvailable:
        if (AcceptLngs.indexOf(lng) < -1) {
            lng = lng;
            return lng;
        }
    },
    // SEARCH IF LANGUAGE OF THE APP IS AVAILABLE.
    isLngDispo = function isLngDispo() {
        // isSubstrL10nAvailable:
        checkLng();
        if (AcceptLngs.indexOf(lng) === -1) {
            lng = lng.substring(0,2);
            return lng;
        }
    },
    // TO DO IF LANGUAGE SUPPORTED ISN'T FIND.
    setLng = function setLng() {
        // isL10nNoAvailable:
        isLngDispo();
        if (AcceptLngs.indexOf(lng) === -1) {
            lng = defaultLng;
            return lng;
        }
    };

    // APPLYING LANGUAGE FOR THE APP.
    setLng();
*/

/*
    function convertDate(date) {
        var matches,
            convertedDate,
            fraction;
        // we have a date, so just return it.
        if (typeof(date) == 'object') {
          return date;
        };

        matches = date.toString().match( /(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})([\.,]\d{1,3})?)?(Z|\+00:?00)?/ );

        if (matches) {
            for (var i = 1; i <= 6; i++) {
                matches[i] = parseInt( matches[i], 10 ) || 0;
            }

            // month starts on 0
            matches[2] -= 1;

            fraction = matches[7] ? 1000 * ('0' + matches[7]) : null;

            if (matches[8]) {
                convertedDate = new Date( Date.UTC(matches[1], matches[2], matches[3], matches[4], matches[5], matches[6], fraction) );
            } else {
                convertedDate = new Date( matches[1], matches[2], matches[3], matches[4], matches[5], matches[6], fraction );
            }
        } else if (typeof(date) == 'number') {
            // UNIX timestamp
            convertedDate = new Date();
            convertedDate.setTime(date);
        } else if (date.match( /([A-Z][a-z]{2}) ([A-Z][a-z]{2}) (\d+) (\d+:\d+:\d+) ([+-]\d+) (\d+)/ )) {
            // This format `Wed Jul 20 13:03:39 +0000 2011` is parsed by
            // webkit/firefox, but not by IE, so we must parse it manually.
            convertedDate = new Date();
            convertedDate.setTime(Date.parse([
                RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$6, RegExp.$4, RegExp.$5
            ].join(' ')));
        } else if (date.match(/\d+ \d+:\d+:\d+ [+-]\d+ \d+/)) {
            // a valid javascript format with timezone info
            convertedDate = new Date();
            convertedDate.setTime(Date.parse(date));
        } else {
            // an arbitrary javascript string
            convertedDate = new Date();
            convertedDate.setTime(Date.parse(date));
        }

        return convertedDate;
    }
*/
  /* https://stackoverflow.com/questions/4784745/how-can-i-measure-the-execution-time-of-a-script
    function time_my_script(script) {
        const start = performance.now();
        script();
        return performance.now() - start;
    }
*/
    //TESTING URLS WITH REGEX
    if ( D.domain == 'deezer.com' ) {
        if ( !!location.href.match( /(login|register|signout|blabla)/ ) ) {
            if( GM_Debug ) { gm_win.console.info( `This url contains an unwanted word, don\'t apply Downloader App, applying Deezer:Download Logo only` ); }
            _dzLogoCss_();      if( GM_Debug ) { gm_win.console.info( `Applying Deezer:Download Logo.` ); }
        } else { // This url not contains unwanted things
            if( GM_Debug ) { gm_win.console.info( `Nothing prohibited here... Yeah, we loose ourselves !   😊` ); }
            _dzLogoCss_();      if( GM_Debug ) { gm_win.console.log( `Applying Deezer:Download Logo.    ✓` ); };
            _dzApp_(uW, D);     if( GM_Debug ) { gm_win.console.log( `Create the app.    ✓` ); }

            // FIXME: Having an info for greasemonkey's users into the GUI
            if ( GM_info.scriptHandler === 'Greasemonkey' ) { // User is running Greasemonkey, do this.
                _gmAlertCss_();  if(GM_Debug) { gm_win.console.info( `Applying FIXME for `, GM_info.scriptHandler ); }
            }
        }
        if( GM_Debug ) {
            var i,
                output = '',
                // Remember when we started
                start = performance.now();
            for ( i = 1; i <= 1e6; i++ )
                output += i;
            // Remember when we finished
            var end = performance.now();
            // Now calculate and output the difference
            gm_win.console.info( `All done !   😊     The page Loading in: ` + (end - start) + ` ms ( for more precision, https://developers.google.com/web/updates/2012/08/When-milliseconds-are-not-enough-performance-now )` );
            gm_win.console.log(  );  // Line break
        }
    }

    function _dzApp_(W, D) {

        // WORKER
        function createWorker(code) {

            const blobURL = URL.createObjectURL(new Blob(['(', code.toString(), ')()'], {
                      type: 'application/javascript'
                })),
                worker = new Worker(blobURL);
            URL.revokeObjectURL(blobURL);
            return worker;
        }


       const mainWk = createWorker(function() {   // gm_win && _getI18N are undefined here  < FIND a soluce


            const WORKER_Debug = 0; //Possible values ( 0 =N || 1 =Y ).
                                  //`Debug mode` ONLY for the var mainWk. For all the rest, we use GM_Debug.
                                  //Write: if(WORKER_Debug) { gm_win.console.log(``yourMsg` + `whatYouWant``); }  where gm_win = unsafeWindow.


            // BLOWFISH LIBRARY, adapted from https://github.com/agorlov/javascript-blowfish (MIT-licensed)
            //     Modified to work with byte arrays, and also supports encryption / decryption in-place for buffers.
            //     Cannot be @require-d, as it is part of worker code. Workers share NO data so everything must be embedded.
            const Blowfish = function(key, mode) {
                this.key = key;
                if (mode === 'ecb' || mode === 'cbc') this.mode = mode;
                this.sBox0 = Blowfish.sBox0.slice();
                this.sBox1 = Blowfish.sBox1.slice();
                this.sBox2 = Blowfish.sBox2.slice();
                this.sBox3 = Blowfish.sBox3.slice();
                this.pArray = Blowfish.pArray.slice();
                this.generateSubkeys(key);
            };
            Blowfish.prototype = {
                sBox0: null,
                sBox1: null,
                sBox2: null,
                sBox3: null,
                pArray: null,
                key: null,
                mode: 'ecb',
                iv: 'abc12345',
                trimZeros: (input) => input.replace(/\0+$/g, ''),
                fixNegative: (number) => (number >>> 0),
                num2block32: (num) => [num >>> 24, num << 8 >>> 24, num << 16 >>> 24, num << 24 >>> 24],
                block32toNum: function(block32) {
                    return this.fixNegative(block32[0] << 24 | block32[1] << 16 | block32[2] << 8 | block32[3]);
                },
                xor: function(a, b) {
                    return this.fixNegative(a ^ b);
                },
                addMod32: function(a, b) {
                    return this.fixNegative((a + b) | 0);
                },
                split64by32: function(block64) {
                    return [this.block32toNum(block64.slice(0, 4)), this.block32toNum(block64.slice(4, 8))];
                },
                encrypt: function(data, iv) {
                    if (this.mode === 'ecb') return this.encryptECB(data);
                    if (this.mode === 'cbc') return this.encryptCBC(data, iv);
                    throw new Error( `BF: unknown cipher mode` );
                },
                decrypt: function(data, iv) {
                    if (this.mode === 'ecb') return this.decryptECB(data);
                    if (this.mode === 'cbc') return this.decryptCBC(data, iv);
                    throw new Error('BF: unknown cipher mode');
                },
                encryptECB: function(data) {
                    let blocks = Math.ceil(data.length / 8),
                        encrypted = [];
                    for (var i = 0; i < blocks; i++) {
                        var block = data.slice(i * 8, (i + 1) * 8);
                        if (block.length < 8) throw new Error( `BF: data length not multiple of 8` ); // var count = 8 - block.length; while (0 < count--) block += "\0";
                        var xL,
                            xR,
                            xLxR = this.split64by32(block);
                        xL = xLxR[0],
                        xR = xLxR[1],
                        xLxR = this.encipher(xL, xR),
                        xL = xLxR[0],
                        xR = xLxR[1];
                        if (data instanceof Uint8Array) {
                            data.set(this.num2block32(xL), i * 8),
                            data.set(this.num2block32(xR), i * 8 + 4);
                        } else encrypted = encrypted.concat(this.num2block32(xL), this.num2block32(xR));
                    }
                    if (!(data instanceof Uint8Array)) return encrypted;
                },
                encryptCBC: function(data, iv) {
                    let blocks = Math.ceil(data.length / 8),
                        ivL,
                        ivR,
                        ivLivR,
                        encrypted = [];
                    ivLivR = this.split64by32(iv),
                    ivL = ivLivR[0],
                    ivR = ivLivR[1];
                    for (var i = 0; i < blocks; i++) {
                        var block = data.slice(i * 8, (i + 1) * 8);
                        if (block.length < 8) throw new Error( `BF: data length not multiple of 8` ); // var count = 8 - block.length; while (0 < count--) block += "\0";
                        var xL,
                            xR,
                            xLxR;
                        xLxR = this.split64by32(block),
                        xL = xLxR[0],
                        xR = xLxR[1],
                        xL = this.xor(xL, ivL),
                        xR = this.xor(xR, ivR),
                        xLxR = this.encipher(xL, xR),
                        xL = xLxR[0],
                        xR = xLxR[1],
                        ivL = xL,
                        ivR = xR;
                        if (data instanceof Uint8Array) {
                            data.set(this.num2block32(xL), i * 8),
                            data.set(this.num2block32(xR), i * 8 + 4);
                        } else encrypted = encrypted.concat(this.num2block32(xL), this.num2block32(xR));
                    }
                    if (!(data instanceof Uint8Array)) return encrypted;
                },
                decryptECB: function(data) {
                    let blocks = Math.ceil(data.length / 8),
                        decrypted = [];
                    for (var i = 0; i < blocks; i++) {
                        var block = data.slice(i * 8, (i + 1) * 8);
                        if (block.length < 8) throw new Error( `BF: ciphertext too short (must be multiple of 8 bytes)` );
                        var xL,
                            xR,
                            xLxR;
                        xLxR = this.split64by32(block),
                        xL = xLxR[0],
                        xR = xLxR[1],
                        xLxR = this.decipher(xL, xR),
                        xL = xLxR[0],
                        xR = xLxR[1];
                        if (data instanceof Uint8Array) {
                            data.set(this.num2block32(xL), i * 8),
                            data.set(this.num2block32(xR), i * 8 + 4);
                        } else decrypted = decrypted.concat(this.num2block32(xL), this.num2block32(xR));
                    }
                    if (!(data instanceof Uint8Array)) return decrypted;
                },
                decryptCBC: function(data, iv) {
                    let blocks = Math.ceil(data.length / 8),
                        ivL,
                        ivR,
                        ivLtmp,
                        ivRtmp,
                        ivLivR,
                        decrypted = [];
                    ivLivR = this.split64by32(iv),
                    ivL = ivLivR[0],
                    ivR = ivLivR[1];
                    for (var i = 0; i < blocks; i++) {
                        var block = data.slice(i * 8, (i + 1) * 8);
                        if (block.length < 8) throw new Error( `BF: ciphertext too short (must be multiple of 8 bytes)` );
                        var xL,
                            xR,
                            xLxR;
                        xLxR = this.split64by32(block),
                        xL = xLxR[0],
                        xR = xLxR[1],
                        ivLtmp = xL,
                        ivRtmp = xR,
                        xLxR = this.decipher(xL, xR),
                        xL = xLxR[0],
                        xR = xLxR[1],
                        xL = this.xor(xL, ivL),
                        xR = this.xor(xR, ivR),
                        ivL = ivLtmp,
                        ivR = ivRtmp;
                        if (data instanceof Uint8Array) {
                            data.set(this.num2block32(xL), i * 8),
                            data.set(this.num2block32(xR), i * 8 + 4);
                        } else decrypted = decrypted.concat(this.num2block32(xL), this.num2block32(xR));
                    }
                    if (!(data instanceof Uint8Array)) return decrypted;
                },
                F: function(xL) {
                    let a = xL >>> 24,
                        b = xL << 8 >>> 24,
                        c = xL << 16 >>> 24,
                        d = xL << 24 >>> 24,
                        res = this.addMod32(this.sBox0[a], this.sBox1[b]);
                    res = this.xor(res, this.sBox2[c]),
                    res = this.addMod32(res, this.sBox3[d]);
                    return res;
                },
                encipher: function(xL, xR) {
                    let tmp;
                    for (var i = 0; i < 16; i++) {
                        xL = this.xor(xL, this.pArray[i]),
                        xR = this.xor(this.F(xL), xR),
                        tmp = xL,
                        xL = xR,
                        xR = tmp;
                    }
                    tmp = xL,
                    xL = xR,
                    xR = tmp,
                    xR = this.xor(xR, this.pArray[16]),
                    xL = this.xor(xL, this.pArray[17]);
                    return [xL, xR];
                },
                decipher: function(xL, xR) {
                    let tmp;
                    xL = this.xor(xL, this.pArray[17]),
                    xR = this.xor(xR, this.pArray[16]),
                    tmp = xL,
                    xL = xR,
                    xR = tmp;
                    for (var i = 15; i >= 0; i--) {
                        tmp = xL,
                        xL = xR,
                        xR = tmp,
                        xR = this.xor(this.F(xL), xR),
                        xL = this.xor(xL, this.pArray[i]);
                    }
                    return [xL, xR];
                },
                generateSubkeys: function(key) {
                    var data = 0,
                        k = 0,
                        i,
                        j;
                    for (i = 0; i < 18; i++) {
                        for (j = 4; j > 0; j--) {
                            data = this.fixNegative(data << 8 | key[k]),
                            k = (k + 1) % key.length;
                        }
                        this.pArray[i] = this.xor(this.pArray[i], data),
                        data = 0;
                    }
                    let block64 = [0, 0];
                    for (i = 0; i < 18; i += 2) {
                        block64 = this.encipher(block64[0], block64[1]);
                        this.pArray[i] = block64[0];
                        this.pArray[i + 1] = block64[1];
                    }
                    for (i = 0; i < 256; i += 2) {
                        block64 = this.encipher(block64[0], block64[1]);
                        this.sBox0[i] = block64[0];
                        this.sBox0[i + 1] = block64[1];
                    }
                    for (i = 0; i < 256; i += 2) {
                        block64 = this.encipher(block64[0], block64[1]);
                        this.sBox1[i] = block64[0];
                        this.sBox1[i + 1] = block64[1];
                    }
                    for (i = 0; i < 256; i += 2) {
                        block64 = this.encipher(block64[0], block64[1]);
                        this.sBox2[i] = block64[0];
                        this.sBox2[i + 1] = block64[1];
                    }
                    for (i = 0; i < 256; i += 2) {
                        block64 = this.encipher(block64[0], block64[1]);
                        this.sBox3[i] = block64[0];
                        this.sBox3[i + 1] = block64[1];
                    }
                }
            };// End Blowfish.prototype

            Blowfish.pArray = [0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89, 0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917, 0x9216d5d9, 0x8979fb1b],
            Blowfish.sBox0 = [0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99, 0x24a19947, 0xb3916cf7, 0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e, 0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee, 0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013, 0xc5d1b023, 0x286085f0, 0xca417918, 0xb8db38ef, 0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e, 0xd71577c1, 0xbd314b27, 0x78af2fda, 0x55605c60, 0xe65525f3, 0xaa55ab94, 0x57489862, 0x63e81440, 0x55ca396a, 0x2aab10b6, 0xb4cc5c34, 0x1141e8ce, 0xa15486af, 0x7c72e993, 0xb3ee1411, 0x636fbc2a, 0x2ba9c55d, 0x741831f6, 0xce5c3e16, 0x9b87931e, 0xafd6ba33, 0x6c24cf5c, 0x7a325381, 0x28958677, 0x3b8f4898, 0x6b4bb9af, 0xc4bfe81b, 0x66282193, 0x61d809cc, 0xfb21a991, 0x487cac60, 0x5dec8032, 0xef845d5d, 0xe98575b1, 0xdc262302, 0xeb651b88, 0x23893e81, 0xd396acc5, 0x0f6d6ff3, 0x83f44239, 0x2e0b4482, 0xa4842004, 0x69c8f04a, 0x9e1f9b5e, 0x21c66842, 0xf6e96c9a, 0x670c9c61, 0xabd388f0, 0x6a51a0d2, 0xd8542f68, 0x960fa728, 0xab5133a3, 0x6eef0b6c, 0x137a3be4, 0xba3bf050, 0x7efb2a98, 0xa1f1651d, 0x39af0176, 0x66ca593e, 0x82430e88, 0x8cee8619, 0x456f9fb4, 0x7d84a5c3, 0x3b8b5ebe, 0xe06f75d8, 0x85c12073, 0x401a449f, 0x56c16aa6, 0x4ed3aa62, 0x363f7706, 0x1bfedf72, 0x429b023d, 0x37d0d724, 0xd00a1248, 0xdb0fead3, 0x49f1c09b, 0x075372c9, 0x80991b7b, 0x25d479d8, 0xf6e8def7, 0xe3fe501a, 0xb6794c3b, 0x976ce0bd, 0x04c006ba, 0xc1a94fb6, 0x409f60c4, 0x5e5c9ec2, 0x196a2463, 0x68fb6faf, 0x3e6c53b5, 0x1339b2eb, 0x3b52ec6f, 0x6dfc511f, 0x9b30952c, 0xcc814544, 0xaf5ebd09, 0xbee3d004, 0xde334afd, 0x660f2807, 0x192e4bb3, 0xc0cba857, 0x45c8740f, 0xd20b5f39, 0xb9d3fbdb, 0x5579c0bd, 0x1a60320a, 0xd6a100c6, 0x402c7279, 0x679f25fe, 0xfb1fa3cc, 0x8ea5e9f8, 0xdb3222f8, 0x3c7516df, 0xfd616b15, 0x2f501ec8, 0xad0552ab, 0x323db5fa, 0xfd238760, 0x53317b48, 0x3e00df82, 0x9e5c57bb, 0xca6f8ca0, 0x1a87562e, 0xdf1769db, 0xd542a8f6, 0x287effc3, 0xac6732c6, 0x8c4f5573, 0x695b27b0, 0xbbca58c8, 0xe1ffa35d, 0xb8f011a0, 0x10fa3d98, 0xfd2183b8, 0x4afcb56c, 0x2dd1d35b, 0x9a53e479, 0xb6f84565, 0xd28e49bc, 0x4bfb9790, 0xe1ddf2da, 0xa4cb7e33, 0x62fb1341, 0xcee4c6e8, 0xef20cada, 0x36774c01, 0xd07e9efe, 0x2bf11fb4, 0x95dbda4d, 0xae909198, 0xeaad8e71, 0x6b93d5a0, 0xd08ed1d0, 0xafc725e0, 0x8e3c5b2f, 0x8e7594b7, 0x8ff6e2fb, 0xf2122b64, 0x8888b812, 0x900df01c, 0x4fad5ea0, 0x688fc31c, 0xd1cff191, 0xb3a8c1ad, 0x2f2f2218, 0xbe0e1777, 0xea752dfe, 0x8b021fa1, 0xe5a0cc0f, 0xb56f74e8, 0x18acf3d6, 0xce89e299, 0xb4a84fe0, 0xfd13e0b7, 0x7cc43b81, 0xd2ada8d9, 0x165fa266, 0x80957705, 0x93cc7314, 0x211a1477, 0xe6ad2065, 0x77b5fa86, 0xc75442f5, 0xfb9d35cf, 0xebcdaf0c, 0x7b3e89a0, 0xd6411bd3, 0xae1e7e49, 0x00250e2d, 0x2071b35e, 0x226800bb, 0x57b8e0af, 0x2464369b, 0xf009b91e, 0x5563911d, 0x59dfa6aa, 0x78c14389, 0xd95a537f, 0x207d5ba2, 0x02e5b9c5, 0x83260376, 0x6295cfa9, 0x11c81968, 0x4e734a41, 0xb3472dca, 0x7b14a94a, 0x1b510052, 0x9a532915, 0xd60f573f, 0xbc9bc6e4, 0x2b60a476, 0x81e67400, 0x08ba6fb5, 0x571be91f, 0xf296ec6b, 0x2a0dd915, 0xb6636521, 0xe7b9f9b6, 0xff34052e, 0xc5855664, 0x53b02d5d, 0xa99f8fa1, 0x08ba4799, 0x6e85076a],
            Blowfish.sBox1 = [0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623, 0xad6ea6b0, 0x49a7df7d, 0x9cee60b8, 0x8fedb266, 0xecaa8c71, 0x699a17ff, 0x5664526c, 0xc2b19ee1, 0x193602a5, 0x75094c29, 0xa0591340, 0xe4183a3e, 0x3f54989a, 0x5b429d65, 0x6b8fe4d6, 0x99f73fd6, 0xa1d29c07, 0xefe830f5, 0x4d2d38e6, 0xf0255dc1, 0x4cdd2086, 0x8470eb26, 0x6382e9c6, 0x021ecc5e, 0x09686b3f, 0x3ebaefc9, 0x3c971814, 0x6b6a70a1, 0x687f3584, 0x52a0e286, 0xb79c5305, 0xaa500737, 0x3e07841c, 0x7fdeae5c, 0x8e7d44ec, 0x5716f2b8, 0xb03ada37, 0xf0500c0d, 0xf01c1f04, 0x0200b3ff, 0xae0cf51a, 0x3cb574b2, 0x25837a58, 0xdc0921bd, 0xd19113f9, 0x7ca92ff6, 0x94324773, 0x22f54701, 0x3ae5e581, 0x37c2dadc, 0xc8b57634, 0x9af3dda7, 0xa9446146, 0x0fd0030e, 0xecc8c73e, 0xa4751e41, 0xe238cd99, 0x3bea0e2f, 0x3280bba1, 0x183eb331, 0x4e548b38, 0x4f6db908, 0x6f420d03, 0xf60a04bf, 0x2cb81290, 0x24977c79, 0x5679b072, 0xbcaf89af, 0xde9a771f, 0xd9930810, 0xb38bae12, 0xdccf3f2e, 0x5512721f, 0x2e6b7124, 0x501adde6, 0x9f84cd87, 0x7a584718, 0x7408da17, 0xbc9f9abc, 0xe94b7d8c, 0xec7aec3a, 0xdb851dfa, 0x63094366, 0xc464c3d2, 0xef1c1847, 0x3215d908, 0xdd433b37, 0x24c2ba16, 0x12a14d43, 0x2a65c451, 0x50940002, 0x133ae4dd, 0x71dff89e, 0x10314e55, 0x81ac77d6, 0x5f11199b, 0x043556f1, 0xd7a3c76b, 0x3c11183b, 0x5924a509, 0xf28fe6ed, 0x97f1fbfa, 0x9ebabf2c, 0x1e153c6e, 0x86e34570, 0xeae96fb1, 0x860e5e0a, 0x5a3e2ab3, 0x771fe71c, 0x4e3d06fa, 0x2965dcb9, 0x99e71d0f, 0x803e89d6, 0x5266c825, 0x2e4cc978, 0x9c10b36a, 0xc6150eba, 0x94e2ea78, 0xa5fc3c53, 0x1e0a2df4, 0xf2f74ea7, 0x361d2b3d, 0x1939260f, 0x19c27960, 0x5223a708, 0xf71312b6, 0xebadfe6e, 0xeac31f66, 0xe3bc4595, 0xa67bc883, 0xb17f37d1, 0x018cff28, 0xc332ddef, 0xbe6c5aa5, 0x65582185, 0x68ab9802, 0xeecea50f, 0xdb2f953b, 0x2aef7dad, 0x5b6e2f84, 0x1521b628, 0x29076170, 0xecdd4775, 0x619f1510, 0x13cca830, 0xeb61bd96, 0x0334fe1e, 0xaa0363cf, 0xb5735c90, 0x4c70a239, 0xd59e9e0b, 0xcbaade14, 0xeecc86bc, 0x60622ca7, 0x9cab5cab, 0xb2f3846e, 0x648b1eaf, 0x19bdf0ca, 0xa02369b9, 0x655abb50, 0x40685a32, 0x3c2ab4b3, 0x319ee9d5, 0xc021b8f7, 0x9b540b19, 0x875fa099, 0x95f7997e, 0x623d7da8, 0xf837889a, 0x97e32d77, 0x11ed935f, 0x16681281, 0x0e358829, 0xc7e61fd6, 0x96dedfa1, 0x7858ba99, 0x57f584a5, 0x1b227263, 0x9b83c3ff, 0x1ac24696, 0xcdb30aeb, 0x532e3054, 0x8fd948e4, 0x6dbc3128, 0x58ebf2ef, 0x34c6ffea, 0xfe28ed61, 0xee7c3c73, 0x5d4a14d9, 0xe864b7e3, 0x42105d14, 0x203e13e0, 0x45eee2b6, 0xa3aaabea, 0xdb6c4f15, 0xfacb4fd0, 0xc742f442, 0xef6abbb5, 0x654f3b1d, 0x41cd2105, 0xd81e799e, 0x86854dc7, 0xe44b476a, 0x3d816250, 0xcf62a1f2, 0x5b8d2646, 0xfc8883a0, 0xc1c7b6a3, 0x7f1524c3, 0x69cb7492, 0x47848a0b, 0x5692b285, 0x095bbf00, 0xad19489d, 0x1462b174, 0x23820e00, 0x58428d2a, 0x0c55f5ea, 0x1dadf43e, 0x233f7061, 0x3372f092, 0x8d937e41, 0xd65fecf1, 0x6c223bdb, 0x7cde3759, 0xcbee7460, 0x4085f2a7, 0xce77326e, 0xa6078084, 0x19f8509e, 0xe8efd855, 0x61d99735, 0xa969a7aa, 0xc50c06c2, 0x5a04abfc, 0x800bcadc, 0x9e447a2e, 0xc3453484, 0xfdd56705, 0x0e1e9ec9, 0xdb73dbd3, 0x105588cd, 0x675fda79, 0xe3674340, 0xc5c43465, 0x713e38d8, 0x3d28f89e, 0xf16dff20, 0x153e21e7, 0x8fb03d4a, 0xe6e39f2b, 0xdb83adf7],
            Blowfish.sBox2 = [0xe93d5a68, 0x948140f7, 0xf64c261c, 0x94692934, 0x411520f7, 0x7602d4f7, 0xbcf46b2e, 0xd4a20068, 0xd4082471, 0x3320f46a, 0x43b7d4b7, 0x500061af, 0x1e39f62e, 0x97244546, 0x14214f74, 0xbf8b8840, 0x4d95fc1d, 0x96b591af, 0x70f4ddd3, 0x66a02f45, 0xbfbc09ec, 0x03bd9785, 0x7fac6dd0, 0x31cb8504, 0x96eb27b3, 0x55fd3941, 0xda2547e6, 0xabca0a9a, 0x28507825, 0x530429f4, 0x0a2c86da, 0xe9b66dfb, 0x68dc1462, 0xd7486900, 0x680ec0a4, 0x27a18dee, 0x4f3ffea2, 0xe887ad8c, 0xb58ce006, 0x7af4d6b6, 0xaace1e7c, 0xd3375fec, 0xce78a399, 0x406b2a42, 0x20fe9e35, 0xd9f385b9, 0xee39d7ab, 0x3b124e8b, 0x1dc9faf7, 0x4b6d1856, 0x26a36631, 0xeae397b2, 0x3a6efa74, 0xdd5b4332, 0x6841e7f7, 0xca7820fb, 0xfb0af54e, 0xd8feb397, 0x454056ac, 0xba489527, 0x55533a3a, 0x20838d87, 0xfe6ba9b7, 0xd096954b, 0x55a867bc, 0xa1159a58, 0xcca92963, 0x99e1db33, 0xa62a4a56, 0x3f3125f9, 0x5ef47e1c, 0x9029317c, 0xfdf8e802, 0x04272f70, 0x80bb155c, 0x05282ce3, 0x95c11548, 0xe4c66d22, 0x48c1133f, 0xc70f86dc, 0x07f9c9ee, 0x41041f0f, 0x404779a4, 0x5d886e17, 0x325f51eb, 0xd59bc0d1, 0xf2bcc18f, 0x41113564, 0x257b7834, 0x602a9c60, 0xdff8e8a3, 0x1f636c1b, 0x0e12b4c2, 0x02e1329e, 0xaf664fd1, 0xcad18115, 0x6b2395e0, 0x333e92e1, 0x3b240b62, 0xeebeb922, 0x85b2a20e, 0xe6ba0d99, 0xde720c8c, 0x2da2f728, 0xd0127845, 0x95b794fd, 0x647d0862, 0xe7ccf5f0, 0x5449a36f, 0x877d48fa, 0xc39dfd27, 0xf33e8d1e, 0x0a476341, 0x992eff74, 0x3a6f6eab, 0xf4f8fd37, 0xa812dc60, 0xa1ebddf8, 0x991be14c, 0xdb6e6b0d, 0xc67b5510, 0x6d672c37, 0x2765d43b, 0xdcd0e804, 0xf1290dc7, 0xcc00ffa3, 0xb5390f92, 0x690fed0b, 0x667b9ffb, 0xcedb7d9c, 0xa091cf0b, 0xd9155ea3, 0xbb132f88, 0x515bad24, 0x7b9479bf, 0x763bd6eb, 0x37392eb3, 0xcc115979, 0x8026e297, 0xf42e312d, 0x6842ada7, 0xc66a2b3b, 0x12754ccc, 0x782ef11c, 0x6a124237, 0xb79251e7, 0x06a1bbe6, 0x4bfb6350, 0x1a6b1018, 0x11caedfa, 0x3d25bdd8, 0xe2e1c3c9, 0x44421659, 0x0a121386, 0xd90cec6e, 0xd5abea2a, 0x64af674e, 0xda86a85f, 0xbebfe988, 0x64e4c3fe, 0x9dbc8057, 0xf0f7c086, 0x60787bf8, 0x6003604d, 0xd1fd8346, 0xf6381fb0, 0x7745ae04, 0xd736fccc, 0x83426b33, 0xf01eab71, 0xb0804187, 0x3c005e5f, 0x77a057be, 0xbde8ae24, 0x55464299, 0xbf582e61, 0x4e58f48f, 0xf2ddfda2, 0xf474ef38, 0x8789bdc2, 0x5366f9c3, 0xc8b38e74, 0xb475f255, 0x46fcd9b9, 0x7aeb2661, 0x8b1ddf84, 0x846a0e79, 0x915f95e2, 0x466e598e, 0x20b45770, 0x8cd55591, 0xc902de4c, 0xb90bace1, 0xbb8205d0, 0x11a86248, 0x7574a99e, 0xb77f19b6, 0xe0a9dc09, 0x662d09a1, 0xc4324633, 0xe85a1f02, 0x09f0be8c, 0x4a99a025, 0x1d6efe10, 0x1ab93d1d, 0x0ba5a4df, 0xa186f20f, 0x2868f169, 0xdcb7da83, 0x573906fe, 0xa1e2ce9b, 0x4fcd7f52, 0x50115e01, 0xa70683fa, 0xa002b5c4, 0x0de6d027, 0x9af88c27, 0x773f8641, 0xc3604c06, 0x61a806b5, 0xf0177a28, 0xc0f586e0, 0x006058aa, 0x30dc7d62, 0x11e69ed7, 0x2338ea63, 0x53c2dd94, 0xc2c21634, 0xbbcbee56, 0x90bcb6de, 0xebfc7da1, 0xce591d76, 0x6f05e409, 0x4b7c0188, 0x39720a3d, 0x7c927c24, 0x86e3725f, 0x724d9db9, 0x1ac15bb4, 0xd39eb8fc, 0xed545578, 0x08fca5b5, 0xd83d7cd3, 0x4dad0fc4, 0x1e50ef5e, 0xb161e6f8, 0xa28514d9, 0x6c51133c, 0x6fd5c7e7, 0x56e14ec4, 0x362abfce, 0xddc6c837, 0xd79a3234, 0x92638212, 0x670efa8e, 0x406000e0],
            Blowfish.sBox3 = [0x3a39ce37, 0xd3faf5cf, 0xabc27737, 0x5ac52d1b, 0x5cb0679e, 0x4fa33742, 0xd3822740, 0x99bc9bbe, 0xd5118e9d, 0xbf0f7315, 0xd62d1c7e, 0xc700c47b, 0xb78c1b6b, 0x21a19045, 0xb26eb1be, 0x6a366eb4, 0x5748ab2f, 0xbc946e79, 0xc6a376d2, 0x6549c2c8, 0x530ff8ee, 0x468dde7d, 0xd5730a1d, 0x4cd04dc6, 0x2939bbdb, 0xa9ba4650, 0xac9526e8, 0xbe5ee304, 0xa1fad5f0, 0x6a2d519a, 0x63ef8ce2, 0x9a86ee22, 0xc089c2b8, 0x43242ef6, 0xa51e03aa, 0x9cf2d0a4, 0x83c061ba, 0x9be96a4d, 0x8fe51550, 0xba645bd6, 0x2826a2f9, 0xa73a3ae1, 0x4ba99586, 0xef5562e9, 0xc72fefd3, 0xf752f7da, 0x3f046f69, 0x77fa0a59, 0x80e4a915, 0x87b08601, 0x9b09e6ad, 0x3b3ee593, 0xe990fd5a, 0x9e34d797, 0x2cf0b7d9, 0x022b8b51, 0x96d5ac3a, 0x017da67d, 0xd1cf3ed6, 0x7c7d2d28, 0x1f9f25cf, 0xadf2b89b, 0x5ad6b472, 0x5a88f54c, 0xe029ac71, 0xe019a5e6, 0x47b0acfd, 0xed93fa9b, 0xe8d3c48d, 0x283b57cc, 0xf8d56629, 0x79132e28, 0x785f0191, 0xed756055, 0xf7960e44, 0xe3d35e8c, 0x15056dd4, 0x88f46dba, 0x03a16125, 0x0564f0bd, 0xc3eb9e15, 0x3c9057a2, 0x97271aec, 0xa93a072a, 0x1b3f6d9b, 0x1e6321f5, 0xf59c66fb, 0x26dcf319, 0x7533d928, 0xb155fdf5, 0x03563482, 0x8aba3cbb, 0x28517711, 0xc20ad9f8, 0xabcc5167, 0xccad925f, 0x4de81751, 0x3830dc8e, 0x379d5862, 0x9320f991, 0xea7a90c2, 0xfb3e7bce, 0x5121ce64, 0x774fbe32, 0xa8b6e37e, 0xc3293d46, 0x48de5369, 0x6413e680, 0xa2ae0810, 0xdd6db224, 0x69852dfd, 0x09072166, 0xb39a460a, 0x6445c0dd, 0x586cdecf, 0x1c20c8ae, 0x5bbef7dd, 0x1b588d40, 0xccd2017f, 0x6bb4e3bb, 0xdda26a7e, 0x3a59ff45, 0x3e350a44, 0xbcb4cdd5, 0x72eacea8, 0xfa6484bb, 0x8d6612ae, 0xbf3c6f47, 0xd29be463, 0x542f5d9e, 0xaec2771b, 0xf64e6370, 0x740e0d8d, 0xe75b1357, 0xf8721671, 0xaf537d5d, 0x4040cb08, 0x4eb4e2cc, 0x34d2466a, 0x0115af84, 0xe1b00428, 0x95983a1d, 0x06b89fb4, 0xce6ea048, 0x6f3f3b82, 0x3520ab82, 0x011a1d4b, 0x277227f8, 0x611560b1, 0xe7933fdc, 0xbb3a792b, 0x344525bd, 0xa08839e1, 0x51ce794b, 0x2f32c9b7, 0xa01fbac9, 0xe01cc87e, 0xbcc7d1f6, 0xcf0111c3, 0xa1e8aac7, 0x1a908749, 0xd44fbd9a, 0xd0dadecb, 0xd50ada38, 0x0339c32a, 0xc6913667, 0x8df9317c, 0xe0b12b4f, 0xf79e59b7, 0x43f5bb3a, 0xf2d519ff, 0x27d9459c, 0xbf97222c, 0x15e6fc2a, 0x0f91fc71, 0x9b941525, 0xfae59361, 0xceb69ceb, 0xc2a86459, 0x12baa8d1, 0xb6c1075e, 0xe3056a0c, 0x10d25065, 0xcb03a442, 0xe0ec6e0e, 0x1698db3b, 0x4c98a0be, 0x3278e964, 0x9f1f9532, 0xe0d392df, 0xd3a0342b, 0x8971f21e, 0x1b0a7441, 0x4ba3348c, 0xc5be7120, 0xc37632d8, 0xdf359f8d, 0x9b992f2e, 0xe60b6f47, 0x0fe3f11d, 0xe54cda54, 0x1edad891, 0xce6279cf, 0xcd3e7e6f, 0x1618b166, 0xfd2c1d05, 0x848fd2c5, 0xf6fb2299, 0xf523f357, 0xa6327623, 0x93a83531, 0x56cccd02, 0xacf08162, 0x5a75ebb5, 0x6e163697, 0x88d273cc, 0xde966292, 0x81b949d0, 0x4c50901b, 0x71c65614, 0xe6c6c7bd, 0x327a140a, 0x45e1d006, 0xc3f27b9a, 0xc9aa53fd, 0x62a80f00, 0xbb25bfe2, 0x35bdd2f6, 0x71126905, 0xb2040222, 0xb6cbcf7c, 0xcd769c2b, 0x53113ec0, 0x1640e3d3, 0x38abbd60, 0x2547adf0, 0xba38209c, 0xf746ce76, 0x77afa1c5, 0x20756060, 0x85cbfe4e, 0x8ae88dd8, 0x7aaaf9b0, 0x4cf9aa7e, 0x1948c25c, 0x02fb8a8c, 0x01c36ae4, 0xd6ebe1f9, 0x90d4f869, 0xa65cdea0, 0x3f09252d, 0xc208e69f, 0xb74e6132, 0xce77e25b, 0x578fdfe3, 0x3ac372e6];

           function xhrProgress(e, userdata) {
              if (e.lengthComputable) {
                  let percent = e.loaded * 100.0 / e.total;
                  postMessage([userdata, `Downloading` + ` ` + Math.floor(percent) + `%`]);
              } else {
                  postMessage([userdata, `Downloading` + ` ` + Math.round(e.loaded * 10.0 / 1024 / 1024) / 10.0 + `M`]);
              }
           }

            function xhrComplete(e, key, userdata) {
                postMessage([userdata, `Decrypting`]);
                let data = new Uint8Array(e.target.response),
                    L = data.length;
                if(WORKER_Debug) { console.log( `Data length`, data.length ); }
                for (var i = 0; i < L; i += 6144) {
                    if (i % (6144 * 20) == 6144 * 19) // let it display state at every 120K
                        postMessage([userdata, `Decrypting ` + Math.floor(i * 100.0 / L) + '%']);
                    if (i + 2048 <= L) {
                        var D = data.slice(i, i + 2048), //data.substr(i, 2048);
                            bf = new Blowfish(key, 'cbc');
                        if (WORKER_Debug && (i===0)) { console.log( D.toString(), D.length ); }
                        bf.decrypt(D, [0, 1, 2, 3, 4, 5, 6, 7]),
                        data.set(D, i); //for (var j=0; j<2048; j++) data[i+j]=DD.charCodeAt(j);
                        //dd += DD;
                        //if (i+6144<L) dd += data.substr(i+2048, 4096);
                        //else          dd += data.substr(i+2048);
                    } // else { dd += data.substr(i); }
                }
                let B = new Blob([data], {
                      type: 'audio/mpeg'
                    }), //dd
                    burl = URL.createObjectURL(B);
                postMessage([userdata, `DONE`, burl]);
                if(WORKER_Debug) { console.log( `Listen at`, burl ); }
            }

            function xhrError(e, userdata) {
                postMessage([userdata, `ERROR`]);
            }

            function xhrCancelled(e, userdata) {
                postMessage([userdata, `ABORT`]);
            }
            self.onmessage = function(m) {
                if(WORKER_Debug) { console.log( m.origin, m.data ); }
                let url = m.data[0],
                    key = m.data[1],
                    userdata = m.data[2],
                    rq = new XMLHttpRequest();
                rq.responseType = 'arraybuffer';
                rq.addEventListener('progress', function(e) {
                    xhrProgress(e, userdata);
                }); // xhr.onprogress = xhrProgress;
                rq.addEventListener('load', function(e) {
                    xhrComplete(e, key, userdata);
                });
                rq.addEventListener('error', function(e) {
                    xhrError(e, userdata);
                });
                rq.addEventListener('abort', function(e) {
                    xhrCancelled(e, userdata);
                });
                rq.open('get', url);
                rq.send();
            };
        });//End var mainWk


        // DOWNLOADER LOGIC: URL ENCRYPTION
        const urlCryptor = new aesjs.ModeOfOperation.ecb(aesjs.util.convertStringToBytes('jo6aey6haid2Teih')),
              hex2bin = function(h) {
                return aesjs.util.convertStringToBytes(h, 'hex');
              },
              bin2hex = function(b) {
                return aesjs.util.convertBytesToString(b, 'hex');
              },
              bin2str = function(b) {
                return b.map(c => String.fromCharCode(c)).join('');
              }, //aesjs.util.convertBytesToString(b);
              str2bin = function(s) {
                return s.split('').map(c => c.charCodeAt(0));
              }, //aesjs.util.convertStringToBytes(s));
              aesBS = 16,
              zeroPad = function(b) {
                let l = b.length;
                if (l % aesBS !== 0) {
                    if (typeof(b) === 'string') b += '\0'.repeat(aesBS - (l % aesBS));
                    else b = b.concat(Array.apply(null, Array(aesBS - (l % aesBS))).map(() => 0));
                }
                return b;
              },
              zeroUnpad = (s => s.replace(/\0+$/, '')),
              urlsep = '\xa4';

        function decryptURL(hasTrack, url, raw) {
            var i = url.lastIndexOf('/');
            if (i >= 0) url = url.substr(i + 1);
            let decrypted = zeroUnpad(bin2str(urlCryptor.decrypt(hex2bin(url)))).split(urlsep);
            if (raw) return decrypted;
            if (hasTrack(decrypted[3])) return getTrack(decrypted[3]);
            return {
                SNG_ID: decrypted[3],
                MD5_ORIGIN: decrypted[1],
                MEDIA_VERSION: decrypted[4],
                chosen_fmt: decrypted[2],
                h: decrypted[0],
                e: decrypted[5]
            };
        }

        function encryptURL(track, fmt) {
            let str = [track.MD5_ORIGIN, fmt, track.SNG_ID, track.MEDIA_VERSION].join(urlsep);
            str = zeroPad([hex_md5(str), str, ''].join(urlsep));
            return bin2hex(urlCryptor.encrypt(str2bin(str)));
        }

        // DOWNLOADER LOGIC: GLOBAL VARIABLES AND HELPER METHODS
        const fmtMisc = 0, fmtLow = 10, fmtLow32 = 11, fmtMed = 1, fmtHQ = 3, fmtFLAC = 9,
              flagTitle = 1, flagArt = 3, flagHash = 16, flagVer = 32, flagFmt = 64;

        function generateName(track, fmt, flags) {
            var name = ''; //Replace track.SNG_ID with ''
            if ((flags & flagHash) == flagHash && (name += `[` + track.SNG_ID + `_` + track.MD5_ORIGIN + `] `),
                (flags & flagVer) == flagVer && (name += `[` + track.SNG_ID + `_v` + track.MEDIA_VERSION + `] `),
                (flags & flagArt) == flagArt && (name += track.ART_NAME.toUpperCase() + ` - `), //Having .toUpperCase() for generate Name > NAME, and invert place with '-'
                (flags & flagTitle) == flagTitle && (name += ` ` + track.SNG_TITLE, track.VERSION && '' !== track.VERSION && (name += ` ` + track.VERSION)), fmt == fmtFLAC) name += '.flac';
            else if ((flags & flagFmt) == flagFmt) {
                switch (fmt) {
                    case fmtMisc:
                        name += '.default';
                        break;
                    case fmtLow:
                        name += '.lq';
                        break;
                    case fmtLow32:
                        name += '.32';
                        break;
                    case fmtMed:
                        name += '.sq';
                        break;
                    case fmtHQ:
                        name += '.hq';
                        break;
                }
                name += '.mp3';
            } else if (fmt >= 0) name += '.mp3';
            return name;
        }

        let bfGK = 'g4el58wc0zvf9na1';

        function bfGenKey2(h1, h2) {
            let l = h1.length,
                s = [];
            for (var i = 0; i < l; i++) s.push(bfGK.charCodeAt(i) ^ h1.charCodeAt(i) ^ h2.charCodeAt(i));
            return s;
        }

        function bfGenKey(id, format) {
            let h = hex_md5(id + ''),
                h1 = h.substr(0, 16),
                h2 = h.substr(16, 16),
                k = bfGenKey2(h1, h2);
            if (!format) return k;
            return k.map(format == 'hex' ? (a => (a + 256).toString(16).substr(-2)) : (a => String.fromCharCode(a))).join('');
        }

        const trackDB = {},
              urlDB = {};

        function hasTrack(id) {
            return trackDB.hasOwnProperty(id + '');
        }

        function getTrack(id) {
            return hasTrack(id) ? trackDB[id + ''] : null;
        }

        function hasDownloaded(id, fmt) {
            if (!urlDB.hasOwnProperty(id + '')) return false;
            let urls = urlDB[id + ''];
            return urls.hasOwnProperty(fmt);
        }

        function getDownloaded(id, fmt) {
            return hasDownloaded(id, fmt) ? urlDB[id + ''][fmt] : null;
        }

        function FileConvertSize(aSize) {
            aSize = Math.abs(parseInt(aSize, 10));
            const def = [
                  [1, 'octets'],
                  [1024, 'ko'],
                  [1024 * 1024, 'Mo'],
                  [1024 * 1024 * 1024, 'Go'],
                  [1024 * 1024 * 1024 * 1024, 'To']
            ];
            for (var i = 0; i < def.length; i++) {
                if (aSize < def[i][0]) return (aSize / def[i - 1][
                        0
                    ]).toFixed(2) + ' ' + def[i - 1]
                    [1];
            }
        }

        // DOWNLOAD ENTRY POINT
        function dzDownload(obj, userdata, fmt, size) {
            const msg = [
                    'https://e-cdns-proxy-' + obj.MD5_ORIGIN.charAt(0) + '.dzcdn.net' +
                        '/mobile/1/' + encryptURL(obj, fmt),
                    bfGenKey(obj.SNG_ID),
                    userdata + ',' + fmt
            ];
            if(GM_Debug) { gm_win.console.log(msg); }
            mainWk.postMessage(msg);
        }

        // DOWNLOADER WORKER CALLBACK
        mainWk.onmessage = function(msg) {
            let userdata = msg.data[0].split(','),
                elId = userdata[0],
                fmt = userdata[1],
                trackEl = D.querySelector('#' + elId);
            if (trackEl === null) return;
            let trackId = trackEl.dataset.trackId,
                state = msg.data[1];
            if (state == 'DONE') {
                if (!hasTrack(trackId)) {
                    gm_win.console.error( `On download: MISSING TRACK INFO!`, trackId ),//Required (not only in debug mode)
                    trackEl.querySelector('.status').style.display = 'none',
                    trackEl.querySelector('.links').style.display = 'block';
                    return;
                }
                if (!urlDB[trackId + '']) urlDB[trackId + ''] = {};
                urlDB[trackId + ''][fmt] = msg.data[2];
                let links = trackEl.querySelectorAll('a.dl');
                for (var i = 0; i < links.length; i++) {
                    if (links[i].dataset.fmt == fmt) {
                        links[i].download = generateName(getTrack(trackId), fmt, W.dzDL.dlFlags),
                        links[i].href = msg.data[2],
                        W.setTimeout((function(l) {
                            return function() {
                                l.click();
                            };
                        })(links[i]), 10);
                        break;
                    }
                }
            } else if (state == 'ABORT') {
                gm_win.console.error( `Download abort:`, trackId, fmt );//Required (not only in debug mode)
            } else if (state == 'ERROR') {
                gm_win.console.error( `Download ERROR!`, trackId, fmt );//Required (not only in debug mode)
            } else {
                trackEl.querySelector('.status').innerHTML = state;
                return;
            }
            trackEl.querySelector('.status').style.display = 'none',
            trackEl.querySelector('.links').style.display = 'block';
        };

        // DOWNLOADER LOGIC: HTML GENERATOR
        const rootEl = D.createElement('div');

        function getFilesize(track, fmt_name) {
            if (!track.hasOwnProperty('FILESIZE_' + fmt_name)) return 0;
            if (track['FILESIZE_' + fmt_name] === '' || track['FILESIZE_' + fmt_name] === 0) return 0;
            let size = parseInt(track['FILESIZE_' + fmt_name]);
            return isNaN(size) ? 0 : size;
        }

        function generateDl(track, fmt_name, fmt_id, size) {
            let msgSize = /*'size: ' +*/ FileConvertSize(size), //Use FileConvertSize fn() to have size 'human readable'
                el = D.createElement('a');
            //el.href = '#',
            el.className = 'dl',
            el.dataset.fmt = fmt_id,
            el.dataset.filesize = size,
            //el.dataset.trackUrl = '',
            el.innerHTML = fmt_name,
            el.title = msgSize,
            el.onclick = function() {
                let trackEl = this.parentElement.parentElement; // a <- links <- trackdl
                if (hasDownloaded(trackEl.dataset.trackId, this.dataset.fmt)) //(this.dataset.trackUrl != "")
                    return true; // we already have a link. href should also be set.
                else {
                    //this.href = '#';
                    this.removeAttribute('download');
                }
                if (!hasTrack(trackEl.dataset.trackId)) {
                    gm_win.console.warn(`NO INFORMATION ABOUT TRACK!`, trackEl.dataset.trackId);//Required (not only in debug mode)
                    return false;
                }
                let track = trackDB[trackEl.dataset.trackId + ''];
                trackEl.querySelector('.links').style.display = 'none',
                trackEl.querySelector('.status').style.display = 'inline-block',
                dzDownload(track, trackEl.id, this.dataset.fmt, this.dataset.filesize);
                return false;
            };
            return el;
        }

        function generateTrackDiv(track, index) {
            trackDB[track.SNG_ID + ''] = track;
            let trackEl = D.createElement('div');
              trackEl.className = 'trackdl',
              trackEl.id = 'trackdl' + Math.floor(Math.random() * 900000 + 100000),
              trackEl.dataset.trackId = track.SNG_ID;
              //trackEl.dataset.trackUrl = '';
            let nameEl = D.createElement('span');
              nameEl.className = 'name',
              nameEl.innerHTML = (index ? index + '. ' : '') + generateName(track, -1, flagTitle | flagArt); // don't add extension here
            let linksEl = D.createElement('div');
              linksEl.className = 'links'//,
            //  linksEl.innerHTML = '▶ ';
            let statusEl = D.createElement('div');
              statusEl.className = 'status',
              statusEl.style.display = 'none',
              statusEl.innerHTML = 'Waiting for download...';
            var miscFilesize = 0;
            if (track.hasOwnProperty('FILESIZE') && track.FILESIZE !== 0 && track.FILESIZE !== '') miscFilesize = parseInt(track.FILESIZE);
              else miscFilesize = getFilesize(track, 'MISC');
            //if (miscFilesize > 0) linksEl.appendChild(generateDl(track, '♪ default ', fmtMisc, miscFilesize));//REMOVE: redundancy
            if (getFilesize(track, 'MP3_32') > 0) linksEl.appendChild(generateDl(track, '♪  mp3 (32)', fmtLow32, getFilesize(track, 'MP3_32')));
            if (getFilesize(track, 'MP3_64') > 0) linksEl.appendChild(generateDl(track, '♪ mp3 (64)', fmtLow, getFilesize(track, 'MP3_64')));
            if (getFilesize(track, 'MP3_128') > 0) linksEl.appendChild(generateDl(track, '♪ mp3 (128)', fmtMed, getFilesize(track, 'MP3_128')));
            if (getFilesize(track, 'MP3_320') > 0) linksEl.appendChild(generateDl(track, '♪ mp3 (320)', fmtHQ, getFilesize(track, 'MP3_320')));
            if (getFilesize(track, 'FLAC') > 0) linksEl.appendChild(generateDl(track, '♪ FLAC', fmtFLAC, getFilesize(track, 'FLAC')));
            trackEl.appendChild(nameEl),
              trackEl.appendChild(linksEl),
              trackEl.appendChild(statusEl),
              trackEl.appendChild((function() {
                  var el = D.createElement('div');
                  el.className = 'endfloat';
                  return el;
              })());
            return trackEl;
        }

        // ENTRY POINTS
        function deleteElement(id) {
            var trackEl = id;
            if (typeof(id) === 'string') trackEl = D.querySelector('#' + id);
            if (hasTrack(trackEl.dataset.trackId)) {
                let urls = urlDB[trackEl.dataset.trackId + ''];
                for (var fmt in urls)
                    if (urls.hasOwnProperty(fmt)) {
                        W.URL.revokeObjectURL(urls[fmt]);
                    }
            }
            trackEl.parentElement.removeChild(trackEl);
        }

        function addTrack(track) {
            let el = generateTrackDiv(track),
                delEl = D.createElement('a');
            delEl.href = '#',
            delEl.className = 'deltrack',
            delEl.onclick = function() {
                W.dzDL.deleteCustom(this.parentElement);
            },
            delEl.innerHTML = '[X]',
            el.insertBefore(el.children[0], delEl),
            D.querySelector('#dlcustomtracks').appendChild(el); //divCustomTracks
            return el.id; //el
        }

        let divCurrentTrack = null,
            divTracklist = D.createElement('div');

        function refreshTracklist() {
                // Clean up EVERYTHING
                if (divCurrentTrack !== null) {
                    deleteElement(divCurrentTrack),
                    divCurrentTrack = null;
                }
                var tracks = divTracklist.querySelectorAll('.trackdl');
                for (var i = 0; i < tracks.length; i++) deleteElement(tracks[i]);
                //rootEl.appendChild(elH1);
                if (W.dzPlayer) {
                    var sng = W.dzPlayer.getCurrentSong();
                    if (sng && sng.SNG_ID) {
                        divCurrentTrack = generateTrackDiv(sng),
                        rootEl //.appendChild
                            .insertBefore(divCurrentTrack, elH2);
                    }
                }
                //rootEl.appendChild(elH2);
                if (W.dzPlayer) {
                    var list = W.dzPlayer.getTrackList(),
                        current = W.dzPlayer.getTrackListIndex();
                    if (list) {
                        var digits = list.length.toString().length;
                        for (var c = 0; c < list.length; c++) {
                            var trackDiv = generateTrackDiv(list[c], '0'.repeat(digits - (c + 1).toString().length) + (c + 1));
                            if (c == current) trackDiv.classList.add('current');
                            divTracklist.appendChild(trackDiv);
                        }
                    }
                }
                return false;
        }

        // DATA STYLESHEET.
        function _dzAppCss_(newStyle) {
            var styleElement = D.getElementById('dzApp_styles_js'),
                appCss =
                  '.dltitle { font-weight: bolder; padding-top: 3px; padding-bottom: 3px; color: color: #92929d; margin-left: 7px }' +
                  '#dzdownloader { position: fixed; top: 0; z-index: 500; background: #191922; padding: 5px; max-height: 90%; overflow-y: auto; width:40% }' +
                  '#dzdltrigger { position: fixed; left: 0; top: 0; z-index: 501; background-color: #ef5466; color: white; padding: 6px; text-align: center; }' +
                  '.trackdl .status { float: right } .trackdl .links { float: right } .trackdl:nth-child(even) { background: #121216 }' +
                  'a.dl {color: #92929d;}'+
                  '.trackdl a.dl { margin-left: 4px color: #92929d }' + // Some others 'improvements'
                  '#page_sidebar { z-index: 2; top: 20px !important }' + // Fix Deezer's sidebar height
                  '.trackdl.current { background: #808284; color: #e8eaed; font-weight: lighter } .dl,#dzdltrigger { letter-spacing: -1px } .dltitle:first-letter { font-size: 1.2em }' +
                  '.dl[download]:not(after) { text-decoration: line-through } #dlrefresh { float: right; color: #92929d } .dltitle,.trackdl { margin-top: .12em } .dl { font-size: 1.02em }' +
                  '.deltrack { margin-right: 3px } #dzdownloader .endfloat { clear: both } .trackdl.current a.dl { color: #e8eaed } #dzdltrigger,#dzdownloader { font-size: 1.05em }' +
                  '.trackdl.current a.dl[download] { color: #595959 } #dzdltrigger:hover { cursor: pointer } select { margin-left: 0px; background-color: #191922; border-color: #808284; color: #808284 }' +
                  '.dltitle:after { content: " : "; position: relative } .dl:after,.dl[download]:after { content: " "; text-decoration: none!important }';
            if (!styleElement) {
                styleElement = D.createElement('style'),
                styleElement.type = 'text/css',
                styleElement.innerHTML = appCss,
                styleElement.id = 'dzApp_styles_js',
                D.getElementsByTagName('head')[0].appendChild(styleElement);
            }
            styleElement.appendChild(D.createTextNode(newStyle));
        }  //End _dzAppCss_ fn

        // THE DOWNLOADER PANEL
        rootEl.style.left = '220px',
          rootEl.id = 'dzdownloader',
          rootEl.className = 'dzdl';

        var elCombo = D.createElement('select');var IDtxt="[ID_hash_v] ";
          elCombo.title = translate(`Choose the file name`),
          elCombo.innerHTML =
              //ADDING translation + REMOVE redundancy
              '<option value="' + (flagTitle) + '" selected>' + `⋯ ` + translate(`Choose`) + ` ⋯` + '</option>' +  //Having 'selected' here
              '<option value="' + (flagTitle) + '">' + translate(`Title`) + '</option>' +
              '<option value="' + (flagTitle | flagArt) + '">' + translate(`Artist`).toUpperCase() + ` - ` + translate(`Title`) + '</option>' +
              '<option value="' + (flagVer | flagTitle) + '">' + `[ID_v] ` + translate(`Title`) + '</option>' +
              '<option value="' + (flagVer | flagArt) + '">' + `[ID_v] ` + translate(`Artist`).toUpperCase() + ` - ` + translate(`Title`) + '</option>' +
              '<option value="' + (flagHash | flagVer | flagTitle) + '">' + `[ID_hash_v] ` + translate(`Title`) + '</option>' +
              '<option value="' + (flagHash | flagVer | flagArt) + '">' + `[ID_hash_v] ` + translate(`Artist`).toUpperCase() + ` - ` + translate(`Title`) + '</option>',
          elCombo.onclick = function() {
              W.dzDL.dlFlags = parseInt(this.value);
          };

        var elRefresh = D.createElement('a');
          elRefresh.id = 'dlrefresh', elRefresh.href = '#', elRefresh.innerHTML = `⟳ ` + translate(`refresh track list`),
          elRefresh.onclick = function() {
              if(GM_Debug) { gm_win.console.info( `Refreshing the Track List.` ); }
              W.dzDL.refreshPlayer();
              return false;
          };

        var elH1 = D.createElement('p');
          elH1.className = 'dltitle', elH1.innerHTML = `♨ ` + translate(`Current track`);

        var elH2 = D.createElement('p');
          elH2.className = 'dltitle', elH2.innerHTML = `⛃ ` + translate(`Track list`);

        var elH3 = D.createElement('p');
          //elH3.className = 'dltitle', elH3.innerHTML = `⛂ User-added tracks`;

          divTracklist.id = 'dltracklist',
          divTracklist.className = 'dllist';

        var divCustomTracks = D.createElement('div');
          divCustomTracks.id = 'dlcustomtracks',
          divCustomTracks.className = 'dllist',
          rootEl.style.display = 'none',
          rootEl.appendChild(elCombo),
          rootEl.appendChild(elRefresh),
          rootEl.appendChild(elH1),
          rootEl.appendChild(elH2),
          rootEl.appendChild(divTracklist),
          //rootEl.appendChild(elH3),
          rootEl.appendChild(divCustomTracks);

        refreshTracklist();
        W.setTimeout(refreshTracklist, 1000);

        var triggerEl = D.createElement('div');
          triggerEl.style.width = '214px', //padding is 3 => 220 total
          triggerEl.id = 'dzdltrigger',
          triggerEl.title = translate(`Click to open the app`),
          triggerEl.innerHTML = 'D➲wnloader ☰',
          triggerEl.onclick = function() {
              var el = D.querySelector('#dzdownloader'); //rootEl
                  el.style.display=(el.style.display!=='block')? 'none' : 'block';
              if (el.style && el.style.display) {
                  if (el.style.display == 'none') {
                      el.style.display = 'block',
                      this.innerHTML = 'D➲wnloader ⚟';
                  } else {
                      el.style.display = 'none',
                      this.innerHTML = 'D➲wnloader ☰';
                  }
              }
              refreshTracklist();
          };

        D.body.appendChild(triggerEl), D.body.appendChild(rootEl);

        _dzAppCss_(); // Applying StyleSheet to the app.
      
        //ESCAPING DOWNLOADER WINDOW POPUP
        W.onload = D.addEventListener('keydown', e => {
            if (e.which === 27) { // escape being used
                if(GM_Debug) { gm_win.console.info( `key with code ` + e.which + ` (escape) was pressed. We quit the app.` ); }
                var node = D.querySelector('#dzdownloader'); //rootEl
                node.style.display=(node.style.display=='block')? 'none' : 'block';
                if (node.style && node.style.display) {
                    node.style.display = 'none', triggerEl.innerHTML = 'D➲wnloader ☰';
                }
                e.preventDefault();
            }
            else { // Other keycode pressed. May be useful.
                if(GM_Debug) { gm_win.console.info( `key with code ` + e.which + ` was pressed.` ); }
            }
        },0);

//    https://blog.sessionstack.com/how-to-track-changes-in-the-dom-using-mutation-observer-bafdac65bca5
//    console.log(`content has changed`);
//    W.dzPlayer.getTrackList();refreshTracklist();

        const dzDL = {
            DEFAULT: fmtMisc, MP3_64: fmtLow, MP3_32: fmtLow32, MP3: fmtMed, MP3_128: fmtMed, MP3_320: fmtHQ, HQ: fmtHQ, FLAC: fmtFLAC, LOSSLESS: fmtFLAC,
            WITH_TITLE: flagTitle, WITH_ART: flagArt, WITH_HASH: flagHash, WITH_VER: flagVer, WITH_FMT: flagFmt, NAME_DEFAULT: flagTitle | flagArt, NAME_DB: flagHash | flagVer,
            // CONFIGURATION
            dlFlags: flagHash | flagVer | flagTitle,
            // MISCELLANEOUS FUNCTIONS
            hasTrackInDB: hasTrack, getTrackFromDB: getTrack, hasDownloadedTrack: hasDownloaded, getDownloadedTrack: getDownloaded, generateFileName: generateName,
            // ENTRY POINTS
            getFromURL: decryptURL, makeURL: encryptURL, download: dzDownload, deleteCustom: deleteElement, addCustom: addTrack, refreshPlayer: refreshTracklist
        };

        W.dzDL = dzDL; if (!W.dzHAX) W.dzHAX = {}, W.dzHAX.dL = dzDL;

    } //END _dzApp_ fn

    function _dzLogoCss_(newStyle) {
        var styleElement = D.getElementById('dzLogo_styles_js'),
            LogoCss =
              '.logo-deezer{ height: 55px }' +
              '.index-header-logo { width: 227px; max-width: 100%; height: 65px }' +
              '.logo-deezer.logo,.logo-deezer-hp.logo.index-header-logo { \
                  background-position: center; background-repeat: no-repeat; background-size: contain; \
                  background-image:url("https://framapic.org/5RWAy9Zz6ekd/X7hftDFqC9MY.png") \
              }' +
              '.nav-main.nav { margin-top: 8px!important } #menu_search { z-index: 2 } #menu_navigation { top: 135px }';
        if (!styleElement) {
            styleElement = D.createElement('style'),
            styleElement.type = 'text/css',
            styleElement.innerHTML = LogoCss,
            styleElement.id = 'dzLogo_styles_js',
            D.getElementsByTagName('head')[0].appendChild(styleElement);
        }
        styleElement.appendChild(D.createTextNode(newStyle));
    }  //End _dzLogoCss_ fn

    function _gmAlertCss_(newStyle) {
        var styleElement = D.getElementById('GM_styles_js'),
            FIXME = `( ℹ ) Greasemonkey :     Works, but you needs to reclick a second time on the link (after the conversion is done).`, //see document.write 
            gmCss =
              '#dlrefresh:after { \
                  content: " (" attr(FIXME) ")"; \
                  font-size: .7em; top: .8em; right: 0; text-align: left; position: absolute; ligne-height: .82em; \
                  letter-spacing: -0.5px; display: table; width: 30% \
               }';
        if (!styleElement) {
            styleElement = D.createElement('style'),
            styleElement.type = 'text/css',
            styleElement.innerHTML = gmCss,
            styleElement.id = 'GM_styles_js',
            styleElement.title = FIXME,
            D.getElementsByTagName('head')[0].appendChild(styleElement);
        }
        styleElement.appendChild(D.createTextNode(newStyle));
    }  //End _gmAlertCss_ fn

})(window, 'script', 'css');
