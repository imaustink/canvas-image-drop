(function($){
    if(!$) throw 'jQuery required for imageDrop';

    var Dropper = require('./main.js');
    
    $.fn.imageDrop = function(settings){
        if(typeof settings === 'function') settings = {drop: settings};
        settings = settings || {};
        // TODO maybe each this
        return this.each(function() {
            settings.element = this;
            Dropper.imageDrop(settings);
            
            this.addEventListener('image-drop', function (e) {
                e.stopImmediatePropagation();
                $(this).trigger('image-drop', e.detail.image);
            });
        });
    };

    $.fn.imagePainter = function(settings){
        if(settings.tagName === 'IMG') settings = {image: settings};
        settings = settings || {};
        settings.canvas = this[0];
        Dropper.imagePainter(settings);
    };

})(jQuery);