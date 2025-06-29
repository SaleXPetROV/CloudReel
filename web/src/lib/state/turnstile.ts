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
