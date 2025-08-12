import "@hotwired/turbo-rails"
import * as bootstrap from "bootstrap"
import "./controllers"

import React from "react"
import ReactDOM from "react-dom"

// Глобальные переменные для react-rails
window.React = React
window.ReactDOM = ReactDOM

import "./add_jquery"
import "./packs/admin"

var ReactRailsUJS = require("react_ujs");

var skipFirstCall = false
ReactRailsUJS.handleEvent('turbo:load', ()=> {
  skipFirstCall && ReactRailsUJS.handleMount()
  skipFirstCall = true
})

import "@fortawesome/fontawesome-free/js/all"

//import './service/galleries'

import toastr from 'toastr'
window.toastr = toastr

window.global = window;





