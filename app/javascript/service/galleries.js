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
  var placeholder = null;
  var indicator = null;
  var pendingReferenceItem = null;
  var orderChanged = false;
  var initialOrder = "";
  container.dataset.nativeSortableReady = "true";

  sortableItems(container).forEach(function(item) {
    item.setAttribute("draggable", "true");
  });
  updateNativeCoverClass(container, draggedItem, placeholder);

  container.addEventListener("dragstart", function(event) {
    if (blockedNativeDragTarget(event.target)) {
      event.preventDefault();
      return;
    }

    draggedItem = event.target.closest("[data-id]");
    if (!draggedItem || draggedItem.parentElement !== container) return;

    orderChanged = false;
    initialOrder = serializedNativeOrder(container);
    pendingReferenceItem = draggedItem.nextElementSibling;
    if (nativeStaticIndicatorMode(container)) {
      indicator = createNativeIndicator();
      container.appendChild(indicator);
      positionNativeIndicator(container, indicator, draggedItem, pendingReferenceItem);
    } else {
      placeholder = createNativePlaceholder(draggedItem);
      container.insertBefore(placeholder, draggedItem.nextSibling);
    }
    container.classList.add("is-sorting");
    draggedItem.classList.add("is-dragging");
    updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedItem.dataset.id || "");
    }
    if (!nativeStaticIndicatorMode(container)) {
      requestAnimationFrame(function() {
        if (draggedItem) draggedItem.classList.add("is-dragging-hidden");
      });
    }
  });

  container.addEventListener("dragover", function(event) {
    if (!draggedItem) return;

    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";

    if (nativeStaticIndicatorMode(container)) {
      var nextReferenceItem = nativeColumnReferenceItemFor(container, draggedItem, event.clientX, event.clientY);
      if (nextReferenceItem === pendingReferenceItem) return;

      pendingReferenceItem = nextReferenceItem;
      positionNativeIndicator(container, indicator, draggedItem, pendingReferenceItem);
      orderChanged = true;
      updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem);
      return;
    }

    if (!placeholder) return;

    var referenceItem = nativeReferenceItemFor(container, draggedItem, event.clientX, event.clientY);
    if (referenceItem === placeholder.nextElementSibling) return;

    container.insertBefore(placeholder, referenceItem);
    orderChanged = true;
    updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem);
  });

  container.addEventListener("drop", function(event) {
    if (!draggedItem) return;

    event.preventDefault();
    commitNativeDragPosition(container, draggedItem, placeholder, pendingReferenceItem);
    updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem);
    if (shouldPersistNativeOrder(container, orderChanged, initialOrder)) {
      persistNativeOrder(container);
      orderChanged = false;
    }
    cleanupNativeDrag(container, draggedItem, placeholder, indicator);
    draggedItem = null;
    placeholder = null;
    indicator = null;
    pendingReferenceItem = null;
    orderChanged = false;
    initialOrder = "";
  });

  container.addEventListener("dragend", function() {
    if (!draggedItem) return;

    if (nativeStaticIndicatorMode(container)) {
      cleanupNativeDrag(container, draggedItem, placeholder, indicator);
      draggedItem = null;
      placeholder = null;
      indicator = null;
      pendingReferenceItem = null;
      orderChanged = false;
      initialOrder = "";
      return;
    }

    commitNativeDragPosition(container, draggedItem, placeholder, pendingReferenceItem);
    updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem);
    if (shouldPersistNativeOrder(container, orderChanged, initialOrder)) {
      persistNativeOrder(container);
    }
    cleanupNativeDrag(container, draggedItem, placeholder, indicator);
    draggedItem = null;
    placeholder = null;
    indicator = null;
    pendingReferenceItem = null;
    orderChanged = false;
    initialOrder = "";
  });
}

function blockedNativeDragTarget(target) {
  return !target.closest("[data-gallery-sort-handle]");
}

function sortableItems(container) {
  return Array.from(container.children).filter(function(item) {
    return item.dataset.id;
  });
}

function nativeReferenceItemFor(container, draggedItem, pointerX, pointerY) {
  var candidates = sortableItems(container).filter(function(item) {
    return item !== draggedItem;
  });

  if (candidates.length === 0) return null;

  var rows = candidates.reduce(function(collection, item) {
    var rect = item.getBoundingClientRect();
    var centerY = rect.top + rect.height / 2;
    var row = collection.find(function(entry) {
      return Math.abs(entry.centerY - centerY) <= Math.min(entry.height, rect.height) / 2;
    });

    if (row) {
      row.items.push({ item: item, rect: rect });
      row.top = Math.min(row.top, rect.top);
      row.bottom = Math.max(row.bottom, rect.bottom);
      row.height = Math.max(row.height, rect.height);
      row.centerY = row.top + (row.bottom - row.top) / 2;
    } else {
      collection.push({
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        centerY: centerY,
        items: [{ item: item, rect: rect }]
      });
    }

    return collection;
  }, []).sort(function(first, second) {
    return first.top - second.top;
  });

  var firstRow = rows[0];
  var lastRow = rows[rows.length - 1];
  var row = rows.find(function(entry) {
    return pointerY >= entry.top && pointerY <= entry.bottom;
  });

  if (!row) {
    if (pointerY < firstRow.top) row = firstRow;
    else if (pointerY > lastRow.bottom) return null;
    else row = rows.find(function(entry) {
      return pointerY < entry.top;
    }) || lastRow;
  }

  var rowItems = row.items.sort(function(first, second) {
    return first.rect.left - second.rect.left;
  });
  var target = rowItems.find(function(entry) {
    return pointerX < entry.rect.left + entry.rect.width / 2;
  });
  if (target) return target.item;

  var nextRow = rows[rows.indexOf(row) + 1];
  if (!nextRow) return null;

  return nextRow.items.sort(function(first, second) {
    return first.rect.left - second.rect.left;
  })[0].item || null;
}

function nativeColumnReferenceItemFor(container, draggedItem, pointerX, pointerY) {
  var candidates = sortableItems(container).filter(function(item) {
    return item !== draggedItem;
  });

  if (candidates.length === 0) return null;

  var containingItem = candidates.find(function(item) {
    var rect = item.getBoundingClientRect();
    return pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
  });

  if (containingItem) {
    var containingRect = containingItem.getBoundingClientRect();
    return pointerY < containingRect.top + containingRect.height / 2 ? containingItem : nextNativeCandidateAfter(candidates, containingItem);
  }

  var closest = candidates.reduce(function(best, item) {
    var rect = item.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var distance = Math.pow(pointerX - centerX, 2) + Math.pow(pointerY - centerY, 2);

    if (!best || distance < best.distance) return { item: item, centerY: centerY, distance: distance };
    return best;
  }, null);

  return pointerY < closest.centerY ? closest.item : nextNativeCandidateAfter(candidates, closest.item);
}

function nextNativeCandidateAfter(candidates, item) {
  return candidates[candidates.indexOf(item) + 1] || null;
}

function serializedNativeOrder(container) {
  return sortableItems(container).map(function(item) {
    return item.dataset.id;
  }).join(",");
}

function shouldPersistNativeOrder(container, orderChanged, initialOrder) {
  return orderChanged && serializedNativeOrder(container) !== initialOrder;
}

function updateNativeCoverClass(container, draggedItem, placeholder, pendingReferenceItem) {
  if (container.dataset.gallerySortCoverValue !== "true") return;

  var firstItem = currentNativeOrderedItems(container, draggedItem, placeholder, pendingReferenceItem)[0];
  sortableItems(container).forEach(function(item) {
    item.classList.remove("admin-gallery-tile--cover");
  });
  if (firstItem) firstItem.classList.add("admin-gallery-tile--cover");
}

function currentNativeOrderedItems(container, draggedItem, placeholder, pendingReferenceItem) {
  if (nativeStaticIndicatorMode(container) && draggedItem) {
    var orderedItems = sortableItems(container).filter(function(item) {
      return item !== draggedItem;
    });
    var index = pendingReferenceItem ? orderedItems.indexOf(pendingReferenceItem) : orderedItems.length;
    orderedItems.splice(index >= 0 ? index : orderedItems.length, 0, draggedItem);
    return orderedItems;
  }

  return Array.from(container.children).reduce(function(orderedItems, child) {
    if (child === placeholder) {
      if (draggedItem) orderedItems.push(draggedItem);
      return orderedItems;
    }

    if (child === draggedItem && placeholder && placeholder.parentElement) return orderedItems;
    if (child.dataset.id) orderedItems.push(child);

    return orderedItems;
  }, []);
}

function createNativePlaceholder(item) {
  var placeholder = document.createElement("div");
  placeholder.className = "admin-gallery-tile admin-gallery-sort-placeholder";
  placeholder.style.minHeight = item.getBoundingClientRect().height + "px";
  placeholder.setAttribute("aria-hidden", "true");
  return placeholder;
}

function createNativeIndicator() {
  var indicator = document.createElement("div");
  indicator.className = "admin-gallery-sort-indicator";
  indicator.setAttribute("aria-hidden", "true");
  return indicator;
}

function positionNativeIndicator(container, indicator, draggedItem, referenceItem) {
  if (!indicator) return;

  var candidates = sortableItems(container).filter(function(item) {
    return item !== draggedItem;
  });
  var target = referenceItem || candidates[candidates.length - 1];
  if (!target) {
    indicator.style.opacity = "0";
    return;
  }

  var containerRect = container.getBoundingClientRect();
  var targetRect = target.getBoundingClientRect();
  var placeAfter = !referenceItem;
  var top = (placeAfter ? targetRect.bottom : targetRect.top) - containerRect.top + container.scrollTop;
  var left = targetRect.left - containerRect.left + container.scrollLeft;

  indicator.style.opacity = "1";
  indicator.style.top = top + "px";
  indicator.style.left = left + "px";
  indicator.style.width = targetRect.width + "px";
}

function commitNativeDragPosition(container, draggedItem, placeholder, pendingReferenceItem) {
  if (draggedItem) draggedItem.classList.remove("is-dragging-hidden");
  if (nativeStaticIndicatorMode(container)) {
    container.insertBefore(draggedItem, pendingReferenceItem);
  } else if (placeholder && placeholder.parentElement) {
    container.insertBefore(draggedItem, placeholder);
  }
}

function cleanupNativeDrag(container, draggedItem, placeholder, indicator) {
  if (draggedItem) draggedItem.classList.remove("is-dragging", "is-dragging-hidden");
  if (placeholder) placeholder.remove();
  if (indicator) indicator.remove();
  container.classList.remove("is-sorting");
}

function nativeStaticIndicatorMode(container) {
  return container.classList.contains("admin-gallery-grid--site-preview");
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
