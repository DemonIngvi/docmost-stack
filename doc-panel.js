// Боковая панель Docmost рядом с чатом. Код LibreChat не меняется: скрипт добавляет прокси.
(function () {
  var DOCS = 'http://localhost:3101';
  var WIDTH = '48vw';
  var panel, frame, button, opened = false;

  function layout() {
    var root = document.getElementById('root');
    if (root) root.style.width = opened ? 'calc(100% - ' + WIDTH + ')' : '';
    panel.style.display = opened ? 'block' : 'none';
    button.textContent = opened ? 'Закрыть документацию' : 'Документация';
  }

  function show(url) {
    if (url) frame.src = url;
    else if (!frame.src) frame.src = DOCS;
    opened = true;
    layout();
  }

  function build() {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:' + WIDTH + ';display:none;z-index:9998;border-left:1px solid #c5cae9;background:#fff';
    frame = document.createElement('iframe');
    frame.title = 'Документация';
    frame.style.cssText = 'width:100%;height:100%;border:0';
    panel.appendChild(frame);
    button = document.createElement('button');
    button.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;padding:8px 14px;border:0;border-radius:18px;background:#3f51b5;color:#fff;font:600 13px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)';
    button.onclick = function () { if (opened) { opened = false; layout(); } else { show(); } };
    document.body.appendChild(panel);
    document.body.appendChild(button);
    layout();
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'doc-guide-open' && String(data.url).indexOf(DOCS) === 0) show(data.url);
  });

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
