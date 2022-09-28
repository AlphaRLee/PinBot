module.exports = {
  name: "messageReactionAdd",
  execute(messageReaction, user) {
    console.log(`messageReaction ${messageReaction.emoji} was received`);
  },
};
