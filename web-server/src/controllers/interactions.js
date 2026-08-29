
// Interaction Controller
// This controller handles user interactions such as adding/removing views and purchases.

const tcpClient = require('../tcpClient');

exports.addView = async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing required parameters or items is not an array' });
    }

    try {
        const command = `ADD_VIEW ${userId} ${items.join(' ')}`;
        const tcpResponse = await tcpClient.sendCommand(command);

        if (tcpResponse.includes("400") || tcpResponse.includes("404")) {
            return res.status(400).json({ error: 'error', message: tcpResponse });
        }

        console.log('Received addView request');
        res.status(201).json({ status: 'success', data: tcpResponse });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

exports.addPurchase = async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing required parameters or items is not an array' });
    }

    try {
        const command = `ADD_PURCHASE ${userId} ${items.join(' ')}`;
        const tcpResponse = await tcpClient.sendCommand(command);

        if (tcpResponse.includes("400") || tcpResponse.includes("404")) {
            return res.status(400).json({ error: 'error', message: tcpResponse });
        }

        console.log('Received addPurchase request');
        res.status(201).json({ status: 'success', data: tcpResponse });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
    
}

exports.removeView = async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing required parameters or items is not an array' });
    }

    try {
        const command = `REMOVE_VIEW ${userId} ${items.join(' ')}`;
        const tcpResponse = await tcpClient.sendCommand(command);

        if (tcpResponse.includes("400") || tcpResponse.includes("404")) {
            return res.status(400).json({ error: 'error', message: tcpResponse });
        }

        console.log('Received removeView request');
        res.status(200).json({ status: 'success', message: 'View removed successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
    
}

exports.removePurchase = async (req, res) => {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing required parameters or items is not an array' });
    }

    try {
        const command = `REMOVE_PURCHASE ${userId} ${items.join(' ')}`;
        const tcpResponse = await tcpClient.sendCommand(command);

        if (tcpResponse.includes("400") || tcpResponse.includes("404")) {
            return res.status(400).json({ error: 'error', message: tcpResponse });
        }

        console.log('Received removePurchase request');
        res.status(200).json({ status: 'success', message: 'Purchase removed successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}