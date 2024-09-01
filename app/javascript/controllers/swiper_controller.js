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
  }
}
