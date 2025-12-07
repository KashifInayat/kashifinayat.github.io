/**
 * Global Search Functionality
 * Searches across all website content including WSN groups, publications, research interests, etc.
 */

(function() {
    'use strict';

    var SearchEngine = {
        searchInput: null,
        searchResults: null,
        searchOverlay: null,
        
        init: function() {
            this.createSearchUI();
            this.attachEventListeners();
        },

        createSearchUI: function() {
            // Create search overlay
            var overlay = document.createElement('div');
            overlay.id = 'search-overlay';
            overlay.innerHTML = `
                <div class="search-container">
                    <div class="search-header">
                        <input type="text" id="global-search-input" placeholder="Search for universities, professors, topics, publications..." autocomplete="off">
                        <button id="search-close" title="Close (Esc)">×</button>
                    </div>
                    <div id="search-results"></div>
                    <div class="search-footer">
                        <span class="search-hint">Press <kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>Cmd</kbd>+<kbd>K</kbd> to search • <kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Create search button in navigation
            var searchBtn = document.createElement('button');
            searchBtn.id = 'search-trigger-btn';
            searchBtn.innerHTML = '<i class="icofont icofont-search"></i> Search';
            searchBtn.title = 'Search (Ctrl/Cmd + K)';
            
            // Insert search button into navigation
            setTimeout(function() {
                var nav = document.querySelector('.c-main-nav__list');
                if (nav) {
                    var li = document.createElement('li');
                    li.className = 'c-main-nav__item';
                    li.appendChild(searchBtn);
                    nav.appendChild(li);
                }
            }, 100);

            this.searchInput = document.getElementById('global-search-input');
            this.searchResults = document.getElementById('search-results');
            this.searchOverlay = overlay;
        },

        attachEventListeners: function() {
            var self = this;

            // Search trigger button
            document.addEventListener('click', function(e) {
                if (e.target.id === 'search-trigger-btn' || e.target.closest('#search-trigger-btn')) {
                    self.openSearch();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Ctrl+K or Cmd+K to open search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    self.openSearch();
                }
                // Esc to close search
                if (e.key === 'Escape' && self.searchOverlay.classList.contains('active')) {
                    self.closeSearch();
                }
            });

            // Close button
            document.getElementById('search-close').addEventListener('click', function() {
                self.closeSearch();
            });

            // Click outside to close
            this.searchOverlay.addEventListener('click', function(e) {
                if (e.target === self.searchOverlay) {
                    self.closeSearch();
                }
            });

            // Search input
            this.searchInput.addEventListener('input', function() {
                self.performSearch(this.value);
            });

            // Navigate to result on click
            this.searchResults.addEventListener('click', function(e) {
                var resultItem = e.target.closest('.search-result-item');
                if (resultItem) {
                    var action = resultItem.dataset.action;
                    var data = JSON.parse(resultItem.dataset.data || '{}');
                    self.handleResultClick(action, data);
                }
            });
        },

        openSearch: function() {
            this.searchOverlay.classList.add('active');
            this.searchInput.focus();
            this.searchInput.value = '';
            this.searchResults.innerHTML = '<div class="search-placeholder">Start typing to search...</div>';
        },

        closeSearch: function() {
            this.searchOverlay.classList.remove('active');
            this.searchInput.value = '';
            this.searchResults.innerHTML = '';
        },

        performSearch: function(query) {
            var self = this;
            
            if (!query || query.trim().length < 2) {
                this.searchResults.innerHTML = '<div class="search-placeholder">Type at least 2 characters...</div>';
                return;
            }

            query = query.toLowerCase().trim();
            var results = [];

            // Search WSN Groups
            if (typeof wsnGroups !== 'undefined') {
                results = results.concat(this.searchWSNGroups(query));
            }

            // Search About
            if (typeof about !== 'undefined') {
                results = results.concat(this.searchAbout(query));
            }

            // Search Publications
            if (typeof publications !== 'undefined') {
                results = results.concat(this.searchPublications(query));
            }

            // Search Research Interests
            if (typeof researchInterest !== 'undefined') {
                results = results.concat(this.searchResearchInterests(query));
            }

            // Search Recent Updates
            if (typeof recentUpdates !== 'undefined') {
                results = results.concat(this.searchRecentUpdates(query));
            }

            // Search News/Chips
            if (typeof chipsopp !== 'undefined') {
                results = results.concat(this.searchNews(query));
            }

            // Search Education
            if (typeof educationList !== 'undefined') {
                results = results.concat(this.searchEducation(query));
            }

            // Search Work Experience
            if (typeof workExperience !== 'undefined') {
                results = results.concat(this.searchWorkExperience(query));
            }

            // Search Blog Posts
            if (typeof blogPosts !== 'undefined') {
                results = results.concat(this.searchBlogPosts(query));
            }

            // Search Journals
            if (typeof journalLinks !== 'undefined') {
                results = results.concat(this.searchJournals(query));
            }

            // Search Conferences
            if (typeof conferencesLinks !== 'undefined') {
                results = results.concat(this.searchConferences(query));
            }

            // Search Skills
            if (typeof skillspProf !== 'undefined') {
                results = results.concat(this.searchSkills(query));
            }

            // Search Honors & Awards
            if (typeof honorsAwards !== 'undefined') {
                results = results.concat(this.searchHonorsAwards(query));
            }

            this.displayResults(results, query);
        },

        searchWSNGroups: function(query) {
            var results = [];
            var regions = ['america', 'asia', 'australia', 'europe', 'middleEast'];
            var regionNames = {
                'america': 'America',
                'asia': 'Asia',
                'australia': 'Australia',
                'europe': 'Europe',
                'middleEast': 'Middle East'
            };

            regions.forEach(function(regionKey) {
                var region = wsnGroups[regionKey];
                if (!region) return;

                region.forEach(function(country, countryIndex) {
                    var countryName = country.country;
                    
                    // Handle USA with regions structure
                    if (country.regions && country.regions.length > 0) {
                        country.regions.forEach(function(usaRegion, regionIndex) {
                            var usaRegionName = usaRegion.region;
                            if (!usaRegion.labs) return;

                            usaRegion.labs.forEach(function(lab, labIndex) {
                                var labName = lab.name;
                                var searchText = (labName + ' ' + countryName + ' ' + usaRegionName).toLowerCase();

                                // Search in people if exists
                                var professors = [];
                                if (lab.people && lab.people.length > 0) {
                                    lab.people.forEach(function(person) {
                                        var profName = person.professor;
                                        professors.push(profName);
                                        searchText += ' ' + profName.toLowerCase();
                                    });
                                } else if (lab.professor) {
                                    professors.push(lab.professor);
                                    searchText += ' ' + lab.professor.toLowerCase();
                                }

                                if (searchText.includes(query)) {
                                    results.push({
                                        type: 'wsn',
                                        title: labName,
                                        subtitle: countryName + ' (' + usaRegionName + ') • ' + regionNames[regionKey],
                                        description: professors.length > 0 ? professors.join(', ') : 'Research Group',
                                        action: 'navigate-wsn',
                                        data: {
                                            region: regionKey,
                                            countryIndex: countryIndex,
                                            regionIndex: regionIndex,
                                            labIndex: labIndex,
                                            regionName: regionNames[regionKey],
                                            hasRegions: true
                                        },
                                        relevance: this.calculateRelevance(query, searchText)
                                    });
                                }
                            }.bind(this));
                        }.bind(this));
                    }
                    
                    // Handle regular labs structure (Canada and other countries)
                    if (country.labs && country.labs.length > 0) {
                        country.labs.forEach(function(lab, labIndex) {
                            var labName = lab.name;
                            var searchText = (labName + ' ' + countryName).toLowerCase();

                            // Search in people if exists
                            var professors = [];
                            if (lab.people && lab.people.length > 0) {
                                lab.people.forEach(function(person) {
                                    var profName = person.professor;
                                    professors.push(profName);
                                    searchText += ' ' + profName.toLowerCase();
                                });
                            } else if (lab.professor) {
                                professors.push(lab.professor);
                                searchText += ' ' + lab.professor.toLowerCase();
                            }

                            if (searchText.includes(query)) {
                                results.push({
                                    type: 'wsn',
                                    title: labName,
                                    subtitle: countryName + ' • ' + regionNames[regionKey],
                                    description: professors.length > 0 ? professors.join(', ') : 'Research Group',
                                    action: 'navigate-wsn',
                                    data: {
                                        region: regionKey,
                                        countryIndex: countryIndex,
                                        labIndex: labIndex,
                                        regionName: regionNames[regionKey]
                                    },
                                    relevance: this.calculateRelevance(query, searchText)
                                });
                            }
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));

            return results;
        },

        searchAbout: function(query) {
            var results = [];
            
            if (about) {
                // Search in name and heading
                var searchText = (about.name + ' ' + about.heading).toLowerCase();
                
                // Search in about text paragraphs
                if (about.aboutText && about.aboutText.length > 0) {
                    var text = about.aboutText[0];
                    searchText += ' ' + (text.text1 || '') + ' ' + (text.text2 || '') + ' ' + (text.text3 || '');
                }
                
                searchText = searchText.toLowerCase();
                
                if (searchText.includes(query)) {
                    results.push({
                        type: 'about',
                        title: about.name,
                        subtitle: about.heading,
                        description: 'About section - Personal information and background',
                        action: 'navigate-section',
                        data: { section: 'about' },
                        relevance: this.calculateRelevance(query, searchText) + 50
                    });
                }
            }
            
            return results;
        },

        searchPublications: function(query) {
            var results = [];
            
            // Search through journals
            if (publications && publications.journals) {
                publications.journals.forEach(function(pub, index) {
                    var authorsText = Array.isArray(pub.authors) ? pub.authors.join(' ') : (pub.authors || '');
                    var searchText = (
                        (pub.publicationTitle || '') + ' ' + 
                        authorsText + ' ' + 
                        (pub.publicationVenue || '') + ' ' + 
                        (pub.publicationVenueInformation || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'publication',
                            title: pub.publicationTitle || 'Untitled',
                            subtitle: (pub.publicationVenue || 'Journal') + ' • ' + (pub.publicationVenueInformation || ''),
                            description: authorsText,
                            action: 'navigate-publication',
                            data: { index: index, link: pub.publicationDownloadLink },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            // Search through conferences
            if (publications && publications.conferences) {
                publications.conferences.forEach(function(pub, index) {
                    var authorsText = Array.isArray(pub.authors) ? pub.authors.join(' ') : (pub.authors || '');
                    var searchText = (
                        (pub.publicationTitle || '') + ' ' + 
                        authorsText + ' ' + 
                        (pub.publicationVenue || '') + ' ' + 
                        (pub.publicationVenueInformation || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'publication',
                            title: pub.publicationTitle || 'Untitled',
                            subtitle: (pub.publicationVenue || 'Conference') + ' • ' + (pub.publicationVenueInformation || ''),
                            description: authorsText,
                            action: 'navigate-publication',
                            data: { index: index, link: pub.publicationDownloadLink },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            // Search through domestic journals
            if (publications && publications.journalsdomestic) {
                publications.journalsdomestic.forEach(function(pub, index) {
                    var authorsText = Array.isArray(pub.authors) ? pub.authors.join(' ') : (pub.authors || '');
                    var searchText = (
                        (pub.publicationTitle || '') + ' ' + 
                        authorsText + ' ' + 
                        (pub.publicationVenue || '') + ' ' + 
                        (pub.publicationVenueInformation || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'publication',
                            title: pub.publicationTitle || 'Untitled',
                            subtitle: (pub.publicationVenue || 'Domestic Journal') + ' • ' + (pub.publicationVenueInformation || ''),
                            description: authorsText,
                            action: 'navigate-publication',
                            data: { index: index, link: pub.publicationDownloadLink },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchResearchInterests: function(query) {
            var results = [];
            
            if (researchInterest && researchInterest.interests) {
                researchInterest.interests.forEach(function(interest, index) {
                    if (interest.isTagLine === "true") return;
                    
                    var searchText = (interest.name + ' ' + interest.text).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'research',
                            title: interest.name,
                            subtitle: 'Research Interest',
                            description: interest.text.substring(0, 100) + '...',
                            action: 'navigate-section',
                            data: { section: 'research' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchRecentUpdates: function(query) {
            var results = [];
            
            if (recentUpdates && recentUpdates.updates) {
                recentUpdates.updates.forEach(function(update, index) {
                    var searchText = (update.date + ' ' + update.text).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'update',
                            title: update.text.substring(0, 80) + '...',
                            subtitle: update.date + ' • Recent Update',
                            description: '',
                            action: 'navigate-url',
                            data: { url: 'recentupdates.html' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchNews: function(query) {
            var results = [];
            
            if (chipsopp && chipsopp.chips) {
                chipsopp.chips.forEach(function(chip, index) {
                    var searchText = (chip.date + ' ' + chip.text).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'news',
                            title: chip.text.substring(0, 80) + '...',
                            subtitle: chip.date + ' • News',
                            description: '',
                            action: 'navigate-url',
                            data: { url: 'chips.html' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchEducation: function(query) {
            var results = [];
            
            if (educationList && educationList.educationList) {
                educationList.educationList.forEach(function(edu, index) {
                    var searchText = (edu.title + ' ' + edu.department + ' ' + edu.thesis + ' ' + (edu.advisorInfo ? edu.advisorInfo.name : '')).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'education',
                            title: edu.title,
                            subtitle: edu.date + ' • Education',
                            description: edu.department,
                            action: 'navigate-section',
                            data: { section: 'education' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchWorkExperience: function(query) {
            var results = [];
            
            if (workExperience && workExperience.experiences) {
                workExperience.experiences.forEach(function(exp, index) {
                    var searchText = (exp.title + ' ' + exp.detail).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'work',
                            title: exp.title,
                            subtitle: exp.date + ' • Work Experience',
                            description: exp.detail.substring(0, 100) + '...',
                            action: 'navigate-section',
                            data: { section: 'education' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchBlogPosts: function(query) {
            var results = [];
            
            if (blogPosts && Array.isArray(blogPosts)) {
                blogPosts.forEach(function(post, index) {
                    // Create searchable text from post
                    var searchText = (
                        (post.title || '') + ' ' + 
                        (post.summary || '') + ' ' + 
                        (post.author || '') + ' ' + 
                        (post.tags ? post.tags.join(' ') : '') + ' ' +
                        (post.content || '').replace(/<[^>]*>/g, ' ') // Remove HTML tags from content
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        var tagsText = post.tags ? post.tags.join(', ') : '';
                        results.push({
                            type: 'blog',
                            title: post.title || 'Untitled Post',
                            subtitle: (post.date || 'No date') + ' • ' + tagsText,
                            description: (post.summary || '').substring(0, 150) + (post.summary && post.summary.length > 150 ? '...' : ''),
                            action: 'navigate-blog',
                            data: { 
                                postId: post.id,
                                url: 'blog.html#post-' + post.id
                            },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchJournals: function(query) {
            var results = [];
            
            if (journalLinks && journalLinks.jrnls && Array.isArray(journalLinks.jrnls)) {
                journalLinks.jrnls.forEach(function(journal, index) {
                    var searchText = (
                        (journal.title || '') + ' ' + 
                        (journal.detail || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        var impactFactor = journal.detail ? journal.detail.replace('[IF: ', '').replace(']', '').trim() : '';
                        results.push({
                            type: 'journal',
                            title: journal.title || 'Untitled Journal',
                            subtitle: 'Journal' + (impactFactor ? ' • Impact Factor: ' + impactFactor : ''),
                            description: 'Academic journal in relevant venues section',
                            action: 'navigate-url',
                            data: { 
                                url: journal.link || 'wsn.html#section-rvenues'
                            },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchConferences: function(query) {
            var results = [];
            
            if (conferencesLinks && conferencesLinks.confs && Array.isArray(conferencesLinks.confs)) {
                conferencesLinks.confs.forEach(function(conf, index) {
                    var detailText = '';
                    if (conf.detail && conf.detail.text) {
                        detailText = conf.detail.text;
                    }
                    
                    var searchText = (
                        (conf.title || '') + ' ' + 
                        detailText
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'conference',
                            title: conf.title || 'Untitled Conference',
                            subtitle: 'Conference',
                            description: 'Academic conference in relevant venues section',
                            action: 'navigate-url',
                            data: { 
                                url: conf.link || 'wsn.html#section-rvenues'
                            },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchSkills: function(query) {
            var results = [];
            
            if (skillspProf && skillspProf.skills && Array.isArray(skillspProf.skills)) {
                skillspProf.skills.forEach(function(skill, index) {
                    var searchText = (
                        (skill.title || '') + ' ' + 
                        (skill.detail || '') + ' ' +
                        (skill.comments || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'skill',
                            title: skill.title || 'Skill',
                            subtitle: 'Technical Skill' + (skill.comments ? ' • ' + skill.comments : ''),
                            description: (skill.detail || '').substring(0, 120) + (skill.detail && skill.detail.length > 120 ? '...' : ''),
                            action: 'navigate-section',
                            data: { 
                                section: 'about'
                            },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        searchHonorsAwards: function(query) {
            var results = [];
            
            if (honorsAwards && honorsAwards.honors && Array.isArray(honorsAwards.honors)) {
                honorsAwards.honors.forEach(function(honor, index) {
                    var searchText = (
                        (honor.title || '') + ' ' + 
                        (honor.detail || '') + ' ' +
                        (honor.comments || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'honor',
                            title: honor.title || 'Award',
                            subtitle: 'Honor & Award' + (honor.comments ? ' • ' + honor.comments : ''),
                            description: honor.detail || 'Academic honor or award',
                            action: 'navigate-section',
                            data: { 
                                section: 'about'
                            },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }

            return results;
        },

        calculateRelevance: function(query, text) {
            var score = 0;
            
            // Exact match bonus
            if (text.includes(query)) score += 100;
            
            // Start of string bonus
            if (text.startsWith(query)) score += 50;
            
            // Word boundary bonus
            if (new RegExp('\\b' + query + '\\b').test(text)) score += 30;
            
            // Length penalty (prefer shorter matches)
            score -= text.length / 100;
            
            return score;
        },

        displayResults: function(results, query) {
            if (results.length === 0) {
                this.searchResults.innerHTML = '<div class="no-results">No results found for "' + this.escapeHtml(query) + '"</div>';
                return;
            }

            // Sort by relevance
            results.sort(function(a, b) {
                return b.relevance - a.relevance;
            });

            // Limit to top 50 results
            results = results.slice(0, 50);

            var html = '<div class="search-results-header">Found ' + results.length + ' result' + (results.length > 1 ? 's' : '') + '</div>';
            
            results.forEach(function(result) {
                var icon = this.getIconForType(result.type);
                html += `
                    <div class="search-result-item" data-action="${result.action}" data-data='${JSON.stringify(result.data)}'>
                        <div class="result-icon">${icon}</div>
                        <div class="result-content">
                            <div class="result-title">${this.highlightQuery(result.title, query)}</div>
                            <div class="result-subtitle">${this.highlightQuery(result.subtitle, query)}</div>
                            ${result.description ? '<div class="result-description">' + this.highlightQuery(result.description, query) + '</div>' : ''}
                        </div>
                        <div class="result-type">${result.type}</div>
                    </div>
                `;
            }.bind(this));

            this.searchResults.innerHTML = html;
        },

        getIconForType: function(type) {
            var icons = {
                'about': '<i class="icofont icofont-user-alt-4"></i>',
                'wsn': '<i class="icofont icofont-building-alt"></i>',
                'publication': '<i class="icofont icofont-file-document"></i>',
                'research': '<i class="icofont icofont-laboratory"></i>',
                'update': '<i class="icofont icofont-notification"></i>',
                'news': '<i class="icofont icofont-newspaper"></i>',
                'education': '<i class="icofont icofont-graduate"></i>',
                'work': '<i class="icofont icofont-briefcase"></i>',
                'blog': '<i class="icofont icofont-pen-alt-4"></i>'
            };
            return icons[type] || '<i class="icofont icofont-search"></i>';
        },

        highlightQuery: function(text, query) {
            if (!text) return '';
            var regex = new RegExp('(' + this.escapeRegex(query) + ')', 'gi');
            return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
        },

        escapeHtml: function(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        escapeRegex: function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        handleResultClick: function(action, data) {
            var self = this;
            this.closeSearch();

            switch(action) {
                case 'navigate-wsn':
                    this.navigateToWSN(data);
                    break;
                case 'navigate-section':
                    this.navigateToSection(data.section);
                    break;
                case 'navigate-url':
                    window.location.href = data.url;
                    break;
                case 'navigate-publication':
                    if (data.link) {
                        window.open(data.link, '_blank');
                    } else {
                        this.navigateToSection('publications');
                    }
                    break;
                case 'navigate-blog':
                    window.location.href = data.url;
                    break;
            }
        },

        navigateToWSN: function(data) {
            // Navigate to wsn.html if not already there
            if (!window.location.href.includes('wsn.html')) {
                var url = 'wsn.html?region=' + data.region + '&country=' + data.countryIndex + '&lab=' + data.labIndex;
                if (data.hasRegions) {
                    url += '&regionIndex=' + data.regionIndex + '&hasRegions=true';
                }
                window.location.href = url;
                return;
            }

            // Already on wsn.html, expand the sections
            this.expandWSNSection(data);
        },

        expandWSNSection: function(data) {
            var regionMap = {
                'america': 'ktab4',
                'asia': 'ktab5',
                'australia': 'ktab8',
                'europe': 'ktab6',
                'middleEast': 'ktab7'
            };

            // Switch to correct region tab
            var tabId = regionMap[data.region];
            var tabRadio = document.getElementById(tabId);
            if (tabRadio) {
                tabRadio.checked = true;
            }

            // Wait for tab content to render
            setTimeout(function() {
                var divIds = {
                    'america': 'americaCountriesDiv',
                    'asia': 'asiaCountriesDiv',
                    'australia': 'australiaCountriesDiv',
                    'europe': 'europeCountriesDiv',
                    'middleEast': 'middleEastCountriesDiv'
                };

                var divId = divIds[data.region];
                var countryId = divId + '-country-' + data.countryIndex;
                
                // Check if this is USA with regions structure
                var labId;
                if (data.hasRegions) {
                    var regionId = countryId + '-region-' + data.regionIndex;
                    labId = regionId + '-lab-' + data.labIndex;
                    
                    // Expand country first
                    if (typeof toggleWSNCountry === 'function') {
                        var countryElem = document.getElementById(countryId);
                        if (countryElem && countryElem.style.display === 'none') {
                            toggleWSNCountry(countryId);
                        }
                    }
                    
                    // Then expand region
                    setTimeout(function() {
                        if (typeof toggleWSNCountry === 'function') {
                            var regionElem = document.getElementById(regionId);
                            if (regionElem && regionElem.style.display === 'none') {
                                toggleWSNCountry(regionId);
                            }
                        }
                        
                        // Then expand lab
                        setTimeout(function() {
                            if (typeof toggleWSNLab === 'function') {
                                var labElem = document.getElementById(labId);
                                if (labElem && labElem.style.display === 'none') {
                                    toggleWSNLab(labId);
                                }
                            }
                            
                            // Scroll to the lab
                            setTimeout(function() {
                                var labElement = document.getElementById(labId);
                                if (labElement) {
                                    labElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    labElement.style.backgroundColor = '#fff3cd';
                                    setTimeout(function() {
                                        labElement.style.transition = 'background-color 1s';
                                        labElement.style.backgroundColor = '';
                                    }, 1000);
                                }
                            }, 300);
                        }, 300);
                    }, 300);
                } else {
                    // Regular structure without regions
                    labId = countryId + '-lab-' + data.labIndex;

                    // Expand country
                    if (typeof toggleWSNCountry === 'function') {
                        var countryElem = document.getElementById(countryId);
                        if (countryElem && countryElem.style.display === 'none') {
                            toggleWSNCountry(countryId);
                        }
                    }

                    // Expand lab
                    setTimeout(function() {
                        if (typeof toggleWSNLab === 'function') {
                            var labElem = document.getElementById(labId);
                            if (labElem && labElem.style.display === 'none') {
                                toggleWSNLab(labId);
                            }
                        }

                        // Scroll to the lab
                        setTimeout(function() {
                            var labElement = document.getElementById(labId);
                            if (labElement) {
                                labElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                labElement.style.backgroundColor = '#fff3cd';
                                setTimeout(function() {
                                    labElement.style.transition = 'background-color 1s';
                                    labElement.style.backgroundColor = '';
                                }, 1000);
                            }
                        }, 300);
                    }, 300);
                }
            }, 300);
        },

        navigateToSection: function(section) {
            var sectionMap = {
                'about': '#section-about',
                'research': '#section-research',
                'teaching': '#section-teaching',
                'publications': '#section-publications',
                'education': '#section-education',
                'contacts': '#section-contacts'
            };

            var targetHash = sectionMap[section] || '#section-' + section;

            if (!window.location.href.includes('index.html') && !window.location.pathname.endsWith('/')) {
                window.location.href = 'index.html' + targetHash;
            } else {
                window.location.hash = targetHash;
                var targetElement = document.querySelector(targetHash);
                if (targetElement) {
                    setTimeout(function() {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SearchEngine.init();
        });
    } else {
        SearchEngine.init();
    }

    // Handle URL parameters for direct navigation (wsn.html?region=usa&country=0&lab=0)
    window.addEventListener('load', function() {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('region') && window.location.href.includes('wsn.html')) {
            setTimeout(function() {
                SearchEngine.expandWSNSection({
                    region: urlParams.get('region'),
                    countryIndex: parseInt(urlParams.get('country')),
                    labIndex: parseInt(urlParams.get('lab'))
                });
            }, 500);
        }
    });

})();
