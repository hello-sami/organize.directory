/* city-page.js
   Client-side behavior for list pages (cities, states, topics).
   Handles:
     1. Thumb notches: fill the notch for the section you're reading
     2. Running head: guide words show the first and last section on screen
     3. Filter input: hide non-matching groups, hide emptied sections,
        dim their notches, show the empty state

   Assumptions:
     - Sections are <section class="group-section" data-section="…" data-title="…">
     - Notch links are <a data-section="…"> inside nav.thumbs
     - Guide words live in the running head's [data-guide] span
     - Filter input is #page-filter; empty state is #empty-state with #empty-query
*/
(function(){
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.group-section'));
  var thumbs = document.querySelector('.thumbs');
  var links = document.querySelectorAll('.thumbs a[data-section]');
  var guide = document.querySelector('.runhead [data-guide]');

  // ─── Thumb notches + guide words ──────────────────────────────────────────
  (function(){
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var linkByKey = {};
    links.forEach(function(a){ linkByKey[a.dataset.section] = a; });

    function isPhone(){ return window.matchMedia('(max-width: 899px)').matches; }

    // Keep the filled notch visible inside its strip/column without moving
    // the page itself.
    function reveal(a){
      if (!thumbs || !a) return;
      if (isPhone()) {
        var left = a.offsetLeft - 20;
        if (a.offsetLeft < thumbs.scrollLeft || a.offsetLeft + a.offsetWidth > thumbs.scrollLeft + thumbs.clientWidth) {
          thumbs.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
        }
      } else {
        var top = a.offsetTop;
        if (top < thumbs.scrollTop || top + a.offsetHeight > thumbs.scrollTop + thumbs.clientHeight) {
          thumbs.scrollTo({ top: Math.max(0, top - 40), behavior: 'auto' });
        }
      }
    }

    var current = null;
    function setActive(key){
      if (key === current) return;
      current = key;
      links.forEach(function(a){
        var on = a.dataset.section === key;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      reveal(linkByKey[key]);
    }

    // Which sections are on screen right now, in page order.
    var onScreen = new Set();
    function update(){
      var visible = sections.filter(function(s){ return onScreen.has(s) && !s.classList.contains('hidden'); });
      if (!visible.length) return;
      setActive(visible[0].dataset.section);
      if (guide) {
        var titled = visible.filter(function(s){ return s.dataset.title; });
        if (titled.length) {
          var first = titled[0].dataset.title;
          var last = titled[titled.length - 1].dataset.title;
          guide.textContent = first === last ? first : first + ' – ' + last;
        }
      }
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      });
      update();
    }, { rootMargin: '-40px 0px 0px 0px', threshold: 0 });
    sections.forEach(function(s){ io.observe(s); });

    links.forEach(function(a){
      a.addEventListener('click', function(){ setActive(a.dataset.section); });
    });
  })();

  // ─── Filter (per-page search) ─────────────────────────────────────────────
  (function(){
    var input = document.getElementById('page-filter');
    var empty = document.getElementById('empty-state');
    var emptyQ = document.getElementById('empty-query');
    if (!input) return;

    // Remember each count's full total the first time we touch it, and put
    // it back when the filter is cleared.
    function setCount(el, n){
      if (!el) return;
      if (el.dataset.total == null) el.dataset.total = el.textContent;
      el.textContent = input.value.trim() ? n : el.dataset.total;
    }

    function apply(){
      var q = input.value.trim().toLowerCase();
      var visibleTotal = 0;
      var sectionCounts = {};

      document.querySelectorAll('#sections-root li[data-name]').forEach(function(li){
        var hay = (li.dataset.name || '') + ' ' + (li.dataset.desc || '');
        var match = !q || hay.indexOf(q) !== -1;
        li.style.display = match ? '' : 'none';
        if (match) {
          visibleTotal++;
          var sec = li.closest('section.group-section');
          if (sec) sectionCounts[sec.dataset.section] = (sectionCounts[sec.dataset.section] || 0) + 1;
        }
      });

      // Counts follow the filter, so a heading never says 14 while showing 1.
      sections.forEach(function(sec){
        var n = sectionCounts[sec.dataset.section] || 0;
        sec.classList.toggle('hidden', !n);
        setCount(sec.querySelector('.hd .k'), n);
      });
      links.forEach(function(a){
        var n = sectionCounts[a.dataset.section] || 0;
        a.classList.toggle('dim', !n);
        setCount(a.querySelector('.k'), n);
      });

      if (empty) {
        empty.hidden = !(visibleTotal === 0 && q);
        if (!empty.hidden && emptyQ) emptyQ.textContent = '"' + input.value.trim() + '"';
      }
    }

    input.addEventListener('input', apply);
  })();
})();
