const { firefox } = require("playwright");

const { getUserAgent } = require('../../utils/user-agent');
const { blockedRegexes, matchUrlDomain } = require("../../utils/sites");
const { extractReadable } = require('../../utils/extract-metadata');

module.exports.getDetails = async (url) => {
	const { userAgent, headers } = getUserAgent(url);

	const browser = await firefox.launch({ args: [], headless: true });
	const tab = await browser.newPage({
		extraHTTPHeaders: headers,
		userAgent,
		viewport: { width: 2000, height: 10000 },
	});

	try {
		await tab.route(/.*/, (route) => {
			const routeUrl = route.request().url();
			const blockedDomains = Object.keys(blockedRegexes);
			const domain = matchUrlDomain(blockedDomains, routeUrl);
			if (domain && routeUrl.match(blockedRegexes[domain])) {
				return route.abort();
			}
			return route.continue().catch(() => void 0);
		});

		await tab.addInitScript({ path: "vendor/bypass-paywalls-chrome/src/js/contentScript.js" });
		await tab.addInitScript({ path: "scripts/cosmetic-filter.js" });
		await tab.addInitScript({ path: "scripts/fix-relative-links.js" });
		await tab.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
		await tab.waitForTimeout(3000);

		const html = await tab.content();
		const readable = await extractReadable(html, url);
		return readable;
	} catch (e) {
		throw e;
	} finally {
		await tab.close();
		await browser.close();
	}
};
