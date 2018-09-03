const fs = require('fs');
const Jimp = require('jimp');


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

Jimp.read('cat.jpg', (err, img) => {
    if (err) throw err;
    if(img.bitmap.height/img.bitmap.width <= 1)//landscape
        img.resize(350, Jimp.AUTO);
    else
        img.resize(Jimp.AUTO, 350);
    console.log(image2ascii(img));
  });