import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import adblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {Config} from './config';
import {Link, Store, Stores} from './store/model';
import {Logger} from './logger';
import {sendNotification} from './notification';
import {lookup} from './store';
import async from 'async';

puppeteer.use(stealthPlugin());
puppeteer.use(adblockerPlugin({blockTrackers: true}));

/**
 * Starts the bot.
 */
async function main() {
	const browser = await puppeteer.launch({
		headless: Config.browser.isHeadless,
		defaultViewport: {
			height: Config.page.height,
			width: Config.page.width
		}
	});

	const q = async.queue<Store>(async (store: Store, cb) => {
		setTimeout(async () => {
			try {
				Logger.debug(`↗ scraping initialized - ${store.name}`);
				await lookup(browser, store);
			} catch (error) {
				// Ignoring errors; more than likely due to rate limits
				Logger.error(error);
			} finally {
				cb();
				q.push(store);
			}
		}, Config.browser.rateLimitTimeout);
	}, Stores.length);

	for (const store of Stores) {
		Logger.debug(store.links);
		q.push(store);
		if (Stores.length === 1) {
			q.push(store);
		} // Keep from completely draining
	}

	await q.drain();

	await browser.close();
}

/**
 * Will continually run until user interferes.
 */
try {
	void main();
} catch (error) {
	// Ignoring errors; more than likely due to rate limits
	Logger.error(error);
	void main();
}
