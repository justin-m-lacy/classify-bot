import * as toxicity from '@tensorflow-models/toxicity';
import { Client, GatewayIntentBits, Message } from 'discord.js';

type Auth = typeof import('../auth.json');

const client = new Client({
	closeTimeout: 4000,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
	],
	sweepers: {
		messages: {
			interval: 1000,
			lifetime: 600
		}
	}
});

client.on('ready', () => {

	console.log(`client ready: ${client.user?.tag}`);
});

const initBot = async () => {

	try {
		const auth = (await import('../auth.json', { with: { type: "json" } })).default;
		await tryLogin(auth);

		//client.on('messageCreate', onMessage);

	} catch (e) {
		console.error(`Bot login failed`);
		console.error(e);
	}
}

type Prediction = {
	label: string,
	results: Array<{ probabilities: Float32Array, match: boolean }>
};

const THRESHOLD = 0.71;
const ToxicityLabels = [
	"identity_attack", "insult", "obscene", "severe_toxicity", "sexual_explicit", "threat"
];
let aiBusy = false;
toxicity.load(THRESHOLD, ToxicityLabels).then(model => {

	console.log(`model loaded...`);
	client.on('messageCreate', (m) => {

		if (m.author.id === client.user?.id) return;

		const content = m.content.trim();
		if (content.length <= 0) return;

		if (aiBusy) return;
		aiBusy = true;

		/**
		 * Predictions[] has one entry for each label.
		 * For each label, results[] is an array for each input test string
		 * results[i].probabilities is an array of probabilities for [off,on]
		 * (false,true) for that label.
		 * 
		 * e.g. predictions[2].results[3][1] is the probability of the 3rd input string
		 * having label with index 2.
		 */
		model.classify([content]).then(predictions => {

			aiBusy = false;

			const best = predictions.reduce((best, cur, index) => {

				if (cur.results.length === 0 || !cur.results[0].match) {
					return best;
				} else if (cur.results[0].probabilities.length < 2) {
					console.warn(`bad probability: label: ${cur.label}\n
						${cur.results[0].probabilities.length}`
					);
				} else if (cur.results[0].probabilities[1] > best.prob) {
					best.index = index;
					best.prob = cur.results[0].probabilities[1];
				}
				return best;

			}, { index: -1, prob: 0 });

			if (best.index >= 0) {
				m.reply(`Warning! Toxicity detected: ${predictions[best.index].label}`);
			}

		});


	});

});


function onMessage(m: Message) {

	if (m.author.id === client.user?.id) return;


}

function tryLogin(auth: Auth) {
	client.login((process.env.NODE_ENV !== 'production' && auth.dev != null) ? auth.dev?.token ?? auth.token : auth.token);
}

initBot();