// Entry point for the build script in your package.json
import "./channels"
//import "./controllers"


import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"

import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'

import './service/galleries'

import toastr from 'toastr'
window.toastr = toastr

require('lightgallery/src/js/lightgallery')
require('lg-fullscreen/src/lg-fullscreen')
require('lg-pager/src/lg-pager')
require('lg-hash/src/lg-hash')


//import './service/vendor/jquery.magnific-popup.min'
//import './service/vendor/isotope.pkgd.min'
//import './service/vendor/imagesloaded.pkgd.min'

Rails.start()
Turbolinks.start()
ActiveStorage.start()



