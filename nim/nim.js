

const white_exclamation_mark = '\u2755';
const exclamation_mark = '\u2757';
const board_size = 30;
const max_per_turn = 3;
module.exports = class Nim {
    constructor() {
        //we will have an array representing the board
        this._chatty = false;
        this._grid = new Array();
        this._allMoves = new Array();
        this._players = [0,1];
        this._players_ids = new Map([[0,'Bot n°0'],[1,'Bot n°1']]);
        this._turn = 0;
        this._finished = false;
        for(let col = 0; col < board_size; col++){
            this._grid[col] = 1;
        }
        this._current_pos = this._grid.length - 1;
    }
    get grid(){
        return this._grid;
    }
    set grid(grid){
        return this._grid = grid;
    }
    getRandomInt(theMin, theMax){
        return theMin + Math.floor(Math.random() * Math.floor(theMax));
    }
    displayGrid(forDiscord = false){
        let st = "";
        for(let col = 0; col < board_size; col++){
            if(forDiscord)
                st += (this._grid[col]==1?`${exclamation_mark}`:`${white_exclamation_mark}`);
            else
                st += (this._grid[col]==1?`| `:`_ `);
        }
        return st;
    }
    take(player, nb){
        if(player != this._turn){
            if(this._chatty)
                console.log("Trying to play while not your turn");
            return false;
        }
        if((this._current_pos +1 ) <= nb ){//we can take more than the number remaining, GG you won
            if(this._chatty)
                console.log(`Winning move by ${player} taking ${nb} objects`);
            this._allMoves.push({player:player, take:nb, remaining:0});
            this._winner = player;
            this._finished = true;
            return true;
        }
        if(nb > 0 && nb <= max_per_turn){//if we are taking a valid amount
            if(this._chatty)
                console.log(`Player ${player} takes ${nb}`);
            for(let i = this._current_pos; i >= (this._current_pos - nb + 1); i--){
                this._grid[i] = 0;
            }
            this._current_pos -= nb;
            this._allMoves.push({player:player, take:nb, remaining:this._current_pos+1});
            this._turn = (this._turn + 1)%2;//either 1 or 0
            return true;
        }
        if(this._chatty)
            console.log(`Trying to take ${nb} while limit is ${max_per_turn}`);
        return false;
    }

    IA_Play(player){
        let remaining_obj = this._current_pos + 1;
        console.log(`${remaining_obj} remaining`);
        if( remaining_obj <= max_per_turn){//we win this turn
            if(this._chatty)
                console.log(`IA winning`);
            this.take(player, max_per_turn);
        }else{//we try to win by getting a multiple of 4
            let wait = true;
            for(let n = 3; n > 0; n--){
                if((remaining_obj - n)%4 == 0){
                    this.take(player, n);
                    wait = false;
                    break;
                }
            }
            if(wait)
                this.take(player, 1);//cannot win now, playing it slow
        }
    }
    IA_Play_Random(player){
        let remaining_obj = this._current_pos + 1;
        console.log(`${remaining_obj} remaining`);
        if( remaining_obj <= max_per_turn){//we win this turn
            if(this._chatty)
                console.log(`IA winning`);
            this.take(player, max_per_turn);
        }else{//we try to win by getting a multiple of 4
            this.take(player,this.getRandomInt(1,3));//cannot win now, playing it slow
        }
    }
}