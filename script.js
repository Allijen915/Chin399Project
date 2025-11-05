var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  })};
  /* ================================
   (Your existing site JS could go here)
   If you already have functions/handlers,
   you can keep them above or below this block.
   ================================ */

/* ================================
   YouTube Video Sources Loader
   - Renders videos from videos.json
   - Works on both the homepage and /categories/ pages
   ================================ */
(function () {
  'use strict';

  // Run after DOM is parsed to ensure elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoSources);
  } else {
    initVideoSources();
  }

  function initVideoSources() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return; // No video area on this page — do nothing

    // Choose correct path whether we're on / or /categories/*
    const inCategories = window.location.pathname.indexOf('/contentpages/') !== -1;
    const jsonPath = inCategories ? '../videos.json' : './videos.json';

    fetch(jsonPath, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load videos.json: ' + res.status);
        return res.json();
      })
      .then(videos => {
        // Basic validation
        if (!Array.isArray(videos)) {
          throw new Error('videos.json is not an array');
        }

        // Render cards
        grid.innerHTML = videos.map(renderVideoCard).join('');
      })
      .catch(err => {
        console.error(err);
        grid.innerHTML = '<p>Could not load video sources.</p>';
      });
  }

  function renderVideoCard(v) {
    const id = extractYouTubeId(v && v.url);
    const title = escapeHtml((v && v.title) || 'Untitled');
    const credit = escapeHtml((v && v.credit) || '');
    const notes = escapeHtml((v && v.notes) || '');
    const src = id ? ('https://www.youtube.com/embed/' + id) : '';

    return (
      '<article class="video-card">' +
        (src
          ? '<iframe src="' + src + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="' + title + '"></iframe>'
          : '<p>Invalid YouTube URL</p>') +
        '<h3>' + title + '</h3>' +
        (credit ? '<p><strong>Credit:</strong> ' + credit + '</p>' : '') +
        (notes ? '<p>' + notes + '</p>' : '') +
        (v && v.url
          ? '<p><a href="' + escapeAttribute(v.url) + '" target="_blank" rel="noopener">Watch on YouTube</a></p>'
          : '') +
      '</article>'
    );
  }

  // Supports https://www.youtube.com/watch?v=ID and https://youtu.be/ID
  function extractYouTubeId(rawUrl) {
    if (!rawUrl) return '';
    try {
      const u = new URL(rawUrl);
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        // /VIDEO_ID
        return u.pathname.slice(1);
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        // watch?v=VIDEO_ID or share URLs
        const v = u.searchParams.get('v');
        if (v) return v;
        // Shorts or embed or other formats fallback: /shorts/ID, /embed/ID
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length >= 2 && (parts[0] === 'shorts' || parts[0] === 'embed')) {
          return parts[1];
        }
      }
      return '';
    } catch {
      return '';
    }
  }

  // Minimal HTML escaping for text nodes
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[s];
    });
  }

  // Escape attribute values (href, etc.)
  function escapeAttribute(str) {
    // Also escape backticks to avoid template literal edge cases
    return String(str).replace(/[&<>"'`]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      })[s];
    });
  }
})();
