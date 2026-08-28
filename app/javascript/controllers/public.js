import { application } from "./application"

import ModalController from "./modal_controller"
application.register("modal", ModalController)

import SwiperController from "./swiper_controller"
application.register("swiper", SwiperController)

import CheckEmailController from "./check_email_controller"
application.register("check_email", CheckEmailController)

import GalleryController from "./gallery_controller"
application.register("gallery", GalleryController)

import EditorialHomeController from "./editorial_home_controller"
application.register("editorial-home", EditorialHomeController)
