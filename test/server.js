const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.resolve(__dirname, '../lib')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

module.exports = {
  start() {
    return new Promise(resolve => {
      const server = app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`);
        resolve(server);
      });
    });
  },
  teardown(server) {
    server.close();
  },
};
