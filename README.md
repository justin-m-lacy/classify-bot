# Discord Bot Toxicity Classifier

Example discord bot classifies toxicity of user text using simply existing tensorflow model. The model honestly isn't very good.

## Install

Install node, npm, or other package manager

run:

`npm i`


## Setup

### Add Bot to Servers

Join your bot to a Discord server by customizing the following link:

[https://discordapp.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=3072]

### Add auth.json file

Create json auth file in root directory with the bot authentication token:

Your Bot token is private information.
DO NOT COMMIT THIS FILE TO A PUBLIC REPOSITORY.

```json
{
	"token": "YOUR AUTH TOKEN HERE",
}
```

## Run

`npm run dev`

to begin sample webserver.