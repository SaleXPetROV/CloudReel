<script lang="ts">
    import { onMount } from "svelte";
    import { tick } from "svelte";

    import cachedInfo from "$lib/state/server-info";
    import { turnstileCreated } from "$lib/state/turnstile";

    import turnstile from "$lib/api/turnstile";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;

    onMount(() => {
        const sitekey = $cachedInfo?.info?.cobalt?.turnstileSitekey;
        if (!sitekey) return;

        $turnstileCreated = true;

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
</div>