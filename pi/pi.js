const fs = require('fs');
//const backwardsStream = require('fs-backwards-stream')
const events = require('events');
const eventEmitter = new events.EventEmitter();
const moment = require('moment');
const tStart = moment().valueOf();;
console.log(`Started at ${moment(tStart).format()}`);
//const buf1 = Buffer.alloc(65536, 0, 'hex');
//const txtSrch = "coucou"
let piFile;
let stats = fs.statSync(__dirname + '/pi-billion.txt');
const fileSizeInBytes = {'pi':stats.size};

const ascii_to_hexa = (str) => {
    let arr1 = new Array();
    for (let n = 0; n < str.length; n++) 
        {
        let hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
        }
    return arr1.join('');
};
const hexa_to_dec = (hexStr) => {
    return parseInt(hexStr, 16);
}
const readBytes = (position, size) => {
    //console.log(position,size);
    let bufferTmp = Buffer.alloc(size, '0', 'ascii');
    //console.log(bufferTmp);
    return new Promise((resolve, reject) => {
        if(position>fileSizeInBytes.pi)
            reject('End of file');
        fs.read(piFile, bufferTmp, 0, size, position, (err, bytesRead, bufferTmp) => {
            //console.log(err, bytesRead, bufferTmp);
            if(err)
                reject(err);
            resolve(bufferTmp);
        });
    });
};
fs.open(__dirname + '/pi-billion.txt', 'r', (err, fd) => {
    if(err)
        console.warn(err);
    piFile = fd;
    eventEmitter.emit('ready');
});

const findTextInPi = (txt, pStart, pEnd) => {
    let bufTxt = Buffer.from(hexa_to_dec(ascii_to_hexa(txt)).toString());
    return findBufferInPi(bufTxt, pStart, pEnd);
};

const findDecimalInPi = (decNb, pStart, pEnd) => {
    let bufTxt = Buffer.from(decNb.toString());
    return findBufferInPi(bufTxt, pStart, pEnd);
};

const findBufferInPi = (bufTxt, pStart, pEnd) => {
    let bufLength = bufTxt.length;
    let position = 2;//on évite le 3.
    if(pStart && pStart > 1)
        position = pStart;
    if(position%100000 == 0)
        console.log(`Position ${position}`);
    readBytes(position, bufLength)
        .then( (bufFound) =>{
            if(bufFound.equals(bufTxt)){
                console.log(`Found at pos : ${position}`);
                return position;
                //break;
            }
            else{
                position++;
                if(position > pEnd)
                    return -1;
                else
                    return findBufferInPi(bufTxt, position);
            }
        })
        .catch((e) => {
            return -1;
        });
    return -1;
};

const findBufferInPiReverse = (bufTxt, pStart, pEnd) => {
    let bufLength = bufTxt.length;
    let position = (fileSizeInBytes.pi);//part de la fin
    if(pStart && pStart <= fileSizeInBytes.pi)
        position = pStart;
    if(!pEnd)
        pEnd = (fileSizeInBytes.pi/2);
    //console.log(position);

    if(position%100000 == 0)
        console.log(`Position ${position}`);
    readBytes(position, bufLength)
        .then( (bufFound) =>{
            if(bufFound.equals(bufTxt)){
                console.log(`Found at pos : ${position}`);
                return position;
                //break;
            }
            else{
                position--;
                if(position < pEnd)
                    return -1;
                return findBufferInPiReverse(bufTxt, position);
            }
        })
        .catch((e) => {
            return -1;
        });
    return -1;
};

//console.log(ascii_to_hexa(txtSrch));
//console.log(hexa_to_dec(ascii_to_hexa(txtSrch)));

console.log(`File size : ${fileSizeInBytes.pi}`);

eventEmitter.on('ready', (evt) => {
    /*readBytes(65534, 10).then((dd)=>{

    })*/
    //findTextInPi('>6');
    //findTextInPi('#V');
    //findDecimalInPi(21101);
    //findDecimalInPi(77274, 999970000);
    //findBufferInPiReverse(Buffer.from('77274'));
    /*fs.readFile(__dirname + '/cat.jpg', (err, buffer) => {
        console.log(buffer.length);
        findBufferInPi(buffer);
    });*/
});

const findTextInPiChunk = (buf) => {
    return new Promise( (resolve, reject) => {
        let readStream = fs.createReadStream(__dirname + '/pi-billion.txt', 'utf8');
        let readStreamShifted = fs.createReadStream(__dirname + '/pi-billion.txt', {encoding:'utf8', start:(65536-buf.length)});
        let totalSize = 0;
        let totalSizeShifted = (65536-buf.length);
        let bufSearch = Buffer.from(buf);
        let result = {search: buf, positions:new Set(), time: null};
        readStream.on('data', (chunk) => {
            //console.log(chunk.toString('hex'));  
            if(totalSize < (buf.length + (fileSizeInBytes.pi / 2))){
                readBytes(fileSizeInBytes.pi - totalSize - buf.length, 65536).then((reverseBuf) => {
                    //console.log(reverseBuf.toString('ascii'));
                    if(reverseBuf.includes(bufSearch)){
                        let evt = {chunk:reverseBuf.toString('ascii'), search:buf, size:(fileSizeInBytes.pi - totalSize + 65536 - buf.length)};
                        result.positions.add(evt.chunk.indexOf(evt.search)+evt.size);
                        if(!result.time)
                            result.time = moment().valueOf() - tStart;
                        eventEmitter.emit('foundEnd', evt);
                        /*readStream.close();
                        readStreamShifted.close();*/
                    }
                }).catch(() => {});
            }
            if(chunk.includes(buf)){
                let evt = {chunk:chunk, search:buf, size:totalSize};
                result.positions.add(evt.chunk.indexOf(evt.search)+evt.size);
                result.time = ((!result.time)?moment().valueOf()-tStart:Math.min(moment().valueOf() - tStart, result.time));
                eventEmitter.emit('found', evt);
                if(result.positions.size == 0)
                    reject(result);
                else
                    resolve(result);
                readStream.close();
                /*readStream.close();
                readStreamShifted.close();*/
            }else{
                totalSize+=chunk.length;
                /*if(totalSize > ((fileSizeInBytes.pi/2) + 2*65536 + buf.length)){
                    if(result.positions.size == 0)
                        reject(result);
                    else
                        resolve(result);
                }*/
            }
        }).on('end', () => {
            if(result.positions.size == 0)
                reject(result);
            else
                resolve(result);
        });
        readStreamShifted.on('data', (chunk) => {
            //console.log(chunk.toString('hex'));  
            if(chunk.includes(buf)){
                let evt = {chunk:chunk, search:buf, size:totalSizeShifted};
                result.positions.add(evt.chunk.indexOf(evt.search)+evt.size);
                result.time = ((!result.time)?moment().valueOf()-tStart:Math.min(moment().valueOf() - tStart, result.time));
                eventEmitter.emit('found', evt);
                if(result.positions.size == 0)
                    reject(result);
                else
                    resolve(result);
                readStreamShifted.close();
                /*readStream.close();
                readStreamShifted.close();*/
            }else{
                totalSizeShifted+=chunk.length;
                //console.log("Not in this chunk");
                /*if(totalSizeShifted > ((fileSizeInBytes.pi/2) + 65536 + buf.length)){
                    if(result.positions.size == 0)
                        reject(result);
                    else
                        resolve(result);
                    readStreamShifted.close();*/
                }
            //}
        }).on('end', () => {
            if(result.positions.size == 0)
                reject(result);
            else
                resolve(result);
            console.log('Ended');
        });
    });
};

let bb = 1073474134;
findTextInPiChunk((bb.toString())).then(e=>{console.log(e);}).catch(e=>{console.log(nope);});

bb = 21101;
findTextInPiChunk((bb.toString())).then(e=>{console.log(e);}).catch(e=>{console.log(nope);});
bb=123456789;
findTextInPiChunk((bb.toString())).then(e=>{console.log(e);}).catch(e=>{console.log(nope);});
bb='55715171395115275045519';
findTextInPiChunk(bb).then(e=>{console.log(e);}).catch(e=>{console.log(nope);});
bb='03041988';
findTextInPiChunk(bb).then(e=>{console.log(e);}).catch(e=>{console.log(nope);});

/*eventEmitter.on('found', (evt) => {
    //console.log('FOUND');
    let tEnd = moment().valueOf();
    let pos = evt.chunk.indexOf(evt.search);
    console.log(`Found ${evt.search} at position ${(pos+evt.size)} in ${tEnd - tStart}ms`);
    let subs = evt.chunk.substring(Math.max(0, pos-10), pos+10+evt.search.length+10);
    console.log(`In this substring : ${subs.replace(evt.search,'*'+evt.search+'*')}`);
});*/

/*eventEmitter.on('foundEnd', (evt) => {
    //console.log('FOUND');
    let tEnd = moment().valueOf();
    let pos = evt.chunk.indexOf(evt.search);
    console.log(`Found (may not be the first) ${evt.search} at position ${(pos+evt.size)} in ${tEnd - tStart}ms`);
    let subs = evt.chunk.substring(Math.max(0, pos-10), pos+10+evt.search.length+10);
    console.log(`In this substring : ${subs.replace(evt.search,'*'+evt.search+'*')}`);
});*/