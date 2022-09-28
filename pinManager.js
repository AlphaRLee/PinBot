const { EmbedBuilder } = require("discord.js");
const config = require("./config.json");

let cachedPinChannelId = undefined;
let cachedPinChannelIdTimestamp = undefined;
const MAX_CACHED_PIN_CHANNEL_ID_TIME = 1000 * 60 * 5;

fetchPinChannel = async (guild) => {
  if (cachedPinChannelIdTimestamp && Date.now() - cachedPinChannelIdTimestamp <= MAX_CACHED_PIN_CHANNEL_ID_TIME) {
    return await guild.channels.fetch(cachedPinChannelId);
  }

  const channels = await guild.channels.fetch();
  const pinChannel = channels.find((c) => c.name.toLowerCase() === config.pinChannelName);

  if (!pinChannel) return null;

  cachedPinChannelId = pinChannel.id;
  cachedPinChannelIdTimestamp = Date.now();

  return pinChannel;
};

buildPinnedEmbed = (message) => {
  const embed = new EmbedBuilder()
    .setColor(0xe8b535)
    .setTitle("Pinned Message")
    .setURL(message.url)
    .setAuthor({
      name: message.member?.nickname || message.author.username,
      iconURL: message.member?.avatarURL() || message.author.avatarURL(),
      url: message.url,
    })
    .setDescription(message.cleanContent)
    .setFooter({ text: message.createdAt.toString() });

  if (message.attachments?.size > 0) {
    const imageUrl = message.attachments
      .map((a) => a.url)
      .find((url) => url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg"));
    if (imageUrl) {
      embed.setImage(imageUrl);
    }
  }

  return embed;
};

sendMessageToChannel = async (message, channel) => {
  const embed = buildPinnedEmbed(message);
  await channel.send({ embeds: [embed] });
};

module.exports = {
  fetchPinChannel,
  buildPinnedEmbed,
  sendMessageToChannel,
  async moveOldestPin(channel, pinnedMessages = undefined) {
    pinnedMessages = pinnedMessages || (await channel.messages.fetchPinned());
    const oldestPin = pinnedMessages.last();

    const pinChannel = await fetchPinChannel(oldestPin.guild);
    if (!pinChannel) {
      await channel.send(
        "Try creating a channel named #${config.pinChannelName} to have PinBot automatically archive old pins for you!"
      );
      return;
    }

    await sendMessageToChannel(oldestPin, pinChannel);
    await oldestPin.unpin(`PinBot has moved the oldest pin to #${config.pinChannelName}`);
  },
};
