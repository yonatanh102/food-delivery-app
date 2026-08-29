const tcpClient = require('../tcpClient');

exports.getRecommendations = async (req, res) => {
    const userId = req.user ? req.user.userId : req.query.userId;
    const { itemId } = req.query;

    if (!userId || !itemId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const command = `RECOMMEND ${userId} ${itemId}`;
        const tcpResponse = await tcpClient.sendCommand(command);
        
        if (tcpResponse.includes("400") || tcpResponse.includes("404")) {
            return res.status(400).json({ error: 'error', message: tcpResponse });
        }

        console.log(`Received recommendation request for userId: ${userId}, itemId: ${itemId}`);
        res.status(200).json({ status: 'success', data: tcpResponse });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
