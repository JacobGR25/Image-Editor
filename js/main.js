console.log('Buenas');

const width = 320;
const height = 240;

let uploadedImage = null;
let isSelectingColor=false;

const downloadButton = $('#download-button');
const colorBox = $('#color-box');

const redSlider = $('#red-slider');
const greenSlider = $('#green-slider');
const blueSlider = $('#blue-slider');

const toleranceSlider = $('#tolerance-slider');

const presetSelect = $('#preset-select');

let sc_r=0, sc_g=0, sc_b=0;

function setup() {
    createCanvas(width, height).parent('canvas-container');
    pixelDensity(1);

    const htmlDropzone = select('#dropzone');

    htmlDropzone.dragOver(function(){
        htmlDropzone.addClass('dragover');
    });
    htmlDropzone.dragLeave(function(){
        htmlDropzone.removeClass('dragover');
    });
    htmlDropzone.drop(function(file){
        uploadedImage = loadImage(file.data);

        htmlDropzone.removeClass('dragover');
    });
}

function draw() {
    background(100, 0);
    if(uploadedImage === null) return;

    let canvasRatio = width/height;

    let imageWidth = uploadedImage.width;
    let imageHeight = uploadedImage.height;
    let imageRatio = imageWidth/imageHeight;

    let x=0, y=0, w, h;

    if (imageRatio > canvasRatio){
        w=width;
        h=w/imageRatio;
        y=(height-h)/2;
    } else{
        h=height;
        w=h*imageRatio;
        x=(width-w)/2;
    }

    image(uploadedImage, x, y, w, h);
    
    // Filters
    loadPixels();

    if(isSelectingColor && mouseInCanvas()){
        x = Math.round(mouseX);
        y = Math.round(mouseY);
        let index=(y*width+x)*4;
        sc_r=pixels[index+0];
        sc_g=pixels[index+1];
        sc_b=pixels[index+2];
        colorBox.css('background-color', `rgb(${sc_r}, ${sc_g}, ${sc_b})`);
    }

    if(presetSelect.val() === 'grayscale') grayscale(pixels);
    else if(presetSelect.val()==='bw') bw(pixels);
    else if(presetSelect.val()==='sc') sc(pixels);
    else defaultFilter(pixels);

    updatePixels();
}

downloadButton.click(function(){
    uploadedImage.loadPixels();

    // Backup pixel values
    let pixelBackup = [];
    for(let i = 0; i < uploadedImage.pixels.length; i++){
        pixelBackup.push(uploadedImage.pixels[i]);
    }

    // Apply filters
    if(presetSelect.val() === 'grayscale') grayscale(uploadedImage.pixels);
    else if(presetSelect.val()==='bw') bw(uploadedImage.pixels);
    else if(presetSelect.val()==='sc') sc(uploadedImage.pixels);
    else defaultFilter(uploadedImage.pixels);
        
        
    
    
    uploadedImage.updatePixels();

    save(uploadedImage, 'edit.png'); 
    
    // Restore image values
    uploadedImage.loadPixels();
    for(let i = 0; i < uploadedImage.pixels.length; i++){
        uploadedImage.pixels[i] = pixelBackup[i];
    }
    uploadedImage.updatePixels();

});

colorBox.click(function(){
    isSelectingColor=true;
    $('body').addClass('picking-color');
});

function mouseClicked(){
    if(mouseInCanvas()) {
        $('body').removeClass('picking-color');
        isSelectingColor=false;
    }
}

function mouseInCanvas(){
    if(mouseX>=0 && mouseX<=width && mouseY>=0 && mouseY<=height) return true;
    else return false;
}



// Filters

function grayscale(pixels){
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel * 4;
        let average = (pixels[i]+pixels[i+1]+pixels[i+2]) / 3;
        pixels[i+0]= average;
        pixels[i+1]= average;
        pixels[i+2]= average;
    }
}

function bw(pixels){
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel * 4;
        let average = (pixels[i]+pixels[i+1]+pixels[i+2]) / 3;
        let b=0;
        if (average>127) b=255;
        else b=0;

        pixels[i+0]= b;
        pixels[i+1]= b;
        pixels[i+2]= b;
    }
}

function sc(pixels){
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel * 4;

        let tolerance = Number(toleranceSlider.val());
        let difference = Math.abs(pixels[i] - sc_r) + Math.abs(pixels[i+1] - sc_g) + Math.abs(pixels[i+2] - sc_b);

        if(difference < tolerance) continue;

        let average = (pixels[i]+pixels[i+1]+pixels[i+2]) / 3;
        pixels[i+0]= average;
        pixels[i+1]= average;
        pixels[i+2]= average;
    }
}

function defaultFilter(pixels){
    let r = Number(redSlider.val());
    let g = Number(greenSlider.val());
    let b = Number(blueSlider.val());

    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel * 4;
        pixels[i+0]= pixels[i+0] + r;
        pixels[i+1]= pixels[i+1] + g;
        pixels[i+2]= pixels[i+2] + b;
    }
}