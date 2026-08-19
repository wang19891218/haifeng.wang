(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,47196,e=>{"use strict";var t=e.i(43476),r=e.i(71645);let a=`
(function () {
  var assetUrlByPath = window.__presentationAssetUrls || {};

  function resolveAssetUrl(rawValue) {
    if (typeof rawValue !== 'string' || rawValue.length === 0) {
      return rawValue;
    }
    var firstCharacter = rawValue.charAt(0);
    if (firstCharacter === '#' || firstCharacter === '?') {
      return rawValue;
    }
    if (rawValue.indexOf('blob:') === 0 || rawValue.indexOf('data:') === 0) {
      return rawValue;
    }

    var candidatePath = rawValue;
    while (candidatePath.indexOf('./') === 0) {
      candidatePath = candidatePath.slice(2);
    }
    if (Object.prototype.hasOwnProperty.call(assetUrlByPath, candidatePath)) {
      return assetUrlByPath[candidatePath];
    }

    if (candidatePath.indexOf('figures/') === 0 ||
        candidatePath.indexOf('assets/') === 0) {
      console.warn(
        'Encrypted deck: no decrypted asset matches "' + rawValue +
        '". The reference will not resolve.'
      );
    }
    return rawValue;
  }

  var imageSourceDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype, 'src'
  );
  if (imageSourceDescriptor && imageSourceDescriptor.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      enumerable: imageSourceDescriptor.enumerable,
      get: function () {
        return imageSourceDescriptor.get.call(this);
      },
      set: function (value) {
        imageSourceDescriptor.set.call(this, resolveAssetUrl(value));
      }
    });
  }

  var originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    var lowerCaseName = String(name).toLowerCase();
    if (lowerCaseName === 'src' || lowerCaseName === 'href' ||
        lowerCaseName === 'xlink:href') {
      return originalSetAttribute.call(this, name, resolveAssetUrl(value));
    }
    return originalSetAttribute.call(this, name, value);
  };

  ['pushState', 'replaceState'].forEach(function (methodName) {
    var originalMethod = window.history[methodName];
    if (typeof originalMethod !== 'function') {
      return;
    }
    window.history[methodName] = function () {
      try {
        return originalMethod.apply(window.history, arguments);
      } catch (error) {
        return undefined;
      }
    };
  });
})();
`;async function n(e,t,r){let a=await window.crypto.subtle.importKey("raw",new TextEncoder().encode(e),"PBKDF2",!1,["deriveKey"]);return window.crypto.subtle.deriveKey({name:"PBKDF2",salt:t,iterations:r,hash:"SHA-256"},a,{name:"AES-GCM",length:256},!1,["decrypt"])}async function o(e,t){let r=await fetch(e,{cache:"force-cache"});if(!r.ok)throw Error(`Could not download the presentation (HTTP ${r.status}).`);let a=r.headers.get("content-length"),n=a?Number(a):0;if(!r.body||n<=0)return t(null),new Uint8Array(await r.arrayBuffer());let o=r.body.getReader(),s=[],i=0;for(;;){let{done:e,value:r}=await o.read();if(e)break;s.push(r),t(Math.min(1,(i+=r.length)/n))}let l=new Uint8Array(i),c=0;for(let e of s)l.set(e,c),c+=e.length;return l}function s(){return new Promise(e=>{window.requestAnimationFrame(()=>window.setTimeout(e,0))})}function i({bundleUrl:e,title:i,description:l,backHref:c,approximateDownloadSize:d="14 MB"}){let[u,h]=(0,r.useState)(""),[f,p]=(0,r.useState)("locked"),[m,y]=(0,r.useState)(""),[w,g]=(0,r.useState)(""),[b,x]=(0,r.useState)(null),[k,v]=(0,r.useState)(null),A=(0,r.useRef)(null),S=(0,r.useRef)([]),T=(0,r.useRef)(null),j=(0,r.useCallback)(e=>{S.current.push(e)},[]);(0,r.useEffect)(()=>{A.current||(A.current=o(e,x).catch(e=>{throw A.current=null,e}))},[e]),(0,r.useEffect)(()=>{let e=S.current;return()=>{for(let t of e)URL.revokeObjectURL(t);e.length=0}},[]);let E=(0,r.useCallback)(async t=>{if(t.preventDefault(),"unlocking"!==f&&0!==u.length){g(""),p("unlocking");try{let t;if(!window.isSecureContext||!window.crypto?.subtle)throw Error("This browser will only decrypt over a secure connection. Open this page over HTTPS (or on localhost) and try again.");y("Downloading the encrypted presentation..."),A.current||(A.current=o(e,x));let r=await A.current;y("Checking the password..."),await s();let{salt:i,initialisationVector:l,iterationCount:c,ciphertext:d}=function(e){if(e.length<=41)throw Error("The encrypted presentation file is truncated.");let t=e.subarray(0,8);if("GNCPDECK"!==new TextDecoder("ascii").decode(t))throw Error("The downloaded file is not an encrypted presentation bundle.");let r=e[8];if(1!==r)throw Error(`Unsupported bundle format version ${r}. This page understands version 1.`);let a=9,n=e.subarray(a,a+16);a+=16;let o=e.subarray(a,a+12);a+=12;let s=new DataView(e.buffer,e.byteOffset+a,4).getUint32(0,!1);if(a+=4,s<1||s>5e6)throw Error(`The bundle header requests an implausible iteration count (${s}). Refusing to continue.`);return{salt:n,initialisationVector:o,iterationCount:s,ciphertext:e.subarray(a)}}(r),f=await n(u,i,c);try{t=await window.crypto.subtle.decrypt({name:"AES-GCM",iv:l,tagLength:128},f,d)}catch{throw Error("Incorrect password. Check for stray spaces, and note that the password is case sensitive.")}y("Assembling the slides..."),await s();let m=function(e){if(e.length<4)throw Error("The decrypted presentation container is truncated.");let t=4+new DataView(e.buffer,e.byteOffset,4).getUint32(0,!1);if(t>e.length)throw Error("The decrypted presentation manifest is truncated.");let r=JSON.parse(new TextDecoder("utf-8").decode(e.subarray(4,t)));if(!r||!Array.isArray(r.files))throw Error("The decrypted presentation manifest is malformed.");return{manifest:r,payload:e.subarray(t)}}(new Uint8Array(t)),w=function(e,t){let{manifest:r,payload:n}=e,o=e=>n.subarray(e.offset,e.offset+e.length),s=new Map;for(let e of r.files)s.set(e.path,e);let i=s.get(r.documentPath);if(!i)throw Error("The presentation bundle contains no entry document.");let l={};for(let e of r.files){if("asset"!==e.role)continue;let r=new Blob([o(e)],{type:e.mediaType}),a=URL.createObjectURL(r);t(a),l[e.path]=a}let c=new TextDecoder("utf-8").decode(o(i)),d=new DOMParser().parseFromString(c,"text/html"),u=e=>new TextDecoder("utf-8").decode(o(e));for(let e of Array.from(d.querySelectorAll('link[rel~="stylesheet"][href]'))){let t=e.getAttribute("href")??"",r=s.get(t);if(!r||"style"!==r.role)continue;let a=d.createElement("style");a.setAttribute("data-source-path",r.path),a.textContent=u(r),e.replaceWith(a)}for(let e of Array.from(d.querySelectorAll("script[src]"))){let t=e.getAttribute("src")??"",r=s.get(t);if(!r||"script"!==r.role)continue;let a=d.createElement("script");a.setAttribute("data-source-path",r.path),a.textContent=u(r),e.replaceWith(a)}let h=["src","href","xlink:href"];for(let e of Array.from(d.querySelectorAll("[src], [href], [xlink\\:href]")))for(let t of h){let r=e.getAttribute(t);if(null===r)continue;let a=l[r];a&&e.setAttribute(t,a)}let f=JSON.stringify(l).replace(/</g,"\\u003c"),p=d.createElement("script");p.textContent=`window.__presentationAssetUrls = ${f};
`+a;let m=d.head??d.documentElement;return m.insertBefore(p,m.firstChild),`<!doctype html>
${d.documentElement.outerHTML}`}(m,j),g=new Blob([w],{type:"text/html"}),b=URL.createObjectURL(g);j(b),v(b),p("unlocked"),h("")}catch(e){g(e instanceof Error?e.message:"The presentation could not be opened."),y(""),p("locked")}}},[e,u,j,f]),N=(0,r.useCallback)(()=>{T.current?.contentWindow?.focus()},[]);if("unlocked"===f&&k)return(0,t.jsxs)("div",{className:"fixed inset-0 z-50 bg-black",children:[(0,t.jsx)("iframe",{ref:T,src:k,title:i,onLoad:N,allow:"fullscreen",allowFullScreen:!0,className:"h-full w-full border-0"}),(0,t.jsx)("a",{href:c,className:"absolute left-3 top-3 z-10 rounded bg-black/40 px-2 py-1 text-xs text-white opacity-25 transition-opacity hover:opacity-100",children:"← Presentations"})]});let C="unlocking"===f,P=null===b?null:Math.round(100*b);return(0,t.jsx)("main",{className:"flex-1 bg-gray-50 dark:bg-gray-900",children:(0,t.jsxs)("div",{className:"mx-auto flex max-w-xl flex-col justify-center px-4 py-20 sm:px-6",children:[(0,t.jsxs)("div",{className:"rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800",children:[(0,t.jsxs)("div",{className:"mb-6 flex items-start gap-3",children:[(0,t.jsx)("svg",{className:"mt-1 h-6 w-6 flex-shrink-0 text-primary-700 dark:text-primary-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor","aria-hidden":"true",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:i}),(0,t.jsx)("p",{className:"mt-1 text-sm text-gray-600 dark:text-gray-400",children:l})]})]}),(0,t.jsx)("p",{className:"mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300",children:"This presentation is encrypted. Enter the password you were given to decrypt it in your browser. Nothing is sent to the server, and the slides are never stored unencrypted."}),(0,t.jsxs)("form",{onSubmit:E,children:[(0,t.jsx)("label",{htmlFor:"presentation-password",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Password"}),(0,t.jsx)("input",{id:"presentation-password",type:"password",autoComplete:"off",spellCheck:!1,value:u,disabled:C,onChange:e=>h(e.target.value),className:"mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 shadow-sm focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white"}),(0,t.jsx)("button",{type:"submit",disabled:C||0===u.length,className:"mt-4 w-full rounded-md bg-primary-700 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60",children:C?"Decrypting...":"Unlock presentation"})]}),C&&(0,t.jsxs)("p",{className:"mt-4 text-sm text-gray-600 dark:text-gray-400",role:"status",children:[m,null!==P&&P<100&&m.startsWith("Downloading")&&` ${P}%`]}),w&&(0,t.jsx)("p",{className:"mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/40 dark:text-red-200",role:"alert",children:w}),(0,t.jsxs)("p",{className:"mt-6 text-xs text-gray-500 dark:text-gray-500",children:["The deck is about ",d,". It is downloaded in the background while you type, then decrypted in one pass, so unlocking takes a few seconds."]})]}),(0,t.jsx)("a",{href:c,className:"mt-6 self-start text-sm text-primary-700 hover:underline dark:text-primary-400",children:"← Back to presentations"})]})})}e.s(["default",()=>i])}]);