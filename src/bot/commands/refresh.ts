import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { updateRoleMeta } from "../../server/lib/discord";

const Refresh: Command = {
  name: "refresh",
  description: "force refresh someone",
  options: [
    {
      name: "user",
      description: "the user to refresh",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const user = interaction.options.getUser("user");

    interaction.deferReply({ ephemeral: true });

    await updateRoleMeta(user.id);

    interaction.editReply({ content: "Refreshed!" });
  },
};

export default Refresh;
