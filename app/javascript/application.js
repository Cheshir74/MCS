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

let analyticsPageStartedAt = Date.now()
let analyticsPageSent = false
let analyticsEvents = []
let analyticsMaxScrollPercent = 0

function analyticsToken() {
  return document.querySelector('meta[name="analytics-page-view-token"]')?.content
}

function analyticsCsrf() {
  return document.querySelector('meta[name="csrf-token"]')?.content
}

function appendCsrf(data) {
  const csrf = analyticsCsrf()
  if (csrf) data.append("authenticity_token", csrf)
}

function sendAnalyticsDuration() {
  if (analyticsPageSent) return

  const token = analyticsToken()
  const url = document.querySelector('meta[name="analytics-duration-url"]')?.content
  if (!token || !url) return

  analyticsPageSent = true
  queueScrollDepthEvent()
  sendAnalyticsEvents()

  const durationSeconds = Math.max(0, Math.round((Date.now() - analyticsPageStartedAt) / 1000))
  const data = new FormData()
  data.append("id", token)
  data.append("duration_seconds", durationSeconds)
  appendCsrf(data)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data)
  } else {
    fetch(url, { method: "POST", body: data, keepalive: true, credentials: "same-origin" })
  }
}

function resetAnalyticsTimer() {
  analyticsPageStartedAt = Date.now()
  analyticsPageSent = false
  analyticsEvents = []
  analyticsMaxScrollPercent = currentScrollPercent()
}

function currentScrollPercent() {
  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const scrollable = Math.max(documentHeight - viewportHeight, 1)
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)))
}

function updateAnalyticsScrollDepth() {
  analyticsMaxScrollPercent = Math.max(analyticsMaxScrollPercent, currentScrollPercent())
}

function queueScrollDepthEvent() {
  if (!analyticsToken()) return
  updateAnalyticsScrollDepth()
  analyticsEvents.push({
    event_type: "scroll_depth",
    scroll_percent: analyticsMaxScrollPercent,
    viewport_width: window.innerWidth || 0,
    viewport_height: window.innerHeight || 0
  })
}

function eventElementLabel(element) {
  return element?.dataset?.analyticsLabel ||
    element?.getAttribute?.("aria-label") ||
    element?.textContent?.trim()?.replace(/\s+/g, " ") ||
    ""
}

function queueAnalyticsClick(event) {
  if (!analyticsToken()) return

  const documentWidth = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0, 1)
  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0, 1)
  const x = ((event.pageX || 0) / documentWidth) * 100
  const y = ((event.pageY || 0) / documentHeight) * 100
  const element = event.target?.closest?.("a, button, input, textarea, select, [data-analytics-label]") || event.target

  analyticsEvents.push({
    event_type: "click",
    x_percent: Math.max(0, Math.min(100, x)),
    y_percent: Math.max(0, Math.min(100, y)),
    viewport_width: window.innerWidth || 0,
    viewport_height: window.innerHeight || 0,
    element_name: element?.tagName?.toLowerCase?.() || "",
    element_label: eventElementLabel(element).slice(0, 120)
  })

  if (analyticsEvents.length >= 20) sendAnalyticsEvents()
}

function sendAnalyticsEvents() {
  const token = analyticsToken()
  const url = document.querySelector('meta[name="analytics-events-url"]')?.content
  if (!token || !url || analyticsEvents.length === 0) return

  const events = analyticsEvents.splice(0, analyticsEvents.length)
  const data = new FormData()
  data.append("id", token)
  events.forEach((event, index) => {
    Object.entries(event).forEach(([key, value]) => {
      data.append(`events[${index}][${key}]`, value)
    })
  })
  appendCsrf(data)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data)
  } else {
    fetch(url, { method: "POST", body: data, keepalive: true, credentials: "same-origin" })
  }
}

document.addEventListener("turbo:load", resetAnalyticsTimer)
document.addEventListener("turbo:before-visit", sendAnalyticsDuration)
document.addEventListener("click", queueAnalyticsClick, true)
document.addEventListener("scroll", updateAnalyticsScrollDepth, { passive: true })
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendAnalyticsDuration()
})
window.addEventListener("pagehide", sendAnalyticsDuration)



