/* jobs-render.js - mirrors academic-render.js but for the Job Oppertunities section
   It prefers an external JSON `js/jobs-links.json` if available, otherwise uses `jobsData` variable.
*/
(function(){
  function normalizeKey(s){
    return (s||"").toLowerCase().replace(/[^a-z0-9]+/g,'_');
  }

  var jobCategoryToDiv = {
    'full time': 'fulltimeItemsDiv',
    'contract base': 'contractItemsDiv',
    'internship': 'internshipItemsDiv',
    'academic': 'academicJobsItemsDiv',
    'companies': 'companiesItemsDiv'
  };

  // Render category using the same markup/classes as the academic section
  function renderCategoryToContainer(catData, container, lookup) {
    if(!catData || !catData.items) return;
    function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    var html = '<div class="academic-items">';
    (catData.items||[]).forEach(function(item, idx){
      var id = container.id + '-item-' + idx;
      // merge files from lookup if provided
      try {
        var filesFromLookup = (lookup && lookup[normalizeKey(catData.category)]||{})[normalizeKey(item.name||'')] || [];
        if ((!item.files || item.files.length===0) && filesFromLookup && filesFromLookup.length) item.files = filesFromLookup;
      } catch(e){}
      html += '<div class="academic-item">';
      html += '<button class="academic-item-btn" data-target="'+id+'">';
      html += '<span class="academic-toggle-icon">▼</span>';
      html += '<span class="academic-item-name">'+escapeHtml(item.name||'Untitled')+'</span>';
      html += '</button>';
      html += '<div id="'+id+'" class="academic-item-content" style="display:none;">';
      if (item.desc) html += '<div class="job-meta" style="margin-bottom:6px;">'+escapeHtml(item.desc)+'</div>';
      if (item.locations && item.locations.length) html += '<div class="job-meta">Locations: '+escapeHtml(item.locations.join(', '))+'</div>';
      if (item.children && item.children.length) {
        html += '<ul style="margin:0 0 0 18px;padding:6px 0;">';
        item.children.forEach(function(c){ html += '<li>'+escapeHtml(c)+'</li>'; });
        html += '</ul>';
      }
      if (item.files && item.files.length) {
        html += '<div class="academic-files" style="margin-top:8px;"><ul style="margin:0;padding-left:18px;">';
        item.files.forEach(function(f, fidx){
          try {
            var safeUrl = f.url || f.link || '#';
            var title = f.title || f.name || safeUrl;
            var escTitle = escapeHtml(title);
            var escUrl = escapeHtml(safeUrl);
            html += '<li style="margin-bottom:6px;">';
            html += '<span style="font-weight:500;">'+escTitle+'</span> ';
            html += '<a class="academic-file-view-btn" href="#" data-url="'+escUrl+'" style="margin-left:8px;">View</a>';
            var downloadUrl = (function(u){ try{ var m=u.match(/\/d\/([a-zA-Z0-9_-]+)/); if(m&&m[1]) return 'https://drive.google.com/uc?export=download&id='+m[1]; var q=u.match(/[?&]id=([a-zA-Z0-9_-]+)/); if(q&&q[1]) return 'https://drive.google.com/uc?export=download&id='+q[1]; }catch(e){} return u; })(safeUrl);
            html += '<a class="academic-file-download-btn" href="'+escapeHtml(downloadUrl)+'" target="_blank" rel="noopener" style="margin-left:8px;">Download</a>';
            html += '</li>';
          } catch(e) { console.error('jobs-render file render error', e); }
        });
        html += '</ul></div>';
      }
      html += '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
    // mark rendered and recalc
    try { container.dataset.rendered = '1'; } catch(e){}
    setTimeout(recalcJobTabs, 20);

    // Attach toggle handlers
    container.querySelectorAll('.academic-item-btn').forEach(function(btn){ btn.addEventListener('click', function(){ var id = btn.getAttribute('data-target'); var el = document.getElementById(id); if(!el) return; el.style.display = (el.style.display==='none' || el.style.display==='') ? 'block' : 'none'; setTimeout(recalcJobTabs, 10); }); });

    // Attach file view handlers
    try {
      container.querySelectorAll('.academic-file-view-btn').forEach(function(btn){ btn.addEventListener('click', function(e){ e.preventDefault(); var url = btn.getAttribute('data-url'); if(!url) return; var li = btn.closest('li'); if(!li) return; var existing = li.querySelector('.academic-iframe-wrap'); if(existing) { existing.parentNode.removeChild(existing); setTimeout(recalcJobTabs, 10); return; } var wrap = document.createElement('div'); wrap.className = 'academic-iframe-wrap'; wrap.style.marginTop = '8px'; wrap.style.maxWidth = '794px'; wrap.style.marginLeft = 'auto'; wrap.style.marginRight = 'auto'; var iframe = document.createElement('iframe'); iframe.src = url; iframe.style.width = '100%'; iframe.style.height = '600px'; iframe.style.maxWidth = '794px'; iframe.style.border = '1px solid #ddd'; iframe.loading = 'lazy'; wrap.appendChild(iframe); li.appendChild(wrap); setTimeout(recalcJobTabs, 50); }); });
    } catch(e) {}
  }

  function renderFromCategories(categories, lookup){
    if(!categories) return;
    categories.forEach(function(cat){
      var key = (cat.category||cat.name||'').toLowerCase();
      var divId = jobCategoryToDiv[key];
      if(divId){
        var container = document.getElementById(divId);
        if(container){
          renderCategoryToContainer(cat, container, lookup);
        }
      }
    });
  }

  function recalcJobTabs() {
    if (!window.jQuery) return;
    var $tabs = $('#section-jobs .k-tabs');
    if ($tabs.length === 0) return;
    var tabsHeight = $tabs.outerHeight();
    var currentContent = $tabs.find('.k-tabs__content:visible');
    var currentContentHeight = (currentContent.outerHeight() || 0);
    try { var scrollH = currentContent.prop('scrollHeight') || 0; if (scrollH > currentContentHeight) currentContentHeight = scrollH; } catch(e) {}
    var margin = Math.max(currentContentHeight, 150);
    $tabs.css({ 'margin-bottom': margin + 'px' });
    currentContent.css({ 'top': tabsHeight });
  }

  function initJobs(){
    // Try to fetch large JSON first
    var jsonPath = 'js/jobs-links.json';
    fetch(jsonPath).then(function(resp){
      if(!resp.ok) throw new Error('no json');
      return resp.json();
    }).then(function(json){
      if(json && json.constellation){
        // build lookup from json
        var jobsLinksLookup = {};
        (json.constellation||[]).forEach(function(ac){
          var aKey = normalizeKey(ac.category);
          jobsLinksLookup[aKey] = jobsLinksLookup[aKey] || {};
          (ac.items||[]).forEach(function(ai){ jobsLinksLookup[aKey][normalizeKey(ai.name||'')] = ai.files || []; });
        });
        renderFromCategories(json.constellation, jobsLinksLookup);
        window._jobsCategories = json.constellation;
        window._jobsLinksLookup = jobsLinksLookup;
      }
    }).catch(function(){
      // fallback to jobsData variable if present
      if(window.jobsData && window.jobsData.constellation){
        renderFromCategories(window.jobsData.constellation);
        window._jobsCategories = window.jobsData.constellation;
      }
    });

    // attach minimal tab-change handler to render active tab lazily
    var tabInputs = document.querySelectorAll('#section-jobs .k-tabs input[type=radio]');
    tabInputs.forEach(function(inp){
      inp.addEventListener('change', function(){
        // when switched, ensure its container is populated (in case external JSON loaded later)
        var val = inp.value;
        var mapping = {
          ktabJ1: 'Full Time',
          ktabJ2: 'Contract Base',
          ktabJ3: 'Internship',
          ktabJ4: 'Academic',
          ktabJ5: 'Companies'
        };
        var catName = mapping[val];
        if(window._jobsCategories){
          var cat = window._jobsCategories.find(function(c){ return (c.category||c.name||'')===catName; });
          if(cat){
            var divId = jobCategoryToDiv[(catName||'').toLowerCase()];
            var container = document.getElementById(divId);
            if(container && (container.children.length===0 || container.dataset.rendered!=='1')){
              renderCategoryToContainer(cat, container, window._jobsLinksLookup);
              setTimeout(recalcJobTabs, 50);
            } else {
              setTimeout(recalcJobTabs, 50);
            }
          }
        }
      });
    });

    // initial render: populate first tab
    var first = document.getElementById('fulltimeItemsDiv');
    if(first){
      // if jobsData already loaded synchronously
      if(window.jobsData && jobsData.constellation){
        var cat = jobsData.constellation.find(function(c){ return (c.category||c.name||'')==='Full Time'; });
        if(cat) {
          renderCategoryToContainer(cat, first, window._jobsLinksLookup);
          try { first.dataset.rendered = '1'; } catch(e){}
        }
      }
    }

    // Recalc when clicking inside jobs tabs nav (mirrors academic behavior)
    var nav = document.querySelector('#section-jobs .k-tabs');
    if(nav){ nav.addEventListener('click', function(){ setTimeout(recalcJobTabs, 20); }); }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initJobs();
    // small delay to allow layout scripts to run
    setTimeout(recalcJobTabs, 500);
  });
})();
