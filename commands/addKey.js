import { SlashCommandBuilder } from "discord.js";
import { setUserKey } from "../utils/data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add-key")
    .setDescription("Add your Gemini API key")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Your Gemini API key")
        .setRequired(true)
    ),
  async execute(interaction) {
    const key = interaction.options.getString("key");
    setUserKey(interaction.user.id, key);
    await interaction.reply({ content: "Key saved successfully.", ephemeral: true });
  }
};