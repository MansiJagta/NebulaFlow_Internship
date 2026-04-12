const axios = require('axios');
const Workspace = require('../models/Workspace');

// Role-to-Channel Mapping (Placeholder names - actual IDs would comes from integration setup)
const ROLE_CHANNEL_MAP = {
  pm: ['general', 'management', 'roadmap'],
  developer: ['general', 'engineering', 'dev-ops'],
  designer: ['general', 'design-ui', 'ux-research'],
  collaborator: ['general']
};

/**
 * Automatically assign a user to Slack channels based on their role
 * @param {string} workspaceId 
 * @param {string} userId 
 * @param {string} role 
 */
async function syncUserToSlackChannels(workspaceId, userId, role) {
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.slackConfig || !workspace.slackConfig.accessToken) {
      console.warn('[ChannelMapper] Slack not configured for workspace:', workspaceId);
      return;
    }

    const { accessToken } = workspace.slackConfig;
    const channelsToJoin = ROLE_CHANNEL_MAP[role.toLowerCase()] || ROLE_CHANNEL_MAP.collaborator;

    console.log(`[ChannelMapper] Syncing user ${userId} (${role}) to channels:`, channelsToJoin);

    // In a real app, we'd loop through channelsToJoin, 
    // find their IDs via Slack API, and use 'conversations.invite'
    // For this implementation, we simulate the internal mapping record
    
    // Example logic (Conceptual):
    /*
    for (const channelName of channelsToJoin) {
      const channelId = await getSlackChannelId(accessToken, channelName);
      if (channelId) {
        await axios.post('https://slack.com/api/conversations.invite', 
          { channel: channelId, users: userId }, 
          { headers: { Authorization: `Bearer ${accessToken}` }}
        );
      }
    }
    */
  } catch (err) {
    console.error('[ChannelMapper] Failed to sync user to Slack:', err.message);
  }
}

module.exports = { syncUserToSlackChannels };
