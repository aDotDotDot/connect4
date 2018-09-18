//const ffmpeg = require('fluent-ffmpeg');
const moment = require('moment');
const number_of_elements = 4;
class Simon{
    //the main objective is to have the current sequence
    constructor(){
        this._sequence = new Array();
        this._possibleValues = new Array(number_of_elements);
        this._mapValues = new Map();//we will work with the indexes, but we want to be able to use images, sounds etc...
        for(let i = 0; i < number_of_elements; i++)
            this._mapValues.set(i,null);
    }
    getRandomInt(theMin, theMax){
        return theMin + Math.floor(Math.random() * Math.floor(theMax));
    }
    next(){
        this._sequence.push(this.getRandomInt(0,this._possibleValues.length));
        return this._sequence;
    }
    get sequence(){
        return this._sequence;
    }
    set sequence(seq){
        this._sequence = seq;
    }
    checkSequence(seq){
        return JSON.stringify(seq)==JSON.stringify(this._sequence);//waaaaaay easier in JSON
    }
    setValue(index, item){
        if(index >= 0 && index < number_of_elements){
            this._mapValues.set(index, item);
        }
    }
    getValue(index){
        return this._mapValues.get(index);
    }
    get mapped(){
        return this._sequence.reduce( (acc, elt) => {
            acc.push(this._mapValues.get(elt));
            return acc;
        }, []);
    }
}

class SimonDiscordPlayer{
    constructor(msg, client){
        this._message = msg;
        this._client = client;
        this._currentGame = new Simon();
    }
    init_players(){
        return new Promise((resolve, reject) => {
            this._message.channel.send(`Cliquez sur le :white_check_mark: pour jouer à la prochaine partie, vous avez 10s`)
            .then((msg)=>{
                this._editMsg = msg;
                msg.react("\u2705").then(()=>{
                    let filter = (reaction, user) => {
                        return user.id != this._client.user.id && reaction.emoji.name == "\u2705";
                    };
                    let collector = msg.createReactionCollector(filter, { time: 10000 });
                    collector.on('end', (collected, reason)=>{
                    try{
                        this._players = collected.get("\u2705").users.filter(user=>user.id != this._client.user.id);
                        if(this._players.size == 0)
                            reject('No one is playing');
                        else
                            resolve(this._players);
                    }catch(err){
                        this._players = null;
                        reject('No one is playing');
                    }
                       
                    });
                }).catch(e=>reject(e));
            }).catch(e=>reject(e));
        });
    }

    rules(){
        return new Promise((resolve, reject) => {
            this._editMsg.edit(
            `C'est un jeu de mémorisation, vous allez jouer en cliquant sur les réactions :
:one: :two: :three: :four: 
Le jeu démarrera dans 10 secondes`).then(msg=>{
                setTimeout(() => {
                    resolve('go');
                }, 10000);
            })
        });
    }

    showEveryStep(seq, idx){
        return new Promise((resolve, reject) => {
            if(seq.length == 0)
                reject('finished');
            else{
                let item = this._currentGame.getValue(seq[0]);
                let s = seq.splice(1);
                console.log(s);
                this._editMsg.edit(`${((idx%2==0)?'*':'-')}${item}`).then(()=>{
                    setTimeout(()=>{
                        resolve(this.showEveryStep(s, idx+1));
                    }, 1000);
                });
            }
        });
    }

    turn(){
        return new Promise((resolve, reject) => {
            this._editMsg.clearReactions();
            this._currentGame.next();
            this._currentGame.next();

            this._currentGame.next();
            this._currentGame.next();
            this._currentGame.next();
            this._currentGame.next();
            this._currentGame.next();

            this.showEveryStep(this._currentGame.sequence, 1)
            .then()
            .catch(e=>{
                console.log(e);
                resolve('gogogo');
            });
        });
    }

    play(){
        this._currentGame.setValue(0,':one:');
        this._currentGame.setValue(1,':two:');
        this._currentGame.setValue(2,':three:');
        this._currentGame.setValue(3,':four:');
        this.init_players().then( (players)=>{//first, we get some players
            this._editMsg.clearReactions();
            this._editMsg.edit(`${players.size} joueur${(players.size>1?'s':'')}`);
            this.rules().then( () => {
                //this._editMsg.edit(`Goooooooo!!!!`);
                this.turn().then(()=>{
                    this._editMsg.edit('Préparez-vous').then( ()=>{
                        this._editMsg.clearReactions().then( ()=>{
                            this._editMsg.react('\u0031\u20E3').then(()=>{
                                this._editMsg.react('\u0032\u20E3').then(()=>{
                                    this._editMsg.react('\u0033\u20E3').then(()=>{
                                        this._editMsg.react('\u0034\u20E3').then(()=>{
                                            this._editMsg.edit(`Vous avez 30s`);
                                        });
                                    });
                                });
                            });
                        });
                    });
                }).catch(e=>{
                    console.log(e);
                });
            }).catch(e=>{
                console.log(e);
            })
        }).catch( e =>{
            console.log(e);
            this._editMsg.clearReactions();
            this._editMsg.edit(`Partie annulée, pas assez de joueurs`);
        })
    }
}

module.exports = {Simon: Simon, SimonDiscordPlayer:SimonDiscordPlayer};
/*
simon sound => normal
simon images
simon emoji
simon couleurs
simon texte
*/