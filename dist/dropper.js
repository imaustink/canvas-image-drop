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
    // defauly canvas deminsions
    var sx = 0;
    var sy = 0;
    var sWidth;
    var sHeight;
    var dx = 0;
    var dy = 0;
    var dWidth;
    var dHeight;

    // Paint the image
    function paint(image) {

        sWidth = dWidth = image.width;
        sHeight = dHeight = image.height;

        // Set center of image placement
        function setCenter(xpos, ypos) {
            dx += (xpos - (dWidth / 2));
            dy += (ypos - (dHeight / 2));
        }
        
        // Resize image to fit canvas
        if(settings.fit){
            var wd = image.width - canvas.width;
            var hd = image.height - canvas.height;
            
            if(hd > 0 || wd > 0){
                var p;
                if(wd >= hd) p = wd / (image.width / 100);
                else p =  hd / (image.height / 100);
                
                var w = (image.width / 100) * (100 - p);
                var h = (image.height / 100) * (100 - p);
                
                // TODO resize
                dWidth = w;
                dHeight = h;
            }    
        }
        
        // Resize canvas to match image
        if(settings.resize){
            // TODO resize
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
            sx += settings.offset.x || 0;
            sy += settings.offset.y || 0;
        }
        
        // Wipe our canvas
        if(!settings.overlay) clearCanvas();

        // Draw image
        context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        
    }
    
    // Clear canvas helper
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    paint(settings.image);
    
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
    
    // Prevent dragover event so you can drop the image
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
    }, false);
    
    // Save last drag event of window
    window.addEventListener('drag', function(e) {
        lastDrag = e;
    }, false);
    
    // Listent for drop event
    element.addEventListener('drop', drop, false);

    function drop(e) {
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
                    setImage(e.target.result);
                };
                // Read our file and convert it to base64
                reader.readAsDataURL(file);
                
            }
        } else
        // Load image from src of exiting image
        if(lastDrag && lastDrag.target) setImage(lastDrag.target.src);
        
    }

    function setImage(src){
        // Create an image element for loading our image into
        var image = document.createElement('img');
        image.src = src;
        // Listen for image loading
        image.addEventListener('load', function(e) {
            // Create event
            e = new CustomEvent('image-drop', {detail: {image: image}});
            // Emit event
            element.dispatchEvent(e);
            // On change callback
            if(typeof settings.drop === 'function') settings.drop(image, element);
        }, false);
    }
    
    return this;
};
},{}],2:[function(require,module,exports){
var Dropper = require('./main.js');
},{"./main.js":1}]},{},[2])(2)
});