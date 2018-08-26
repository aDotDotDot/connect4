const Discord = require('discord.js');
const logger = require('winston');
const connect4 = require('./connect4/connect4.js');

const auth = require('./auth.json');
const runningGames = new Map();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';



const playTheGame = (msg) => {
    if(runningGames.has(msg.author.id)){
        console.log(runningGames);
    }else{
        runningGames.set(msg.author.id, new connect4());
    }
};


const emojiToCol = new Map();
emojiToCol.set('\u0031\u20E3',0);
emojiToCol.set('\u0032\u20E3',1);
emojiToCol.set('\u0033\u20E3',2);
emojiToCol.set('\u0034\u20E3',3);
emojiToCol.set('\u0035\u20E3',4);
emojiToCol.set('\u0036\u20E3',5);
emojiToCol.set('\u0037\u20E3',6);
let theMsgWeWorkWith;

const createDisplayGrid = (grid) => {
    let theCurrentGrid = grid.getGridForDisplay();
    let msgTxt = "";
    for(let row of theCurrentGrid){   
        msgTxt += row.join('')
        .replace(/0/g,':full_moon: ')
        .replace(/Y/g,':angry: ')
        .replace(/R/g,':rage: ');
        msgTxt+='\n';
    }
    return msgTxt;
}

const createMessageAndCollector = (message) => {
    message.channel.send(createDisplayGrid(runningGames.get(message.author.id)))
    .then(function(msg){
        theMsgWeWorkWith = msg;
        msg.react('\u0031\u20E3').then(() => {
            msg.react('\u0032\u20E3').then(() => {
                msg.react('\u0033\u20E3').then(() => {
                    msg.react('\u0034\u20E3').then(() => {
                        msg.react('\u0035\u20E3').then(() => {
                            msg.react('\u0036\u20E3').then(() => {
                                msg.react('\u0037\u20E3');
                            })
                        })
                    })
                })
            })
        });
        let filter = function(reaction, user){
            return user.id != bot.user.id && user.id == message.author.id;
        };
        let collector = msg.createReactionCollector(filter, { time: 60000 });
        collector.on('collect', function(reaction){
            console.log(theMsgWeWorkWith);
            if(emojiToCol.has(reaction.emoji.name)){
                let g = runningGames.get(message.author.id);
                g.play('R', emojiToCol.get(reaction.emoji.name));
                g.IA_cleanSmartPlay('Y');
                if(g.isWon()||g.isDraw()){
                    theMsgWeWorkWith.delete()
                    .then(()=>{
                        collector.stop();
                        message.channel.send(createDisplayGrid(g));
                        if(g.isDraw())
                            message.channel.send(`Match nul`);
                        if(g.isWon())
                            message.channel.send(`Les ${((g._winner == 'Y')?':angry:':':rage:')} gagnent !`);
                        runningGames.delete(message.author.id);
                    })
                    .catch(console.log("Cannot delete"));
                }
                else{
                    theMsgWeWorkWith.delete()
                    .then(()=>{
                        collector.stop();
                        createMessageAndCollector(message);
                    })
                    .catch(console.log("Cannot delete"));
                }
                console.log(g);
            }
        });
        collector.on('end', function(collected, reason){
      
        });
    });
};

// Initialize Discord Bot
const bot = new Discord.Client();

/* Bot stuff, creating ready event*/
bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});

bot.on('message', (message) => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `prefix`
    let prefix = "µ";
    if(message.author.id == bot.user.id)
        return;
    if (message.content.substring(0, 1) == prefix) {   
        let args = message.content.substring(prefix.length).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            case 'p4':
                playTheGame(message);
                createMessageAndCollector(message);
                /*
                theMsgWeWorkWith = message.channel.send('Play')
                .then(function(msg){
                    msg.react('\u0031\u20E3').then(() => {
                        msg.react('\u0032\u20E3').then(() => {
                            msg.react('\u0033\u20E3').then(() => {
                                msg.react('\u0034\u20E3').then(() => {
                                    msg.react('\u0035\u20E3').then(() => {
                                        msg.react('\u0036\u20E3').then(() => {
                                            msg.react('\u0037\u20E3');
                                        })
                                    })
                                })
                            })
                        })
                    });
                    var filter = function(reaction, user){
                        return user.id != bot.user.id;
                    };
                    const collector = msg.createReactionCollector(filter, { time: 60000 });
                    collector.on('collect', function(reaction){
                        if(emojiToCol.has(reaction.emoji.name)){
                            let g = runningGames.get(message.author.id);
                            g.play('R', emojiToCol.get(reaction.emoji.name));
                            g.IA_cleanSmartPlay('Y');
                            if(g.isWon())
                                message.channel.send("PArtie terminée");
                            console.log(g);
                        }
                    });
                    collector.on('end', function(collected, reason){
                  
                    });
                });*/
            break;
            case 'p4play':
                console.log(runningGames.get(message.author.id));
            break;
         }
     }
});

bot.login(auth.token);
