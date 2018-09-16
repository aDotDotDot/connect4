const Discord = require('discord.js');
const logger = require('winston');
const connect4 = require('./connect4/connect4.js');
let nim = require('./nim/nim.js');
const helper = require('../help-generator/help.js');
const { image2ascii, url2base64, url2Buffer, animatedGifToAscii, gifUrl2Buffer } = require('./img2ascii/img2ascii.js');
//const url2base64 = require('./img2ascii/img2ascii.js').url2Base64;
//const url2Buffer = require('./img2ascii/img2ascii.js').url2Buffer;

const auth = require('./auth.json');
const runningGames = new Map();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';



const p4_playTheGame = (msg) => {
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

const colToEmoji =  new Map();
colToEmoji.set(1, '\u0031\u20E3');
colToEmoji.set(2, '\u0032\u20E3');
colToEmoji.set(3, '\u0033\u20E3');
colToEmoji.set(4, '\u0034\u20E3');
colToEmoji.set(5, '\u0035\u20E3');
colToEmoji.set(6, '\u0036\u20E3');
colToEmoji.set(7, '\u0037\u20E3');
let theMsgWeWorkWith;

const p4_createDisplayGrid = (grid) => {
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

const p4_createMessageAndCollector = (message) => {
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
        collector.on('end', function(collected, reason){});
    });
};

const nim_games = new Map();
const nim_valid_moves = new Map();
nim_valid_moves.set('\u0031\u20E3',1);
nim_valid_moves.set('\u0032\u20E3',2);
nim_valid_moves.set('\u0033\u20E3',3);
const nim_playTheGame = (msg, vs = false, mod = false) => {
    if(nim_games.has(msg.author.id)){
        console.log(nim_games);
    }else{
        let gg = new nim(mod);
        gg._players_ids.set(0, msg.guild.members.get(msg.author.id));
        if(vs)
            gg._players_ids.set(1, msg.guild.members.get(msg.mentions.users.first().id));

        nim_games.set(msg.author.id, {vs: gg._players_ids.get(1) , game:gg});
    }
};
const nim_createMsgAndCollector = (message, vsIA = false, random = false) => {
    let theGrid = (nim_games.get(message.author.id)).game.displayGrid(true);
    message.channel.send(`\`\`\`${theGrid}\`\`\``)
    .then((msg) => {
        theMsgWeWorkWith = msg;
        msg.react('\u0031\u20E3').then(() => {
            msg.react('\u0032\u20E3').then(() => {
                msg.react('\u0033\u20E3').then(() => {

                })
            })
        });

        let filter = (reaction, user) => {
            return user.id != bot.user.id && user.id == message.author.id;
        };
        let collector = msg.createReactionCollector(filter, { time: 300000 });
        collector.on('collect', (reaction, thisCollector) => {
            if(nim_valid_moves.has(reaction.emoji.name)){
                //console.log(reaction);
                reaction.remove(message.author.id).then(()=>{}).catch(()=>{});
                let g = nim_games.get(message.author.id).game;
                if(vsIA)
                    g.take(0,nim_valid_moves.get(reaction.emoji.name));
                else{
                    g.take(g._turn,nim_valid_moves.get(reaction.emoji.name));
                    let secondFilter = (reaction, user) => {
                        console.log(user.id, g._players_ids.get(g._turn).id );
                        return user.id != bot.user.id && user.id == g._players_ids.get(g._turn).id;
                    };
                    thisCollector.filter = secondFilter;
                    console.log(collector.filter, thisCollector.filter);
                }
                if(vsIA && !g._finished){
                    if(random)
                        g.IA_Play_Random(1);//playing vs dumb IA 
                    else
                        g.IA_Play(1);//playing vs IA
                }
                if(g._finished){
                    theMsgWeWorkWith.edit(`Partie terminée, victoire de ${(g._players_ids.get(g._winner))}`)
                    .then(()=>{
                        collector.stop();
                        theMsgWeWorkWith.reactions.map( (e)=>{
                            e.remove(bot.user.id);
                        });
                        nim_games.delete(message.author.id);
                    })
                    .catch(e => console.log(e));
                }
                else{
                    theMsgWeWorkWith.edit(`${(g._players_ids.get((g._allMoves[g._allMoves.length - 1]).player))} retire ${(g._allMoves[g._allMoves.length - 1]).take} bâtonnet${(((g._allMoves[g._allMoves.length - 1]).take<2)?'':'s')}, il en reste ${(g._current_pos+1)}\n\`\`\`${g.displayGrid(true)}\`\`\``)
                    .then(()=>{
                        //console.log('coucou');
                    })
                    .catch(e => console.log(e));
                }
                //console.log(g);
            }
        });
        collector.on('end', function(collected, reason){
            if(reason == 'time'){
                theMsgWeWorkWith.edit(`Partie terminée, personne n'a joué depuis 5 minutes`);
                theMsgWeWorkWith.reactions.map( (e)=>{
                    e.remove(bot.user.id);
                });
            }
        });
    });
}





let cpt = 0;
let ordcpt = '+';

const playWithTux = {message_tux:null, game: new connect4(), isStarted:false};

// Initialize Discord Bot
const bot = new Discord.Client();

/* Bot stuff, creating ready event*/
bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
});
bot.on('disconnect', (evt) => {
    bot.login(auth.token);
});
bot.on('error', console.error);
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
            case 'help':
                let h = new helper.HelpBot('weekly');
                h.loadConfig().then(()=>{
                    message.channel.send({embed:h.generateDiscordHelp()});
                }).catch(e=>console.log(e))
            break;
            case 'p4':
                p4_playTheGame(message);
                p4_createMessageAndCollector(message);
            break;
            case 'p4tux':
                message.channel.send('!p4');
            break;
            case 'pi':

            break;
            case 'img2ascii':
                if(message.attachments.size > 0){
                    message.attachments.map( (att) => {
                        message.channel.send(`En raison des limitations de Discord, le processus est assez long pour recréer une image, merci de patienter =)`)
                        .then( msgToDel => {
                            url2Buffer(att.url, true).then(bImg => {
                                image2ascii(bImg, true).then( ob => {
                                    msgToDel.delete().then().catch();
                                    message.channel.send(`${ob.ascii.length} symboles ont été utilisés pour ${att.filename}`);
                                    const attachment = new Discord.Attachment(ob.image, 'ascii.png');
                                    message.channel.send(attachment);
                                }).catch( e => {
                                    console.log(e);
                                    message.channel.send(`Le fichier ${att.filename} est invalide`);
                                })
                            }).catch(e=>console.log(e));
                        }).catch( e => console.error);

                    });
                }else{
                    message.channel.send(`Il me faut une image à convertir !`);
                }
            break;
            case 'img2txtfile':
                if(message.attachments.size > 0){
                    message.attachments.map( (att) => {
                        url2Buffer(att.url, true).then(bImg => {
                            image2ascii(bImg, false, true).then( ob => {
                                message.channel.send(`${ob.ascii.length} symboles ont été utilisés pour ${att.filename}`);
                                const attachment = new Discord.Attachment(ob.textFile, 'ascii.txt');
                                message.channel.send(attachment);
                            }).catch( e => {
                                console.log(e);
                                message.channel.send(`Le fichier ${att.filename} est invalide`);
                            })
                        }).catch(e=>console.log(e));
                    });
                }else{
                    message.channel.send(`Il me faut une image à convertir !`);
                }
            break;
            case 'gif2ascii':
            if(message.attachments.size > 0){
                message.attachments.map( (att) => {
                    message.channel.send(`En raison des limitations de Discord, le processus est assez long pour recréer une image, merci de patienter =)`)
                    .then( msgToDel => {
                        gifUrl2Buffer(att.url, true).then(bImg => {
                            animatedGifToAscii(bImg).then( ob => {
                                msgToDel.delete().then().catch();
                                //message.channel.send(`${ob.ascii.length} symboles ont été utilisés pour ${att.filename}`);
                                const attachment = new Discord.Attachment(ob.image, 'ascii.gif');
                                message.channel.send(attachment).then(()=>{}).catch(()=>{
                                    message.channel.send("Une erreur s'est produite, le fichier est probablement trop gros pour être envoyé en pièce jointe");
                                });
                            }).catch( e => {
                                console.log(e);
                                message.channel.send(`Le fichier ${att.filename} est invalide`);
                            })
                        }).catch(e=>console.log(e));
                    }).catch( e => console.error);

                });
            }else{
                message.channel.send(`Il me faut une image à convertir !`);
            }
        break;
        case 'nimvsIA':
            if(args[0] == 'mod')
                nim_playTheGame(message, false, true);
            else
                nim_playTheGame(message, false);
            nim_createMsgAndCollector(message, true);
        break;
        case 'nimvs':
            if(message.mentions.users.size > 0){
                if(args[0] == 'mod')
                    nim_playTheGame(message, true, true);
                else
                    nim_playTheGame(message, true);
                nim_createMsgAndCollector(message, false, false);
            }else{
                message.channel.send("Il te faut un adversaire");
            }

        break;
        case 'nimvsIArandom':
            if(args[0] == 'mod')
                nim_playTheGame(message, false, true);
            else
                nim_playTheGame(message, false);
            nim_createMsgAndCollector(message, true, true);
        break;
        }
     }else{
        //console.log(message);
        if(message.author.id == '380775694411497493' && message.content.startsWith('Qui veut jouer avec')){
        //if(message.author.id == '308618848284966912' && message.content.startsWith('Qui veut jouer avec')){
            playWithTux.message_tux = message;
            //console.log(playWithTux);
        }
        if(message.author.id == '380775694411497493' && (message.content.startsWith('Bravo') || message.content.startsWith("Personne m'a répondu pendant 2 minutes"))){
            //if(message.author.id == '308618848284966912' && message.content.startsWith('Qui veut jouer avec')){
                playWithTux.message_tux = null;
                playWithTux.game = new connect4();
                playWithTux.isStarted = false;
                //console.log(playWithTux);{message_tux:null, game: new connect4(), isStarted:false}
            }
     }
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    //console.log(oldMessage.id, newMessage.content);
    if(playWithTux.message_tux && oldMessage.id == playWithTux.message_tux.id){
        //console.log(newMessage.content);
        if(!playWithTux.isStarted){
            if(newMessage.content.startsWith('Voici les règles du jeu')){
                newMessage.react('\u2705').then( msg => {
                    playWithTux.isStarted = true;
                });
            }
        }else{
            if(newMessage.content.startsWith('À toi de jouer <@470634615665590272>')){
                /*let ccc =`À toi de jouer <@308618848284966912> (jeton <:p4jaune:482157809300144128>)

                1⃣2⃣3⃣4⃣5⃣6⃣7⃣
                ⚫⚫⚫⚫<:p4jaune:482157809300144128>⚫⚫
                ⚫⚫⚫⚫<:p4jaune:482157809300144128>⚫⚫
                ⚫<:p4jaune:482157809300144128>⚫⚫<:p4rouge:482157821324951563>⚫⚫
                ⚫<:p4rouge:482157821324951563><:p4rouge:482157821324951563>⚫<:p4jaune:482157809300144128>⚫⚫
                ⚫<:p4jaune:482157809300144128><:p4jaune:482157809300144128>⚫<:p4rouge:482157821324951563>⚫⚫
                <:p4jaune:482157809300144128><:p4rouge:482157821324951563><:p4rouge:482157821324951563><:p4rouge:482157821324951563><:p4jaune:482157809300144128><:p4rouge:482157821324951563>⚫`;
                */
                let cont = newMessage.content.replace('\u0031\u20E3\u0032\u20E3\u0033\u20E3\u0034\u20E3\u0035\u20E3\u0036\u20E3\u0037\u20E3','').split('\n');
                let lines = new Array();
                for(let cpt=0; cpt<6; cpt++){
                    lines[cpt] = cont.pop().replace(/<\:p4rouge\:482157821324951563>/g,'R')
                                            .replace(/<\:p4jaune\:482157809300144128>/g,'Y')
                                            .replace(/⚫/g,'0')
                                            .replace(/\s/g,'').split('');
                }
                //console.log(lines);
                let gTest = new Array();
                for(let i=0; i<7; i++){
                    gTest[i] = new Array();
                    for(let j=0; j<6; j++){
                        if(lines[j][i] == '0')
                            gTest[i][j] = 0;
                        else
                            gTest[i][j] = lines[j][i];
                    }
                }
                //console.log(gTest);
                playWithTux.game.grid = gTest;
                playWithTux.game._turn = 'R';
                //console.log(playWithTux.game);
                try{
                    console.log(playWithTux.game.IA_cleanSmartPlay('R'));
                    let lastMove = playWithTux.game.undoLastMove();
                    let colToPlay = lastMove.col + 1;
                    //console.log(colToPlay, colToEmoji.get(colToPlay));
                    newMessage.react(colToEmoji.get(colToPlay));
                }catch(e){
                    newMessage.react(colToEmoji.get(playWithTux.game.getRandomInt(1,7)));
                }
               
            }
        }
    }
});

bot.login(auth.token);
