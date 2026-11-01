// Боковая панель Docmost рядом с чатом. Код LibreChat не меняется: скрипт добавляет прокси.
// Режимы: закрыта, половина экрана, весь экран с чатом в окне, весь экран без чата.
(function () {
  var DOCS = 'http://localhost:3101';
  var HALF = '48vw';
  var MODES = { closed: 'Документация', half: 'Половина экрана', window: 'Чат в окне', full: 'Только документация' };
  var mode = 'closed', panel, frame, bar;

  function chat(style) {
    var root = document.getElementById('root');
    if (!root) return;
    root.style.cssText = style;
  }

  function apply() {
    var frameStyle = 'position:fixed;top:0;bottom:0;right:0;z-index:9998;border-left:1px solid #c5cae9;background:#fff;';
    panel.style.cssText = frameStyle + (mode === 'closed' ? 'display:none' : 'display:block;width:' + (mode === 'half' ? HALF : '100vw'));
    if (mode === 'half') chat('width:calc(100% - ' + HALF + ')');
    else if (mode === 'window') chat('position:fixed;right:16px;bottom:64px;width:420px;height:560px;z-index:9999;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.35);background:#fff');
    else if (mode === 'full') chat('display:none');
    else chat('');
    Array.prototype.forEach.call(bar.children, function (item) {
      var active = item.dataset.mode === mode;
      item.style.display = mode === 'closed' && item.dataset.mode !== 'half' ? 'none' : 'inline-block';
      item.style.opacity = active ? '1' : '.75';
      item.textContent = mode === 'closed' ? MODES.closed : (item.dataset.mode === 'closed' ? 'Закрыть' : MODES[item.dataset.mode]);
    });
  }

  function open(url, next) {
    if (url) frame.src = url;
    else if (!frame.src) frame.src = DOCS;
    mode = next || (mode === 'closed' ? 'half' : mode);
    apply();
  }

  function build() {
    panel = document.createElement('div');
    frame = document.createElement('iframe');
    frame.title = 'Документация';
    frame.style.cssText = 'width:100%;height:100%;border:0';
    panel.appendChild(frame);
    bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:10000;display:flex;gap:6px';
    ['half', 'window', 'full', 'closed'].forEach(function (key) {
      var item = document.createElement('button');
      item.dataset.mode = key;
      item.style.cssText = 'padding:8px 12px;border:0;border-radius:18px;background:#3f51b5;color:#fff;font:600 13px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)';
      item.onclick = function () { if (key === 'closed') { mode = 'closed'; apply(); } else { open(null, key); } };
      bar.appendChild(item);
    });
    document.body.appendChild(panel);
    document.body.appendChild(bar);
    apply();
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'doc-guide-open' && String(data.url).indexOf(DOCS) === 0) open(data.url);
  });

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
