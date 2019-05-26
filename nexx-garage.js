const { NexxApiClient } = require('nexx-garage-sdk');

let client;
module.exports = function(RED) {
  function node (config) {
      
    RED.nodes.createNode(this, config);
    const node = this;
    client = new NexxApiClient(config);

    if (process.env.NODE_ENV === 'development') {
      client.logger = (payload) => {
          node.send({  payload });
      };
    }

    this.on('input', async (msg) => {
      try {
        await client.generateToken();
        const devices = await client.getDevices();
        await client.open(devices[0].DeviceId);
        node.send(msg);
      } catch (e) {
        node.send({ payload: e});
      }
    });
  };

  RED.nodes.registerType("NexxGarage", node);
  RED.httpAdmin.get(`/NexxGarage/devices`, (req, res) => {
    client.getDevices().then((devices) => {
      res.send(devices);
    });
  });
}