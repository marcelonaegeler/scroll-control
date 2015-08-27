define('scroll-control'
  , [ 'jquery' ]
  , function() {
    "use strict";
    // Global vars
    var PAGES = $('[href^=#]');
    var PATH = document.getElementById('main').getAttribute('data-url');
    var PAGE_LIMITER;
    var FIXED_HEADER = 135; // Consider fixed header bar height
    var pages = [];

    /*
    * Set each page info
    */
    var setPages = function() {
      var pagesLength = PAGES.length;
      pages = [];
      for(var i = 0; i < pagesLength; i++) {
        (function() {
          var page = $(PAGES[i]);
          var pageId = page.attr('href');
          var pageName = pageId.split('#')[1];

          var el = $(pageId);
          if(!el[0]) return;
          var elOffsetTop = el.offset().top
            , elHeight = el.outerHeight();

          if(!!page.attr('data-show-url')) {
            var pageInfo = {
              name: pageName
              , top: elOffsetTop
              , height: elHeight
              , topLimit: elOffsetTop - PAGE_LIMITER
              , bottomLimit: elOffsetTop + elHeight - PAGE_LIMITER
            };

            pages.push(pageInfo);
          }

          $('[href="'+ pageId +'"]').click(function(event) {
            event.preventDefault();
            scrollTo(pageId);
          });
        })();
      }
    };

    /*
    * The limit to change between pages (actually 60%)
    */
    var setPageLimiter = function() {
      return PAGE_LIMITER = ($(window).height() / 100) * 60;
    };

    /*
    * Load an external funciton inside the onscroll event
    */
    var externalScroll = function(position) {
      position = position || $(window).scrollTop();
      window.scrollEvent && window.scrollEvent(position);
    };

    /*
    * Handle the scroll event
    */
    var scrollHandler = function() {
      var position = $(window).scrollTop()
        , hash = '';
      externalScroll(position);

      var pagesLength = pages.length;
      for(var i = 0; i < pagesLength; i++) {
        (function() {
          var page = pages[i];
          if(position >= page.topLimit && position < page.bottomLimit) hash = page.name;
        })();
      }

      setHistory(hash);
    };

    /*
    * Handle the resize event
    */
    var resizeHandler = function() {
      setPageLimiter();
      setPages();
    };

    /*
    * Scroll the page (smoothly)
    */
    var scrollTo = function(hash) {
      var scrollEnd = hash.length > 1 ? $(hash).offset().top : 0;
      $('html, body').animate({
        scrollTop: (scrollEnd ? (scrollEnd - FIXED_HEADER) : scrollEnd) +'px'
      }, 200);
    };

    /*
    * Set the window history (html5)
    */
    var setHistory = function(page) {
      window.history.pushState(null, null, [ PATH, page ].join('/'));
    };

    /*
    * The first scroll, if it's needed
    */
    var initialPagination = function() {
      var pagesLength = PAGES.length
        , location = window.location.href
        , hash = '';

      for(var i = 0; i < pagesLength; i++) {
        if(!PAGES[i] || !pages[PAGES[i]]) continue;
        (function() {
          var regex = new RegExp('('+ pages[PAGES[i]].name +')$');
          if(regex.exec(location)) hash = regex.exec(location)[1];
        })();
      }
      scrollTo([ '#', hash ].join(''));
    };

    /*
    * Let's start it!
    */
    (function() {
      setPageLimiter();
      setPages();
      initialPagination();

      $(window)
        .resize(resizeHandler)
        .scroll(scrollHandler);
    })();
  }
);
