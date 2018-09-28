const Discord = require('discord.js');
const logger = require('winston');
const connect4 = require('./connect4/connect4.js');
const nim = require('./nim/nim.js');
const {Simon, SimonDiscordPlayer, SimonSound} = require('./simon/simon.js');
const fs = require('fs');
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

let simon_players = new Map();
let simon_lost = new Map();

const simonEmojis = new Map([[0,"\u26EA"],[1,"\u23F0"],[2,"\u260E"],[3,"\uD83D\uDE84"]]);
const emojisSimon = new Map([["\u26EA",0],["\u23F0",1],["\u260E",2],["\uD83D\uDE84",3]]);

const simonTurn = (message, client, connection, game, audioSequence ) => {
    let sequence = game.sequence;
    console.log(sequence);
    return new Promise( (resolve, reject) => {
        const dispatcher = connection.playFile(audioSequence);
        dispatcher.on('end', (reasonD)=>{
            message.channel.send(`Préparez-vous, attendez les émojis`).then( (msg) => {
                msg.react("\u26EA").then(()=>{
                    msg.react("\u23F0").then(()=>{
                        msg.react("\u260E").then(()=>{
                            msg.react("\uD83D\uDE84").then(()=>{
                                let timeAllowed = 1000*(8 + sequence.length);
                                msg.edit(`Vous avez ${(timeAllowed/1000)}s pour refaire la séquence entière`);
                                let filter = (reaction, user) => {
                                    return user.id != client.user.id && emojisSimon.has(reaction.emoji.name);
                                };
                                let collector = msg.createReactionCollector(filter, { time: timeAllowed });
                                collector.on('collect', (reaction, thisCollector) => {
                                    reaction.users.map( (user) => {
                                        if(user.id == client.user.id) return;
                                        if(simon_players.has(user.id)){
                                            let currentSeqUser = simon_players.get(user.id);
                                            let emojiId = emojisSimon.get(reaction.emoji.name);
                                            currentSeqUser.push(emojiId);
                                            simon_players.set(user.id, currentSeqUser);
                                            reaction.remove(user).catch(e=>console.log);
                                        }
                                    });
                                });
                                collector.on('end', (reason, collected) => {
                                    let lost_at_this_round = [];
                                    simon_players.forEach( (v,k) => {
                                        if(v.length != sequence.length){
                                            simon_players.delete(k);
                                            lost_at_this_round.push(message.guild.members.find(user => user.id == k));
                                            simon_lost.set(k, {user_seq:v, good_seq:sequence});
                                            return;
                                        }
                                        else{
                                            for(let i = 0; i < sequence.length; i++){
                                                if(sequence[i]!=v[i]){
                                                    simon_players.delete(k);
                                                    lost_at_this_round.push(message.guild.members.find(user => user.id == k));
                                                    simon_lost.set(k, {user_seq:v, good_seq:sequence});
                                                    return;
                                                }
                                            }
                                        }
                                        simon_players.set(k, []);
                                    });
                                    let editMsg = ``;
                                    if(lost_at_this_round.length>0){
                                        let lost_text = ``;
                                        for(let u of lost_at_this_round){
                                            lost_text += `${u} `;
                                        }
                                        editMsg = `Nous venons de perdre ${lost_text}\n`;
                                    }
                                    if(simon_players.size>0){
                                        editMsg += `${simon_players.size} joueur${((simon_players.size>1)?'s':'')} encore en lice.\n`;
                                        editMsg += `Tour ${sequence.length} terminé, préparez-vous pour la suite`;
                                    }
                                    msg.edit(editMsg).then(()=>{
                                        fs.unlink(audioSequence, (err)=>{
                                          resolve(msg);  
                                        });
                                    });
                                });
                            })
                        })
                    })
                });
            }).catch(e=>reject(e));
        })
    });
}

const sequenceToEmojis = (sequence)=>{
    let ms = ``;
    for(let i of sequence){
        ms+=`${simonEmojis.get(i)} `;
    }
    return ms;
};

const simonLoop = async (message, client, connection, game) => {
    while(simon_players.size > 0){
        //console.log('loop');
        game.next();
        let audioSequence = await game.createSequence();
        let msg = await simonTurn(message, client, connection, game, audioSequence);
        setTimeout(() => {
            msg.delete();
        }, 3500);
    }
    //console.log("simon finished");
    let ms = `Tout le monde a perdu, partie terminée sur la séquence `;
    ms+=sequenceToEmojis(game.sequence)+`\n`;
    simon_lost.forEach( (v,k)=>{
        let us = message.guild.members.find(user => user.id == k);
        ms+= `${us} a perdu au tour ${v.good_seq.length} `;
        if(v.user_seq.length == 0)
            ms+= `en ne faisant rien\n`;
        else
            ms+= `avec la séquence ${sequenceToEmojis(v.user_seq)}\n`;
    });
    message.channel.send(ms);
    current_simon_game = false;
    connection.disconnect();
    return "game finished";
}
let current_simon_game = false;
let audioChanPlay = new Map([['437369409091272725','437691550622023680'],['401667451189985280','401669627391770625']])

const simonSoundPlay = async (message, client, game) => {
    simon_lost = new Map();
    let channel = client.channels.get(audioChanPlay.get(message.guild.id));
    channel.join().then((connection) => {
        simonLoop(message, client, connection, game);
    }).catch(e=>{
        console.error(e);
        current_simon_game = false;
        message.channel.send('Impossible de rejoindre le vocal, partie annulée');
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
        case 'simon':
            if(!current_simon_game){
                current_simon_game = true;
                message.channel.send(`Qui pour une partie de Simon ?`).then( msg=>{
                    msg.react("\u270B").then(()=>{
                        let filter = (reaction, user) => {
                            return user.id != bot.user.id &&  reaction.emoji.name == "\u270B";
                        };
                        let collector = msg.createReactionCollector(filter, { time: 15000 });
                        collector.on('end', (collected, reason)=>{
                            try{
                                collected.get("\u270B").users.map( (user)=>{
                                    if(user.id != bot.user.id){
                                        simon_players.set(user.id, []);
                                    }
                                });
                                msg.clearReactions();
                                if(simon_players.size > 0){
                                    let m = `Nous avons donc ${simon_players.size} joueur${((simon_players.size > 1)?'s':'')} :\n`;
                                    simon_players.forEach( (v,k) => {
                                        let us = message.guild.members.find(user => user.id == k);
                                        m += `${us}\n`;
                                    });
                                    m+=`La partie va démarrer dans **5** secondes, **rejoignez vite le vocal si ce n'est pas fait**`
                                    msg.edit(m).then(()=>{
                                       setTimeout(() => {
                                            msg.delete();
                                            let g = new SimonSound();
                                            current_simon_game = true;
                                            simonSoundPlay(message, bot, g);
                                       }, 5000); 
                                    });
                                }else{
                                    msg.edit(`Ok, personne ne veut jouer :(`);
                                    current_simon_game = false;
                                }
                            }catch(e){
                                msg.clearReactions();
                                msg.edit(`Ok, personne ne veut jouer :(`);
                                current_simon_game = false;
                            }
                        });
                    })
                }).catch(e=>console.error);
            }else{
                message.channel.send('une partie est déjà en cours');
            }

            /*let g = new SimonSound();
            simonSoundPlay(message, bot, g);*/
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
