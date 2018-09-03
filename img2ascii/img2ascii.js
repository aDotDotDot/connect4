const fs = require('fs');
const Jimp = require('jimp');

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
const image2ascii = (sourceImage) => {
    let ascii = '';
    for (let j = 0; j < sourceImage.bitmap.height; j++) {
        for (i = 0; i < sourceImage.bitmap.width; i++) {
            ascii += chars.charAt(Math.round(pixelIntensity(sourceImage, i, j) / norm));
        }
        ascii += '\n';//end of line to match the next row of pixels
    }
    return ascii;
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

Jimp.read('cat.jpg', (err, img) => {
    if (err) throw err;
    if(img.bitmap.height > 350 || img.bitmap.width > 350){//waaaaay too big
        if(img.bitmap.height/img.bitmap.width <= 1)//landscape
            img.resize(350, Jimp.AUTO);
        else
            img.resize(Jimp.AUTO, 350);
    }
    console.log(image2ascii(img));
  });


animatedGifToAscii('cat.gif');