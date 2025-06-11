<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { t } from '$lib/i18n/translations';

    const dispatch = createEventDispatcher();

    let showAd = true;

    function skipAd() {
        showAd = false;
        dispatch('adComplete');
    }
</script>

{#if showAd}
<div class="ad-modal-overlay">
    <div class="ad-modal-content">
        <h2>{$t('ad.title')}</h2>
        <p>{$t('ad.message')}</p>
        <button on:click={skipAd}>{$t('ad.skip_button')}</button>
    </div>
</div>
{/if}

<style>
    .ad-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .ad-modal-content {
        background-color: var(--background-2);
        padding: 20px;
        border-radius: var(--border-radius);
        text-align: center;
        color: var(--text);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
    }

    .ad-modal-content h2 {
        margin-top: 0;
        color: var(--secondary);
    }

    .ad-modal-content button {
        background-color: var(--accent);
        color: var(--text-button);
        border: none;
        padding: 10px 20px;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 16px;
        margin-top: 15px;
    }

    .ad-modal-content button:hover {
        opacity: 0.9;
    }
</style>
