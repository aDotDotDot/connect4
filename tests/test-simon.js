const chai = require('chai');
let simon = require('../simon/simon.js').Simon;
let sound = require('../simon/simon.js').SimonSound;
let should = chai.should();

describe('Unit tests - Simon', () => {
    it('it should create an empty sequence', (done) => {
        let game = new simon();
        let sequence = game.sequence;
        (sequence).should.be.an('array');
        sequence.should.have.lengthOf(0);
        done();
    });
    it('it should create a random sequence', (done) => {
        let game = new simon();
        for(let i = 0; i < 25; i++ ){
            game.next();
        }
        let sequence = game.sequence;
        sequence.should.be.an('array');
        sequence.should.have.lengthOf(25);
        console.log(sequence);
        done();
    });
    it('it should check sequences properly', (done) => {
        let game = new simon();
        for(let i = 0; i < 25; i++ ){
            game.next();
        }
        let sequence = game.sequence;
        game.checkSequence(sequence).should.be.true;
        game.checkSequence([1,2,3]).should.be.false;
        done();
    });
    it('it should be able to use almost anything to play', (done) => {
        let game = new simon();
        game.setValue(0,[1]);
        game.setValue(1,[2]);
        game.setValue(2,[0,3]);
        game.setValue(3,[42]);
        game.sequence = [2,3,1,0];
        let m = game.mapped;
        m.should.be.deep.equal([[0,3],[42],[2],[1]]);
        done();
    });
    it('it should be able to play sound', (done) => {
        let game = new sound();
        game.next();
        game.next();
        game.next();
        game.next();
        game.next();
        game.createSequence();
        done();
    });
});