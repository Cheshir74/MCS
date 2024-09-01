import toastr from 'toastr'
window.toastr = toastr

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")
require("jquery")


//require('lightgallery/src/js/lightgallery')
//require('lg-fullscreen/src/lg-fullscreen')
//require('lg-pager/src/lg-pager')
//require('lg-hash/src/lg-hash')
import "dropzone/dist/min/dropzone.min.css";
import "dropzone/dist/min/basic.min.css";
import "controllers"
//import "lightgallery/css/lightgallery.css";
import "bootstrap";
import 'stylesheets/admin'

import 'service/galleries'
