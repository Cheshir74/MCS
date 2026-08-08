import lightGallery from "lightgallery"
import Rails from '@rails/ujs'


$(document).on("turbolinks:load", function(){

		$(window).scroll(function () {
		  var $nav = $(".navbar");
		  $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
		});

	$(".loader").delay(400).fadeOut();
  $(".animationload").delay(400).fadeOut("fast"); });

$(document).on('turbolinks:load', function () {
    $('#lightgallery').lightGallery({
        selector: '.item',
        escKey: true,
        hideControlOnEnd: true,
        preload: 2,
        download: false,
        pager: true
    });

    document.querySelectorAll('.sortable').forEach(enableNativeSort);

    
});

function enableNativeSort(container) {
  if (container.dataset.nativeSortableReady === "true") return;

  var draggedItem = null;
  container.dataset.nativeSortableReady = "true";

  sortableItems(container).forEach(function(item) {
    item.setAttribute("draggable", "true");
  });

  container.addEventListener("dragstart", function(event) {
    if (event.target.closest("a, button, label, input")) {
      event.preventDefault();
      return;
    }

    draggedItem = event.target.closest("[data-id]");
    if (!draggedItem || draggedItem.parentElement !== container) return;

    draggedItem.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedItem.dataset.id || "");
  });

  container.addEventListener("dragover", function(event) {
    if (!draggedItem) return;

    var target = event.target.closest("[data-id]");
    if (!target || target === draggedItem || target.parentElement !== container) return;

    event.preventDefault();

    var rect = target.getBoundingClientRect();
    var centerY = rect.top + rect.height / 2;
    var centerX = rect.left + rect.width / 2;
    var insertAfter = event.clientY > centerY || (Math.abs(event.clientY - centerY) < rect.height / 4 && event.clientX > centerX);

    container.insertBefore(draggedItem, insertAfter ? target.nextSibling : target);
  });

  container.addEventListener("drop", function(event) {
    if (!draggedItem) return;

    event.preventDefault();
    persistNativeOrder(container);
  });

  container.addEventListener("dragend", function() {
    if (draggedItem) {
      draggedItem.classList.remove("is-dragging");
    }
    draggedItem = null;
  });
}

function sortableItems(container) {
  return Array.from(container.children).filter(function(item) {
    return item.dataset.id;
  });
}

function persistNativeOrder(container) {
  var dataIDList = sortableItems(container).map(function(item, position) {
    $(item).find(".position").text(position + 1);
    return "images[]=" + encodeURIComponent(item.dataset.id);
  }).join("&");

  if (!dataIDList) return;

  Rails.ajax({
    url: "sort",
    type: "PATCH",
    data: dataIDList,
  });
}
