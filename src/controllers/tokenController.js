const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Generate Agora token for RTC
exports.generateRtcToken = (req, res) => {
  try {
    const { channelName, uid, role } = req.body;
    console.log('Generating token for channel:', role);
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }
    
    // Get App ID and Certificate from environment variables
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      return res.status(500).json({ error: 'Agora credentials not configured' });
    }
    
    // Set expiration time (1 hour from now)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    // Determine the role
    let roleType;
    if (role === 'publisher') {
      roleType = RtcRole.PUBLISHER;
    } else {
      roleType = RtcRole.SUBSCRIBER;
    }
    
    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      parseInt(uid) || 0,
      roleType,
      privilegeExpiredTs
    );
    
    // Return the token to client
    return res.json({ token, uid });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Could not generate token' });
  }
};