import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Instructions to get your Gemini API key"),
  async execute(interaction) {
    await interaction.reply({
      content: "Visit https://developers.google.com/ai to get your Gemini API key.",
      ephemeral: true
    });
  }
};