const net = require("net");
const readline = require("readline");
const resp = require("./resp");
// create readline input and output interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// exit if enough arguments are not provided
if (process.argv.length < 4) {
    console.log("Not enough arguments provided.");
    process.exit();
}
// get hostname and port from arguments
const HOSTNAME = process.argv[2];
const PORT = process.argv[3];
// create socket and connect to host and port
const socket = net.connect(PORT, HOSTNAME);
// function to read line from stdin
function enterCommand(query) {
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            resolve(ans);
        })
    );
}
// function to send and receive data to and from socket
function sendAndRecieve(socket, commandRESPEncoded) {
    return new Promise((resolve) => {
        socket.write(commandRESPEncoded, () => {
            socket.on("data", (data) => {
                resolve(data);
            });
        });
    });
}
// function implementing command-line loop
async function cli() {
    const RESP = new resp.RESP();
    while (true) {
        let command = await enterCommand("redis> ");
        command = command.split(" ");
        commandArray = [];
        for (let i = 0; i < command.length; i++) {
            commandArray.push(Buffer.from(command[i]));
        }
        const commandRESPEncoded = RESP.encode(commandArray);
        data = await sendAndRecieve(socket, commandRESPEncoded);
        const commandRESPDecoded = RESP.decode(data);
        console.log(commandRESPDecoded.toString());
    }
}
// start command-line loop
cli();