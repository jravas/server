import { connect } from 'net';

const   WebSocket = require('ws');
        wss = new WebSocket.Server({ port: 8080 });
// lsit of users that are connected to the server
var users = {};

wss.on('connection', function connection(connection) {
  connection.on('message', function incoming(message) {
    var data;
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.log('Error parsing JSON');
        data = {};
    }
    // check if user is logged with taht id
    switch (data.type) {
        case 'login':
            console.log('User logged in as ', data.name);
            if (users[data.name]) {
                sendTo(connection, {
                    type: 'login',
                    success: false
                });
            } else {
                users[data.name] = connection;
                connection.name = data.name;
                sendTo(connection, {
                    type: 'login',
                    success: true
                });
            }
            break;
        default:
        sendTo(connection, {
            type: 'error',
            message: 'Unrecognized command: ' + data.type
        });
        break;
    }
  });
  connection.send('something');
  // clean up clients connections when they disconenct
  connection.on('close', function () {
      if (connection.name) {
          delete users[connection.name];
      }
  })
});
// handles sending a message to connection
function sendTo(conn, message) {
    conn.send(JSON.stringify(message));
}