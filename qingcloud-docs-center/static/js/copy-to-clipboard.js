(function() {
    'use strict';

    if(!document.queryCommandSupported('copy')) {
      return;
    }


    function flashCopyMessage(el, msg) {
      el.firstChild.setAttribute('data-tooltip', msg);
    }

    function selectText(node) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
      return selection;
    }

    function addCopyButton(containerEl) {
      var copyNode = document.createElement("span");
      copyNode.className = "icon-copy_fill";

      var tooltipNode = document.createElement('div');
      ['has-tooltip-top', 'has-tooltip-arrow'].forEach(function (className) {
        tooltipNode.classList.add(className);
      });
      tooltipNode.setAttribute('data-tooltip', '复制');
      tooltipNode.appendChild(copyNode);

      var copyBtn = document.createElement("div");
      copyBtn.className = "highlight-copy-btn";
      copyBtn.appendChild(tooltipNode);

      copyBtn.addEventListener('click', function() {

        try {

          var selection = selectText(containerEl);
          document.execCommand('copy');
          selection.removeAllRanges();

          flashCopyMessage(copyBtn, '复制成功');
        } catch(e) {
          console && console.log(e);
          flashCopyMessage(copyBtn, '复制失败！');
        }
      });
      containerEl.parentNode.append(copyBtn);
      containerEl.parentNode.parentNode.style.position = 'relative';
    }

    var normalCodeBlock = $("pre code");
    if (normalCodeBlock) {
      Array.prototype.forEach.call(normalCodeBlock, addCopyButton);
    }
  })();

