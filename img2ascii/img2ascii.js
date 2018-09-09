const fs = require('fs');
const Jimp = require('jimp');
const moment = require('moment');
const request = require('request').defaults({ encoding: null });


const {  GifUtil, BitmapImage, GifFrame } = require('gifwrap');//for the gifs

//const chars = ' .,:;i1tfLCG08@';//if we want to inverse colors
//const chars = '@80GCLft1i;:,. ';//white = space  - black = @
const chars = "MNHQ$OC?7>!:-;. ";//test caracteres

const num_c = chars.length - 1;
let norm  = 255/num_c;//to fit on the previous chars
const pixelIntensity = (sourceImage, i, j) => {
    //mean value of the 'intensity' of a pixel
    //max => white non tranparent
    let color = Jimp.intToRGBA(sourceImage.getPixelColor(i, j));
    return (1/7) * (color.r*2 + color.g*2 + color.b*2 + color.a);
}
const image2ascii = (sourceImage, withDestImage = false, withTextFile = false, noWrite = false) => {
    return new Promise( (resolve, reject) => {
        if(!withDestImage){
            let ascii = '';
            for (let j = 0; j < sourceImage.bitmap.height; j++) {
                for (let i = 0; i < sourceImage.bitmap.width; i++) {
                    let theChar = chars.charAt(Math.round(pixelIntensity(sourceImage, i, j) / norm));
                    ascii += theChar;
                }
                ascii += '\n';//end of line to match the next row of pixels
            }
            if(!withTextFile)
                resolve({ascii:ascii, image:null, textFile:null});
            else{
                let thePath = `${__dirname}/tmp_imgs/tmp_${moment().valueOf()}.txt`;
                fs.writeFile(thePath, ascii, (err) => {
                    if (err) reject(err);
                    resolve({ascii:ascii, image:null, textFile:thePath});
                  });
            }
        }
        else{
            Jimp.loadFont(Jimp.FONT_SANS_8_BLACK).then(font => {//only for discord
                new Jimp(8*sourceImage.bitmap.width, 8*sourceImage.bitmap.height, 0xffffffff, (err, image) => {
                    if(err)
                        reject(err);
                    let ascii = '';
                    for (let j = 0; j < sourceImage.bitmap.height; j++) {
                        for (let i = 0; i < sourceImage.bitmap.width; i++) {
                            let theChar = chars.charAt(Math.round(pixelIntensity(sourceImage, i, j) / norm));
                            ascii += theChar;
                            if(theChar !== ' '){
                                image.print(font, 8*i, 8*j, theChar);
                            }
                        }
                        ascii += '\n';//end of line to match the next row of pixels
                    }
                    if(!noWrite){
                        let thePath = `${__dirname}/tmp_imgs/tmp_${moment().valueOf()}.png`;
                        image.writeAsync(thePath)
                        .then( () => resolve({ascii:ascii, image:thePath, textFile:null, bitmap:image}))
                        .catch( e => reject(e));
                    }else{
                        resolve({ascii:ascii, image:null, textFile:null, bitmap:image});
                    }

                });
            });
        }
    });
};

const gifFrameToJimp = (sourceImage) => {
    // create a Jimp that shares a bitmap with the frame
    const jShared = new Jimp(1, 1, 0); // any Jimp
    jShared.bitmap = sourceImage.bitmap;
    if(jShared.bitmap.height > 150 || jShared.bitmap.width > 150){//waaaaay too big
        if(jShared.bitmap.height/jShared.bitmap.width <= 1)//landscape
            jShared.resize(150, Jimp.AUTO);
        else
            jShared.resize(Jimp.AUTO, 150);
    }
    return jShared;
};

const jimpToGifFrame = (img) => {
    const fShared2 = new GifFrame(1, 1, 0); // any GifFrame
    fShared2.bitmap = img.bitmap;
    return fShared2;
};

const animatedGifToAscii = (imgBuff) => {
    return new Promise( (resolve, reject) => {
        let frames = [];
        const createGif = async (frames) => {
                let asciiFrames = []
                for(let i=0; i < frames.length;){
                    let frAscii = await image2ascii(gifFrameToJimp(frames[i]), true, false, true);
                    asciiFrames.push(jimpToGifFrame(frAscii.bitmap));
                    i++;
                }
                let thePath = `${__dirname}/tmp_imgs/${moment().valueOf()}.gif`;
                await GifUtil.write(thePath, asciiFrames, {})
                console.log({image:thePath});
                return {image:thePath};
        };
        GifUtil.read(imgBuff).then(inputGif => {
            inputGif.frames.forEach( (frame, index, ar) => {
                frames.push(frame);
                //TODO : test without the forEach, rendered useless now
            });
            resolve(createGif(frames));
        }).catch( e => reject(e));
    });    
};

const url2Base64 = (theUrl) => {
    return new Promise( (resolve, reject) => {
        request.get(theUrl, function (err, res, body) {
            if(err)
                reject(err);
            resolve(body.toString('base64'));
        });
    });
};

const url2Buffer = (theUrl, withResizing = false) => {
    return new Promise( (resolve, reject) => {
        request.get(theUrl, function (err, res, body) {
            if(err)
                reject(err);
            Jimp.read(body).then( img => {
                if(withResizing){
                    if(img.bitmap.height > 350 || img.bitmap.width > 350){//waaaaay too big
                        if(img.bitmap.height/img.bitmap.width <= 1)//landscape
                            img.resize(350, Jimp.AUTO, null, () => resolve(img));
                        else
                            img.resize(Jimp.AUTO, 350, null, () => resolve(img));
                    }
                }else
                    resolve(img)
            }).catch(e=>reject(e));
        });
    });
};
const gifUrl2Buffer = (theUrl) => {
    return new Promise( (resolve, reject) => {
        request.get(theUrl, function (err, res, body) {
            if(err)
                reject(err);
            resolve(body);//only buffer
        });
    });
};

/*Jimp.read('cat.png', (err, img) => {
    if (err) throw err;
    if(img.bitmap.height > 350 || img.bitmap.width > 350){//waaaaay too big
        if(img.bitmap.height/img.bitmap.width <= 1)//landscape
            img.resize(350, Jimp.AUTO);
        else
            img.resize(Jimp.AUTO, 350);
    }
    image2ascii(img).then( (d) => {
        console.log(d.ascii);
    }).catch((err) => {});
  });
*/
/*
animatedGifToAscii('cat.gif');*/

const createArtifacts = () => {
    new Jimp(35, 35, 0xffffffff, (err, image) => {
        // this image is 32, every pixel is set to 0xFFFFFFFF
        let oldImage = image.clone();
        for(let char of chars){
            if(char === ' ')
                continue;
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
                image.print(font, 0, 0, char);
                image.write(`${__dirname}/artifacts/art_${char}.png`);
                image = oldImage.clone();
            });
        }
    });
};
//createArtifacts();
module.exports = {image2ascii:image2ascii,
                  url2Base64Buffer:url2Base64,
                  url2Buffer:url2Buffer,
                  animatedGifToAscii:animatedGifToAscii,
                  gifUrl2Buffer:gifUrl2Buffer};