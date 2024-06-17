// Entry point for the build script in your package.json
//import "controllers"
import"./channels"

import"./controllers"


import toastr from 'toastr'
window.toastr = toastr

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

require('lightgallery/src/js/lightgallery')
require('lg-fullscreen/src/lg-fullscreen')
require('lg-pager/src/lg-pager')
require('lg-hash/src/lg-hash')
// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

import 'bootstrap' 

import 'service/galleries';

import 'stylesheets/application'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fontsource/lora'
import "@fontsource/cabin"

import "lightgallery/dist/css/lightgallery.css";
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel';
import 'service/vendor/jquery.magnific-popup.min'
import 'service/vendor/isotope.pkgd.min'
import 'service/vendor/imagesloaded.pkgd.min'
import 'service/script'