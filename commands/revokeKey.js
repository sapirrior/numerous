import { SlashCommandBuilder } from "discord.js";
import { removeUserKey } from "../utils/data.js";

export default {
  data: new SlashCommandBuilder()
    .setName("revoke-key")
    .setDescription("Revoke your Gemini API key"),
  async execute(interaction) {
    removeUserKey(interaction.user.id);
    await interaction.reply({ content: "Your key has been removed.", ephemeral: true });
  }
};