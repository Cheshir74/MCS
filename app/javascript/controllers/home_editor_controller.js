import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["variant", "section", "navItem", "modeBadge", "modeDescription", "filterButton", "variantPanel"]

  connect() {
    this.filterMode = "current"
    this.boundScheduleCurrentNavRefresh = this.scheduleCurrentNavRefresh.bind(this)
    this.boundRefreshCurrentNav = this.refreshCurrentNav.bind(this)

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", this.boundScheduleCurrentNavRefresh, { passive: true })
      window.addEventListener("resize", this.boundRefreshCurrentNav)
    }

    this.syncDesign()
  }

  disconnect() {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.boundScheduleCurrentNavRefresh)
      window.removeEventListener("resize", this.boundRefreshCurrentNav)
      window.cancelAnimationFrame(this.currentNavFrame)
    }
  }

  syncDesign() {
    this.updateModeText()
    this.updateVariantPanels()
    this.updateVisibility()
    this.updateFilterButtons()
  }

  showCurrent() {
    this.filterMode = "current"
    this.updateVisibility()
    this.updateFilterButtons()
  }

  showAll() {
    this.filterMode = "all"
    this.updateVisibility()
    this.updateFilterButtons()
  }

  jumpToSection(event) {
    const link = event.currentTarget
    const sectionId = link.getAttribute("href")?.replace(/^#/, "")

    if (!sectionId) return

    const section = this.sectionTargets.find((target) => target.id === sectionId)

    if (!section || section.hidden) return

    event.preventDefault()
    this.markCurrentNav(sectionId)

    window.scrollTo({
      top: Math.max(this.sectionScrollTop(section), 0),
      behavior: this.prefersReducedMotion() ? "auto" : "smooth"
    })

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", `#${sectionId}`)
    } else {
      window.location.hash = sectionId
    }
  }

  updateModeText() {
    const variant = this.currentVariant()
    const badgeText = variant === "editorial" ? "New mode" : "Legacy mode"
    const descriptionText = variant === "editorial" ?
      "You are editing the new homepage. Shared sections stay visible, legacy blocks can be hidden with the filter." :
      "You are editing the legacy homepage. Shared sections stay visible, new sections can be hidden with the filter."

    this.modeBadgeTargets.forEach((target) => {
      target.textContent = badgeText
      target.dataset.mode = variant
    })

    this.modeDescriptionTargets.forEach((target) => {
      target.textContent = descriptionText
    })
  }

  updateVisibility() {
    const variant = this.currentVariant()

    this.sectionTargets.forEach((target) => {
      const scope = target.dataset.scope || "shared"
      const hidden = this.filterMode === "current" && scope !== "shared" && scope !== variant

      target.hidden = hidden
      target.classList.toggle("is-hidden", hidden)
    })

    this.navItemTargets.forEach((target) => {
      const scope = target.dataset.scope || "shared"
      const hidden = this.filterMode === "current" && scope !== "shared" && scope !== variant

      target.hidden = hidden
      target.classList.toggle("is-hidden", hidden)
    })

    this.refreshCurrentNav()
  }

  updateFilterButtons() {
    this.filterButtonTargets.forEach((target) => {
      const active = target.dataset.filterMode === this.filterMode
      target.classList.toggle("is-active", active)
      target.setAttribute("aria-pressed", String(active))
    })
  }

  updateVariantPanels() {
    const variant = this.currentVariant()

    this.variantPanelTargets.forEach((target) => {
      const hidden = target.dataset.variantPanel !== variant
      target.hidden = hidden
      target.classList.toggle("is-hidden", hidden)
    })
  }

  currentVariant() {
    return this.hasVariantTarget ? this.variantTarget.value : "legacy"
  }

  scheduleCurrentNavRefresh() {
    if (typeof window === "undefined" || this.currentNavFrame) return

    this.currentNavFrame = window.requestAnimationFrame(() => {
      this.currentNavFrame = null
      this.refreshCurrentNav()
    })
  }

  refreshCurrentNav() {
    const currentSection = this.currentSection()

    if (currentSection) {
      this.markCurrentNav(currentSection.id)
    }
  }

  currentSection() {
    const visibleSections = this.visibleSections()

    if (visibleSections.length === 0) return null

    if (typeof window === "undefined") return visibleSections[0]

    const threshold = window.scrollY + this.scrollOffset() + 20
    let currentSection = visibleSections[0]

    visibleSections.forEach((section) => {
      if (this.sectionPageTop(section) <= threshold) {
        currentSection = section
      }
    })

    return currentSection
  }

  visibleSections() {
    return this.sectionTargets.filter((target) => !target.hidden)
  }

  markCurrentNav(sectionId) {
    this.navItemTargets.forEach((target) => {
      const active = target.getAttribute("href") === `#${sectionId}`

      target.classList.toggle("is-current", active)

      if (active) {
        target.setAttribute("aria-current", "true")
      } else {
        target.removeAttribute("aria-current")
      }
    })
  }

  sectionScrollTop(section) {
    return this.sectionPageTop(section) - this.scrollOffset()
  }

  sectionPageTop(section) {
    return section.getBoundingClientRect().top + window.scrollY
  }

  scrollOffset() {
    const headerHeight = document.querySelector(".admin-topbar")?.getBoundingClientRect().height || 0
    const stickyRail = this.element.querySelector(".admin-editor__rail-sticky")
    const stickyTop = stickyRail ? Number.parseFloat(window.getComputedStyle(stickyRail).top) : Number.NaN

    if (Number.isFinite(stickyTop) && stickyTop > headerHeight) {
      return stickyTop
    }

    return headerHeight + 16
  }

  prefersReducedMotion() {
    return typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }
}
