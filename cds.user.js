// ==UserScript==
// @name         Pause Quiz Timer - CDS
// @version      1.0
// @match        https://thicongdanso.bacninh.gov.vn/take/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    function waitFor(selector, cb, timeout = 10000) {
        const start = Date.now();
        (function poll() {
            const el = document.querySelector(selector);
            if (el) return cb(el);
            if (Date.now() - start > timeout) return;
            setTimeout(poll, 150);
        })();
    }

    waitFor('#countdown', init);

    function init(countdownEl) {
        if (document.getElementById('userscript-pause-time-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'userscript-pause-time-btn';
        btn.type = 'button';
        btn.className = 'btn btn-warning';
        btn.style.marginRight = '10px';
        btn.style.marginTop = '6px';
        btn.textContent = 'Tạm dừng thời gian';

        const label = document.createElement('span');
        label.id = 'userscript-pause-label';
        label.style.marginLeft = '8px';
        label.style.fontWeight = 'bold';
        label.style.color = '#ffffff';

        countdownEl.parentNode.insertBefore(btn, countdownEl);
        countdownEl.parentNode.insertBefore(label, countdownEl.nextSibling);

        window.__pauseTimerData = window.__pauseTimerData || {
            paused: false,
            pauseStart: 0,
            totalPausedBefore: 0,
            lastElapsedAtPause: 0
        };

        function formatMs(ms) {
            if (!isFinite(ms) || ms < 0) ms = 0;
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms / 1000) % 60);
            return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
        }

        if (!window.__orig_updateCountdown && typeof window.updateCountdown === 'function') {
            window.__orig_updateCountdown = window.updateCountdown;
        }
        if (!window.__orig_saveTimeAndSubmit && typeof window.saveTimeAndSubmit === 'function') {
            window.__orig_saveTimeAndSubmit = window.saveTimeAndSubmit;
        }

        window.updateCountdown = function () {
            try { if (window.timerInterval) clearInterval(window.timerInterval); } catch (e) { /*ignore*/ }

            window.timerInterval = setInterval(function () {
                if (!window.startTime || !window.countdownTime) return;

                const pdata = window.__pauseTimerData;
                const now = Date.now();

                let totalPaused = pdata.totalPausedBefore || 0;
                if (pdata.paused) totalPaused += (now - pdata.pauseStart);

                const elapsedExcludingPause = now - window.startTime - totalPaused;
                let remaining = (window.countdownTime || 0) - elapsedExcludingPause;

                if (pdata.paused) {
                    const remainingAtPauseMs = Math.max((window.countdownTime || 0) - (pdata.lastElapsedAtPause || elapsedExcludingPause), 0);
                    countdownEl.textContent = formatMs(remainingAtPauseMs) + ' (Đã tạm dừng)';
                    label.textContent = '';
                    return;
                }

                if (remaining <= 0) {
                    clearInterval(window.timerInterval);
                    if (typeof window.saveTimeAndSubmit === 'function') {
                        try { window.saveTimeAndSubmit(); } catch (e) { console.error(e); }
                    } else {
                        const form = document.querySelector('#v-pills-tabContent');
                        if (form) form.submit();
                    }
                    return;
                }

                countdownEl.textContent = formatMs(remaining);
                label.textContent = '';
            }, 1000);
        };

        btn.addEventListener('click', function () {
            const pdata = window.__pauseTimerData;
            if (!pdata.paused) {
                pdata.paused = true;
                pdata.pauseStart = Date.now();
                pdata.lastElapsedAtPause = pdata.pauseStart - (window.startTime || pdata.pauseStart) - (pdata.totalPausedBefore || 0);
                btn.textContent = 'Tiếp tục thời gian';
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-success');
                const remainingAtPauseMs = Math.max((window.countdownTime || 0) - pdata.lastElapsedAtPause, 0);
                countdownEl.textContent = formatMs(remainingAtPauseMs) + ' (Đã tạm dừng)';
            } else {
                pdata.paused = false;
                const pausedFor = Date.now() - pdata.pauseStart;
                pdata.totalPausedBefore = (pdata.totalPausedBefore || 0) + pausedFor;
                pdata.pauseStart = 0;
                btn.textContent = 'Tạm dừng thời gian';
                btn.classList.remove('btn-success');
                btn.classList.add('btn-warning');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'p' || e.key === 'P') {
                const tgt = e.target;
                const tag = tgt && tgt.tagName ? tgt.tagName.toLowerCase() : '';
                if (tag === 'input' || tag === 'textarea' || tgt.isContentEditable) return;
                btn.click();
            }
        });

        window.saveTimeAndSubmit = function () {
            try { if (window.timerInterval) clearInterval(window.timerInterval); } catch (e) { /*ignore*/ }

            const pdata = window.__pauseTimerData || { paused: false, pauseStart: 0, totalPausedBefore: 0, lastElapsedAtPause: 0 };
            const start = window.startTime || 0;
            const maxTime = window.countdownTime || (10 * 60 * 1000);

            let quizSecondsToSend = 0;
            let quizTimeView = '00:00';

            if (pdata.paused) {
                const elapsedAtPause = (typeof pdata.lastElapsedAtPause === 'number' && pdata.lastElapsedAtPause > 0)
                    ? pdata.lastElapsedAtPause
                    : Math.max(0, (pdata.pauseStart - start - (pdata.totalPausedBefore || 0)));
                const elapsedClamped = Math.max(0, Math.min(elapsedAtPause, maxTime));
                quizSecondsToSend = Math.floor(elapsedClamped / 1000);
                if (quizSecondsToSend < 0) quizSecondsToSend = 0;
                if (quizSecondsToSend > Math.ceil(maxTime / 1000)) quizSecondsToSend = Math.ceil(maxTime / 1000);
                quizTimeView = formatMs(elapsedClamped);
            } else {
                const totalPaused = pdata.totalPausedBefore || 0;
                let elapsed = Date.now() - start - totalPaused;
                if (elapsed < 0) elapsed = 0;
                if (elapsed > maxTime) elapsed = maxTime;
                quizSecondsToSend = Math.floor(elapsed / 1000);
                quizTimeView = formatMs(elapsed);
            }

            const quizTimeViewEl = document.getElementById('quiz_time_view');
            const quizTimeEl = document.getElementById('quiz_time');
            if (quizTimeViewEl) quizTimeViewEl.value = quizTimeView;
            if (quizTimeEl) quizTimeEl.value = quizSecondsToSend;

            const form = document.querySelector('#v-pills-tabContent');
            if (form) {
                form.submit();
                return;
            }

            if (typeof window.__orig_saveTimeAndSubmit === 'function') {
                try { window.__orig_saveTimeAndSubmit(); } catch (e) { console.error(e); }
            }
        };

        try { window.updateCountdown(); } catch (e) { /*ignore*/ }

        console.log('Userscript: Injected pause button; when submitting while paused, will send elapsed seconds at pause (elapsed = countdown - remaining).');
    }
})();
