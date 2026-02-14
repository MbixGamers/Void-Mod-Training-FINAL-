import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextChannel, Interaction, GuildMember } from 'discord.js';
import { storage } from './storage';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ]
});

const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.DISCORD_GUILD_ID,
  CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  ROLE_IDS: [
    process.env.DISCORD_ROLE_ID,
    process.env.DISCORD_ROLE_ID_1,
    process.env.DISCORD_ROLE_ID_2,
    process.env.DISCORD_ROLE_ID_3,
    process.env.DISCORD_ROLE_ID_4,
    process.env.DISCORD_ROLE_ID_5
  ].filter(Boolean) as string[],
};

let isReady = false;

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

export async function sendSubmissionNotification(submissionId: string, username: string, score: number, passed: boolean, answers: Record<string, string>) {
  if (!isReady || !CONFIG.CHANNEL_ID) return;

  try {
    const channel = await client.channels.fetch(CONFIG.CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const correctAnswers: Record<string, string> = {
      q1: "Hello, what is your age and how may I assist you today? Please review the requirements and choose a roster.",
      q2: "Request Fortnite tracker and earnings verification",
      q3: "Verify Fortnite tracker authenticity and PR.",
      q4: "Ask for socials and check their content & follower requirements.",
      q5: "Request portfolio and proof of work & ping @GFX/VFX Lead.",
      q6: "Ask for 2-3 clips including one freebuild. After sending, ping @Creative Department.",
      q7: "Ask them to include Void in their username. Use the creator code Team.Void in shop. Verify them."
    };

    let responseSheet = "";
    for (const [id, correct] of Object.entries(correctAnswers)) {
      const userAns = answers[id] || "No response";
      const isCorrect = userAns === correct;
      responseSheet += `**${id.toUpperCase()}**: ${isCorrect ? "✅" : "❌"}\n*User:* ${userAns.substring(0, 50)}${userAns.length > 50 ? "..." : ""}\n`;
    }

    const baseUrl = "https://asset-flow--danielasczrelot.replit.app";
    const supportUrl = "https://discord.gg/voidggs";

    const embed = new EmbedBuilder()
      .setTitle(`New Test Submission: ${username}`)
      .setDescription(`**Response Sheet**\n${responseSheet}`)
      .addFields(
        { name: 'Score', value: `${score}%`, inline: true },
        { name: 'Passed', value: passed ? 'Yes' : 'No', inline: true },
        { name: 'Submission ID', value: submissionId, inline: true }
      )
      .setColor(passed ? 0x00FF00 : 0xFF0000)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`approve_${submissionId}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`deny_${submissionId}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setLabel('Website').setURL(baseUrl).setStyle(ButtonStyle.Link),
      new ButtonBuilder().setLabel('Support Server').setURL(supportUrl).setStyle(ButtonStyle.Link)
    );

    await channel.send({ embeds: [embed], components: [row] });

    // --- LOGIC FIX: CHECK DATABASE FOR ADMINS ---
    try {
      const dbAdmins = await storage.getAdmins();

      if (dbAdmins.length > 0) {
        const dmEmbed = new EmbedBuilder()
          .setTitle(`🔔 New Training Submission`)
          .setDescription(`A new training submission has been received from **${username}**.`)
          .addFields(
            { name: 'Score', value: `${score}%`, inline: true },
            { name: 'Passed', value: passed ? 'Yes' : 'No', inline: true }
          )
          .setColor(0x0099ff)
          .setTimestamp();

        const dmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Review Dashboard')
            .setURL(`${baseUrl}/admin`)
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Support Server')
            .setURL(supportUrl)
            .setStyle(ButtonStyle.Link)
        );

        for (const adminRecord of dbAdmins) {
          try {
            // adminRecord.id is the Discord ID stored in your DB
            const user = await client.users.fetch(adminRecord.id);
            if (user && !user.bot) {
              await user.send({ embeds: [dmEmbed], components: [dmRow] });
            }
          } catch (err) {
            console.log(`Could not send DM to DB Admin: ${adminRecord.username}`);
          }
        }
      }
    } catch (err) {
      console.error("Error in admin DM process:", err);
    }

  } catch (error) {
    console.error("Error sending submission notification:", error);
  }
}

export async function handleSubmissionResult(userId: string, action: 'approve' | 'deny', submissionId?: string) {
  if (!isReady || !CONFIG.GUILD_ID) return;

  try {
    if (submissionId && CONFIG.CHANNEL_ID) {
      const channel = await client.channels.fetch(CONFIG.CHANNEL_ID) as TextChannel;
      if (channel) {
        const messages = await channel.messages.fetch({ limit: 50 });
        const notificationMsg = messages.find(m => 
          m.embeds.length > 0 && 
          m.embeds[0].fields.some(f => f.name === 'Submission ID' && f.value === submissionId)
        );

        if (notificationMsg) {
          const status = action === 'approve' ? 'approved' : 'denied';
          const originalEmbed = notificationMsg.embeds[0];
          const newEmbed = EmbedBuilder.from(originalEmbed)
            .addFields({ name: 'Status', value: `marked as ${status} (via Dashboard)` })
            .setColor(status === 'approved' ? 0x00FF00 : 0xFF0000);

          const firstRow = notificationMsg.components[0] as any;
          const components = firstRow?.components || [];
          const websiteBtn = components.find((c: any) => c.url && c.url.includes('replit'));
          if (websiteBtn) {
            websiteBtn.url = "https://asset-flow--danielasczrelot.replit.app";
          }
          const supportUrl = "https://discord.gg/voidggs";
          const supportBtn = new ButtonBuilder().setLabel('Support Server').setURL(supportUrl).setStyle(ButtonStyle.Link);
          const newComponents = [new ActionRowBuilder<ButtonBuilder>()];
          if (websiteBtn) newComponents[0].addComponents(ButtonBuilder.from(websiteBtn as any));
          newComponents[0].addComponents(supportBtn);

          await notificationMsg.edit({ embeds: [newEmbed], components: newComponents });
        }
      }
    }

    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const member = await guild.members.fetch(userId);

    if (member) {
      if (action === 'approve') {
        for (const roleId of CONFIG.ROLE_IDS) {
          try {
            await member.roles.add(roleId);
            if (CONFIG.ROLE_IDS.length > 1) await new Promise(r => setTimeout(r, 500));
          } catch (e) { console.error(`Role Error: ${roleId}`, e); }
        }
        try { await member.send(`Congratulations! Your submission was approved.`); } catch (e) {}
      } else {
        try { await member.send(`Your submission has been denied.`); } catch (e) {}
      }
    }
  } catch (error) {
    console.error(`Error handling result:`, error);
  }
}

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton()) return;
  const [action, submissionId] = interaction.customId.split('_');
  if (!['approve', 'deny'].includes(action)) return;

  try {
    await interaction.deferReply({ ephemeral: true });
    const status = action === 'approve' ? 'approved' : 'denied';
    const submission = await storage.updateSubmissionStatus(submissionId, status);

    if (submission) {
      await handleSubmissionResult(submission.userId, action === 'approve' ? 'approve' : 'deny');
    }

    const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .addFields({ name: 'Status', value: `marked as ${status} by <@${interaction.user.id}>` })
      .setColor(status === 'approved' ? 0x00FF00 : 0xFF0000);

    await interaction.message.edit({ embeds: [newEmbed], components: [] });
    await interaction.editReply(`Submission ${status} successfully.`);
  } catch (error) {
    console.error("Interaction Error:", error);
  }
});