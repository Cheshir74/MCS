import { application } from "./application"

import DropzoneController from "./dropzone_controller.js"
application.register("dropzone", DropzoneController)

import ModalController from "./modal_controller"
application.register("modal", ModalController)

import ChangePasswordController from "./change_password_controller"
application.register("change-password", ChangePasswordController)

import EmailChangeController from "./email_change_controller"
application.register("email-change", EmailChangeController)

import LogoPreviewController from "./logo_preview_controller"
application.register("logo-preview", LogoPreviewController)

import RichTextController from "./rich_text_controller"
application.register("rich-text", RichTextController)

import SectionOrderController from "./section_order_controller"
application.register("section-order", SectionOrderController)

import FeaturedHomeController from "./featured_home_controller"
application.register("featured-home", FeaturedHomeController)

import HomeEditorController from "./home_editor_controller"
application.register("home-editor", HomeEditorController)

import GalleryPreviewController from "./gallery_preview_controller"
application.register("gallery-preview", GalleryPreviewController)

import GallerySortController from "./gallery_sort_controller"
application.register("gallery-sort", GallerySortController)

import SelectMenuController from "./select_menu_controller"
application.register("select-menu", SelectMenuController)

import BulkSelectionController from "./bulk_selection_controller"
application.register("bulk-selection", BulkSelectionController)

import UserAccessGuardController from "./user_access_guard_controller"
application.register("user-access-guard", UserAccessGuardController)
