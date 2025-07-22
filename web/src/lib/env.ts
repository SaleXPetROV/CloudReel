import * as _env from "$env/static/public";

const getEnv = (_key: string) => {
    const env = _env as any;
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
    // temporary variable until webcodecs features are ready for testing
    ENABLE_WEBCODECS: !!getEnv('ENABLE_WEBCODECS'),
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
    stripe: "https://donate.stripe.com/5kQ8wP2PO5bc2Due55dAk00",
    liberapay: "https://liberapay.com/imput/donate",
    crypto: {
        ethereum: "0xDA47A671B2411468E8320916C3e57D2F60FE7197, 0xec8197b35af7d60ff129a9950ee24108b344fdf1",
        monero: "463y93PsQDTYGVPAHUNcjiYDsxWjn7bL2FS9GYXjetEH5XEoNKB7kCHHQXsuoebbSv8RqGspo61pxhMQQrudDky2AfTGbs3, 88wPepbTUNBJVnNdJJDWTU8K9XfUckuoNF2k4DDL5RLBBQghevuEstPgGhjqTtFjpXMpbizQGgvkn5zAXgMZPGY25aSwacF",
        solana: "BWPQpPvSyfauUm1BwmV55qE1vJT56Pc6qHrNFzCmtmFJ, Gvwre3bhPyCggqycfeU7XUweu7j3nQ9JdLzTPRRgjMBB",
        litecoin: "ltc1qfdemqtfsj7pgnfmtv7n5agtrh0yzwk2pzgr96y, LQbTATqd15cPZ27MMa8gg9dAq3dPx2Hpom",
        bitcoin: "bc1qeqd27qknt3fwvuzpvv2ne730klggggwcqm43yq, 1JfoTuRTQw9WXArLTMCv4nBxxNKAwk4LhQ",
        ton: "UQBosUGIkvZcV8k02bdm-lRFLXrlr1A_sdO1FnXhAsUOLx1S, UQBq1iqfu9P05AXPluA359dl_mcrWC7zJFQPKBsf5dYg37VS",
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

const officialApiURL = "https://api.cobalt.tools";

export { donate, officialApiURL, contacts, partners, siriShortcuts, docs };
export default variables;
