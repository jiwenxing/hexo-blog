+function($) {
    'use strict';

    // Resize code blocks to fit the screen width

    var CodeBlockResizer = function(elem) {
        this.$codeBlocks = $(elem);
    };

    // Resize some elements according to personal preferences by jverson
    var changeTitleSize = function(){    
        if($(document).width() <= 600){
            $(".description").css({"font-size":"12px"}); //subtitle
            $("#logo").css({"font-size":"35px"}); //title
            $(".disqus-comment-count").hide(); //小屏时 文章标题下方的评论数会换行展示，因此隐藏掉
            $("#header").hide(); //mobile时隐藏header便于移动端分享
            //$(".img-box").css({"width":"auto", "height":"auto"});
        }else{
            $(".description").css({"font-size":"18px"}); //subtitle
            $("#logo").css({"font-size":"55px"}); //title
            $(".disqus-comment-count").show();
            $("#header").show(); 
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
            changeTitleSize();
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
