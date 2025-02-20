module.exports = function (io) {
    // io realted function will be defined here:
    io.on("connection", async(socket) => {
        console.log("client is connected", socket.id);
    });
};