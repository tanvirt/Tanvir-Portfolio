/*!
 * Vitality v1.4.0 (http://themes.startbootstrap.com/vitality-v1.4.0)
 * Copyright 2013-2016 Start Bootstrap Themes
 * To use this theme you must have a license purchased at WrapBootstrap (https://wrapbootstrap.com)
 */

function Theme() {}

Theme.init = function() {
    Theme.initWow();
    Theme.initSmoothScrolling();
    Theme.initContactFormHeadings();
    Theme.initResponsiveMenu();
    Theme.initOwlCarouselSettings();
    Theme.initMagnificPopupSettings();
    Theme.initVideoBackground();
    Theme.initScrollSpy();
    Theme.initPortfolioFiltering();
}

Theme.initWow = function() {
    // Load WOW.js on non-touch devices
    var isPhoneDevice = "ontouchstart" in document.documentElement;
    $(document).ready(function() {
        if (isPhoneDevice) {
            //mobile
        } else {
            //desktop               
            // Initialize WOW.js
            wow = new WOW({
                offset: 50
            })
            wow.init();
        }
    });
}

Theme.initSmoothScrolling = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Smooth Scrolling: Smooth scrolls to an ID on the current page.
        // To use this feature, add a link on your page that links to an ID, and add the .page-scroll class to the link itself. See the docs for more details.
        $('a.page-scroll').bind('click', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: ($($anchor.attr('href')).offset().top - 50)
            }, 1250, 'easeInOutExpo');
            event.preventDefault();
        });
    })(jQuery); // End of use strict
}

Theme.initContactFormHeadings = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Activates floating label headings for the contact form.
        $("body").on("input propertychange", ".floating-label-form-group", function(e) {
            $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
        }).on("focus", ".floating-label-form-group", function() {
            $(this).addClass("floating-label-form-group-with-focus");
        }).on("blur", ".floating-label-form-group", function() {
            $(this).removeClass("floating-label-form-group-with-focus");
        });
    })(jQuery); // End of use strict
}

Theme.initResponsiveMenu = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Closes the Responsive Menu on Menu Item Click
        $('.navbar-collapse ul li a').click(function() {
            $('.navbar-toggle:visible').click();
        });
    })(jQuery); // End of use strict
}

Theme.initOwlCarouselSettings = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Owl Carousel Settings
        $(".about-carousel").owlCarousel({
            items: 3,
            navigation: true,
            pagination: false,
            navigationText: [
                "<i class='fa fa-angle-left'></i>",
                "<i class='fa fa-angle-right'></i>"
            ],
        });

        $(".portfolio-carousel").owlCarousel({
            singleItem: true,
            navigation: true,
            pagination: false,
            navigationText: [
                "<i class='fa fa-angle-left'></i>",
                "<i class='fa fa-angle-right'></i>"
            ],
            autoHeight: true,
            mouseDrag: false,
            touchDrag: false,
            transitionStyle: "fadeUp"
        });

        $(".testimonials-carousel, .mockup-carousel").owlCarousel({
            singleItem: true,
            navigation: true,
            pagination: true,
            autoHeight: true,
            navigationText: [
                "<i class='fa fa-angle-left'></i>",
                "<i class='fa fa-angle-right'></i>"
            ],
            transitionStyle: "backSlide"
        });

        $(".portfolio-gallery").owlCarousel({
            items: 3,
        });
    })(jQuery); // End of use strict
}

Theme.initMagnificPopupSettings = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Magnific Popup jQuery Lightbox Gallery Settings
        $('.gallery-link').magnificPopup({
            type: 'image',
            gallery: {
                enabled: true
            },
            image: {
                titleSrc: 'title'
            }
        });

        $('.mix').magnificPopup({
            type: 'image',
            image: {
                titleSrc: 'title'
            }
        });
    })(jQuery); // End of use strict
}

Theme.initVideoBackground = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Formstone Background - Video Background Settings
        $("header.video").background({
            source: {
                poster: "img/agency/backgrounds/bg-mobile-fallback.jpg",
                mp4: "mp4/camera.mp4"
            }
        });
    })(jQuery); // End of use strict
}

Theme.initScrollSpy = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Scrollspy: Highlights the navigation menu items while scrolling.
        $('body').scrollspy({
            target: '.navbar-fixed-top',
            offset: 51
        })
    })(jQuery); // End of use strict
}

Theme.initPortfolioFiltering = function() {
    (function($) {
        "use strict"; // Start of use strict

        // Portfolio Filtering Scripts & Hover Effect
        var filterList = {
            init: function() {
                // MixItUp plugin
                $('#portfoliolist').mixItUp();
            }
        };

        filterList.init();
    })(jQuery); // End of use strict
}
