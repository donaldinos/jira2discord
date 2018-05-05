module.exports = {
    discord_channel_addr: process.env.DISCORD_CHANNEL_ADDR || "http://discord.app",
    jira_project_addr: process.env.JIRA_PROJECT_ADDR || "http://myproject.atlasian.net",
    jira_consumer_key: process.env.JIRA_CONSUMER_KEY || "consumer_key",
    jira_callback_url: process.env.JIRA_CALLBACK_URL || "http://localhost/"
}