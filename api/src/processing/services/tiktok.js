import Cookie from "../cookie/cookie.js";

import { extract, normalizeURL } from "../url.js";
import { genericUserAgent } from "../../config.js";
import { updateCookie } from "../cookie/manager.js";
import { createStream } from "../../stream/manage.js";
import { convertLanguageCode } from "../../misc/language-codes.js";

const shortDomain = "https://vt.tiktok.com/";

export default async function(obj) {
    console.log('TikTok handler called:', obj);
    const cookie = new Cookie({});
    let postId = obj.postId;
    let url = obj.url || (obj.shortLink ? `https://vm.tiktok.com/${obj.shortLink}` : undefined);
    let debugLog = [];
    console.log('Initial postId:', postId);
    console.log('Initial url:', url);

    // Если нет postId, но есть shortLink, формируем короткую ссылку
    if (!postId && obj.shortLink && !url) {
        url = `https://vm.tiktok.com/${obj.shortLink}`;
        console.log('Formed url from shortLink:', url);
    }

    if (!postId && url) {
        const isShort = /^https:\/\/(vm|vt)\.tiktok\.com\//.test(url);
        debugLog.push(`Input url: ${url}`);
        debugLog.push(`isShortTikTokUrl: ${isShort}`);
        console.log('isShortTikTokUrl:', isShort);
        if (isShort) {
            let res;
            try {
                res = await fetch(url, {
                    redirect: "manual",
                    headers: {
                        "user-agent": genericUserAgent.split(' Chrome/1')[0]
                    }
                });
                console.log('Fetched short TikTok URL:', res.status, res.headers.get('location'));
            } catch (e) {
                debugLog.push(`fetch short url error: ${e}`);
                console.log('fetch short url error:', e);
                return { error: "fetch.fail", debugLog };
            }

            const location = res.headers.get('location');
            debugLog.push(`Redirect Location header: ${location}`);
            console.log('Redirect Location header:', location);
            if (location && location.startsWith('https://')) {
                const extractedURL = location.split('?')[0];
                debugLog.push(`Extracted redirect URL: ${extractedURL}`);
                console.log('Extracted redirect URL:', extractedURL);
                const { patternMatch } = extract(normalizeURL(extractedURL));
                console.log('extract result from redirect:', patternMatch);
                postId = patternMatch?.postId;
                debugLog.push(`Extracted postId from redirect: ${postId}`);
            } else {
                let html = await res.text();
                debugLog.push(`Fetched HTML from short TikTok URL: ${html?.slice(0, 200)}`);
                console.log('Fetched HTML from short TikTok URL:', html?.slice(0, 200));
                if (html.startsWith('<a href=\"https://')) {
                    const extractedURL = html.split('<a href=\"')[1].split('?')[0];
                    debugLog.push(`Extracted redirect URL from HTML: ${extractedURL}`);
                    console.log('Extracted redirect URL from HTML:', extractedURL);
                    const { patternMatch } = extract(normalizeURL(extractedURL));
                    console.log('extract result from HTML redirect:', patternMatch);
                    postId = patternMatch?.postId;
                    debugLog.push(`Extracted postId from HTML redirect: ${postId}`);
                } else {
                    debugLog.push('No redirect found in headers or HTML.');
                    console.log('No redirect found in headers or HTML.');
                }
            }
        } else {
            const { patternMatch } = extract(normalizeURL(url));
            console.log('extract result from normal URL:', patternMatch);
            postId = patternMatch?.postId;
            debugLog.push(`Extracted postId from normal URL: ${postId}`);
        }
    }
    console.log('Final postId:', postId);
    if (!postId) {
        debugLog.push('No postId extracted, returning fetch.short_link error');
        console.log('No postId extracted, returning fetch.short_link error');
        console.error('TikTok ERROR:', debugLog.join(' | '));
        return { error: "fetch.short_link", debugLog };
    }

    // should always be /video/, even for photos
    const res = await fetch(`https://www.tiktok.com/@i/video/${postId}`, {
        headers: {
            "user-agent": genericUserAgent,
            cookie,
        }
    })
    updateCookie(cookie, res.headers);

    const html = await res.text();

    let detail;
    try {
        const json = html
            .split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1]
            .split('</script>')[0];

        const data = JSON.parse(json);
        const videoDetail = data["__DEFAULT_SCOPE__"]["webapp.video-detail"];

        if (!videoDetail) {
            debugLog.push("no video detail found");
            console.error('TikTok ERROR:', debugLog.join(' | '));
            throw "no video detail found";
        }

        // status_deleted or etc
        if (videoDetail.statusMsg) {
            debugLog.push("content.post.unavailable: " + videoDetail.statusMsg);
            console.error('TikTok ERROR:', debugLog.join(' | '));
            return { error: "content.post.unavailable", debugLog };
        }

        detail = videoDetail?.itemInfo?.itemStruct;
    } catch (e) {
        debugLog.push("fetch.fail: " + e);
        console.error('TikTok ERROR:', debugLog.join(' | '));
        return { error: "fetch.fail", debugLog };
    }

    if (detail.isContentClassified) {
        debugLog.push("content.post.age");
        console.error('TikTok ERROR:', debugLog.join(' | '));
        return { error: "content.post.age", debugLog };
    }

    if (!detail.author) {
        debugLog.push("fetch.empty");
        console.error('TikTok ERROR:', debugLog.join(' | '));
        return { error: "fetch.empty", debugLog };
    }

    let video, videoFilename, audioFilename, audio, images,
        filenameBase = `tiktok_${detail.author?.uniqueId}_${postId}`,
        bestAudio; // will get defaulted to m4a later on in match-action

    images = detail.imagePost?.images;

    let playAddr = detail.video?.playAddr;

    if (obj.h265) {
        const h265PlayAddr = detail?.video?.bitrateInfo?.find(b => b.CodecType.includes("h265"))?.PlayAddr.UrlList[0]
        playAddr = h265PlayAddr || playAddr
    }

    if (!obj.isAudioOnly && !images) {
        video = playAddr;
        videoFilename = `${filenameBase}.mp4`;
    } else {
        audio = playAddr;
        audioFilename = `${filenameBase}_audio`;

        if (obj.fullAudio || !audio) {
            audio = detail.music.playUrl;
            audioFilename += `_original`
        }
        if (audio.includes("mime_type=audio_mpeg")) bestAudio = 'mp3';
    }

    if (video) {
        let subtitles, fileMetadata;
        if (obj.subtitleLang && detail?.video?.subtitleInfos?.length) {
            const langCode = convertLanguageCode(obj.subtitleLang);
            const subtitle = detail?.video?.subtitleInfos.find(
                s => s.LanguageCodeName.startsWith(langCode) && s.Format === "webvtt"
            )
            if (subtitle) {
                subtitles = subtitle.Url;
                fileMetadata = {
                    sublanguage: langCode,
                }
            }
        }
        return {
            urls: video,
            subtitles,
            fileMetadata,
            filename: videoFilename,
            headers: { cookie }
        }
    }

    if (images && obj.isAudioOnly) {
        return {
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }

    if (images) {
        let imageLinks = images
            .map(i => i.imageURL.urlList.find(p => p.includes(".jpeg?")))
            .map((url, i) => {
                if (obj.alwaysProxy) url = createStream({
                    service: "tiktok",
                    type: "proxy",
                    url,
                    filename: `${filenameBase}_photo_${i + 1}.jpg`
                })

                return {
                    type: "photo",
                    url
                }
            });

        return {
            picker: imageLinks,
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }

    if (audio) {
        return {
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }

    debugLog.push("fetch.empty");
    console.error('TikTok ERROR:', debugLog.join(' | '));
    return { error: "fetch.empty", debugLog };
}
