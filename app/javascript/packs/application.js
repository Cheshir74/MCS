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

import 'bootstrap';
import 'service/galleries';

import 'stylesheets/application'

import 'service/vendor/owl'
import 'service/vendor/jquery.magnific-popup.min'
import 'service/vendor/isotope.pkgd.min'
import 'service/vendor/imagesloaded.pkgd.min'
import 'service/script'