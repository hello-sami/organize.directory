/* Theme toggle
   Works with the pre-paint init script that sets html.light or html.dark.
   Persists choice in localStorage under key "theme".
   If the user hasn't set an explicit preference, follows system changes. */
(function(){
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  if(!toggle) return;

  function sync(){
    var isDark = root.classList.contains('dark');
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', String(isDark));
  }
  sync();

  toggle.addEventListener('click', function(){
    var isDark = root.classList.toggle('dark');
    root.classList.toggle('light', !isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e){}
    sync();
  });

  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if(mq && mq.addEventListener){
    mq.addEventListener('change', function(e){
      try { if(localStorage.getItem('theme')) return; } catch(_){}
      root.classList.toggle('dark', e.matches);
      root.classList.toggle('light', !e.matches);
      sync();
    });
  }
})();
