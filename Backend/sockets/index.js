const socketio = require('socket.io');

module.exports = function(server) {
    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', ({ roomId, userId, userName }) => {
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;
            socket.userName = userName;

            // Get all other users in the room
            const clients = io.sockets.adapter.rooms.get(roomId);
            const users = [];
            if (clients) {
                for (const clientId of clients) {
                    if (clientId !== socket.id) {
                        const clientSocket = io.sockets.sockets.get(clientId);
                        if (clientSocket) {
                            users.push({
                                socketId: clientSocket.id,
                                userId: clientSocket.userId,
                                userName: clientSocket.userName
                            });
                        }
                    }
                }
            }

            // Send existing users to the new user
            socket.emit('room-users', users);

            // Broadcast to others that a new user joined
            socket.to(roomId).emit('user-joined', {
                socketId: socket.id,
                userId: userId,
                userName: userName
            });
        });

        socket.on('offer', ({ target, sdp, name }) => {
            socket.to(target).emit('offer', {
                sdp,
                from: socket.id,
                name
            });
        });

        socket.on('answer', ({ target, sdp }) => {
            socket.to(target).emit('answer', {
                sdp,
                from: socket.id
            });
        });

        socket.on('ice-candidate', ({ target, candidate }) => {
            socket.to(target).emit('ice-candidate', {
                candidate,
                from: socket.id
            });
        });

        socket.on('toggle-media', ({ kind, enabled }) => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('toggle-media', {
                    socketId: socket.id,
                    kind,
                    enabled
                });
            }
        });

        const handleDisconnect = () => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-left', {
                    socketId: socket.id
                });
            }
        };

        socket.on('leave-room', ({ roomId }) => {
            socket.leave(roomId);
            handleDisconnect();
            socket.roomId = null;
        });

        socket.on('disconnect', () => {
            handleDisconnect();
            console.log('User disconnected:', socket.id);
        });
    });
};