## Basic signaling server for connecting WebRTC users
- login
`{ "type": "login", "name": "UserB" }`
- send offer
`{ "type": "offer", "name": "UserB", "offer": "Hello" }`
- send answer
`{ "type": "answer", "name": "UserA", "answer": "Hello to you too!" }`