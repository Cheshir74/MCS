import sortable  from  "html5sortable/dist/html5sortable.cjs"
import lightGallery from "lightgallery/dist/js/lightgallery-all"
import Rails from '@rails/ujs'

$(document).on('turbolinks:load', function () {
  

    $('#lightgallery').lightGallery({
        selector: '.item',
        escKey: true,
        hideControlOnEnd: true,
        preload: 2,
        download: false,
        pager: true
    });
    sortable('.sortable');
    if (typeof sortable('.sortable')[0] != 'undefined'){
        sortable('.sortable')[0].addEventListener('sortupdate', function(e) {
          var dataIDList = $(this).children().map(function(position){
             $(this).find( ".position" ).text(position + 1)
             return "images[]=" + $(this).data("id");
          }).get().join("&");
          Rails.ajax({
              url: "sort",
              type: "PATCH",
              data: dataIDList,
            });
        });
      }

    
});