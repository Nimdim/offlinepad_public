(function($){
  $(function(){
    $('.sidenav').sidenav();
    $('.parallax').parallax();

    $('img[data-src]').each(function(index, img) {
      let src = img.attributes.getNamedItem("data-src");
      img.src = src.value;
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space
