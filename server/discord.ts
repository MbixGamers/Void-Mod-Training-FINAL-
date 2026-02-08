import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextChannel, Interaction } from 'discord.js';
import { storage } from './storage';

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Needed to assign roles
    GatewayIntentBits.GuildMessages,
  ]
});

// Configuration (from env)
const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.DISCORD_GUILD_ID,
  ROLE_ID: process.env.DISCORD_ROLE_ID,
  CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
};

let isReady = false;

// Start Bot
export async function startDiscordBot() {
  if (!CONFIG.TOKEN) {
    console.warn("DISCORD_BOT_TOKEN not set. Bot features will be disabled.");
    return;
  }

  try {
    await client.login(CONFIG.TOKEN);
    console.log(`Discord Bot logged in as ${client.user?.tag}`);
    isReady = true;
  } catch (error) {
    console.error("Failed to login Discord Bot:", error);
  }
}

// Send Submission Embed to Channel
export async function sendSubmissionNotification(submissionId: string, username: string, score: number, passed: boolean) {
  if (!isReady || !CONFIG.CHANNEL_ID) return;

  try {
    const channel = await client.channels.fetch(CONFIG.CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`New Test Submission: ${username}`)
      .addFields(
        { name: 'Score', value: `${score}`, inline: true },
        { name: 'Passed', value: passed ? 'Yes' : 'No', inline: true },
        { name: 'Submission ID', value: submissionId, inline: true }
      )
      .setColor(passed ? 0x00FF00 : 0xFF0000)
      .setTimestamp();

    const approveBtn = new ButtonBuilder()
      .setCustomId(`approve_${submissionId}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success);

    const denyBtn = new ButtonBuilder()
      .setCustomId(`deny_${submissionId}`)
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(approveBtn, denyBtn);

    await channel.send({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error("Error sending submission notification:", error);
  }
}

// Assign Role to User
export async function assignVerifiedRole(userId: string) {
  if (!isReady || !CONFIG.GUILD_ID || !CONFIG.ROLE_ID) return;

  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const member = await guild.members.fetch(userId);
    
    if (member) {
      await member.roles.add(CONFIG.ROLE_ID);
      // Send DM
      try {
        await member.send(`Congratulations! Your submission has been approved and you have been given the Verified Staff role.`);
      } catch (dmError) {
        console.log("Could not send DM to user (DMs closed?)");
      }
    }
  } catch (error) {
    console.error(`Error assigning role to ${userId}:`, error);
  }
}

// Interaction Handler (for Buttons)
client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const [action, submissionId] = interaction.customId.split('_');
  if (!['approve', 'deny'].includes(action)) return;

  try {
    await interaction.deferReply({ ephemeral: true });

    // Update DB
    const status = action === 'approve' ? 'approved' : 'denied';
    const submission = await storage.updateSubmissionStatus(submissionId, status);

    // If approved, assign role
    if (status === 'approved' && submission) {
      await assignVerifiedRole(submission.userId);
    }

    // Update the message to remove buttons or show result
    const originalEmbed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(originalEmbed)
      .addFields({ name: 'Status', value: `marked as ${status} by <@${interaction.user.id}>` })
      .setColor(status === 'approved' ? 0x00FF00 : 0xFF0000);

    await interaction.message.edit({ embeds: [newEmbed], components: [] });
    await interaction.editReply(`Submission ${status} successfully.`);

  } catch (error) {
    console.error("Error handling interaction:", error);
    if (interaction.isRepliable()) {
      await interaction.editReply("An error occurred processing this action.");
    }
  }
});
