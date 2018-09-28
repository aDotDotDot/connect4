const Reversi = require('./reversi/reversi.js');
const fs = require('fs');
const app = require('express')();
const https = require('https');
const privateKey = fs.readFileSync('./privkey.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');
const ca = fs.readFileSync('./chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
const httpsServer = https.createServer(credentials, app);

//const http = require('http').Server(app);
const io = require('socket.io')(httpsServer);

const currentUsers = new Map();
const generateId = () => {
    const charz = 'abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/-';
    let genId = "";
    while(currentUsers.has(genId) || genId.length < 5){
        genId+=charz[Math.floor(Math.random()*charz.length)];
    }
    currentUsers.set(genId, {game:new Reversi(), color: 'B'});
    return genId;
}

io.on('connection', (socket) =>{
    let id = generateId();
    let currentUser = currentUsers.get(id);
    currentUser.socket = socket;
    currentUsers.set(id, currentUser);
    let game = currentUser.game;
    let color = currentUser.color;
    socket.emit('game ready', currentUser.game.rawGrid);
    socket.on('new game', (data)=>{
        currentUser.game = new Reversi();
        currentUsers.set(id, currentUser);
        game = currentUser.game;
        color = currentUser.color;
        socket.emit('game ready', currentUser.game.rawGrid);
    });
    socket.on('click', (data) =>{
        let col = game.grid._colNames[data.col];
        let row = game.grid._rowNames[data.row];
        if(game.play(col, row, color)){
            while(!game._isFinished && game._turn === 'W'){
                game.AI_PlayRandom('W');
            }
            if(game._isFinished){
                socket.emit('game finished', {_currentCount: game.grid._currentCount, grid:game.rawGrid, transcript:game.transcript});
            }
        }
        socket.emit('turn', game.rawGrid);
    });

    socket.on('disconnect', ()=>{
        currentUsers.delete(id);
    })
});


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/reversi/index-express.html`);
});


/*http.listen(2345, () => {
    console.log('listening http on *:2345');
  });*/
httpsServer.listen(3456, () => {
  console.log('listening https on *:3456');
});