// THIS HANDELS THE TRANSFORMATIONS IN THE MENU ICON
// IT TOGGLES THE ICON TO AN X
$(document).ready(function(){
    $('#menu').click(function(){
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });
});