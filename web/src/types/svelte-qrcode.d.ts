declare module 'svelte-qrcode' {
    import { SvelteComponentTyped } from 'svelte';

    export default class extends SvelteComponentTyped<{
        value: string;
        size?: number;
        padding?: number;
        background?: string;
        color?: string;
        errorCorrection?: 'L' | 'M' | 'Q' | 'H';
    }> {}
}
