# canvas-image-drop
A light weight library that allows you to drag and drop images from your filesystem or the browser onto a canvas and paint them.

### Bassic Implimentation:
```html
<!-- Include jQuery -->
<script src="js/jquery.min.js"></script>
<!-- Include droper -->
<script src="js/dropper.jq.js"></script>
<script type="text/javascript">
    // Get out canvas, save it and call imageDrop on it to detect and image being dropped
    var $canvas = $('#Canvas').imageDrop(function(image){
        // Call imagePainter to draw said image on the canvas
        $canvas.imagePainter({
            image: image,
            // Place image on the center of the canvas
            center: 'canvas'
        });
    });
</script>
```