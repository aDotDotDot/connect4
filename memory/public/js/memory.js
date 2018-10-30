const GAME_SIZE = 16;//2x16 memory
const POSSIBLE_CARDS = ['arch',
                        'ubuntu',
                        'gentoo',
                        'windows',
                        'apple',
                        'manjaro',
                        'centos',
                        'mint',
                        'debian',
                        'fedora',
                        'kali',
                        'android',
                        'suse',
                        'bsd',
                        'tux',
                        'raspbian'];
const getRandomInt = (theMin, theMax) => {
    return theMin + Math.floor(Math.random() * Math.floor(theMax));
}
function *randomUniqueGenerator(theMax) {
    let alreadyUsed = [];
    while(alreadyUsed.length < theMax){
        let next = getRandomInt(0,theMax);
        while(alreadyUsed.includes(next)){
            next = getRandomInt(0,theMax);
        }
        alreadyUsed.push(next);
        yield next;
    }
    return;
};

class Card{
    constructor(name, position){
        this._name = name;
        this._path = `assets/${name}.png`;
        this._position = position;
        this._found = false;
        this._partial = false;
    }
    get name(){
        return this._name;
    }
    get path(){
        return this._path;
    }
    get found(){
        return this._found;
    }
    set found(v){
        this._found = v;
    }
    get partial(){
        return this._partial;
    }
    set partial(v){
        this._partial = v;
    }
    get position(){
        return this._position;
    }
    click(name = null){
        if(this._found)
            return 'no match';
        if(this._partial){
            this.partial = false;
            return 'no match';
        }
        if(name === null){
            this.partial = true;
            return 'partial';
        }
        else{
            if(this.name == name){
                this.found = true;
                return 'found';
            }
            else
                return 'no match';
        }
    }
}
class Memory{
    constructor(){
        this._cards = new Array();//array(card1, ... cardN)
        this._currentName = null;
        this._finished = false;
        this._foundSoFar = 0;
        this._tries = 0;
        this.shuffle();
    }
    shuffle(){
        this._finished = false;
        const it = randomUniqueGenerator(GAME_SIZE*2);
        let namesTaken = [];
        for(let i=0;i<GAME_SIZE;i++){
            let p1 = it.next().value;
            let p2 = it.next().value;
            let name = POSSIBLE_CARDS[getRandomInt(0, POSSIBLE_CARDS.length)];
            while(namesTaken.includes(name)){
                name = POSSIBLE_CARDS[getRandomInt(0, POSSIBLE_CARDS.length)];
            }
            namesTaken.push(name);
            let card1 = new Card(name, p1);
            let card2 = new Card(name, p2);
            this._cards[p1] = card1;
            this._cards[p2] = card2;
        }
    }
    click(id){
        if(id >= 0 && id < (GAME_SIZE*2)){
            this._tries+=1;
            let cname = null;
            if(this._currentName)
                cname = this._currentName.name;
            let ans = this._cards[id].click(cname);
            try{
                switch(ans){
                    case 'partial':
                        this._currentName = this._cards[id];
                    break;
                    case 'found':
                        this._foundSoFar+=1;
                        this._currentName.found = true;
                        this._cards[id].found = true;
                        this._currentName = null;
                    break;
                    case 'no match':
                        this.flash(id);
                        this._currentName.partial = false;
                        this._currentName = null;
                    break;
                    default:
                        this._currentName = null;
                    break;
                }
            }catch(err){
                this._currentName = null;
            }
            this.render();
            if(this._foundSoFar == GAME_SIZE){
                this._finished = true;
                setTimeout(()=>{
                    this.render();
                }, 200);
            }
        }
    }
    flash(id){
        this._cards[id].partial = true;
        this.render();
        setTimeout(() => {
            this._cards[id].partial = false;
            this.render();
        }, 250);
    }
    render(){
        let container = document.getElementById('gameContainer');
        container.innerHTML='';
        this._cards.map(e=>{
            let cd = document.createElement("div");
            cd.innerHTML = `<img src='${e.path}'></img>`;
            cd.classList.add('card');
            if(e.partial || e.found)
                cd.classList.add('found');
            else
                cd.classList.add('back');
            const self = this;
            cd.addEventListener('click', function () {
                self.click(e.position);
            });
            container.appendChild(cd);
        });
        if(this._finished){
            if(confirm('Game Over\nTry again ?')){
                this.shuffle();
                this.render();
            }else{
                this._finished = false;
                container.innerHTML = `<h1>Finished in ${this._tries} clicks</h1>`;
            }
        }

    }
}

const m = new Memory();
//m.render();
function start(){
    m.render();
}