import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"

import "./add_jquery"
var ReactRailsUJS = require("react_ujs");

var skipFirstCall = false
ReactRailsUJS.handleEvent('turbo:load', ()=> {
  skipFirstCall && ReactRailsUJS.handleMount()
  skipFirstCall = true
})

import "@fortawesome/fontawesome-free/js/all"