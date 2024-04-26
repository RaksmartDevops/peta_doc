var POST_LAST_SEARCH = '';
var SEARCH_CURRENT_PAGE = 1;
var SEARCH_HASH = window.location.hash.split('#').pop();

function isSearchPage() {
  return location.pathname.split('/').filter(Boolean).length === 2 && location.pathname.endsWith('\/search\/');
}

function initSearchDom($searchDomMap) {
  if (isSearchPage()) {
    var SEARCH_QUERY = getUrlQuery('q');
    if (SEARCH_QUERY || SEARCH_QUERY === '') {
      POST_LAST_SEARCH = SEARCH_QUERY;
      $searchDomMap.$postSearchHeader.addClass('center');
      $searchDomMap.$postSearchResult.show();
      $searchDomMap.$postInput.val(SEARCH_QUERY);
      $searchDomMap.$navbarInput.val(SEARCH_QUERY);
      $('.search-result .search-result-none').hide();
      $searchDomMap.$searchLoading.show();
      $searchDomMap.$postInput.prop('disabled', true);
    } else {
      $searchDomMap.$postSearchHeader.removeClass('center');
      $('.post-search-result-wrapper').hide();
      $searchDomMap.$postInput.prop('disabled', false);
    }
  }
}

function searchFromSearchData(query, $searchDomMap) {
  return function (searchData) {
    if (isSearchPage()) {
      insertResultToDom(query, $searchDomMap, searchData);
      $searchDomMap.$postInput.on('keypress', function (e) {
        if (e.which === 13) {
          e.preventDefault();
          $searchDomMap.$searchLoading.show();
          $searchDomMap.$postInput.prop('disabled', true);
          insertResultToDom($(this).val().trim(), $searchDomMap, searchData);
        }
      });
    } else {
      if (!$('.root.is-embed').length) {
        $searchDomMap.$navbarInput.on('input', debounce(function () {
          var keywords = $(this).val();
          if (keywords) {
            $('.navbar-search-result').show();
            $searchDomMap.$searchLoading.show();
            insertResultToDom($(this).val().trim(), $searchDomMap, searchData);
          } else {
            $('.navbar-search-result').hide();
          }
        }, 300));
      }
    }

    if ($searchDomMap.$searchSuggestionsInput.length) {
      function handleSearchSuggestions() {
        var keywords = $(this).val();
        if (keywords) {
          var result = getSearchQueryResultFromTitle(
              keywords,
              searchData.queryMap,
              searchData.keyMap,
          );
          $('.search-suggestions').empty();
          if (result.length) {
            result.slice(0, 12).forEach(function (keyword) {
              $('.search-suggestions').append(
                '<a class="search-suggestions-item" href="'+ keyword.href +'">' + keyword.title + (keyword.type ? ('（' + keyword.type + '）') : '') + '</a>'
              );
            });
            $('.search-suggestions').show();
            $('.search-suggestions')
              .unmark()
              .mark(parseKeywords(keywords));
          } else {
            $('.search-suggestions').hide();
          }
        } else {
          $('.search-suggestions').hide();
        }
      }
      $searchDomMap.$searchSuggestionsInput.on('focus', handleSearchSuggestions);
      $searchDomMap.$searchSuggestionsInput.on('blur', function (e) {
        setTimeout(function () {
          $('.search-suggestions').hide();
        }, 100);
      });
      $searchDomMap.$searchSuggestionsInput.on('input', debounce(handleSearchSuggestions, 300));
      $searchDomMap.$postInput.on('input', debounce(handleSearchSuggestions, 300));
    }
  }
}

function getSearchData(callback) {
  $.get("/js/search/" + $('.navbar-nav-item .project-version').text().trim() + "/lunr.json?2d5afa44e8297eea8603f15eec8f36e0", callback);
}

function insertResultToDom(query, $searchDomMap, searchData) {
  var limit = 10;
  if (!isSearchPage()) {
    limit = 1000;
  }
  var current = SEARCH_CURRENT_PAGE;
  if (POST_LAST_SEARCH !== query) {
    current = 1;
  }


  POST_LAST_SEARCH = query;
  var offset = (current - 1) * limit;
  var result = getSearchQueryResult(
      query,
      searchData.queryMap,
      searchData.keyMap,
  );
  $searchDomMap.$searchLoading.hide();
  $searchDomMap.$postInput.prop('disabled', false);
  $searchDomMap.$searchResultContent.empty();
  var resultLength = result.length;
  if (resultLength) {
    $('.search-result .search-result-none').hide();
    var domResult = result.slice(offset, offset + limit).map(function (item) {
      return $.extend(item, {
        breadcrumb: getHrefBreadcrumb(item.href, searchData.keyMap),
        content: getSearchContent(query, item.content),
      });
    });
    $searchDomMap.$searchTotalTmpl
      .tmpl({ count: resultLength })
      .appendTo($searchDomMap.$searchResultContent);
    if (domResult.length) {
      domResult.forEach(function (value) {
        const itemHtml = $searchDomMap.$searchResultTmpl.tmpl(value);
        const breadcrumbHtml = $('#search-breadcrumb-template').tmpl(value.breadcrumb).each(function (index) {
          if (index === 0) {
            $(this).find('a').attr({
              class: 'no-link',
              href: null,
            });
          }
          if (!$(this).find('a').attr('href')) {
            $(this).find('a').attr({
              class: 'no-link',
              href: null,
            }).on('click', function (event) {
              event.preventDefault();
            });
          }
        });
        breadcrumbHtml.appendTo(itemHtml.find('.content-breadcrumb'));
        itemHtml.appendTo($searchDomMap.$searchResultContent);
      })
    }

    renderPagination(query, searchData, resultLength, $searchDomMap, limit, current);
    $searchDomMap.$searchResultContent
      .unmark()
      .mark(parseKeywords(query), {
        exclude: [
          'h1',
          '.search-result-pagination *',
          '.content-breadcrumb *',
        ],
      });
  } else  {
    $('.search-result .search-result-none').show();
    $searchDomMap.$postInput.focus();
  }
}

function renderPagination(query, searchData, resultLength, $searchDomMap, limit, current) {
  if (resultLength > limit && isSearchPage()) {
      $searchDomMap.$searchPageTmpl
        .tmpl()
        .appendTo($searchDomMap.$searchResultContent);
      var total = Math.ceil(resultLength / limit);

      if (current === 1) {
        $('.search-result-pagination .pagination-previous').addClass('is-disabled');
      } else if (current === total) {
        $('.search-result-pagination .pagination-next').addClass('is-disabled');
      } else {
        $('.search-result-pagination .pagination-previous').removeClass('is-disabled');
        $('.search-result-pagination .pagination-next').removeClass('is-disabled');
      }
      var pages = [];
      var LIMIT_PAGE = 7;
      if (total <= LIMIT_PAGE) {
        for (var i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else if (current >= total - LIMIT_PAGE + 1) {
        for (var i = total - LIMIT_PAGE + 1; i <= total; i++) {
          pages.push(i);
        }
      } else if (current <= LIMIT_PAGE) {
        for (var i = 1; i <= LIMIT_PAGE; i++) {
          pages.push(i);
        }
      } else{
        pages.push(current - 2);
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push(current + 2);
      }
      pages = pages
      .sort(function (a, b) { return a - b; })
      .filter(function (v, index, self) {
        return v > 0
          && v <= total
          && self.indexOf(v) === index; // 去重, 保证范围在 1 ~ total 之间
      });
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        if (i > 1 && pages[i] - pages[i - 1] > 1) {
          // $('.search-result-pagination .pagination-list').append($('<li><span class="pagination-ellipsis">&hellip;</span></li>'));
        }
        if (+page === +current) {
          $('.search-result-pagination .pagination-list')
            .append('<li><a class="pagination-link is-current" data-page="' + page + '">'+ page +'</a></li>');
        } else {
          $('.search-result-pagination .pagination-list')
            .append('<li><a class="pagination-link" data-page="' + page + '">'+ page +'</a></li>');
        }
      }
      $('.search-result-pagination .pagination-link').on('click', function (e) {
        handlePageChange(+$(this).text(), query, $searchDomMap, searchData);
      });
      $('.search-result-pagination .pagination-previous:not(.is-disabled)').on('click', function (e) {
        var prevPage = +$('.search-result-pagination .pagination-link.is-current').attr('data-page') - 1;
        handlePageChange(+prevPage, query, $searchDomMap, searchData);
      });
      $('.search-result-pagination .pagination-next:not(.is-disabled)').on('click', function (e) {
        var nextPage = +$('.search-result-pagination .pagination-link.is-current').attr('data-page') + 1;
        handlePageChange(+nextPage, query, $searchDomMap, searchData);
      });
    }
}
function handlePageChange(page, query, $searchDomMap, searchData) {
  window.scrollTo(0,0);
  $searchDomMap.$searchLoading.show();
  $searchDomMap.$postInput.prop('disabled', true);
  SEARCH_CURRENT_PAGE = page;
  insertResultToDom(query, $searchDomMap, searchData);
}

function getUrlQuery(key) {
  var vars = getUrlVars();
  if (key) {
    if (vars[key] === undefined) {
      return vars[key];
    }
    return (decodeURI(vars[key] || '').replace(/\+/g, ' ')).trim();
  }
  return vars;
}

function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

function getSearchContent(query, content) {
  var SPLIT_COUNT = 40;
  var TOTAL_COUNT = 200;
  if (!isSearchPage()) {
    SPLIT_COUNT = 20;
    TOTAL_COUNT = 80;
  }
  var endIndex = content.length - 1;
  if (endIndex < TOTAL_COUNT) {
    return content;
  }
  var keywords = parseKeywords(query);
  var pattern = new RegExp(
    '(' +
    keywords.join('|') +
    ')',
    'im');
  var searchIndex = content.search(pattern);
  if (searchIndex === -1 || searchIndex < SPLIT_COUNT) {
    return content.slice(0, TOTAL_COUNT) + '...';
  }
  var searchContent = content.slice(searchIndex - SPLIT_COUNT, searchIndex);
  var reverseIndex = searchContent.split('').reverse().join('').search(/[，。\},”#]/);
  if (reverseIndex === -1) {
    return content.slice(searchIndex - SPLIT_COUNT, searchIndex - SPLIT_COUNT + TOTAL_COUNT) + '...';
  }
  return content.slice(searchIndex - reverseIndex, searchIndex - reverseIndex + TOTAL_COUNT) + '...';
}

function parseKeywords(keywords) {
  return keywords
    .split(" ")
    .filter(function (keyword) {
      return !!keyword;
    })
    .map(function (keyword) {
      return keyword.toUpperCase();
    });
}

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

function getHrefBreadcrumb(href, keyMap) {
  var breadcrumb = [{ title: '来自：' }];
  if (href) {
    href.split('/').filter(Boolean).reduce(function (previousValue, currentValue) {
      var hrefLink = previousValue + '/' + currentValue;
      var item = keyMap[hrefLink + '/'];
      if (item) {
        breadcrumb.push({
          title: item.title,
          href: (item.isSection || item.content) ? item.href : (item.firstChild ? item.firstChild.href : ''),
        });
      }
      return hrefLink;
    }, '');
  }
  return breadcrumb;
}

function filter(keywords, obj, fields) {
  var keywordArray = parseKeywords(keywords);
  var containKeywords = keywordArray.filter(function (keyword) {
    var containFields = fields.filter(function (field) {
      if (!obj.hasOwnProperty(field)) return false;
      if (obj[field].toUpperCase().indexOf(keyword.toUpperCase()) > -1) return true;
    });
    if (containFields.length > 0) return true;
    return false;
  });
  return containKeywords.length === keywordArray.length;
}

function filterFactory(keywords, fields) {
  var _fields = fields || ["title", "content"];
  return {
    POST: function (obj) {
      return filter(keywords, obj, _fields);
    },
    PAGE: function (obj) {
      return filter(keywords, obj, _fields);
    },
  };
}

function weight(keywords, obj, fields, weights) {
  var value = 0;
  parseKeywords(keywords).forEach(function (keyword) {
    var pattern = new RegExp(keyword, "img"); // Global, Multi-line, Case-insensitive
    fields.forEach(function (field, index) {
      if (obj.hasOwnProperty(field)) {
        var matches = obj[field].match(pattern);
        value += matches ? matches.length * weights[index] : 0;
      }
    });
  });
  return value;
}

function weightFactory(keywords, fields) {
  var _fields = fields || ["title", "content"];
  return {
    POST: function (obj) {
      return weight(keywords, obj, _fields, [3, 1]);
    },
    PAGE: function (obj) {
      return weight(keywords, obj, _fields, [3, 1]);
    },
  };
}

function getSearchQueryResultFromTitle(query, queryMap, keyMap) {
  if (!query.trim()) {
    return [];
  }
  if (queryMap[`$SEARCH_TITLE_${query}`]) {
    return queryMap[`$SEARCH_TITLE_${query}`];
  }
  var WEIGHTS = weightFactory(query, ['title']);
  var FILTERS = filterFactory(query, ['title']);
  var searchData = [];
  Object.values(keyMap).forEach(function (item) {
    if (item.type) {
      searchData.push(item);
    } else if (item.studyTitle) {
      searchData.push({
        title: item.studyTitle,
        href: item.href,
      });
      searchData.push(item);
    } else if (item.content && item.content.trim()) {
      searchData.push(item);
    }
  });
  var result = searchData
    .filter(FILTERS.POST)
    .sort(function (a, b) {
      return WEIGHTS.POST(b) - WEIGHTS.POST(a);
    });
  queryMap[`$SEARCH_TITLE_${query}`] = result;
  return result;
}

function getSearchQueryResult(query, queryMap, keyMap) {
  if (!query.trim()) {
    return [];
  }
  // query is matched
  if (queryMap[query]) {
    var result = [];
    result = queryMap[query].map(function (item) {
      if (typeof item === 'string') {
        return keyMap[item];
      }
      return item;
    });
    return result;
  }
  // query is not matched
  var WEIGHTS = weightFactory(query);
  var FILTERS = filterFactory(query);
  var searchData = Object.values(keyMap).filter(function (item) {
    return !!item.content?.trim();
  });
  var result = searchData
    .filter(FILTERS.POST)
    .sort(function (a, b) {
      return WEIGHTS.POST(b) - WEIGHTS.POST(a);
    });
  queryMap[query] = result;
  return result;
}

$(function () {
  var SEARCH_QUERY = getUrlQuery('q') || '';
  var $searchDomMap = {
    $postSearchHeader: $('.post-search-header'),
    $postSearchResult: $('.post-search-result'),
    $searchResultContent: $('.search-result-content'),
    $searchSuggestions: $('.search-suggestions'),
    $postInput: $('.post-search .input'),
    $searchSuggestionsInput: $('.search.has-suggestions .input'),
    $navbarInput: $('.navbar-search .input'),
    $searchInput: $('.search .input'),
    $searchLoading: $('.search-result-loading'),
    $searchTotalTmpl: $('#search-result-total-template'),
    $searchResultTmpl: $('#search-result-item-template'),
    $searchPageTmpl: $('#search-result-page-template'),
  }

  $searchDomMap.$searchInput.on('input focus mouseenter', function () {
    if ($(this).val() && ($(this).is(':focus') || $(this).is(':hover'))) {
      $(this).parent().parent().children('.clear-search-input').show();
    } else {
      $('.clear-search-input').hide();
    }
  });
  $('.clear-search-input').on('click', function () {
    $('.clear-search-input').hide();
    $searchDomMap.$searchInput
      .val('')
      .trigger('input')
      .trigger('focus');
  });

  initSearchDom($searchDomMap);
  getSearchData(searchFromSearchData(SEARCH_QUERY, $searchDomMap));
});
