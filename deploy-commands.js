const { REST, Routes, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const credentials = require("./auth.json");

const commands = [
  {
    name: "pinbot",
    type: ApplicationCommandType.ChatInput,
    description: "General PinBot help instructions",
  },
  {
    name: "randompin",
    description: "Get an old random pin from recent pins",
  },
  {
    name: "moveoldestpin",
    aliases: ["archive", "archivepin", "archiveoldest", "archiveoldestpin", "pinoldest"],
    description: "Archive the oldest pin on this channel into the #pins channel",
  },
  {
    name: "ping",
    description: "Pinbot will say pong!",
  },
];

// Register slash commands against Discord API version 10
const rest = new REST({ version: "10" }).setToken(credentials.token);
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(credentials.clientId), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
