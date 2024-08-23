import "@hotwired/turbo-rails"
import * as bootstrap from "bootstrap"
import "./controllers"

import "./add_jquery"

var ReactRailsUJS = require("react_ujs");

var skipFirstCall = false
ReactRailsUJS.handleEvent('turbo:load', ()=> {
  skipFirstCall && ReactRailsUJS.handleMount()
  skipFirstCall = true
})

import "@fortawesome/fontawesome-free/js/all"

//import './service/galleries'
import "./packs/check_email"

import toastr from 'toastr'
window.toastr = toastr

//require('lightgallery')
//require('lg-fullscreen/src/lg-fullscreen')
//require('lg-pager/src/lg-pager')
//require('lg-hash/src/lg-hash')


//import './service/vendor/jquery.magnific-popup.min'
//import './service/vendor/isotope.pkgd.min'
//import './service/vendor/imagesloaded.pkgd.min'

//Rails.start()
//Turbolinks.start()
//ActiveStorage.start()



