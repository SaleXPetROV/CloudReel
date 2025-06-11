import * as _env from "$env/static/public";

const getEnv = (_key: string) => {
    const env = _env as Record<string, string | undefined>;
    const key = `WEB_${_key}`;

    if (key in env) {
        return env[key];
    }
}

const variables = {
    HOST: getEnv('HOST'),
    PLAUSIBLE_HOST: getEnv('PLAUSIBLE_HOST'),
    PLAUSIBLE_ENABLED: getEnv('HOST') && getEnv('PLAUSIBLE_HOST'),
    DEFAULT_API: getEnv('DEFAULT_API'),
}

const contacts = {
    discord: "https://discord.gg/pQPt8HBUPu",
    twitter: "https://x.com/justusecobalt",
    github: "https://github.com/imputnet/cobalt",
    bluesky: "https://bsky.app/profile/cobalt.tools",
    telegram_ru: "https://t.me/justusecobalt_ru",
}

const partners = {
    royalehosting: "https://royalehosting.net/?partner=cobalt",
}

const donate = {
    stripe: "https://donate.stripe.com/test_5kQ8wP2PO5bc2Due55dAk00",
    liberapay: "https://liberapay.com/imput/donate",
    crypto: {
        ethereum: "0xec8197b35af7d60ff129a9950ee24108b344fdf1",
        monero: "88wPepbTUNBJVnNdJJDWTU8K9XfUckuoNF2k4DDL5RLBBQghevuEstPgGhjqTtFjpXMpbizQGgvkn5zAXgMZPGY25aSwacF",
        solana: "Gvwre3bhPyCggqycfeU7XUweu7j3nQ9JdLzTPRRgjMBB",
        litecoin: "LQbTATqd15cPZ27MMa8gg9dAq3dPx2Hpom",
        bitcoin: "1JfoTuRTQw9WXArLTMCv4nBxxNKAwk4LhQ",
        ton: "UQBq1iqfu9P05AXPluA359dl_mcrWC7zJFQPKBsf5dYg37VS",
    },
    other: {
        boosty: "https://boosty.to/wukko/donate",
    }
};

const siriShortcuts = {
    photos: "https://www.icloud.com/shortcuts/14e9aebf04b24156acc34ceccf7e6fcd",
    files: "https://www.icloud.com/shortcuts/2134cd9d4d6b41448b2201f933542b2e",
};

const docs = {
    instanceHosting: "https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md",
    webLicense: "https://github.com/imputnet/cobalt/blob/main/web/LICENSE",
    apiLicense: "https://github.com/imputnet/cobalt/blob/main/api/LICENSE",
};

const defaultApiURL = "https://api.cobalt.tools";

export { donate, defaultApiURL, contacts, partners, siriShortcuts, docs };
export default variables;
