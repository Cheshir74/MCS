pin "popper", to: 'popper.js', preload: true

pin "bootstrap", to: 'bootstrap.min.js', preload: truepin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
