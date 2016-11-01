(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dropper = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.imagePainter = function imagePainter(settings){
    // We need at least 1 arg
    if(!settings) throw Error('Missing first argument!');
    // If we only have an ID put it in an object
    if(typeof settings === 'string') settings = {id: settings};
    // If we only have a canvas put it in an object
    if(settings.tagName === 'CANVAS') settings = {canvas: settings};
    
    // Get our canvas
    var canvas = settings.canvas || document.getElementById(settings.id);
    // Get 2D context
    var context = canvas.getContext('2d');
    // Create an image element for loading our image into
    var image = document.createElement('img');
    // defauly canvas deminsions
    var dHeight = canvas.height;
    var dWidth = canvas.width;
    
    // Listen for image loading
    image.addEventListener('load', function() {
        // Starting x and y pos
        var x = 0;
        var y = 0;
        
        // Set center of image placement
        function setCenter(xpos, ypos) {
            x += (xpos - (image.width / 2));
            y += (ypos - (image.height / 2));
        }
        
        // Resize image to fit canvas
        if(settings.fit){
            var wd = image.width - canvas.width;
            var hd = image.height - canvas.height;
            
            if(hd > 0 || wd > 0){
                var rp;
                if(wd >= hd) rp = wd / (image.width / 100);
                else rp =  hd / (image.height / 100);
                
                var w = (image.width / 100) * (100 - rp);
                var h = (image.height / 100) * (100 - rp);
                
                var tempCanvas = document.createElement('canvas');
                var temContext = tempCanvas.getContext('2d');
                
                tempCanvas.height = image.height;
                tempCanvas.width = image.width;
                
                temContext.drawImage(image, 0, 0);
                resizeImage(tempCanvas, w, h, true);
                
                image.src = tempCanvas.toDataURL();

                return;
            }
            
        }
        
        // Resize canvas to match image
        if(settings.resize){
            resizeImage(canvas, dWidth, dHeight, true);
            
            canvas.width = image.width;
            canvas.height = image.height;
        }
        
        // Center image over cursor
        if(settings.center === 'cursor'){
            // Get our mouse position from the element so we can get it inside $.imagePainter
            // I don't love this but it's the best solution I can think of right now
            var dropX = canvas.getAttribute('data-drop-x');
            var dropY = canvas.getAttribute('data-drop-y');
            if(dropX && dropY) setCenter(parseInt(dropX), parseInt(dropY));
        }
        // Or canvas
        else if(settings.center === 'canvas') setCenter(canvas.width / 2, canvas.height / 2);
    
        // Add custom offset
        if(settings.offset){
            x += settings.offset.x || 0;
            y += settings.offset.y || 0;
        }
        
        // Wipe our canvas
        if(!settings.overlay) clearCanvas();
        
        // Draw image
        context.drawImage(image, x, y);
        
    }, false);
    
    // Clear canvas helper
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    /**
     * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
     * 
     * @param {HtmlElement} canvas
     * @param {int} width
     * @param {int} height
     * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
     */
    function resizeImage(canvas, width, height, resize_canvas) {
        var width_source = canvas.width;
        var height_source = canvas.height;
        width = Math.round(width);
        height = Math.round(height);
    
        var ratio_w = width_source / width;
        var ratio_h = height_source / height;
        var ratio_w_half = Math.ceil(ratio_w / 2);
        var ratio_h_half = Math.ceil(ratio_h / 2);
    
        var ctx = canvas.getContext("2d");
        var img = ctx.getImageData(0, 0, width_source, height_source);
        var img2 = ctx.createImageData(width, height);
        var data = img.data;
        var data2 = img2.data;
    
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var x2 = (i + j * width) * 4;
                var weight = 0;
                var weights = 0;
                var weights_alpha = 0;
                var gx_r = 0;
                var gx_g = 0;
                var gx_b = 0;
                var gx_a = 0;
                var center_y = (j + 0.5) * ratio_h;
                var yy_start = Math.floor(j * ratio_h);
                var yy_stop = Math.ceil((j + 1) * ratio_h);
                for (var yy = yy_start; yy < yy_stop; yy++) {
                    var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    var center_x = (i + 0.5) * ratio_w;
                    var w0 = dy * dy; //pre-calc part of w
                    var xx_start = Math.floor(i * ratio_w);
                    var xx_stop = Math.ceil((i + 1) * ratio_w);
                    for (var xx = xx_start; xx < xx_stop; xx++) {
                        var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        var w = Math.sqrt(w0 + dx * dx);
                        if (w >= 1) {
                            //pixel too far
                            continue;
                        }
                        //hermite filter
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        var pos_x = 4 * (xx + yy * width_source);
                        //alpha
                        gx_a += weight * data[pos_x + 3];
                        weights_alpha += weight;
                        //colors
                        if (data[pos_x + 3] < 255)
                            weight = weight * data[pos_x + 3] / 250;
                        gx_r += weight * data[pos_x];
                        gx_g += weight * data[pos_x + 1];
                        gx_b += weight * data[pos_x + 2];
                        weights += weight;
                    }
                }
                data2[x2] = gx_r / weights;
                data2[x2 + 1] = gx_g / weights;
                data2[x2 + 2] = gx_b / weights;
                data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        //clear and resize canvas
        if (resize_canvas === true) {
            canvas.width = width;
            canvas.height = height;
        } else {
            ctx.clearRect(0, 0, width_source, height_source);
        }
    
        //draw
        ctx.putImageData(img2, 0, 0);
    }
    
    // Load image
    image.src = settings.image.src;
    
    return this;
};

module.exports.imageDrop = function imageDrop(settings){
    // We need at least 1 arg
    if(!settings) throw Error('Missing first argument!');
    // If we only have an ID put it in an object
    if(typeof settings === 'string') settings = {id: settings};
    // If we only have a element put it in an object
    if(settings.tagName) settings = {element: settings};
    
    // Get our element
    var element = settings.element;
    // Create an image element for loading our image into
    var image = document.createElement('img');
    // Last drag event
    var lastDrag;
    
    // If it's a canvas we can add a label
    if(settings.element.tagName === 'CANVAS'){
        // Get 2D context
        var context = element.getContext('2d');
        // Align text center
        context.textAlign = 'center'; 
        // Add a title to our convas
        context.fillText(settings.title || 'Drop image here', element.width / 2, element.height / 2);   
    }
    
    // Listen for image loading
    image.addEventListener('load', function(e) {
        // Create event
        e = new CustomEvent('image-drop', {detail: {image: image}});
        // Emit event
        element.dispatchEvent(e);
        // On change callback
        if(typeof settings.drop === 'function') settings.drop(image, element);
    }, false);
    
    // Prevent dragover event so you can drop the image
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
    }, false);
    
    // Save last drag event of window
    window.addEventListener('drag', function(e) {
        lastDrag = e;
    }, false);
    
    // Listent for drop event
    element.addEventListener('drop', function(e) {
        // Prevent page from loading dropped file
        e.preventDefault();
        
        // Save our mouse position to the element so we can get it inside $.imagePainter
        // I don't love this but it's the best solution I can think of right now
        element.setAttribute('data-drop-x', e.layerX);
        element.setAttribute('data-drop-y', e.layerY);
        
        // Get files dropped
        var files = e.dataTransfer.files;
        // Make sure we have at least 1
        if(files.length > 0) {
            // Get the first file
            var file = files[0];
            
            // Make sure we have FileReader and our file is an image
            if(typeof FileReader !== 'undefined' && /image/.test(file.type)) {
                // Construct a FileReader
                var reader = new FileReader();
                // Listen for load of file
                // Note: addEventListener doesn't work in Google Chrome for this event
                reader.onload = function(e) {
                    // Load base64 encoded image
                    image.src = e.target.result;
                };
                // Read our file and convert it to base64
                reader.readAsDataURL(file);
                
            }
        } else
        // Load image from src of exiting image
        if(lastDrag && lastDrag.target) image.src = lastDrag.target.src;
        
    }, false);
    
    return this;
};
},{}],2:[function(require,module,exports){
var Dropper = require('./main.js');
},{"./main.js":1}]},{},[2])(2)
});