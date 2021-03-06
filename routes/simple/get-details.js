const scraper = require("../../scraper/simple");

module.exports = {
	getDetails,
};

async function getDetails(req, res) {
	const url = req.body.url;
	if (!/https?:\/\/(www\.)?.*\/.*/i.test(url)) {
		return res.status(400);
	}
	console.log(`[simple/details] for url ${url}`);
	console.log('[simple/details] doing a declutter');
	try {
		const readable = await scraper.getDetails(url);
		console.log('[simple/details] have decluttered readable', !!readable);
		if (!readable) {
			return res.status(500);
		}
		console.log('[simple/details] sent readable');
		return res.send(readable);
	} catch (e) {
		console.error('[simple/details] have decluttered readable', e);
		return res.sendStatus(500);
	}
}