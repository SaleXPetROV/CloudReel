import settings from "$lib/state/settings";
import cachedInfo from "$lib/state/server-info";
import { derived, writable } from "svelte/store";

export const turnstileSolved = writable(false);
export const turnstileCreated = writable(false);

function isTelegramWebView() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Telegram|WebView|tg:\/\/|tgb|TDesktop|TWebView/.test(ua);
}

console.log("User-Agent:", navigator.userAgent, "isTelegramWebView:", isTelegramWebView());

export const turnstileEnabled = derived(
    [settings, cachedInfo],
    ([$settings, $cachedInfo]) => {
        if (isTelegramWebView()) return false;
        return !!$cachedInfo?.info?.cobalt?.turnstileSitekey &&
            !(
                $settings.processing.enableCustomApiKey &&
                $settings.processing.customApiKey.length > 0
            )
    }
)

if (typeof window !== 'undefined') {
    // Создаём или находим div для логов
    let logDiv = document.getElementById('debug-log');
    if (!logDiv) {
        logDiv = document.createElement('div');
        logDiv.id = 'debug-log';
        logDiv.style.position = 'fixed';
        logDiv.style.top = '0';
        logDiv.style.left = '0';
        logDiv.style.background = 'rgba(255,255,255,0.95)';
        logDiv.style.color = '#111';
        logDiv.style.zIndex = '99999';
        logDiv.style.fontSize = '12px';
        logDiv.style.padding = '8px';
        logDiv.style.border = '1px solid #ccc';
        logDiv.style.maxWidth = '90vw';
        logDiv.style.whiteSpace = 'pre-wrap';
        document.body.appendChild(logDiv);
    }

    // Ваши данные для логирования
    const ua = navigator.userAgent;
    const isTg = /Telegram|WebView|tg:\/\/|tgb|TDesktop|TWebView/.test(ua);

    // Выводим логи
    logDiv.innerText = `User-Agent: ${ua}\nisTelegramWebView: ${isTg}`;
}
