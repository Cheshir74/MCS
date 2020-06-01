$(document).ready(function(){
	"use strict";

	$(".loader").delay(400).fadeOut();
    $(".animationload").delay(400).fadeOut("fast");

    var bgi = $("[data-background]");
    bgi.length > 0 && bgi.each(function() {
    	var e = $(this),
    	t = e.attr('data-background');
    	e.css({'background-image': 'url(' + t + ')'});
    });

    var progressBar = $('.progress-bar');
    progressBar.length > 0 && progressBar.each(function() {
    	var e = $(this),
    	t = e.attr('aria-valuenow');
    	e.css({'width': t + '%'});
    });
	

	var top = jQuery(document).scrollTop();
	var batas = 200;
	var navbar = jQuery('.navbar-main');
	var navbarnav = jQuery('.navbar-nav');
	var header = jQuery('.header');
	
	
	if ( top > batas ) {
		navbar.addClass('stiky');
		navbarnav.addClass('ml-auto');
	}
	jQuery(window).scroll(function () {
		top = jQuery(document).scrollTop();

		
		if ( top > batas ) {
			navbar.addClass('stiky');
		}else {
			navbar.removeClass('stiky'); 
			if(header.hasClass('header-2')){
				navbarnav.removeClass('ml-auto');
			}
			if(header.hasClass('header-5')){
				navbarnav.removeClass('ml-auto');
			}
		}

	});

	var slides = $(".full-screen"),
    b = slides.find('.item');
    b.each(function(){
        var e = $(this),
        ocImg = e.find('img').attr('src');
        e.css({'background-image': 'url(' + ocImg + ')'});
    });

    if (b.length == 1) {
		slides.owlCarousel({
			// stagePadding: 50,
			loop: true,
			// margin: 10,
			nav: false,
			navText: [
				'<i class="fa fa-angle-left" aria-hidden="true"></i>',
				'<i class="fa fa-angle-right" aria-hidden="true"></i>'
			],
			// navContainer: '.banner .custom-nav',
			items: 1,
		})
	} else
	{
		slides.owlCarousel({
			// stagePadding: 50,
			loop: true,

			mouseDrag: true,
			touchDrag: true,
			pullDrag: true,
			freeDrag: false,
			// margin: 10,
			nav: false,
			navText: [
				'<i class="fa fa-angle-left" aria-hidden="true"></i>',
				'<i class="fa fa-angle-right" aria-hidden="true"></i>'
			],
			// navContainer: '.banner .custom-nav',
			items: 1,
		})
	}

	// Slide Thumbnail
	var slider = $(".carousel-full");
	var thumbnailSlider = $(".carousel-thumbs");
	var duration = 500;
	var syncedSecondary = true;

	var c = slider.find('.item');
    c.each(function(){
        var e = $(this),
        ocImg = e.find('img').attr('src');
        e.css({'background-image': 'url(' + ocImg + ')'});
    });

	slider

    .owlCarousel({
        loop: true,
        nav: true,
        navText: [
	        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
	        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
	    ],
        items: 1,
        lazyLoad: true,
        autoplay: true,
        smartSpeed: 600,
        autoplayHoverPause: true,
        dots: false,
        navContainer: '.banner .custom-nav',
        onInitialized  : counter,
        onTranslated : counter
    })
    .on("changed.owl.carousel", syncPosition);

    thumbnailSlider
    .on("initialized.owl.carousel", function() {
        thumbnailSlider
            .find(".owl-item")
            .eq(0)
            .addClass("current");
    })
    .owlCarousel({
        loop: false,
        nav: false,
        smartSpeed: 600,
        responsive: {
            0: {
                items: 4
            },
            600: {
                items: 6
            },
            1200: {
                items: 9
            }
        }
    })
    .on("changed.owl.carousel", syncPosition2);

	// on click thumbnaisl
	thumbnailSlider.on("click", ".owl-item", function(e) {
	    e.preventDefault();
	    var number = $(this).index();
	    slider.data("owl.carousel").to(number, 300, true);

	});

	function counter(event) {
	   var element   = event.target; 
	   var items     = event.item.count; 
	   var item      = event.item.index + 1;


	  if(item > items) {
	    item = item - items
	  }
	  // console.log(slider.find(".owl-item").eq(item).find("img").attr('title'));
	  $('#counter').html(slider.find(".owl-item").eq(event.item.index).find("img").attr('title'));
	}

	function syncPosition(el) {

	    var count = el.item.count - 1;
	    var current = Math.round(el.item.index - el.item.count / 2 - 0.5);

	    if (current < 0) {
	        current = count;
	    }
	    if (current > count) {
	        current = 0;
	    }
	   
	    thumbnailSlider
	        .find(".owl-item")
	        .removeClass("current")
	        .eq(current)
	        .addClass("current");
	    var onscreen = thumbnailSlider.find(".owl-item.active").length - 1;
	    var start = thumbnailSlider
	        .find(".owl-item.active")
	        .first()
	        .index();
	    var end = thumbnailSlider
	        .find(".owl-item.active")
	        .last()
	        .index();

	    if (current > end) {
	        thumbnailSlider.data("owl.carousel").to(current, 100, true);
	    }
	    if (current < start) {
	        thumbnailSlider.data("owl.carousel").to(current - onscreen, 100, true);
	    }
	}

	function syncPosition2(el) {
	    if (syncedSecondary) {
	        var number = el.item.index;
	        slider.data("owl.carousel").to(number, 100, true);
	    }
	}
});




  
  