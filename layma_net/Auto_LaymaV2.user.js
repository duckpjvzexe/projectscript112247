// ==UserScript==
// @name         Layma.net Bypass - CUTTAY PROMAX
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  Auto nhiệm vụ lấy mã
// @author       DuckXkurumi
// @icon         https://files.catbox.moe/8p9l8w.jpg
// @match        https://layma.net/*
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-end
// @require      https://raw.githubusercontent.com/duckpjvzexe/projectscript112247/refs/heads/main/layma_net/FunctionV2.js
// @updateURL    https://github.com/duckpjvzexe/projectscript112247/raw/refs/heads/main/layma_net/Auto_LaymaV2.user.js
// @downloadURL  https://github.com/duckpjvzexe/projectscript112247/raw/refs/heads/main/layma_net/Auto_LaymaV2.user.js
// ==/UserScript==

window.WAIT_TIME = 80;
window.AUTO_CHANGE_MISSION_ON_ERROR = false;

if (typeof window.LayMaScript === 'function') {
    window.LayMaScript({
        'gmXhr': typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : null,
        'uWindow': typeof unsafeWindow !== 'undefined' ? unsafeWindow : null
    });
} else {
    console.error("Không tìm thấy thư viện. Vui lòng kiểm tra lại link @require!");
}
