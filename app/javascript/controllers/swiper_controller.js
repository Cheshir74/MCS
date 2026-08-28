import { Controller } from '@hotwired/stimulus';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default class extends Controller {
  connect() {
    this.swiper = new Swiper('.swiper-container', {
      // Swiper configuration options
      modules: [Navigation],
      centeredSlides: true,
      pagination: {
        el: ".swiper-pagination",
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });

    this.boundLoadDeferredBackgrounds = this.loadDeferredBackgrounds.bind(this)
    if (document.readyState === "complete") {
      window.setTimeout(this.boundLoadDeferredBackgrounds, 800)
    } else {
      window.addEventListener("load", this.boundLoadDeferredBackgrounds, { once: true })
    }
  }

  disconnect() {
    window.removeEventListener("load", this.boundLoadDeferredBackgrounds)
    this.swiper?.destroy()
  }

  loadDeferredBackgrounds() {
    this.element.querySelectorAll("[data-background]").forEach((element) => {
      element.style.background = `url('${element.dataset.background}') center / cover no-repeat`
      element.removeAttribute("data-background")
    })
  }
}
