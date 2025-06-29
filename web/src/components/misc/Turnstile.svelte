<script lang="ts">
    import { onMount } from "svelte";
    import { tick } from "svelte";

    import cachedInfo from "$lib/state/server-info";
    import { turnstileCreated } from "$lib/state/turnstile";

    import turnstile from "$lib/api/turnstile";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;
    let showBotCheckWarning = false;
    let warningTimeout: ReturnType<typeof setTimeout>;

    function showWarningWithDelay() {
        showBotCheckWarning = false;
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
            showBotCheckWarning = true;
        }, 1000); // 10 секунд
    }

    function reloadPage() {
        window.location.reload();
    }

    function closeWarning() {
        showBotCheckWarning = false;
    }

    onMount(() => {
        const sitekey = $cachedInfo?.info?.cobalt?.turnstileSitekey;
        if (!sitekey) return;

        $turnstileCreated = true;

        showWarningWithDelay();

        const setup = () => {
            window.turnstile?.render(turnstileElement, {
                sitekey,
                "refresh-expired": "never",
                "retry-interval": 800,

                "error-callback": (error) => {
                    return true;
                },
                "expired-callback": () => {
                    turnstile.reset();
                },
                callback: () => {
                    // intentionally do nothing
                }
            });
        }

        if (window.turnstile) {
            setup();
        } else {
            turnstileScript.addEventListener("load", setup);
        }

        return () => {
            clearTimeout(warningTimeout);
        };
    });
</script>

<svelte:head>
    <script
        bind:this={turnstileScript}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        defer
    ></script>
</svelte:head>

<div id="turnstile-container">
    <div bind:this={turnstileElement} id="turnstile-widget"></div>
    {#if showBotCheckWarning}
        <div class="bot-check-warning-overlay">
            <div class="bot-check-warning-modal" role="alert">
                <button class="close-btn" aria-label="Закрыть" on:click={closeWarning}>&times;</button>
                <div class="bot-check-warning-text">
                    Проверка на бота занимает слишком много времени. Если ничего не происходит более 10 секунд, попробуйте обновить страницу.
                </div>
                <button class="refresh-btn" on:click={reloadPage}>Обновить страницу</button>
            </div>
        </div>
    {/if}
</div>

<style>
    #turnstile-container {
        position: absolute;
        z-index: 999;
        right: 0;
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
