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
    // check if user is logged with that id
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
        // Initiating a call
        case 'offer':
            console.log('Sending offer to ', data.name);
            var conn = users[data.name];
            if (conn != null) {
                connection.otherName = data.name;
                sendTo(conn, {
                    type: 'offer',
                    offer: data.offer,
                    name: connection.name
                });
            }
            break;
        // Answering a call
        case 'answer':
            console.log('Sending answer to ', data.name);
            var conn = users[data.name];
            if (conn != null) {
                connection.otherName = data.name;
                sendTo(conn, {
                    type: 'answer',
                    answer: data.answer
                });
            }
            break;
        // Handling ICE candidates
        case 'candidate':
            console.log('Sending candidate to ', data.name);
            var conn = users[data.name];
            if (conn !=null) {
                sendTo(conn, {
                    type: 'candidate',
                    candidate: data.candidate
                });
            }
            break;
        // Hanging up a call
        case 'leave':
            console.log('Disconnecting user from ', data.name);
            var conn = users[data.name];
            conn.otherName = null;
            if (conn != null) {
                sendTo(conn, {
                    type: 'leave'
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
          if (connection.otherName) {
              console.log('Disconnecting user from ', connection.otherName);
              var conn = users[connection.otherName];
              conn.otherName = null;
              if (conn != null) {
                  sendTo(conn, {
                      type: 'leave'
                  });
              }
          }
      }
  })
});
// handles sending a message to connection
function sendTo(conn, message) {
    conn.send(JSON.stringify(message));
}
// listening handler for notifing when the server is ready to accept WebSocket connections
wss.on('listening', function () {
    console.log('Server started ...');
});