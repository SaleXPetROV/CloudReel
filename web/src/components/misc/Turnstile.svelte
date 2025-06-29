<script lang="ts">
    import { onMount } from "svelte";
    import { tick } from "svelte";

    import cachedInfo from "$lib/state/server-info";
    import { turnstileSolved, turnstileCreated } from "$lib/state/turnstile";

    import turnstile from "$lib/api/turnstile";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;
    let showBotCheckWarning = false;
    let warningTimeout: ReturnType<typeof setTimeout>;

    onMount(() => {
        const sitekey = $cachedInfo?.info?.cobalt?.turnstileSitekey;
        if (!sitekey) return;

        $turnstileCreated = true;

        // Сброс предупреждения при решении капчи
        const unsubscribe = turnstileSolved.subscribe(async (solved) => {
            if (solved) {
                showBotCheckWarning = false;
                clearTimeout(warningTimeout);
                await tick();
            }
        });

        // Показываем предупреждение через 10 секунд
        warningTimeout = setTimeout(() => {
            showBotCheckWarning = true;
        }, 10000);

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
                    $turnstileSolved = true;
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
            unsubscribe();
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
        <div class="bot-check-warning" role="alert">
            Проверка на бота занимает слишком много времени. Если ничего не происходит более 30 секунд, попробуйте <b>обновить страницу</b>.
        </div>
    {/if}
</div>

<style>
    #turnstile-container {
        position: absolute;
        z-index: 999;
        right: 0;
    }
    .bot-check-warning {
        margin-top: 16px;
        background: #fffbe6;
        color: #b26a00;
        border: 1px solid #ffe58f;
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 15px;
        max-width: 350px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        font-weight: 500;
    }
</style>
