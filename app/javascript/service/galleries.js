import sortable  from  "html5sortable/dist/html5sortable.cjs"
import lightGallery from "lightgallery/dist/js/lightgallery-all"

$(document).on('turbolinks:load', function () {
    $('#lightgallery').lightGallery({
        selector: '.item',
        escKey: true,
        hideControlOnEnd: true,
        preload: 2,
        download: false,
        pager: true
    });
    sortable('.sortable', {
        
        });

    
});