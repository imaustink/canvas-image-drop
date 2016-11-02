# Dropper.js
A light weight library that allows you to drag and drop images from your filesystem or the browser onto a canvas and paint them.

## Bassic Implimentation:
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

# Options
## .imagePainter()
| Name          | Type          | Description                                   | Example                                             |
|---------------|---------------|-----------------------------------------------|-----------------------------------------------------|
| ```canvas```  | ```Object```  | Reference to DOM element                      | ```{canvas: document.getElelementById('Canvas')}``` |
| ```fit```     | ```Boolean``` | Shrink image to fit within the canvas         | ```{fit: true}```                                   |
| ```resize```  | ```Boolean``` | Resize canvas to image size                   | ```{resize: true}```                                |
| ```center```  | ```String```  | Options are ```'cursor'``` and ```'canvas'``` | ```{center: 'cursor'}```                            |
| ```offset```  | ```Object```  | X and Y offset values                         | ```{offset: {x: 10, y: 10}}```                      |
| ```overlay``` | ```Boolean``` | Allow image to be drawn over existing images  | ```{overlay: true}```                               |

## .imageDrop()
| Name          | Type           | Description                                     | Example                                              |
|---------------|----------------|-------------------------------------------------|------------------------------------------------------|
| ```element``` | ```Object```   | Reference to DOM element                        | ```{element: document.getElelementById('Canvas')}``` |
| ```title```   | ```String```   | A title to draw on the element if it's a canvas | ```{title: true}```                                  |
| ```drop```    | ```Function``` | On drop callback function                       | ```{drop: function(image, target){}}```              |