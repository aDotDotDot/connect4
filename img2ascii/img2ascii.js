const fs = require('fs');
const Jimp = require('jimp');
const moment = require('moment');
const request = require('request').defaults({ encoding: null });


const {  GifUtil, BitmapImage, GifFrame } = require('gifwrap');//for the gifs

//const chars = ' .,:;i1tfLCG08@';//if we want to inverse colors
const chars = '@80GCLft1i;:,. ';//white = space  - black = @
const num_c = chars.length - 1;
let norm  = 255/num_c;//to fit on the previous chars
const pixelIntensity = (sourceImage, i, j) => {
    //mean value of the 'intensity' of a pixel
    //max => white non tranparent
    let color = Jimp.intToRGBA(sourceImage.getPixelColor(i, j));
    return 0.25 * (color.r + color.g + color.b + color.a);
}
const image2ascii = (sourceImage, withDestImage = false, withTextFile = false) => {
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
                    let thePath = `${__dirname}/tmp_imgs/tmp_${moment().valueOf()}.png`;
                    image.writeAsync(thePath)
                    .then( () => resolve({ascii:ascii, image:thePath, textFile:null}))
                    .catch( e => reject(e));
                });
            });
        }
    });
};

const gifFrameToJimp = (sourceImage) => {
    // create a Jimp containing a clone of the frame bitmap
    const baseEmpty = new Jimp(1, 1, 0); // any Jimp
    baseEmpty.bitmap = new BitmapImage(sourceImage);
 
    // create a Jimp that shares a bitmap with the frame
    const jShared = new Jimp(1, 1, 0); // any Jimp
    jShared.bitmap = sourceImage.bitmap;
    if(jShared.bitmap.height > 350 || jShared.bitmap.width > 350){//waaaaay too big
        if(jShared.bitmap.height/jShared.bitmap.width <= 1)//landscape
            jShared.resize(350, Jimp.AUTO);
        else
            jShared.resize(Jimp.AUTO, 350);
    }
    return jShared;
};

const animatedGifToAscii = (imgPath) => {

    GifUtil.read(__dirname + '/' + imgPath).then(inputGif => {
        inputGif.frames.forEach(frame => {
            console.log(image2ascii(gifFrameToJimp(frame)));
        });
    }).catch( e => console.log(e));
    
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

const url2Buffer = (theUrl) => {
    return new Promise( (resolve, reject) => {
        request.get(theUrl, function (err, res, body) {
            if(err)
                reject(err);
            Jimp.read(body).then( img => {resolve(img)}).catch(e=>reject(e));
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
                  url2Buffer:url2Buffer};