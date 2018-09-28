const chai = require('chai');
let Reversi = require('../reversi/reversi.js');
let should = chai.should();

describe('Unit tests - Reversi', () => {
    it('it should create an empty grid', (done) => {
        let game = new Reversi();
        let grid = game.rawGrid;
        console.log(grid);
        (grid).should.be.an('array');
        grid.should.have.lengthOf(8);
        done();
    });
    it('it should be able to check squares', (done) => {
        let game = new Reversi();
        let grid = game.grid;
        /*console.log(grid);
        console.log(grid.availablePositions());
        console.log(grid.canGo(5,4));
        console.log(grid.canGo(2,2));
        console.log(grid.wouldTurnFrom(5,4,'B'));
        grid.setAvailableOnGrid();
        console.log(grid._grid);*/
        console.log(grid.isFinished());
        console.log(grid._grid);
        done();
    });
    it('it should handle moves', (done) => {
        let game = new Reversi();
        let grid = game.grid;
        console.log(grid.isFinished());
        console.log(game.play('d','3', 'B'),"??");
        console.log(grid.display());
        console.log(game.play('d','2', 'W'),"??");
        console.log(game._turn);
        console.log(grid.display());
        console.log(game.play('c','3', 'W'),"??");
        console.log(game._turn);
        console.log(grid.display());
        console.log(game.play('c','4', 'B'),"??");
        console.log(game._turn);
        console.log(grid.display());
        console.log(game.play('c','5', 'W'),"??");
        console.log(game._turn);
        console.log(grid.display());
        game.transcript.should.have.lengthOf(4);
        done();
    });
    it('it should have a basic AI', (done) => {
        let game = new Reversi();
        while(!game._isFinished){
            game.AI_PlayRandom(game._turn);
        }
        console.log(game.grid.display());
        console.log(game.grid._currentCount);
        console.log(game._isDraw, game._winner);
        done();
    });
});