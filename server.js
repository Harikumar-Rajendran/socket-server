// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const channels = new Map();

wss.on('connection', ws => {
  let currentChannel = null;

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      currentChannel = data.channel;
      const connections = channels.get(currentChannel) || [];
      connections.push(ws);
      channels.set(currentChannel, connections);
      console.log(`Client joined channel ${currentChannel}`);
    } else if (data.type === 'message') {
      const connections = channels.get(currentChannel) || [];
      connections.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
          console.log(`Message sent to channel ${client}`);
        }
      });
    }
  });

  ws.on('close', () => {
    if (currentChannel) {
      const connections = channels.get(currentChannel) || [];
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        channels.delete(currentChannel);
      } else {
        channels.set(currentChannel, connections);
      }
    }
  });
});