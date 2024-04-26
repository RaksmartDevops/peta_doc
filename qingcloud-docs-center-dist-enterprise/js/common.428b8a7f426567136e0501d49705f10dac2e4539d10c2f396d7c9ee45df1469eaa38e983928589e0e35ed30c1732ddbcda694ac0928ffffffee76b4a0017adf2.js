function handleNavbar() {
  if ($('.navbar-logo-home .content-item-title-icon').length) {
    $('.navbar-logo-home').on('mouseenter', function() {
      if ($('.navbar-logo-home .content-item-title-icon').hasClass('icon-house_duotone1')) {
        $('.navbar-logo-home .content-item-title-icon').removeClass('icon-house_duotone1');
      }
      $('.navbar-logo-home .content-item-title-icon').addClass('icon-house_duotone');
    }).on('mouseleave', function() {
      if ($('.navbar-logo-home .content-item-title-icon').hasClass('icon-house_duotone')) {
        $('.navbar-logo-home .content-item-title-icon').removeClass('icon-house_duotone');
      }
      $('.navbar-logo-home .content-item-title-icon').addClass('icon-house_duotone1');
    });
  }
}

//滚动事件方法
function checkTOC(min, max) {
  function funScroll(depth) {
    //获取当前滚动条的高度
    var top = $(document).scrollTop();
    var titles = $(".post h" + depth);

    var activeIndex = depth === min ? 0 : undefined;
    titles.each(function (index) {
      var thisTop = $(this).offset().top;
      if (top >= Math.floor(thisTop)) {
        activeIndex = index;
      }
    });
    titles.each(function (index) {
      var anchor = $(this).attr('id');
      if (activeIndex === index) {
        $('#TableOfContents'+ ' > ul > li '.repeat(depth - min + 1) +'a[href="#' + anchor + '"]').parent().addClass('active');
        if (depth + 1 <= max) {
          funScroll(depth + 1);
        }
      } else {
        $('#TableOfContents'+ ' > ul > li '.repeat(depth - min + 1) +'a[href="#' + anchor + '"]').parent().removeClass('active');
      }
    });
  }
  funScroll(min);
}

function checkBackToTop() {
  if ($(document).scrollTop() > '1024') {
    $('.post-back-to-top').addClass('show');
  } else {
    $('.post-back-to-top').removeClass('show');
  }
}

function toggleDropdown() {
  // Get all dropdowns on the page that aren't hoverable.
  var dropdowns = document.querySelectorAll('.dropdown:not(.is-hoverable)');

  if (dropdowns.length > 0) {
    // For each dropdown, add event handler to open on click.
    dropdowns.forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        el.classList.toggle('is-active');
        triggerDropdownIcon(el);
      });
    });

    // If user clicks outside dropdown, close it.
    document.addEventListener('click', function(e) {
      closeDropdowns();
    });
  }

  /*
  * Close dropdowns by removing `is-active` class.
  */
  function closeDropdowns() {
    dropdowns.forEach(function (el) {
      if ($(el).hasClass('is-active')) {
        $(el).removeClass('is-active');
        triggerDropdownIcon(el);
      }
    });
  }

  // Close dropdowns if ESC pressed
  document.addEventListener('keydown', function (event) {
    let e = event || window.event;
    if (e.key === 'Esc' || e.key === 'Escape') {
      closeDropdowns();
    }
  });

  function triggerDropdownIcon(el) {
    var $triggerIcon = $(el).find('.dropdown-trigger .icon');
    if ($triggerIcon.hasClass('icon-chevron_down_fill')) {
      $triggerIcon.removeClass('icon-chevron_down_fill').addClass('icon-chevron_up_duotone');
    } else if ($triggerIcon.hasClass('icon-chevron_up_duotone')) {
      $triggerIcon.removeClass('icon-chevron_up_duotone').addClass('icon-chevron_down_fill');
    }
  }
}

function downloadFile(filePath, fileName) {
  var a = document.createElement('a');
  a.href = filePath + fileName;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function insertNextPrev() {
  if ($('.post-footer').length) {
    var listPage = [];
    $('.sidebar-menu a').each(function () {
      var href = $(this).attr('href');
      if (href) {
        listPage.push({
          url: href,
          title: $(this).text().trim(),
        });
      }
    });
    var currentPathname = window.location.pathname;
    var currentIndex = listPage.findIndex(function (item) {
      return item.url === currentPathname;
    });
    if (currentIndex > 0) {
      $('.post-prev').empty().append(
        $('<a></a>')
          .attr('href', listPage[currentIndex - 1].url)
          .append($('<span class="icon-chevron_left_circle_fill"></span>'))
          .append('上一篇：' + listPage[currentIndex - 1].title)
      );
    }
    if (currentIndex < listPage.length - 1) {
      $('.post-next').empty().append(
        $('<a></a>').attr('href', listPage[currentIndex + 1].url)
          .append('下一篇：' + listPage[currentIndex + 1].title)
          .append($('<span class="icon-chevron_right_circle_fill"></span>'))
      );
    }
  }
}

function checkSearchSidebar() {
  function debounce(fn, delay) {
    var timer;
    return function () {
      var _this = this;
      var args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        fn.apply(_this, args);
      }, delay);
    };
  }
  if ($('.search-sidebar-result-item').length) {
    var sidebarData = [];
    $('.search-sidebar-result .column').each(function () {
      $(this).children('.search-sidebar-result-item').each(function (index) {
        var item = {
          title: $(this).children('.search-sidebar-result-item-title').children('.search-sidebar-result-item-title-text').text().trim(),
          icon: $(this).children('.search-sidebar-result-item-title').children('.search-sidebar-result-item-title-icon').attr('class').split(/\s+/).find(function (className) {
            return className.toLowerCase().startsWith('icon');
          }),
          index: index,
        }
        item.children = [];
        $(this).find('.search-sidebar-result-item-children a').each(function () {
          item.children.push({
            title: $(this).text().trim(),
            href: $(this).attr('href'),
          });
        });
        sidebarData.push(item);
      });
    });
    sidebarData = sidebarData.sort(function (a, b) {
      return a.index - b.index;
    });
    $('.search-sidebar .input').on('input', debounce(function (e) {
      var searchInput = $(this).val().trim().toUpperCase();
      var resultData = [];
      sidebarData.forEach(function (item) {
        if (item.title.toUpperCase().includes(searchInput)) {
          resultData.push(item);
        } else {
          var children = item.children.filter(function (v) {
            return v.title.toUpperCase().includes(searchInput);
          });
          if (children.length) {
            resultData.push({
              title: item.title,
              icon: item.icon,
              children: children,
            });
          }
        }
      });
      $('.search-sidebar-result').empty();
      if (resultData.length) {
        var nodes = resultData.map(function (item) {
          return $('<div class="search-sidebar-result-item"></div>')
            .append('<div class="search-sidebar-result-item-title">' +
            (item.icon ?
              ('<span class="search-sidebar-result-item-title-icon content-item-title-icon ' + item.icon + '">' +
                '<span class="path1"></span>' +
                '<span class="path2"></span>' +
                '<span class="path3"></span>' +
                '<span class="path4"></span>' +
                '<span class="path5"></span>' +
                '<span class="path6"></span>' +
                '<span class="path7"></span>' +
                '<span class="path8"></span>' +
                '<span class="path9"></span>' +
                '<span class="path10"></span>' +
                '<span class="path11"></span>' +
                '<span class="path12"></span>' +
                '<span class="path13"></span>' +
                '<span class="path14"></span>' +
                '<span class="path15"></span>' +
              '</span>') : '') +
              '<span class="search-sidebar-result-item-title-text">' + item.title + '</span>' +
              '</div>')
            .append('<div class="search-sidebar-result-item-children">' + item.children.map(function (child) {
              return '<a href="' + child.href + '">' + child.title + '</a>';
          }).join('') + '</div>');
        });
        var columns = [
          $('<div class="column"></div>'),
          $('<div class="column"></div>'),
          $('<div class="column"></div>'),
          $('<div class="column"></div>'),
        ];
        nodes.forEach(function (node, index) {
          columns[index % 4].append(node);
        });
        columns.forEach(function (column) {
          $('.search-sidebar-result').append(column);
        });
      }
    }, 300));
    var searchSidebarTimer = null;
    var $searchIcon = $('.sidebar-title .icon-menu_fill');
    var $searchSidebar = $('.search-sidebar-wrapper');
    $('.sidebar-title .icon-menu_fill').on('mouseenter', function () {
      clearTimeout(searchSidebarTimer);
      $searchSidebar.show();
      $(this).addClass('active');
    }).on('mouseleave', function () {
      searchSidebarTimer = setTimeout(function () {
        $searchSidebar.hide();
        $searchIcon.removeClass('active');
      }, 400);
    });
    $searchSidebar.on('mouseenter', function () {
      clearTimeout(searchSidebarTimer);
      $(this).show();
      $searchIcon.addClass('active');
    }).on('mouseleave', function () {
      searchSidebarTimer = setTimeout(function () {
        $searchSidebar.hide();
        $searchIcon.removeClass('active');
      }, 400);
    });
    //
    // .search-sidebar-wrapper
  }
}

function handleSearchHomeSidebar() {
  var hash = window.location.hash;
  var activeNode = $('.search-home-content-wrapper li.sidebar-item a[href="' + hash + '"]');
  activeNode.parent().addClass('active');
  $('.search-home-content-wrapper li.sidebar-item').on('click', function () {
    $('.search-home-content-wrapper li.sidebar-item').removeClass('active');
    $(this).addClass('active');
  });
}

function handleSidebarWidth() {
  var min = 180;
  var max = 500;
  var leftMenu = $('.sidebar');
  var dragNode = $('.sidebar-drag');
  var container = $('.container');

  // init set width
  var SIDEBAR_WIDTH = 300;
  var currentWidth = (sessionStorage && sessionStorage.getItem('SIDEBAR_WIDTH')) || SIDEBAR_WIDTH;
  leftMenu.css({
    width: currentWidth + 'px',
    minWidth: currentWidth + 'px',
  });

  var isResizing = false,
    lastDownX = 0;
  dragNode.on('mousedown', function (e) {
    isResizing = true;
    lastDownX = e.clientX;
  });

  $(document).on('mousemove', function (e) {
    if (!isResizing) {
      return;
    }
    var width = e.clientX - container.offset().left;
    if (width >= min && width <= max) {
      leftMenu.css({
        width: width + 'px',
        minWidth: width + 'px',
      });
      sessionStorage.setItem('SIDEBAR_WIDTH', width);
    }
  }).on('mouseup', function (e) {
    isResizing = false;
  });
}

function handleVideoSection() {
  $(".video-bg").each(function () {
    if ($(this).attr('src') == '') {
      $(this).attr('src', '/images/video-normal.png')
    }
  })

  $('.card').on('click', function () {
    $("#video").attr('src', $(this).attr('data-url'))
  });

  $('.video-close').on('click', function () {
    $('.modal').trigger('click');
  });

  $('.modal').on('click', function () {
    $('#video').trigger("pause");
  });


  $(".card").on('hover', function () {
    if ($(this).find(".video-bg").attr('src') == '/images/video-normal.png') {
      $(this).find(".video-bg").attr('src', "/images/video-hover.png")
    }
  }, function () {
    if ($(this).find(".video-bg").attr('src') == "/images/video-hover.png") {
      $(this).find(".video-bg").attr('src', "/images/video-normal.png")
    }
  });
}

function handleAdmonIcon() {
  $('.admon.note th').addClass('icon-information_fill');
  $('.admon.note [id]').addClass('icon-information_fill');
  $('.admon.attention th').addClass(' icon-warning_fill');
  $('.admon.attention [id]').addClass(' icon-warning_fill');
  $('.admon.warning th').addClass('icon-warning_2_fill');
  $('.admon.warning [id]').addClass('icon-warning_2_fill');
  $('.admon.danger th').addClass('icon-alarm_lamp_fill');
  $('.admon.danger [id]').addClass('icon-alarm_lamp_fill');
}

function handleBlankLink() {
  $('.post-content a[target="_blank"][rel="noopener"]').each(function () {
    if (/^https?:\/\/.+\/[^\/]+\.[a-zA-Z\d]+$/i.test($(this).attr('href'))) {
      $(this).attr('download', '');
    }
  });
}

function handleCheckConsoleLogin() {
  if (location.hostname === 'docsv4.qingcloud.com') {
    $.ajax({
      url: 'https://docsv4.qingcloud.com/cksk/',
      type: 'GET',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        var isLogged = data && data.status === 1;
        var consoleUrl = 'https://console.qingcloud.com/';
        var consoleText = '控制台 →';
        $('.navbar a').each(function () {
          if ($(this).attr('href').startsWith('https://console.qingcloud.com')) {
            if ($(this).attr('href').startsWith('https://console.qingcloud.com/login')) {
              if (isLogged) {
                $(this).attr({
                  href: consoleUrl,
                  target: '_blank',
                }).text(consoleText);
              }
              $(this).removeClass('is-hidden');
            } else if (isLogged) {
              if (!$(this).hasClass('is-hidden')) {
                $(this).addClass('is-hidden');
              }
            } else {
              $(this).removeClass('is-hidden');
            }
          }
        });
      },
    });
  }
}

$(function () {
  // 检测控制台是否登录
  handleCheckConsoleLogin();
  // 处理导航条
  handleNavbar();
  // 处理侧边栏
  $('li.sidebar-item a').each(function (event) {
    if (!$(this).attr('href')) {
      $(this).removeAttr('href');
    }
  });
  $('li.sidebar-item .menu-switch-icon').on('click', function () {
    if ($(this).hasClass('icon-caret_down_fill')) {
      $(this).removeClass('icon-caret_down_fill');
      $(this).parent().removeClass('collapsed');
      $(this).addClass('icon-caret_up_fill');
    } else if ($(this).hasClass('icon-caret_up_fill')){
      $(this).removeClass('icon-caret_up_fill');
      $(this).parent().addClass('collapsed');
      $(this).addClass('icon-caret_down_fill');
    }
  });

  $('li.sidebar-item a').on('click', function (event) {
    if ($(this).attr('href') === window.location.pathname || !$(this).attr('href')) {
      if ($(this).parent().children('.menu-switch-icon').hasClass('icon-caret_down_fill')) {
        $(this).parent().children('.menu-switch-icon').removeClass('icon-caret_down_fill');
        $(this).parent().removeClass('collapsed');
        $(this).parent().children('.menu-switch-icon').addClass('icon-caret_up_fill');
      } else if ($(this).parent().children('.menu-switch-icon').hasClass('icon-caret_up_fill')){
        $(this).parent().children('.menu-switch-icon').removeClass('icon-caret_up_fill');
        $(this).parent().addClass('collapsed');
        $(this).parent().children('.menu-switch-icon').addClass('icon-caret_down_fill');
      }
      if ($(this).attr('href') === window.location.pathname) {
        event.preventDefault();
      }
    }
  });

  // 处理 Dropdown
  toggleDropdown();

  // pdf download
  if ($('.post-tag.export-pdf').length && $('.post-tag.export-pdf').attr('data-url')) {
    var downloadParentUrlText = $('.post-tag.export-pdf').attr('data-url').split('/').filter(Boolean).slice(-1)[0];
    if (downloadParentUrlText && ['news', 'videos', 'video'].includes(downloadParentUrlText.trim().toLowerCase())) {
      $('.post-tag.export-pdf').remove()
    } else {
      $('.post-tag.export-pdf').on('click', function (e) {
        e.stopPropagation();
        var url = $(this).attr('data-url');
        var title = $(`.content-breadcrumb a[data-url="${url}"]`).text().trim();
        downloadFile('/pdf' + url + '/', title + '.pdf')
      });
    }
  }

  $('.section-tag.export-pdf').on('click', function (e) {
    e.stopPropagation();
    var url = $(this).attr('data-url');
    var title = $(this).attr('data-title');
    downloadFile('/pdf' + url + '/', title + '.pdf')
  });

  $('.post-tag.export-word').on('click', function (e) {
    e.stopPropagation();
    var url = $(this).attr('data-url');
    var title = $(`.content-breadcrumb a[data-url="${url}"]`).text().trim();
    downloadFile('/docx' + url + '/', title + '.docx')
  });

  $('.section-tag.export-word').on('click', function (e) {
    e.stopPropagation();
    var url = $(this).attr('data-url');
    var title = $(this).attr('data-title');
    downloadFile('/docx' + url + '/', title + '.docx')
  });

  // 处理 searchPageHome
  handleSearchHomeSidebar();

  // 处理侧边栏搜索
  checkSearchSidebar();

  if (!$('.root.is-search-home').length) {
    // 处理拖动修改侧边栏宽度
    handleSidebarWidth();
  }

  $('a').each(function () {
    var href = $(this).attr('href');
    if (href && !/^(\/\/|https?:\/\/)/.test(href)) {
      var hash = href.split('#')[1] ? ('#' + href.split('#')[1]) : '';
      var url = href.split('#')[0].replace(/\/_index\/$/i, '/');
      var link = url + hash;
      if (link !== href) {
        $(this).attr('href', link);
      }
    }
  });

  if ($('.post-content').length) {
    // 处理 Post 页面，回到顶部
    $('.post-back-to-top').on('click', function () {
      window.scrollTo(0, 0);
    });
    checkBackToTop();
    $(window).on('scroll', checkBackToTop);

    // 处理 copyBtn
    $('.highlight-copy-btn .has-tooltip-top').on('mouseout', function () {
      $(this).attr('data-tooltip', '复制');
    });

    // 处理文章上一页，下一页
    insertNextPrev();

    // 处理 toc 滚动监听
    if ($('#TableOfContents').children().length) {
      checkTOC(2, 3);
      $(window).on('scroll', function () {
        checkTOC(2, 3);
      });
    } else {
      $('.post-menu').each(function () {
        $(this).remove();
      });
    }

    // 处理 video_section
    handleVideoSection();

    // 处理说明 icon
    handleAdmonIcon();

    // 处理外部下载链接
    handleBlankLink();
  }

});
