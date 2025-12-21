document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('section-academic')) return;

    // Fetch tree.md and academic-links.json in parallel to avoid large JS parse
    Promise.all([
        fetch('tree.md').then(function(res){ if (!res.ok) throw new Error('Failed to fetch tree.md'); return res.text(); }),
        fetch('js/academic-links.json').then(function(res){ if (!res.ok) return {}; return res.json(); }).catch(function(){ return {}; })
    ])
    .then(function(results){
        var text = results[0] || '';
        var linksData = results[1] || {};
        var categories = [];

        // Prefer structure from `js/academic-links.json` when available.
        if (linksData && linksData.constellation && linksData.constellation.length) {
            categories = (linksData.constellation||[]).map(function(c){
                return { category: c.category, items: (c.items||[]).map(function(i){ return { name: i.name||i, children: i.children||[], files: i.files||[] }; }) };
            });
            console.log('Using structure from js/academic-links.json', categories.map(function(c){ return c.category; }));
        } else {
            // Fallback: parse tree.md (kept for one-time development edits but not used when JSON exists)
            var lines = text.split(/\r?\n/);
            var currentCat = null;
            var currentItem = null;

            lines.forEach(function(raw){
                var line = raw.replace(/\u00A0/g,' '); // handle non-breaking spaces
                var m = line.match(/^(\s*)[-*]\s*(.+)$/);
                if (!m) return;
                var indent = m[1].length;
                var level = Math.floor(indent/2);
                var name = m[2].trim();

                if (level === 0) {
                    currentCat = { category: name, items: [] };
                    categories.push(currentCat);
                    currentItem = null;
                } else if (level === 1) {
                    if (!currentCat) return;
                    currentItem = { name: name, children: [] };
                    currentCat.items.push(currentItem);
                } else {
                    if (!currentItem) return;
                    currentItem.children.push(name);
                }
            });

            console.log('Parsed categories from tree.md', categories);
            if ((!categories || categories.length === 0) && typeof academicData !== 'undefined' && academicData.constellation) {
                console.warn('tree.md parsed empty — falling back to academicData');
                categories = (academicData.constellation||[]).map(function(c){ return { category: c.category, items: (c.items||[]).map(function(i){ return { name: i.name||i, children: i.children||[] }; }) }; });
            }
        }
                // Build lookup from linksData (if any)
                var linksLookup = {};
                if (linksData && linksData.constellation) {
                    linksData.constellation.forEach(function(ac){
                        var aKey = normalizeKey(ac.category);
                        linksLookup[aKey] = linksLookup[aKey] || {};
                        (ac.items||[]).forEach(function(ai){ linksLookup[aKey][normalizeKey(ai.name||'')] = ai.files || []; });
                    });
                }
                // Merge academicData fallback files if present
                if (typeof academicData !== 'undefined' && academicData.constellation) {
                    academicData.constellation.forEach(function(ac){
                        var aKey = normalizeKey(ac.category);
                        linksLookup[aKey] = linksLookup[aKey] || {};
                        (ac.items||[]).forEach(function(ai){ linksLookup[aKey][normalizeKey(ai.name||'')] = (linksLookup[aKey][normalizeKey(ai.name||'')] || []).concat(ai.files || []); });
                    });
                }
                // Store categories and linksLookup globally for lazy rendering
                window._academicCategories = categories;
                window._academicLinksLookup = linksLookup;
                // Render only the currently visible academic tab to reduce DOM and network work
                renderActiveAcademicTab();
    }).catch(function(err){
                console.error('academic-render error:', err);
                if (typeof academicData !== 'undefined' && academicData.constellation) {
                    console.warn('Falling back to academicData due to fetch/parse error');
                    renderFromAcademicData(academicData.constellation);
                }
    });

    // Render only the active tab content; render other tabs on demand when selected
    function renderActiveAcademicTab() {
        var normMap = {
            'articles': 'articlesItemsDiv', 'books': 'booksItemsDiv', 'lectures': 'lecturesItemsDiv',
            'patents': 'patentsItemsDiv', 'presentations': 'presentationsItemsDiv', 'published_issues': 'publishedIssuesItemsDiv',
            'thesis': 'thesisItemsDiv'
        };
        // build reverse map from container id to normalized category key
        var containerToCat = {};
        Object.keys(normMap).forEach(function(k){ containerToCat[normMap[k]] = k; });
        // find checked tab input
        var checked = document.querySelector('input[name="ktabs-academic"]:checked');
        var contentDiv = checked ? checked.parentNode.querySelector('.k-tabs__content') : null;
        if (!contentDiv) return;
        // find items container inside this content
        var container = contentDiv.querySelector('[id$="ItemsDiv"]');
        if (!container) return;
        var cid = container.id;
        var catKey = containerToCat[cid];
        if (!catKey) return;
        // if already rendered, skip
        container.dataset.rendered = container.dataset.rendered || '0';
        if (container.dataset.rendered === '1') return;
        // find category data
        var cats = window._academicCategories || [];
        var lookup = window._academicLinksLookup || {};
        var catData = null;
        for (var i=0;i<cats.length;i++){ if (normalizeKey(cats[i].category) === catKey) { catData = cats[i]; break; } }
        if (!catData) {
            // try to find by more permissive matching
            for (var i=0;i<cats.length;i++){ if (normalizeKey(cats[i].category).indexOf(catKey) !== -1) { catData = cats[i]; break; } }
        }
        if (!catData) { container.innerHTML = '<p>No items.</p>'; container.dataset.rendered='1'; return; }
        // render the category into this container
        renderCategoryToContainer(catData, container, lookup);
        container.dataset.rendered = '1';
        // attach change handler to render other tabs on demand
        document.querySelectorAll('input[name="ktabs-academic"]').forEach(function(inp){
            inp.addEventListener('change', function(){ setTimeout(renderActiveAcademicTab, 50); });
        });
    }

    // Recalculate margins for academic tabs (mirrors WSN logic)
    // Moved to top-level of DOMContentLoaded so all handlers can call it.
    function recalcAcademicTabs() {
        if (!window.jQuery) return;
        var $tabs = $('#section-academic .k-tabs');
        if ($tabs.length === 0) return;
        var tabsHeight = $tabs.outerHeight();
        var currentContent = $tabs.find('.k-tabs__content:visible');
        // Use outerHeight or scrollHeight for hidden/transitioning content
        var currentContentHeight = (currentContent.outerHeight() || 0);
        try {
            var scrollH = currentContent.prop('scrollHeight') || 0;
            if (scrollH > currentContentHeight) currentContentHeight = scrollH;
        } catch (e) {}
        var margin = Math.max(currentContentHeight, 150);
        $tabs.css({ 'margin-bottom': margin + 'px' });
        currentContent.css({ 'top': tabsHeight });
    }

    function renderCategoryToContainer(catData, container, lookup) {
        function escapeHtml(str) {
            return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }
        var html = '<div class="academic-items">';
        (catData.items||[]).forEach(function(item, idx){
            var id = container.id + '-item-' + idx;
            // merge files from lookup
            try {
                var filesFromLookup = (lookup[normalizeKey(catData.category)]||{})[normalizeKey(item.name||'')] || [];
                if ((!item.files || item.files.length===0) && filesFromLookup && filesFromLookup.length) item.files = filesFromLookup;
            } catch(e){}
            // Debug: log files count for this item
            try { console.log('academic-render: renderCategoryToContainer item', item.name, 'filesCount', (item.files||[]).length); } catch(e){}
            html += '<div class="academic-item">';
            html += '<button class="academic-item-btn" data-target="'+id+'">';
            html += '<span class="academic-toggle-icon">▼</span>';
            html += '<span class="academic-item-name">' + item.name + '</span>';
            html += '</button>';
            html += '<div id="'+id+'" class="academic-item-content" style="display:none;">';
            if (item.children && item.children.length) {
                html += '<ul style="margin:0 0 0 18px;padding:6px 0;">';
                item.children.forEach(function(c){ html += '<li>'+c+'</li>'; });
                html += '</ul>';
            } else {
                html += '<p style="margin:0;">'+item.name+'</p>';
            }
            if (item.files && item.files.length) {
                html += '<div class="academic-files" style="margin-top:8px;">';
                html += '<ul style="margin:0;padding-left:18px;">';
                item.files.forEach(function(f, fidx){
                    try {
                        var safeUrl = f.url || f.link || '#';
                        var title = f.title || f.name || safeUrl;
                        var embedId = id + '-file-' + fidx;
                        var escTitle = escapeHtml(title);
                        var escUrl = escapeHtml(safeUrl);
                        html += '<li style="margin-bottom:6px;">';
                        html += '<span style="font-weight:500;">'+escTitle+'</span> ';
                        // Open preview/download in a new tab — Drive previews often block embedding
                        html += '<a class="academic-file-view-btn" href="'+escUrl+'" target="_blank" rel="noopener" aria-label="Open '+escTitle+'" style="margin-left:8px;">Open</a>';
                        var downloadUrl = (function(u){ try{ var m=u.match(/\/d\/([a-zA-Z0-9_-]+)/); if (m&&m[1]) return 'https://drive.google.com/uc?export=download&id=' + m[1]; var q = u.match(/[?&]id=([a-zA-Z0-9_-]+)/); if (q&&q[1]) return 'https://drive.google.com/uc?export=download&id=' + q[1]; }catch(e){} return u; })(safeUrl);
                        html += '<a class="academic-file-download-btn" href="'+escapeHtml(downloadUrl)+'" target="_blank" rel="noopener" style="margin-left:8px;">Download</a>';
                        html += '</li>';
                    } catch (err) {
                        console.error('Error rendering file for', item.name, 'fileIndex', fidx, err);
                    }
                });
                html += '</ul>';
                html += '</div>';
            }
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
        // Attach item toggle handlers for new content
        container.querySelectorAll('.academic-item-btn').forEach(function(btn){ btn.addEventListener('click', function(){ var id = btn.getAttribute('data-target'); var el = document.getElementById(id); if (!el) return; el.style.display = (el.style.display==='none' || el.style.display==='') ? 'block' : 'none'; setTimeout(recalcAcademicTabs, 10); }); });
    }

    function renderFromCategories(categories) {
        function escapeHtml(str) {
            return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }
        var map = {
            'Articles': 'articlesItemsDiv',
            'Books': 'booksItemsDiv',
            'Lectures': 'lecturesItemsDiv',
            'Patents': 'patentsItemsDiv',
            'Presentations': 'presentationsItemsDiv',
            'Published_Issues': 'publishedIssuesItemsDiv',
            'Thesis': 'thesisItemsDiv'
        };

        // Build normalized map for flexible matching
        var normMap = {};
        Object.keys(map).forEach(function(k){ normMap[normalizeKey(k)] = map[k]; });

        // Build a lookup from academicData (if present) to merge file links into parsed tree items
        var academicFilesLookup = {};
        if (typeof academicData !== 'undefined' && academicData.constellation) {
            academicData.constellation.forEach(function(ac){
                var aKey = normalizeKey(ac.category);
                academicFilesLookup[aKey] = academicFilesLookup[aKey] || {};
                (ac.items||[]).forEach(function(ai){
                    var iname = (ai.name || ai).toString();
                    academicFilesLookup[aKey][normalizeKey(iname)] = ai.files || [];
                });
            });
        }
        // Also merge generated academicLinks (from links.md) if present
        if (typeof academicLinks !== 'undefined' && academicLinks.constellation) {
            academicLinks.constellation.forEach(function(ac){
                var aKey = normalizeKey(ac.category);
                academicFilesLookup[aKey] = academicFilesLookup[aKey] || {};
                (ac.items||[]).forEach(function(ai){
                    var iname = (ai.name || ai).toString();
                    var existing = academicFilesLookup[aKey][normalizeKey(iname)] || [];
                    var newFiles = ai.files || [];
                    academicFilesLookup[aKey][normalizeKey(iname)] = existing.concat(newFiles);
                });
            });
        }


        categories.forEach(function(cat){
            var targetId = normMap[normalizeKey(cat.category)];
            if (!targetId) return;
            var container = document.getElementById(targetId);
            if (!container) return;

            var html = '<div class="academic-items">';
            (cat.items||[]).forEach(function(item, idx){
                var id = targetId + '-item-' + idx;
                // merge files from academicData if available
                try {
                    var filesFromData = (academicFilesLookup[normalizeKey(cat.category)] || {})[normalizeKey(item.name || '')] || [];
                    if ((!item.files || item.files.length === 0) && filesFromData && filesFromData.length) {
                        item.files = filesFromData;
                    }
                } catch(e) {}
                    // Debug: log files count for this item when rendering from categories
                    try { console.log('academic-render: renderFromCategories item', item.name, 'filesCount', (item.files||[]).length); } catch(e){}
                html += '<div class="academic-item">';
                html += '<button class="academic-item-btn" data-target="'+id+'">';
                html += '<span class="academic-toggle-icon">▼</span>';
                html += '<span class="academic-item-name">' + item.name + '</span>';
                html += '</button>';
                html += '<div id="'+id+'" class="academic-item-content" style="display:none;">';
                if (item.children && item.children.length) {
                    html += '<ul style="margin:0 0 0 18px;padding:6px 0;">';
                    item.children.forEach(function(c){ html += '<li>'+c+'</li>'; });
                    html += '</ul>';
                } else {
                    html += '<p style="margin:0;">'+item.name+'</p>';
                }

                // Render attached files (links / Drive previews)
                if (item.files && item.files.length) {
                    html += '<div class="academic-files" style="margin-top:8px;">';
                    html += '<ul style="margin:0;padding-left:18px;">';
                    item.files.forEach(function(f, fidx){
                        try {
                            var safeUrl = f.url || f.link || '#';
                            var title = f.title || f.name || safeUrl;
                            var embedId = id + '-file-' + fidx;
                            var escTitle = escapeHtml(title);
                            var escUrl = escapeHtml(safeUrl);
                            html += '<li style="margin-bottom:6px;">';
                            // Open external preview in a new tab — Drive previews often block embedding
                            html += '<span style="font-weight:500;">'+escTitle+'</span> ';
                            html += '<a class="academic-file-view-btn" href="'+escUrl+'" target="_blank" rel="noopener" aria-label="Open '+escTitle+'" style="margin-left:8px;">Open</a>';
                            // Build download URL (Google Drive direct-download when possible)
                            var downloadUrl = (function(u){
                                try {
                                    var m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                    if (m && m[1]) return 'https://drive.google.com/uc?export=download&id=' + m[1];
                                    var q = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                    if (q && q[1]) return 'https://drive.google.com/uc?export=download&id=' + q[1];
                                } catch(e){}
                                return u;
                            })(safeUrl);
                            html += '<a class="academic-file-download-btn" href="'+escapeHtml(downloadUrl)+'" target="_blank" rel="noopener" style="margin-left:8px;">Download</a>';
                            html += '</li>';
                        } catch (err) {
                            console.error('Error rendering file for', item.name, 'fileIndex', fidx, err);
                        }
                    });
                    html += '</ul>';
                    html += '</div>';
                }
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
                });

                // Ensure spacing is recalculated after rendering
                setTimeout(function(){
                    try { recalcAcademicTabs(); } catch(e){}
                    if (window.jQuery) {
                        // trigger change on the checked academic tab to align with site behavior
                        $('input[name="ktabs-academic"]:checked').trigger('change');
                    }
                }, 20);

        // Attach click handlers to toggle buttons
        document.querySelectorAll('#section-academic .academic-item-btn').forEach(function(btn){
            btn.addEventListener('click', function(e){
                var id = btn.getAttribute('data-target');
                var el = document.getElementById(id);
                if (!el) return;
                el.style.display = (el.style.display==='none' || el.style.display==='') ? 'block' : 'none';
                // Recalculate tab margins like WSN does
                setTimeout(recalcAcademicTabs, 10);
            });
        });

        // File view buttons are anchors that open in a new tab; no JS handler required.

        // recalcAcademicTabs moved to outer scope to avoid ReferenceError

        // Also recalc when switching academic tabs
        if (window.jQuery) {
            $('input[name="ktabs-academic"]').on('change', function(){
                setTimeout(recalcAcademicTabs, 50);
            });
        }

        // Recalc on any click inside the academic tabs (covers clicking already-selected tab)
        var nav = document.querySelector('#section-academic .k-tabs');
        if (nav) {
            nav.addEventListener('click', function(){
                setTimeout(recalcAcademicTabs, 20);
            });
        }
    }

        // Run several recalculations after initial render so spacing is correct on first load
        [50, 200, 600].forEach(function(delay){ setTimeout(function(){ if (window.jQuery) recalcAcademicTabs(); }, delay); });

        // If URL contains academic params (from search navigation), expand requested item/file
        (function expandAcademicFromUrl(){
            try {
                var params = new URLSearchParams(window.location.search || '');
                if (!params.has('ac_cat') && !params.has('ac_item') && !params.has('ac_file')) return;
                var cidx = parseInt(params.get('ac_cat') || '0', 10);
                var iidx = parseInt(params.get('ac_item') || '0', 10);
                var fidx = params.has('ac_file') ? parseInt(params.get('ac_file'), 10) : undefined;

                // Wait for categories to be available and UI to render
                setTimeout(function(){
                    try {
                        // Ensure active tab rendered
                        if (typeof renderActiveAcademicTab === 'function') renderActiveAcademicTab();
                        var cats = window._academicCategories || [];
                        var cat = cats[cidx];
                        if (!cat) return;

                        // Map category name to radio id like in search.js
                        var name = (cat.category||'').toLowerCase();
                        var radioMap = {
                            'articles': 'ktabA1', 'books': 'ktabA2', 'lectures': 'ktabA3',
                            'patents': 'ktabA4', 'presentations': 'ktabA5', 'published_issues': 'ktabA6', 'thesis': 'ktabA7'
                        };
                        var norm = name.replace(/[^a-z0-9]+/g, '_');
                        var radioId = radioMap[norm] || 'ktabA1';
                        var radio = document.getElementById(radioId);
                        if (radio) radio.checked = true;

                        setTimeout(function(){
                            var container = document.querySelector('#section-academic [id$="ItemsDiv"]');
                            if (!container) return;
                            // trigger render if needed
                            if (container.dataset && container.dataset.rendered !== '1') {
                                if (typeof renderActiveAcademicTab === 'function') renderActiveAcademicTab();
                            }
                            var itemId = container.id + '-item-' + iidx;
                            var itemEl = document.getElementById(itemId);
                            if (itemEl) {
                                itemEl.style.display = 'block';
                                if (typeof fidx !== 'undefined') {
                                    try {
                                        var cats = window._academicCategories || [];
                                        var file = (cats[cidx] && cats[cidx].items && cats[cidx].items[iidx] && cats[cidx].items[iidx].files && cats[cidx].items[iidx].files[fidx]) || null;
                                        var url = file ? (file.url || file.link || null) : null;
                                        if (url) window.open(url, '_blank');
                                    } catch(e) { /* ignore */ }
                                }
                                setTimeout(function(){ itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
                            }
                        }, 200);
                    } catch (e) { console.warn('expandAcademicFromUrl error', e); }
                }, 400);
            } catch (e) {}
        })();

    function renderFromAcademicData(constellation) {
        // Convert existing academicData.constellation format to categories-like format
        var categories = (constellation||[]).map(function(c){
            return { category: c.category, items: (c.items||[]).map(function(i){ return { name: i.name || i, children: i.children || [] }; }) };
        });
        renderFromCategories(categories);
    }

    function normalizeKey(s) {
        return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'_');
    }
});