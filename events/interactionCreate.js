const config = require("../config.json");
const { moveOldestPin, fetchPinChannel, sendMessageToChannel, buildPinnedEmbed } = require("../pinManager.js");

const pinbotHelpCommand = async (interaction) => {
  await interaction.reply(
    `Hello, I'm PinBot! I'll automatically move your oldest pins to the #${config.pinChannelName} channel.\n` +
      `You can also pin messages using :${config.pinEmojiName}: as a reaction!\n` +
      `I'm still in beta right now, so please report any bugs you find to @RLee#4054. Enjoy!`
  );
};

const moveOldestPinCommand = async (interaction) => {
  if (!interaction.guild || !interaction.channel) {
    await interaction.reply("Sorry, this command must be used inside a channel");
    return;
  }

  await moveOldestPin(interaction.channel);
  await interaction.reply({ content: "Done! The oldest pin on this channel has been archived", ephemeral: true });
};

const randomPinCommand = async (interaction) => {
  if (!interaction.guild || !interaction.channel) {
    await interaction.reply("Sorry, this command must be used inside a channel");
    return;
  }

  // TODO: Tag which channel a pin originates from and only fetch from there (inspect embed's URL for channel ID match)

  const channel = interaction.channel;
  const pinnedMessages = await channel.messages.fetchPinned();

  const maxMessageHistory = 50;
  let randIndex = Math.floor(Math.random() * maxMessageHistory);

  let embed;

  if (randIndex < pinnedMessages.size) {
    embed = buildPinnedEmbed([...pinnedMessages.values()][randIndex]);
  } else {
    const pinChannel = await fetchPinChannel(interaction.guild);
    randIndex = randIndex - (pinnedMessages.size || 0); // Reset index to ignore the pinned section on the original channel

    const pinMessage = await fetchRandomOldPinFromChannel(pinChannel, randIndex, maxMessageHistory);
    if (pinMessage) {
      embed = pinMessage.embeds[0];
    } else {
      await interaction.reply("Whoops, something has gone terribly wrong! Try again later");
      return;
    }
  }

  await interaction.reply({ embeds: [embed] });
};

const fetchRandomOldPinFromChannel = async (channel, randIndex, maxMessageHistory) => {
  let pinCandidate;
  let fetchParams = { limit: Math.min(maxMessageHistory, 100) };

  for (let i = 0; i < 10; i++) {
    const oldPinMessages = await channel.messages.fetch(fetchParams);
    const candidateMessages = oldPinMessages
      .filter((msg) => msg.author.id === channel.client.user.id)
      .filter((msg) => msg.embeds && msg.embeds.length > 0); // TODO: Ensure embed selected is a pin message, not something random

    pinCandidate = candidateMessages[Math.min(randIndex, candidateMessages.length - 1)];

    if (pinCandidate) {
      return pinCandidate;
    } else {
      fetchParams.around = oldPinMessages.last().id;
    }
  }

  return null;
};

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const commandResponses = {
      ping: async (interaction) => await interaction.reply("Pinbot says pong!"),
      pinbot: pinbotHelpCommand,
      moveoldestpin: moveOldestPinCommand,
      randompin: randomPinCommand,
    };

    const commandResponse = commandResponses[interaction.commandName.toLowerCase()];
    if (!commandResponse) {
      console.log(`Command ${interaction.commandName} not recognized, skipping`);
      return; // Silently skip out. Commands should be registered anyway
    }

    commandResponse(interaction);
  },
};
