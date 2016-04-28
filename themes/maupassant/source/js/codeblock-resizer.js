+function($) {
    'use strict';

    // Resize code blocks to fit the screen width

    var CodeBlockResizer = function(elem) {
        this.$codeBlocks = $(elem);
    };

    var changeTitleSize = function(){    
        if($(document).width() <= 600){
            $(".description").css({"font-size":"12px"}); //副标题
            $("#logo").css({"font-size":"35px"}); //标题
            //$(".img-box").css({"width":"auto", "height":"auto"});
        }else{
            $(".description").css({"font-size":"18px"}); //副标题
            $("#logo").css({"font-size":"55px"}); //标题
        }
    }

    CodeBlockResizer.prototype = {
        /**
         * Run main feature
         */
        run: function() {
            var self = this;
            // resize all codeblocks
            self.resize();
            // resize codeblocks when window is resized
            $(window).smartresize(function() {
                self.resize();
            });
        },

        /**
         * Resize codeblocks
         */
        resize: function() {
            var self = this;
            self.$codeBlocks.each(function() {
                var $gutter = $(this).find('.gutter');
                var $code = $(this).find('.code');
                // get padding of code div
                var codePaddings = $code.width() - $code.innerWidth();
                // code block div width with padding - gutter div with padding + code div padding
                var width = $(this).outerWidth() - $gutter.outerWidth() + codePaddings;
                // apply new width
                $code.css('width', width);
                $code.children('pre').css('width', width);
            });
            changeTitleSize();
        }
    };

    $(document).ready(function() {
        // register jQuery function to check if an element has an horizontal scroll bar
        $.fn.hasHorizontalScrollBar = function() {
            return this.get(0).scrollWidth > this.innerWidth();
        };
        var resizer = new CodeBlockResizer('figure.highlight');
        resizer.run();
    });
}(jQuery);
