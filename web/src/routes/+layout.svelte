<script lang="ts">
    import "../app.css";
    import "../fonts/noto-mono-cobalt.css";

    import "@fontsource/ibm-plex-mono/400.css";
    import "@fontsource/ibm-plex-mono/400-italic.css";
    import "@fontsource/ibm-plex-mono/500.css";

    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { updated } from "$app/stores";
    import { browser } from "$app/environment";
    import { afterNavigate } from "$app/navigation";

    import "$lib/polyfills";
    import env from "$lib/env";
    import locale from "$lib/i18n/locale";
    import settings from "$lib/state/settings";

    import { t } from "$lib/i18n/translations";

    import { device, app } from "$lib/device";
    import { getServerInfo } from "$lib/api/server-info";
    import currentTheme, { statusBarColors } from "$lib/state/theme";
    import { turnstileCreated, turnstileEnabled } from "$lib/state/turnstile";
    import { turnstileSolved } from "$lib/state/turnstile";

    import Sidebar from "$components/sidebar/Sidebar.svelte";
    import Turnstile from "$components/misc/Turnstile.svelte";
    import NotchSticker from "$components/misc/NotchSticker.svelte";
    import DialogHolder from "$components/dialog/DialogHolder.svelte";
    import ProcessingQueue from "$components/queue/ProcessingQueue.svelte";
    import UpdateNotification from "$components/misc/UpdateNotification.svelte";

    $: reduceMotion =
        $settings.accessibility.reduceMotion || device.prefers.reducedMotion;

    $: reduceTransparency =
        $settings.accessibility.reduceTransparency ||
        device.prefers.reducedTransparency;

    $: preloadAssets = false;
    $: plausibleLoaded = false;

    let showGlobalBotCheckWarning = false;
    let globalWarningTimeout: ReturnType<typeof setTimeout>;

    function showGlobalWarningWithDelay() {
        showGlobalBotCheckWarning = false;
        clearTimeout(globalWarningTimeout);
        globalWarningTimeout = setTimeout(() => {
            showGlobalBotCheckWarning = true;
        }, 10000); // 10 секунд
    }

    function reloadPage() {
        window.location.reload();
    }

    function closeGlobalWarning() {
        showGlobalBotCheckWarning = false;
    }

    afterNavigate(async () => {
        const to_focus: HTMLElement | null =
            document.querySelector("[data-first-focus]");
        to_focus?.focus();

        if ($page.url.pathname === "/") {
            await getServerInfo();
        }

        turnstileSolved.set(false);
        turnstileCreated.set(false);
    });

    onMount(() => {
        preloadAssets = true;
        showGlobalWarningWithDelay();
    });
</script>

<svelte:head>
    <meta name="description" content={$t("general.embed.description")} />
    <meta property="og:description" content={$t("general.embed.description")} />

    {#if env.HOST}
        <meta
            property="og:url"
            content="https://{env.HOST}{$page.url.pathname}"
        />
    {/if}

    {#if device.is.mobile}
        <meta
            name="theme-color"
            content={statusBarColors.mobile[$currentTheme]}
        />
    {:else}
        <meta
            name="theme-color"
            content={statusBarColors.desktop[$currentTheme]}
        />
    {/if}

    {#if plausibleLoaded || (browser && env.PLAUSIBLE_ENABLED && !$settings.privacy.disableAnalytics)}
        <script
            defer
            data-domain={env.HOST}
            on:load={() => {
                plausibleLoaded = true;
            }}
            src="https://{env.PLAUSIBLE_HOST}/js/script.js"
        ></script>
    {/if}
</svelte:head>

<div
    style="display: contents"
    data-theme={browser ? $currentTheme : undefined}
    lang={$locale}
>
    {#if showGlobalBotCheckWarning}
        <div class="bot-check-warning-overlay">
            <div class="bot-check-warning-modal" role="alert">
                <button class="close-btn" aria-label="Закрыть" on:click={closeGlobalWarning}>&times;</button>
                <div class="bot-check-warning-text">
                    Проверка на бота занимает слишком много времени. Если ничего не происходит более 10 секунд, попробуйте обновить страницу.
                </div>
                <button class="refresh-btn" on:click={reloadPage}>Обновить страницу</button>
            </div>
        </div>
    {/if}
    {#if preloadAssets}
        <div id="preload" aria-hidden="true">??</div>
    {/if}
    <div
        id="cobalt"
        class:loaded={browser}
        data-chrome={device.browser.chrome}
        data-iphone={device.is.iPhone}
        data-mobile={device.is.mobile}
        data-reduce-motion={reduceMotion}
        data-reduce-transparency={reduceTransparency}
    >
        {#if device.is.iPhone && app.is.installed}
            <NotchSticker />
        {/if}
        <DialogHolder />
        <Sidebar />
        {#if $updated}
            <UpdateNotification />
        {/if}
        <ProcessingQueue />
        <div id="content">
            {#if ($turnstileEnabled && $page.url.pathname === "/") || $turnstileCreated}
                <Turnstile />
            {/if}
            <slot></slot>
        </div>
    </div>
</div>

<style>
    #cobalt {
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns:
            calc(var(--sidebar-width) + var(--sidebar-inner-padding) * 2)
            1fr;
        overflow: hidden;
        background-color: var(--sidebar-bg);
        color: var(--secondary);
        position: fixed;
    }

    /* add padding for notch / dynamic island in landscape */
    @media screen and (orientation: landscape) and (min-width: 535px) {
        #cobalt[data-iphone="true"] {
            grid-template-columns:
                calc(
                    var(--sidebar-width) + var(--sidebar-inner-padding) * 2 +
                        env(safe-area-inset-left)
                )
                1fr;
        }

        #cobalt[data-iphone="true"] #content {
            padding-right: env(safe-area-inset-right);
        }
    }

    #content {
        display: flex;
        overflow: scroll;
        background-color: var(--primary);
        box-shadow: 0 0 0 var(--content-border-thickness) var(--content-border);
        margin-left: var(--content-border-thickness);
        border-top-left-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);
        grid-column: 2;
        grid-row: 1;
    }

    #content:dir(rtl) {
        margin-left: 0;
        margin-right: var(--content-border-thickness);
    }

    @media screen and (max-width: 535px) {
        /* dark navbar cuz it looks better on mobile */
        :global([data-theme="light"]) {
            --sidebar-bg: #000000;
            --sidebar-highlight: var(--primary);
        }

        #cobalt {
            display: grid;
            grid-template-columns: unset;
            grid-template-rows:
                1fr
                calc(
                    var(--sidebar-height-mobile) + var(--sidebar-inner-padding) * 2
                );
        }

        #content,
        #content:dir(rtl) {
            padding-top: env(safe-area-inset-top);
            order: -1;

            margin: 0;
            box-shadow: none;

            border-bottom-left-radius: calc(var(--border-radius) * 2);
            border-bottom-right-radius: calc(var(--border-radius) * 2);
            margin-left: 0;
            height: calc(100vh - var(--sidebar-height-mobile));
            grid-column: unset;
            grid-row: 1;
        }
    }

    /* preload assets to prevent flickering when they appear on screen */
    #preload {
        width: 0;
        height: 0;
        position: absolute;
        z-index: -10;
        content: url(/meowbalt/smile.png) url(/meowbalt/error.png)
            url(/meowbalt/question.png) url(/meowbalt/think.png);

        font-family: "Noto Sans Mono";
        font-size: 0;
        opacity: 0;

        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
    }

    .bot-check-warning-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.25);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .bot-check-warning-modal {
        background: #fffbe6;
        color: #b26a00;
        border: 1px solid #ffe58f;
        border-radius: 12px;
        padding: 24px 28px 20px 24px;
        font-size: 16px;
        max-width: 400px;
        min-width: 280px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        font-weight: 500;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 18px;
    }
    .bot-check-warning-text {
        margin-bottom: 4px;
    }
    .refresh-btn {
        background: #ffe58f;
        color: #b26a00;
        border: none;
        border-radius: 6px;
        padding: 8px 18px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
        align-self: flex-end;
    }
    .refresh-btn:hover {
        background: #ffd666;
    }
    .close-btn {
        position: absolute;
        top: 10px;
        right: 12px;
        background: none;
        border: none;
        font-size: 22px;
        color: #b26a00;
        cursor: pointer;
        font-weight: bold;
        line-height: 1;
        padding: 0;
    }
    .close-btn:hover {
        color: #ff4d4f;
    }
</style>
