class ReversiGrid{
    constructor(){
        this._grid = new Array(8)
        for(let i = 0; i < 8; i++){
            this._grid[i] = new Array(8);
            for(let j = 0; j < 8; j++){
                this._grid[i][j] = [];
            }
        }
        //                 0    1    2    3    4    5    6    7
        this._colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this._rowNames = ['1', '2', '3', '4', '5', '6', '7', '8'];
        this._colors = ['B', 'W'];
        this._grid[3][3] = 'W';
        this._grid[3][4] = 'B';
        this._grid[4][4] = 'W';
        this._grid[4][3] = 'B';
        this._currentCount = {'B': 2, 'W': 2};
    }
    get grid(){
        return this._grid;
    }
    set grid(gr){
        this._grid = gr;
    }
    availablePositions(){
        /*
        we will set the available positions in the grid
        if nothing can be played : []
        if B or W only : ['B']//['W']
        if both : ['B','W'];
        */
       this._availablePositions = new Array();
        for(let col = 0; col < 8; col++){
            for(let row = 0; row < 8; row++){
                let adj = this.adjacentFrom(col, row);
                if(adj.length > 0){
                    this._availablePositions.push(adj);
                }
            }
        }
        return this._availablePositions;
    }
    setAvailableOnGrid(){
        this._totalWhiteAvailable = 0;
        this._totalBlackAvailable = 0;
        this._currentCount['B'] = 0;
        this._currentCount['W'] = 0;
        for(let col = 0; col < 8; col++){
            for(let row = 0; row < 8; row++){
                if(this.isEmpty(col, row)){
                    let cg = this.canGo(col, row);
                    this._grid[row][col] = cg;
                    if(cg.includes('B')) this._totalBlackAvailable++;
                    if(cg.includes('W')) this._totalWhiteAvailable++;
                }else{
                    if(this._grid[row][col] === 'B') this._currentCount['B']++;
                    if(this._grid[row][col] === 'W') this._currentCount['W']++;
                }
            }
        }
    }
    wouldTurnFrom(idxCol, idxRow, color){
        /*
        returns what would be turned if we played <color> at this position
        */
        let upperCol = [];
        let lowerCol = [];
        let leftRow = [];
        let rightRow = []
        let upperLeftDiagonal = [];
        let upperRightDiagonal = [];
        let lowerLeftDiagonal = [];
        let lowerRightDiagonal = [];
        let col = idxCol - 1;
        while(col >= 0 && !this.isEmpty(col, idxRow) && this._grid[idxRow][col] !== color ){
            upperCol.push([col, idxRow]);
            col--;
        }
        if(!(col >= 0 && this._grid[idxRow][col] === color))//are wee keepîng this ? only if the next square is the right color
            upperCol = [];
        col = idxCol + 1;
        while(col < 8 && !this.isEmpty(col, idxRow) && this._grid[idxRow][col] !== color){
            lowerCol.push([col, idxRow]);
            col++;
        }

        if(!(col < 8 && this._grid[idxRow][col] === color))//are wee keepîng this ? only if the next square is the right color
            lowerCol = [];
        let row = idxRow + 1;
        while(row < 8 && !this.isEmpty(idxCol, row) && this._grid[row][idxCol] !== color){
            rightRow.push([idxCol, row]);
            row++
        }
        if(!(row < 8 && this._grid[row][idxCol] === color))//are wee keepîng this ? only if the next square is the right color
            rightRow = [];

        row = idxRow - 1;
        while(row >=0 && !this.isEmpty(idxCol, row) && this._grid[row][idxCol] !== color){
            leftRow.push([idxCol, row]);
            row--;
        }

        if(!(row >= 0 && this._grid[row][idxCol] === color))//are wee keepîng this ? only if the next square is the right color
            leftRow = [];
        row = idxRow - 1;
        col = idxCol - 1;
        while(row >= 0 && col >= 0 && !this.isEmpty(col, row) && this._grid[row][col] !== color ){
            upperLeftDiagonal.push([col, row]);
            col--;
            row--;
        }
        if(!(row >= 0 && col >= 0 && this._grid[row][col] === color))
            upperLeftDiagonal = [];
        row = idxRow + 1;
        col = idxCol - 1;
        while(row < 8 && col >= 0 && !this.isEmpty(col, row) && this._grid[row][col] !== color ){
            lowerLeftDiagonal.push([col, row]);
            col--;
            row++;
        }
        if(!(row < 8 && col >= 0 && this._grid[row][col] === color))
            lowerLeftDiagonal = [];
        row = idxRow + 1;
        col = idxCol + 1;
        while(row < 8 && col < 8 && !this.isEmpty(col, row) && this._grid[row][col] !== color ){
            lowerRightDiagonal.push([col, row]);
            col++;
            row++;
        }
        if(!(row < 8 && col < 8 && this._grid[row][col] === color))
            lowerRightDiagonal = [];
        row = idxRow - 1;
        col = idxCol + 1;
        while(row >= 0 && col < 8 && !this.isEmpty(col, row) && this._grid[row][col] !== color ){
            upperRightDiagonal.push([col, row]);
            col++;
            row--;
        }
        if(!(row >= 0 && col < 8 && this._grid[row][col] === color))
            upperRightDiagonal = [];
        return upperLeftDiagonal.concat(lowerLeftDiagonal)
                                .concat(lowerRightDiagonal)
                                .concat(upperRightDiagonal)
                                .concat(rightRow)
                                .concat(leftRow)
                                .concat(upperCol)
                                .concat(lowerCol);
    }
    canGo(idxCol, idxRow){
        /*
        returns what color can go in this square
        */
        let ret = [];
        if(this.wouldTurnFrom(idxCol, idxRow, 'B').length > 0)
            ret.push('B');
        if(this.wouldTurnFrom(idxCol, idxRow, 'W').length > 0)
            ret.push('W');
        return ret;
    }
    adjacentFrom(idxCol, idxRow){
        if(Array.isArray(this._grid[idxRow][idxCol])){//no one played here
            return [];
        }else{
            let adj = [];
            for(let col = idxCol - 1; col <= idxCol + 1; col++){
                for(let row = idxRow -1; row <= idxRow +1; row++){
                    let tmp = this.getSquare(col, row);
                    if(tmp.length > 0 && this.isEmpty(col, row) && !(col==idxCol && row==idxRow))//not the center
                        adj.push(tmp);
                }
            }
            return adj;
        }
    }
    getSquare(idxCol, idxRow){
        if(idxCol >= 0 && idxCol < 8 && idxRow >= 0 && idxRow < 8)
            return [idxCol, idxRow, this._grid[idxRow][idxCol]];
        else
            return false;
    }
    isEmpty(idxCol, idxRow){
        return Array.isArray(this._grid[idxRow][idxCol]);
    }
    setDisk(col, row, color){
        if(this._colNames.includes(col) && this._rowNames.includes(row) && this._colors.includes(color)){
            let idxCol = this._colNames.indexOf(col);
            let idxRow = this._rowNames.indexOf(row);
            if(Array.isArray(this._grid[idxRow][idxCol]) && this._grid[idxRow][idxCol].includes(color)){//only if we can play here
                let nb = 0;
                for(let t of this.wouldTurnFrom(idxCol, idxRow, color)){
                    this._grid[t[1]][t[0]] = color;
                    nb++;
                }
                this._grid[idxRow][idxCol] = color;
                this.isFinished();
                return nb;
            }else
                return false;
        }
        return false;
    }
    isFinished(){
        this.setAvailableOnGrid();
        return (this._totalBlackAvailable == 0 && this._totalWhiteAvailable == 0);
    }
    display(){
        let st = `  _A__B__C__D__E__F__G__H_\n`;
        for(let row = 0; row < 8; row++){
            st += `${(row+1)}|`;
            for(let col = 0; col < 8; col++){
                st += `${Array.isArray(this._grid[row][col])?' . ':' '+this._grid[row][col]+' '}`;
            }
            st += '|\n';
        }
        st += ` |________________________|`;
        return st;
    }
}


class Reversi{
    constructor(){
        this._grid = new ReversiGrid();
        this._allMoves = [];
        this._turn = 'B';
        this._isFinished = this._grid.isFinished();
        this._winner = null;
        this._isDraw = false;
    }
    get grid(){
        return this._grid;
    }
    get rawGrid(){
        return this._grid.grid;
    }
    set grid(gr){
        this._grid = gr;
    }
    get transcript(){
        return this._allMoves;
    }
    play(col, row, color){
        if(color == this._turn && !this._grid.isFinished()){
            let g = this._grid.setDisk(col, row, color);
            if(g){
                this._allMoves.push([col, row, g]);
                this._turn = this._turn=='W'?'B':'W';
                if(this._grid._totalBlackAvailable == 0 && this._turn == 'B'){
                    console.log('no moves availables for B, switching directly to W');
                    this._turn = 'W';
                }
                if(this._grid._totalWhiteAvailable == 0 && this._turn == 'W'){
                    console.log('no moves availables for W, switching directly to B');
                    this._turn = 'B';
                }
                this._isFinished = this._grid.isFinished();
                if(this._isFinished){
                    if(this._grid._currentCount['B']==this._grid._currentCount['W'])
                        this._isDraw = true;
                    else
                        this._winner = ((this._grid._currentCount['B']>=this._grid._currentCount['W'])?'B':'W');
                }
                return g;
            }
        }
        return false;
    }

    AI_PlayRandom(color){
        if(this._isFinished)
            return;
        let possible = [];
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                if(Array.isArray(this.rawGrid[row][col]) && this.rawGrid[row][col].includes(color)){
                    possible.push([this._grid._colNames[col], this._grid._rowNames[row], color]);
                }
            }
        }
        let move = possible[Math.floor(Math.random()*possible.length)];
        this.play(...move);
    }
}

module.exports = Reversi;