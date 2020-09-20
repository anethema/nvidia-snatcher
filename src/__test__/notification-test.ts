import {sendNotification} from '../notification';
import {Link} from '../store/model';

const link: Link = {
	brand: 'brand',
	cartUrl: 'http://example.com/',
	captchaLabels: ['captcha'],
	model: 'model',
	oosLabels: ['out of stock'],
	url: 'http://example.com/'
};

/**
 * Send test email.
 */
sendNotification(link.cartUrl ?? link.url, link);
