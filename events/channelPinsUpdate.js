const { EmbedBuilder, MessageType } = require("discord.js");
const config = require("../config.json");
const { moveOldestPin } = require("../pinManager.js");

module.exports = {
  name: "channelPinsUpdate",
  async execute(channel, time) {
    // Hack workaround
    // There is a channel.lastMessage available with type 6 (MessageType.ChannelPinnedMessage),
    // but it's not consistently emitted when this event is triggered (and the old one can be fetched when pins are deleted)
    // Instead simply detect if the max # of pins is hit, which only happens when a pin is added

    const pinnedMessages = await channel.messages.fetchPinned();
    if (pinnedMessages.size < config.pinLimit) {
      return; // Have not exceeded pinLimit yet, do nothing
    }

    moveOldestPin(channel, pinnedMessages);
  },
};
