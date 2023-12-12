const SlackBots = require('slackbots')

const Bot = new SlackBots({
    token: process.env.SLACK_BOT_CODE,
    name:'HackingHR',
})

Bot.on('open', () => console.log('Bot is ready'))

module.exports = Bot