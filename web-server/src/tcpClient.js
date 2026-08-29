const net = require('net');

const TCP_HOST = process.env.TCP_HOST || '127.0.0.1';
const TCP_PORT = process.env.TCP_PORT || 5000;

exports.sendCommand = (command) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(TCP_PORT, TCP_HOST, () => {
            console.log(`[TCP Client] Connected to ${TCP_HOST}:${TCP_PORT}`);
            // Send the command to the TCP server
            client.write(command + '\n');
        });

        client.on('data', (data) => {
            const response = data.toString('utf-8').trim();
            console.log(`[TCP Client] Received: ${response}`);
            resolve(response);
            
            // close the connection after receiving the response
            client.destroy(); 
        });

        // Handle error events
        client.on('error', (err) => {
            console.error(`[TCP Client] Error: ${err.message}`);
            reject(err);
            client.destroy();
        });
    });
};