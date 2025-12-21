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
        sectionMetadata: null,
        
        init: function() {
            this.createSearchUI();
            this.attachEventListeners();
            this.generateSectionMetadata(); // Auto-generate metadata from DOM
        },

        generateSectionMetadata: function() {
            // Auto-generate section metadata by reading section headings from the page
            this.sectionMetadata = {};
            
            // Find all sections with IDs that start with "section-"
            var sections = document.querySelectorAll('[id^="section-"]');
            
            console.log('Found ' + sections.length + ' sections to generate metadata for');
            
            sections.forEach(function(section) {
                var sectionId = section.id.replace('section-', '');
                
                // Try to find the heading text
                var heading = section.querySelector('h2, h3, h1');
                var title = heading ? heading.textContent.trim().replace('.', '') : sectionId;
                
                // Generate keywords from the title
                var keywords = this.generateKeywordsFromTitle(title, sectionId);
                
                this.sectionMetadata[sectionId] = {
                    title: title,
                    keywords: keywords
                };
                
                console.log('Section "' + sectionId + '" - Title: "' + title + '", Keywords:', keywords);
            }.bind(this));
            
            console.log('Auto-generated section metadata:', this.sectionMetadata);
        },

        generateKeywordsFromTitle: function(title, sectionId) {
            var keywords = [];
            
            // Add the title itself
            keywords.push(title.toLowerCase());
            
            // Add individual words from title
            var words = title.toLowerCase().split(/\s+/);
            keywords = keywords.concat(words);
            
            // Add section ID
            keywords.push(sectionId);
            
            // Add common variations based on section ID
            var commonKeywords = {
                'about': ['biography', 'bio', 'profile', 'personal', 'introduction', 'background', 'overview'],
                'research': ['interests', 'topics', 'areas', 'focus', 'expertise', 'specialization'],
                'teaching': ['service', 'reviewer', 'committee', 'professional'],
                'publications': ['papers', 'articles', 'research papers', 'journal papers', 'conference papers'],
                'education': ['academic', 'degree', 'phd', 'masters', 'bachelors', 'university', 'studies', 'qualifications'],
                'contacts': ['contact', 'email', 'phone', 'address', 'location', 'reach', 'get in touch', 'call', 'write'],
                'recent': ['updates', 'news', 'latest', 'announcements']
            };
            
            if (commonKeywords[sectionId]) {
                keywords = keywords.concat(commonKeywords[sectionId]);
            }
            
            // Remove duplicates
            return [...new Set(keywords)];
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

            // Search Contacts
            if (typeof contacts !== 'undefined') {
                results = results.concat(this.searchContacts(query));
            }

            // Search Short Courses
            if (typeof shortCourses !== 'undefined') {
                results = results.concat(this.searchShortCourses(query));
            }

            // Search Academic Material
            if (typeof academicMaterialData !== 'undefined') {
                results = results.concat(this.searchAcademicMaterial(query));
            }

            // Search Academic Section (WSN page `section-academic`) using runtime data
            results = results.concat(this.searchAcademicSection(query));
            // Search Tools & Resources
            if (typeof toolsResourcesData !== 'undefined') {
                results = results.concat(this.searchToolsResources(query));
            }

            // Search Page Titles
            results = results.concat(this.searchPageTitles(query));

            // Search Navigation & Sections
            results = results.concat(this.searchNavigationSections(query));

            // Search Common Keywords
            results = results.concat(this.searchCommonKeywords(query));

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
                                var searchText = (
                                    labName + ' ' + 
                                    countryName + ' ' + 
                                    usaRegionName + ' ' + 
                                    regionNames[regionKey]
                                ).toLowerCase();

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
                            var searchText = (
                                labName + ' ' + 
                                countryName + ' ' + 
                                regionNames[regionKey]
                            ).toLowerCase();

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

                // Search in profile links (GitHub, LinkedIn, CV, etc.)
                if (about.profles && Array.isArray(about.profles)) {
                    about.profles.forEach(function(profile) {
                        searchText += ' ' + (profile.name || '') + ' ' + (profile.link || '');
                    });
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
                    var searchText = (
                        (edu.title || '') + ' ' + 
                        (edu.department || '') + ' ' + 
                        (edu.thesis || '') + ' ' + 
                        (edu.major || '') + ' ' +
                        (edu.detail || '') + ' ' +
                        (edu.CGPA || '') + ' ' +
                        (edu.date || '') + ' ' +
                        (edu.advisorInfo ? edu.advisorInfo.name : '')
                    ).toLowerCase();
                    
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
                    var searchText = (
                        (exp.title || '') + ' ' + 
                        (exp.detail || '') + ' ' +
                        (exp.date || '') + ' ' +
                        (exp.text || '')
                    ).toLowerCase();
                    
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

        searchPageTitles: function(query) {
            var results = [];
            
            // Define searchable page titles with their metadata
            var pageTitles = [
                {
                    title: 'Watan Semiconductor Network',
                    subtitle: 'WSN',
                    description: 'Network of semiconductor researchers and professors across the globe',
                    url: 'wsn.html',
                    keywords: ['watan', 'semiconductor', 'network', 'wsn', 'professors', 'universities']
                },
                {
                    title: 'Binary Thoughts',
                    subtitle: 'Blog',
                    description: 'Technical blog covering computer architecture, VLSI design, ML accelerators',
                    url: 'blog.html',
                    keywords: ['binary', 'thoughts', 'blog', 'vlsi', 'machine learning', 'accelerators']
                },
                {
                    title: 'Academic Material',
                    subtitle: 'Resources',
                    description: 'Academic resources, courses, and educational materials',
                    url: 'Academic Material.html',
                    keywords: ['academic', 'material', 'resources', 'courses', 'education']
                },
                {
                    title: 'Tools & More Resources',
                    subtitle: 'Resources',
                    description: 'Useful tools and additional resources for research and development',
                    url: 'Tools  More Resources.html',
                    keywords: ['tools', 'resources', 'utilities', 'development']
                },
                {
                    title: 'Publications',
                    subtitle: 'Research',
                    description: 'Research publications, papers, and academic contributions',
                    url: 'publications.html',
                    keywords: ['publications', 'papers', 'research', 'journals', 'conferences']
                },
                {
                    title: 'Recent Updates',
                    subtitle: 'News',
                    description: 'Latest news, achievements, and professional updates',
                    url: 'recentupdates.html',
                    keywords: ['updates', 'news', 'recent', 'achievements']
                }
            ];
            
            pageTitles.forEach(function(page) {
                var searchText = (
                    page.title + ' ' + 
                    page.subtitle + ' ' + 
                    page.description + ' ' + 
                    page.keywords.join(' ')
                ).toLowerCase();
                
                if (searchText.includes(query)) {
                    results.push({
                        type: 'page',
                        title: page.title,
                        subtitle: page.subtitle,
                        description: page.description,
                        action: 'navigate-url',
                        data: { url: page.url },
                        relevance: this.calculateRelevance(query, searchText)
                    });
                }
            }.bind(this));

            return results;
        },

        searchNavigationSections: function(query) {
            var results = [];
            
            // Use auto-generated metadata
            if (!this.sectionMetadata || Object.keys(this.sectionMetadata).length === 0) {
                return results;
            }
            
            // Iterate through all auto-generated sections
            Object.keys(this.sectionMetadata).forEach(function(sectionKey) {
                var section = this.sectionMetadata[sectionKey];
                var searchText = (
                    section.title + ' ' + 
                    section.keywords.join(' ')
                ).toLowerCase();
                
                if (searchText.includes(query)) {
                    results.push({
                        type: 'section',
                        title: section.title,
                        subtitle: 'Section',
                        description: 'Navigate to ' + section.title + ' section',
                        action: 'navigate-section',
                        data: { section: sectionKey },
                        relevance: this.calculateRelevance(query, searchText) + 100
                    });
                }
            }.bind(this));

            return results;
        },

        searchCommonKeywords: function(query) {
            var results = [];
            
            // Map common keywords to specific sections or pages
            var keywordMap = [
                {
                    keywords: ['professor', 'professors', 'university', 'universities', 'researcher', 'researchers', 'faculty', 'academia', 'academic institutions'],
                    title: 'Watan Semiconductor Network',
                    subtitle: 'WSN Database',
                    description: 'Browse professors and researchers in semiconductor field across universities worldwide',
                    url: 'wsn.html',
                    type: 'wsn'
                },
                {
                    keywords: ['qualcomm', 'barcelona', 'bsc', 'supercomputing', 'samsung', 'hongik', 'iqra', 'incheon', 'inu', 'company', 'organization', 'employer'],
                    title: 'Work Experience & Education',
                    subtitle: 'Career & Academic Background',
                    description: 'View work experience at Qualcomm, BSC, Samsung and education at INU, Hongik University',
                    section: 'education',
                    type: 'work'
                },
                {
                    keywords: ['cv', 'resume', 'curriculum vitae', 'download', 'pdf'],
                    title: 'Download CV',
                    subtitle: 'Curriculum Vitae',
                    description: 'Download Kashif Inayat\'s CV/Resume',
                    section: 'about',
                    type: 'about'
                },
                {
                    keywords: ['github', 'code', 'repository', 'repositories', 'projects', 'source code'],
                    title: 'GitHub Profile',
                    subtitle: 'Code & Projects',
                    description: 'View code repositories and projects on GitHub',
                    section: 'about',
                    type: 'about'
                },
                {
                    keywords: ['linkedin', 'professional network', 'connections'],
                    title: 'LinkedIn Profile',
                    subtitle: 'Professional Network',
                    description: 'Connect on LinkedIn',
                    section: 'about',
                    type: 'about'
                },
                {
                    keywords: ['google scholar', 'scholar', 'citations', 'h-index', 'research metrics'],
                    title: 'Google Scholar Profile',
                    subtitle: 'Research Metrics',
                    description: 'View publications and citations on Google Scholar',
                    section: 'about',
                    type: 'about'
                },
                {
                    keywords: ['vlsi', 'asic', 'fpga', 'hardware', 'rtl', 'verilog', 'vhdl', 'digital design', 'chip design'],
                    title: 'Research Interests',
                    subtitle: 'VLSI & Hardware Design',
                    description: 'VLSI design, ASIC development, and hardware architecture research',
                    section: 'research',
                    type: 'research'
                },
                {
                    keywords: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural network', 'accelerator', 'accelerators', 'tpu', 'gpu'],
                    title: 'Research Interests',
                    subtitle: 'AI & ML Accelerators',
                    description: 'Machine learning accelerators, AI hardware, and neural network implementations',
                    section: 'research',
                    type: 'research'
                },
                {
                    keywords: ['systolic', 'array', 'systolic array', 'tensor', 'gemini', 'gemmini', 'processing element', 'dataflow'],
                    title: 'Research Interests',
                    subtitle: 'Systolic Arrays',
                    description: 'Systolic array architectures and tensor processing research',
                    section: 'research',
                    type: 'research'
                },
                {
                    keywords: ['korea', 'south korea', 'spain', 'ireland', 'pakistan', 'country', 'location'],
                    title: 'Work & Education History',
                    subtitle: 'International Experience',
                    description: 'Work and education experience across Korea, Spain, Ireland, and Pakistan',
                    section: 'education',
                    type: 'education'
                },
                {
                    keywords: ['paper', 'journal', 'conference', 'publication', 'article', 'ieee', 'acm', 'springer'],
                    title: 'Publications',
                    subtitle: 'Research Papers',
                    description: 'Browse research publications in journals and conferences',
                    section: 'publications',
                    type: 'publication'
                },
                {
                    keywords: ['skills', 'programming', 'languages', 'tools', 'software', 'expertise', 'proficiency'],
                    title: 'Skills',
                    subtitle: 'Technical Skills',
                    description: 'Programming languages, tools, and technical expertise',
                    section: 'about',
                    type: 'skill'
                },
                {
                    keywords: ['award', 'awards', 'honor', 'honors', 'achievement', 'achievements', 'recognition', 'fellowship'],
                    title: 'Honors & Awards',
                    subtitle: 'Achievements',
                    description: 'Academic honors, awards, and achievements',
                    section: 'about',
                    type: 'honor'
                },
                {
                    keywords: ['course', 'courses', 'class', 'classes', 'teaching', 'mooc', 'coursera', 'udemy'],
                    title: 'Short Courses',
                    subtitle: 'Online Courses',
                    description: 'Completed short courses and certifications',
                    section: 'about',
                    type: 'course'
                }
            ];
            
            keywordMap.forEach(function(item) {
                var searchText = item.keywords.join(' ').toLowerCase();
                
                if (searchText.includes(query)) {
                    var actionType = item.url ? 'navigate-url' : 'navigate-section';
                    var actionData = item.url ? { url: item.url } : { section: item.section };
                    
                    results.push({
                        type: item.type,
                        title: item.title,
                        subtitle: item.subtitle,
                        description: item.description,
                        action: actionType,
                        data: actionData,
                        relevance: this.calculateRelevance(query, searchText) + 80
                    });
                }
            }.bind(this));

            return results;
        },

        searchContacts: function(query) {
            var results = [];
            
            if (contacts && contacts.contact) {
                var contact = contacts.contact;
                
                // Use auto-generated metadata for contact keywords
                var contactKeywords = '';
                if (this.sectionMetadata && this.sectionMetadata.contacts) {
                    contactKeywords = this.sectionMetadata.contacts.keywords.join(' ') + ' ';
                    console.log('Using auto-generated contact keywords:', this.sectionMetadata.contacts.keywords);
                } else {
                    contactKeywords = 'contact information details '; // fallback
                    console.log('Using fallback contact keywords (metadata not found)');
                }
                
                var searchText = (
                    contactKeywords +
                    (contact.email || '') + ' ' +
                    (contact.skype || '') + ' ' +
                    (contact.mobile || '') + ' ' +
                    (contact.lab || '') + ' ' +
                    (contact.department || '')
                ).toLowerCase();
                
                console.log('Contact search - Query:', query, 'SearchText:', searchText.substring(0, 200));
                
                if (searchText.includes(query)) {
                    var displayText = [];
                    if (contact.email) displayText.push('Email: ' + contact.email);
                    if (contact.mobile) displayText.push('Mobile: ' + contact.mobile);
                    if (contact.lab) displayText.push('Location: ' + contact.lab);
                    
                    // Use auto-generated contact title
                    var contactTitle = 'Contact Information';
                    if (this.sectionMetadata && this.sectionMetadata.contacts) {
                        contactTitle = this.sectionMetadata.contacts.title;
                    }
                    
                    results.push({
                        type: 'contact',
                        title: contactTitle,
                        subtitle: contact.lab || 'Contact Details',
                        description: displayText.join(' • '),
                        action: 'navigate-section',
                        data: { section: 'contacts' },
                        relevance: this.calculateRelevance(query, searchText)
                    });
                }
            }
            
            return results;
        },

        searchShortCourses: function(query) {
            var results = [];
            
            if (shortCourses && shortCourses.courses && Array.isArray(shortCourses.courses)) {
                shortCourses.courses.forEach(function(course, index) {
                    var searchText = (
                        (course.title || '') + ' ' +
                        (course.platform || '') + ' ' +
                        (course.comments || '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'course',
                            title: course.title || 'Course',
                            subtitle: (course.platform || 'Certificate') + ' • ' + (course.comments || ''),
                            description: 'Professional certification and short course',
                            action: 'navigate-section',
                            data: { section: 'education' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }
            
            return results;
        },

        searchAcademicMaterial: function(query) {
            var results = [];
            
            if (academicMaterialData) {
                Object.keys(academicMaterialData).forEach(function(key) {
                    var section = academicMaterialData[key];
                    var searchText = (
                        (section.category || '') + ' ' +
                        (section.title || '') + ' ' +
                        (section.resources ? section.resources.join(' ') : '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'academic',
                            title: section.title || section.category,
                            subtitle: 'Academic Material • ' + section.category,
                            description: 'Resources: ' + (section.resources ? section.resources.slice(0, 3).join(', ') + (section.resources.length > 3 ? '...' : '') : ''),
                            action: 'navigate-url',
                            data: { url: 'Academic Material.html' },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }
            
            return results;
        },

        // Search rendered Academic section (categories, items, files)
        searchAcademicSection: function(query) {
            var results = [];
            if (!window._academicCategories || !Array.isArray(window._academicCategories)) return results;

            (window._academicCategories||[]).forEach(function(cat, cidx){
                var catKey = (cat.category||'').toString();
                (cat.items||[]).forEach(function(item, iidx){
                    var baseText = (catKey + ' ' + (item.name||'') + ' ' + ((item.children||[]).join(' '))).toLowerCase();
                    // include file titles/links
                    var files = item.files || [];
                    var filesText = files.map(function(f){ return (f.title||f.name||f.url||f.link||''); }).join(' ').toLowerCase();
                    var searchText = (baseText + ' ' + filesText);

                    if (searchText.includes(query)) {
                        // If files match specifically, push one result per matching file for direct open
                        files.forEach(function(f, fidx){
                            var fText = (f.title||f.name||f.url||f.link||'').toString().toLowerCase();
                            if (fText.includes(query) || baseText.includes(query)) {
                                results.push({
                                    type: 'academic',
                                    title: (f.title || item.name || catKey),
                                    subtitle: (item.name || '') + ' • ' + (cat.category || ''),
                                    description: (f.title ? 'File: ' + f.title : (f.url || f.link || 'File')),
                                    action: 'navigate-academic',
                                    data: { categoryIndex: cidx, itemIndex: iidx, fileIndex: fidx },
                                    relevance: this.calculateRelevance(query, searchText)
                                });
                            }
                        }.bind(this));

                        // Also add a result for the item itself (if not already added by file match)
                        results.push({
                            type: 'academic',
                            title: item.name || catKey,
                            subtitle: cat.category || '',
                            description: (item.children && item.children.length ? 'Has subtopics' : 'Academic item'),
                            action: 'navigate-academic',
                            data: { categoryIndex: cidx, itemIndex: iidx },
                            relevance: this.calculateRelevance(query, searchText)
                        });
                    }
                }.bind(this));
            }.bind(this));

            return results;
        },

        searchToolsResources: function(query) {
            var results = [];
            
            if (toolsResourcesData) {
                Object.keys(toolsResourcesData).forEach(function(key) {
                    var section = toolsResourcesData[key];
                    var searchText = (
                        (section.category || '') + ' ' +
                        (section.title || '') + ' ' +
                        (section.resources ? section.resources.join(' ') : '')
                    ).toLowerCase();
                    
                    if (searchText.includes(query)) {
                        results.push({
                            type: 'tool',
                            title: section.title || section.category,
                            subtitle: 'Tools & Resources • ' + section.category,
                            description: 'Tools: ' + (section.resources ? section.resources.slice(0, 3).join(', ') + (section.resources.length > 3 ? '...' : '') : ''),
                            action: 'navigate-url',
                            data: { url: 'Tools  More Resources.html' },
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
                'blog': '<i class="icofont icofont-pen-alt-4"></i>',
                'journal': '<i class="icofont icofont-book-alt"></i>',
                'conference': '<i class="icofont icofont-users-social"></i>',
                'skill': '<i class="icofont icofont-star"></i>',
                'honor': '<i class="icofont icofont-award"></i>',
                'page': '<i class="icofont icofont-page"></i>',
                'contact': '<i class="icofont icofont-phone"></i>',
                'course': '<i class="icofont icofont-certificate"></i>',
                'academic': '<i class="icofont icofont-book"></i>',
                'tool': '<i class="icofont icofont-tools-alt-2"></i>',
                'section': '<i class="icofont icofont-location-arrow"></i>'
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
                case 'navigate-academic':
                    this.navigateToAcademic(data);
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

        navigateToAcademic: function(data) {
            // Navigate to wsn.html and instruct it to open academic tab/item
            var params = [];
            if (typeof data.categoryIndex !== 'undefined') params.push('ac_cat=' + encodeURIComponent(data.categoryIndex));
            if (typeof data.itemIndex !== 'undefined') params.push('ac_item=' + encodeURIComponent(data.itemIndex));
            if (typeof data.fileIndex !== 'undefined') params.push('ac_file=' + encodeURIComponent(data.fileIndex));

            var query = params.length ? ('?' + params.join('&')) : '';
            var url = 'wsn.html' + query + '#section-academic';

            if (!window.location.href.includes('wsn.html')) {
                window.location.href = url;
                return;
            }

            // Already on wsn.html — expand academic UI
            this.expandAcademicSection(data);
        },

        expandAcademicSection: function(data) {
            // Wait a bit for academic renderer to have run
            setTimeout(function(){
                try {
                    var cats = window._academicCategories || [];
                    var cidx = parseInt(data.categoryIndex || 0, 10);
                    var iidx = parseInt(data.itemIndex || 0, 10);

                    // Map category indices to tab radio IDs: rely on order used in academic-render
                    var cat = cats[cidx];
                    if (!cat) return;

                    // Determine which radio to check by matching normalized category name
                    var name = (cat.category||'').toLowerCase();
                    var radioMap = {
                        'articles': 'ktabA1', 'books': 'ktabA2', 'lectures': 'ktabA3',
                        'patents': 'ktabA4', 'presentations': 'ktabA5', 'published_issues': 'ktabA6', 'thesis': 'ktabA7'
                    };
                    var norm = name.replace(/[^a-z0-9]+/g, '_');
                    var radioId = radioMap[norm] || 'ktabA1';
                    var radio = document.getElementById(radioId);
                    if (radio) radio.checked = true;

                    // Trigger rendering of active tab
                    setTimeout(function(){
                        // Locate items container
                        var container = document.querySelector('#section-academic [id$="ItemsDiv"]');
                        if (!container) return;
                        // Ensure active tab content rendered
                        if (typeof container.dataset !== 'undefined' && container.dataset.rendered !== '1') {
                            // try to call renderActiveAcademicTab if available on page
                            if (typeof renderActiveAcademicTab === 'function') renderActiveAcademicTab();
                        }

                        // Expand the requested item
                        var itemId = container ? (container.id + '-item-' + iidx) : null;
                        if (itemId) {
                            var itemEl = document.getElementById(itemId);
                            if (itemEl && itemEl.style.display === 'none') itemEl.style.display = 'block';
                            // If a file index provided, open that file's embed
                            if (typeof data.fileIndex !== 'undefined') {
                                var embedId = itemId + '-file-' + data.fileIndex;
                                var embed = document.getElementById(embedId);
                                if (embed) {
                                    var iframe = embed.querySelector('iframe');
                                    if (iframe && !iframe.src) {
                                        var ds = iframe.getAttribute('data-src') || iframe.dataset.src;
                                        if (ds) iframe.src = ds;
                                    }
                                    embed.style.display = 'block';
                                }
                            }
                            // Scroll into view and highlight briefly
                            setTimeout(function(){
                                var elToScroll = document.getElementById(itemId);
                                if (elToScroll) {
                                    elToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    elToScroll.style.backgroundColor = '#fff3cd';
                                    setTimeout(function(){ elToScroll.style.transition='background-color 1s'; elToScroll.style.backgroundColor=''; }, 1000);
                                }
                            }, 200);
                        }
                    }, 200);
                } catch(e) { console.warn('expandAcademicSection error', e); }
            }, 300);
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
