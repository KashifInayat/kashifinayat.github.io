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
              // slug helper (use provided slug if present)
              function slugifyStr(s){ return (s||'').toString().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
              var slug = (f && f.slug) ? f.slug : slugifyStr((f && (f.title||f.name)) || (item.name||'') + '-' + fidx);
              var jobId = 'job-' + slug;
              // If job-style fields present, render a structured job card
              if (f && (f.company || f.apply || f.city || f.rsu)) {
                var jobTitle = escapeHtml(f.title || f.name || 'Job');
                var jobCompany = escapeHtml(f.company || '');
                var jobCity = escapeHtml(f.city || '');
                var jobRsu = escapeHtml(f.rsu || '');
                var jobSalary = escapeHtml(f.salary || '');
                var jobApply = escapeHtml(f.apply || f.url || f.link || '#');
                html += '<li style="margin-bottom:10px;">';
                html += '<div id="'+jobId+'" class="job-card" style="padding:10px;border:1px solid #e6e6e6;border-radius:6px;background:#fff;">';
                html += '<div style="font-weight:700;margin-bottom:6px;">'+jobTitle+' <a class="job-permalink" href="#'+jobId+'" style="font-size:12px;margin-left:8px;color:#666;text-decoration:none;">🔗</a></div>';
                html += '<div style="font-size:90%;color:#333;margin-bottom:4px;">Company/University: <strong>'+jobCompany+'</strong></div>';
                if (jobCity) html += '<div style="font-size:90%;color:#333;margin-bottom:4px;">City/Country: '+jobCity+'</div>';
                if (jobRsu) html += '<div style="font-size:90%;color:#333;margin-bottom:4px;">RSU: '+jobRsu+'</div>';
                if (jobSalary) html += '<div style="font-size:90%;color:#333;margin-bottom:8px;">Salary: '+jobSalary+'</div>';
                html += '<a class="job-apply-link" href="'+jobApply+'" target="_blank" rel="noopener" style="display:inline-block;padding:6px 10px;background:#2b8bd6;color:#fff;border-radius:4px;text-decoration:none;">Apply</a>';
                html += '</div>';
                html += '</li>';
              } else {
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
              }
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

  // If a hash points to a job, ensure it's rendered and expanded
  function openJobFromHash(){
    try{
      var h = (location.hash||'').replace(/^#/, '');
      if(!h) return;
      if(h.indexOf('job-')!==0) return;
      // ensure all categories rendered (safe for modest data sizes)
      if(window._jobsCategories){ renderFromCategories(window._jobsCategories, window._jobsLinksLookup); }
      var el = document.getElementById(h);
      if(!el) return;
      // expand parent academic-item-content
      var content = el.closest('.academic-item-content');
      if(content){ content.style.display = 'block'; }
      // scroll into view
      setTimeout(function(){ el.scrollIntoView({behavior:'smooth', block:'center'}); setTimeout(recalcJobTabs, 50); }, 200);
    }catch(e){ console.warn('openJobFromHash error', e); }
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
        // Ensure permalink handling after async JSON render
        setTimeout(openJobFromHash, 120);
      }
    }).catch(function(){
      // fallback to jobsData variable if present
      if(window.jobsData && window.jobsData.constellation){
        renderFromCategories(window.jobsData.constellation);
        window._jobsCategories = window.jobsData.constellation;
        // Ensure permalink handling after synchronous fallback render
        setTimeout(openJobFromHash, 120);
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
    // handle permalink hash after rendering
    setTimeout(openJobFromHash, 600);
    // small delay to allow layout scripts to run
    setTimeout(recalcJobTabs, 500);
  });
})();
