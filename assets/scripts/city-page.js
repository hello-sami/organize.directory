/* city-page.js
   Client-side behavior for list-style pages (cities, topics, states with sections).
   Handles:
     1. TOC active-section highlighting via IntersectionObserver
     2. Mobile disclosure dropdown for the TOC (<900px)
     3. Filter input: hide non-matching groups, dim empty sections, show empty state

   Assumptions:
     - Sections are <section class="group-section" data-section="..."> with IDs
     - TOC links are <a data-section="..."> inside nav.toc
     - Filter input is #page-filter
     - Empty-state message is #empty-state with #empty-query span inside
*/
(function(){
  // ─── TOC active-section + mobile disclosure ─────────────────────────────
  (function(){
    var sections = document.querySelectorAll('section.group-section');
    var toc = document.querySelector('.toc');
    var toggle = document.querySelector('.toc-toggle');
    var currentName = document.querySelector('.toc-toggle .current-name');
    var links = document.querySelectorAll('.toc a[data-section]');
    if (!sections.length || !toc || !('IntersectionObserver' in window)) return;

    var linkByKey = {};
    links.forEach(function(a){ linkByKey[a.dataset.section] = a; });

    function isMobile(){
      return window.matchMedia('(max-width: 899px)').matches;
    }

    function setActive(key){
      links.forEach(function(a){ a.classList.toggle('active', a.dataset.section === key); });
      var active = linkByKey[key];
      if (active) {
        if (currentName) {
          var label = active.querySelector('.label');
          currentName.textContent = label ? label.textContent : active.textContent.trim();
        }
        // Don't scroll the hidden mobile panel; on desktop keep active item in view.
        if (!isMobile() && active.scrollIntoView) {
          active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    }

    function openPanel(){
      toc.classList.add('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
    function closePanel(){
      toc.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    if (toggle) {
      toggle.addEventListener('click', function(){
        if (toc.classList.contains('open')) {
          closePanel();
        } else {
          openPanel();
          // Scroll active item into view within the panel once it's visible
          requestAnimationFrame(function(){
            var active = document.querySelector('.toc a.active');
            if (active && active.scrollIntoView) {
              active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
          });
        }
      });

      // Outside-tap closes
      document.addEventListener('click', function(e){
        if (!toc.classList.contains('open')) return;
        if (toc.contains(e.target)) return;
        closePanel();
      });

      // Escape closes, returns focus to toggle
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && toc.classList.contains('open')) {
          closePanel();
          toggle.focus();
        }
      });

      // If viewport grows past mobile breakpoint, make sure mobile state is cleared
      var mq = window.matchMedia('(min-width: 900px)');
      if (mq.addEventListener) {
        mq.addEventListener('change', function(){ closePanel(); });
      }
    }

    // IntersectionObserver → track which section is currently "active"
    var currentActive = null;
    var io = new IntersectionObserver(function(entries){
      var visible = entries
        .filter(function(e){ return e.isIntersecting; })
        .sort(function(a, b){ return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible.length) {
        var key = visible[0].target.dataset.section;
        if (key !== currentActive) {
          currentActive = key;
          setActive(key);
        }
      }
    }, {
      rootMargin: '-80px 0px -65% 0px',
      threshold: 0,
    });
    sections.forEach(function(s){ io.observe(s); });
    if (sections[0]) setActive(sections[0].dataset.section);

    // Clicking a TOC link: mark active immediately, close panel on mobile
    links.forEach(function(a){
      a.addEventListener('click', function(){
        setActive(a.dataset.section);
        if (isMobile()) closePanel();
      });
    });
  })();

  // ─── Filter (per-page search) ───────────────────────────────────────────
  (function(){
    var input = document.getElementById('page-filter');
    var empty = document.getElementById('empty-state');
    var emptyQ = document.getElementById('empty-query');
    var tocLinks = document.querySelectorAll('.toc a[data-section]');
    if (!input) return;

    function apply(){
      var q = input.value.trim().toLowerCase();
      var visibleTotal = 0;
      var sectionCounts = {};

      document.querySelectorAll('.groups li').forEach(function(li){
        var hay = ((li.dataset.name || '') + ' ' + (li.dataset.desc || '')).toLowerCase();
        var match = !q || hay.indexOf(q) !== -1;
        li.style.display = match ? '' : 'none';
        if (match) {
          visibleTotal++;
          var sec = li.closest('section.group-section');
          if (sec) {
            var key = sec.dataset.section;
            sectionCounts[key] = (sectionCounts[key] || 0) + 1;
          }
        }
      });

      // Hide sections with no matches, dim their TOC link
      document.querySelectorAll('section.group-section').forEach(function(sec){
        var key = sec.dataset.section;
        var has = !!sectionCounts[key];
        sec.classList.toggle('hidden', !has);
      });
      tocLinks.forEach(function(a){
        var key = a.dataset.section;
        a.classList.toggle('dim', !sectionCounts[key]);
      });

      if (empty) {
        if (visibleTotal === 0 && q) {
          empty.hidden = false;
          if (emptyQ) emptyQ.textContent = '"' + input.value.trim() + '"';
        } else {
          empty.hidden = true;
        }
      }
    }

    input.addEventListener('input', apply);
  })();
})();
