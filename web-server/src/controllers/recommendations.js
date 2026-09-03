const tcpClient = require('../tcpClient');
const Product = require('../models/products');

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

exports.getCartRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : 'guest';
        const { productIds, restaurantId } = req.body; 

        if (!productIds || productIds.length === 0) {
            return res.status(200).json([]);
        }

        const mainItemId = productIds[productIds.length - 1];
        const command = `RECOMMEND ${userId} ${mainItemId}`;
        const tcpResponse = await tcpClient.sendCommand(command);
        const recIds = tcpResponse.match(/[0-9a-fA-F]{24}/g) || [];

        if (recIds.length === 0) {
            return res.status(200).json([]); 
        }

        const recommendedProducts = await Product.find({
            _id: { $in: recIds },
            restaurantId: restaurantId 
        });

        res.status(200).json(recommendedProducts);

    } catch (error) {
        console.error('[Cart Rec Error]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};