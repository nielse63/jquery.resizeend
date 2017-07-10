/* eslint-disable no-console */

const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(path.join(`${__dirname}/static`)));
app.use(express.static(path.resolve(`${__dirname}/../../lib`)));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/static/index.html`));
});

let server;

module.exports = {
  start() {
    return new Promise(((resolve) => {
      server = app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`);
        resolve();
      });
    }));
  },
  close() {
    console.log('Closing server');
    server.close();
  },
};
