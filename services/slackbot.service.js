const SlackBots = require('slackbots')

const Bot = new SlackBots({
    token: process.env.SLACK_BOT_CODE,
    name:'HackingHR',
})

Bot.on('open', () => console.log('Server is running'))

module.exports = Bot