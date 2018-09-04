const fs = require('fs');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const moment = require('moment');
const tStart = moment().valueOf();
console.log(`Started at ${moment(tStart).format()}`);
const filePath = __dirname + '/sqrt2.txt';
let piFile;
let stats = fs.statSync(filePath);
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
    let bufferTmp = Buffer.alloc(size, '0', 'ascii');
    return new Promise((resolve, reject) => {
        if(position>fileSizeInBytes.pi)
            reject('End of file');
        fs.read(piFile, bufferTmp, 0, size, position, (err, bytesRead, bufferTmp) => {
            if(err)
                reject(err);
            resolve(bufferTmp);
        });
    });
};
fs.open(filePath, 'r', (err, fd) => {
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
    let position = 2;//it begins with 3.
    if(pStart && pStart > 1)
        position = pStart;
    if(position%100000 == 0)
        console.log(`Position ${position}`);
    readBytes(position, bufLength)
        .then( (bufFound) =>{
            if(bufFound.equals(bufTxt)){
                console.log(`Found at pos : ${position}`);
                return position;
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
    let position = (fileSizeInBytes.pi);//from the end
    if(pStart && pStart <= fileSizeInBytes.pi)
        position = pStart;
    if(!pEnd)
        pEnd = (fileSizeInBytes.pi/2);

    if(position%100000 == 0)
        console.log(`Position ${position}`);
    readBytes(position, bufLength)
        .then( (bufFound) =>{
            if(bufFound.equals(bufTxt)){
                console.log(`Found at pos : ${position}`);
                return position;
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

console.log(`File size : ${fileSizeInBytes.pi}`);

eventEmitter.on('ready', (evt) => {

});

const findTextInPiChunk = (buf) => {
    return new Promise( (resolve, reject) => {
        let readStream = fs.createReadStream(filePath, 'utf8');
        let readStreamShifted = fs.createReadStream(filePath, {encoding:'utf8', start:(65536-buf.length)});
        let totalSize = 0;
        let totalSizeShifted = (65536-buf.length);
        let bufSearch = Buffer.from(buf);
        let result = {search: buf, positions:new Set(), time: null};
        readStream.on('data', (chunk) => {
            if(totalSize < (buf.length + (fileSizeInBytes.pi / 2))){
                readBytes(fileSizeInBytes.pi - totalSize - buf.length, 65536).then((reverseBuf) => {
                    if(reverseBuf.includes(bufSearch)){
                        let evt = {chunk:reverseBuf.toString('ascii'), search:buf, size:(fileSizeInBytes.pi - totalSize + 65536 - buf.length)};
                        result.positions.add(evt.chunk.indexOf(evt.search)+evt.size);
                        if(!result.time)
                            result.time = moment().valueOf() - tStart;
                        eventEmitter.emit('foundEnd', evt);
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
            }else{
                totalSize+=chunk.length;
            }
        }).on('end', () => {
            if(result.positions.size == 0)
                reject(result);
            else
                resolve(result);
        });
        readStreamShifted.on('data', (chunk) => {
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
            }else{
                totalSizeShifted+=chunk.length;
            }
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
