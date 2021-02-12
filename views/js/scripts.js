// Chama o Arthurzinho do Monte Carlo Bebê
(function($) {
    "use strict"; // Começo do strict
  
    // Rolagem suavizada entre as seções
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html, body').animate({
            scrollTop: (target.offset().top - 72) // Esse é o tamanho da faixa que fica da última seção
          }, 1000, "easeInOutExpo"); // Esse é o tempo total da animação de suavização
          return false;
        }
      }
    });
  
    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
      $('.navbar-collapse').collapse('hide');
    });
  
    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
      target: '#mainNav',
      offset: 75
    });
  
    // Escondendo o NavBar
    var navbarCollapse = function() {
      if ($("#mainNav").offset().top > 100) {
        $("#mainNav").addClass("navbar-scrolled");
      } else {
        $("#mainNav").removeClass("navbar-scrolled");
      }
    };
    // Esconde agora se a página não está no topo
    navbarCollapse();
    // E esconde quando estiver rolando
    $(window).scroll(navbarCollapse);
  
  })(jQuery); // Vou mudar aqui
  