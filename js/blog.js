/**
 * Binary Thoughts - Blog Management
 */

(function() {
    'use strict';

    var BlogManager = {
        posts: [],
        filteredPosts: [],
        currentPage: 1,
        postsPerPage: 6,
        currentTag: 'all',
        searchQuery: '',

        init: function() {
            this.posts = blogPosts.sort((a, b) => {
                // Featured posts first, then by date
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.date) - new Date(a.date);
            });
            
            this.filteredPosts = [...this.posts];
            this.setupEventListeners();
            this.generateTags();
            this.renderPosts();
            this.updateBlogCount();
        },

        setupEventListeners: function() {
            var self = this;

            // Tag filtering
            document.getElementById('blog-tags').addEventListener('click', function(e) {
                if (e.target.classList.contains('blog-tag')) {
                    document.querySelectorAll('.blog-tag').forEach(function(tag) {
                        tag.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    self.currentTag = e.target.dataset.tag;
                    self.currentPage = 1;
                    self.filterPosts();
                }
            });

            // Search
            document.getElementById('blog-search').addEventListener('input', function(e) {
                self.searchQuery = e.target.value.toLowerCase();
                self.currentPage = 1;
                self.filterPosts();
            });

            // Pagination
            document.getElementById('prev-page').addEventListener('click', function() {
                if (self.currentPage > 1) {
                    self.currentPage--;
                    self.renderPosts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            document.getElementById('next-page').addEventListener('click', function() {
                var totalPages = Math.ceil(self.filteredPosts.length / self.postsPerPage);
                if (self.currentPage < totalPages) {
                    self.currentPage++;
                    self.renderPosts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        },

        generateTags: function() {
            var tagsSet = new Set();
            this.posts.forEach(function(post) {
                post.tags.forEach(function(tag) {
                    tagsSet.add(tag);
                });
            });

            var tagsContainer = document.getElementById('blog-tags');
            var tagsArray = Array.from(tagsSet).sort();
            
            tagsArray.forEach(function(tag) {
                var button = document.createElement('button');
                button.className = 'blog-tag';
                button.dataset.tag = tag;
                button.textContent = tag;
                tagsContainer.appendChild(button);
            });
        },

        filterPosts: function() {
            var self = this;
            this.filteredPosts = this.posts.filter(function(post) {
                var matchesTag = self.currentTag === 'all' || post.tags.includes(self.currentTag);
                var matchesSearch = self.searchQuery === '' || 
                    post.title.toLowerCase().includes(self.searchQuery) ||
                    post.summary.toLowerCase().includes(self.searchQuery) ||
                    post.tags.some(function(tag) { return tag.toLowerCase().includes(self.searchQuery); });
                
                return matchesTag && matchesSearch;
            });

            this.renderPosts();
        },

        renderPosts: function() {
            var self = this;
            var grid = document.getElementById('blog-grid');
            var empty = document.getElementById('blog-empty');
            
            grid.innerHTML = '';

            if (this.filteredPosts.length === 0) {
                grid.style.display = 'none';
                empty.style.display = 'block';
                document.getElementById('blog-pagination').style.display = 'none';
                return;
            }

            grid.style.display = 'grid';
            empty.style.display = 'none';

            var start = (this.currentPage - 1) * this.postsPerPage;
            var end = start + this.postsPerPage;
            var postsToShow = this.filteredPosts.slice(start, end);

            postsToShow.forEach(function(post) {
                var card = self.createPostCard(post);
                grid.appendChild(card);
            });

            this.renderPagination();
        },

        createPostCard: function(post) {
            var card = document.createElement('div');
            card.className = 'blog-card' + (post.featured ? ' featured' : '');
            
            var tagsHtml = post.tags.map(function(tag) {
                return '<span class="blog-card-tag">' + tag + '</span>';
            }).join('');

            card.innerHTML = `
                <div class="blog-card-header">
                    ${post.featured ? '<div class="blog-card-featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                    <div class="blog-card-tags">${tagsHtml}</div>
                </div>
                <div class="blog-card-body">
                    <h3 class="blog-card-title">${this.escapeHtml(post.title)}</h3>
                    <p class="blog-card-summary">${this.escapeHtml(post.summary)}</p>
                </div>
                <div class="blog-card-footer">
                    <div class="blog-card-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
                    </div>
                    <button class="blog-card-btn" data-post-id="${post.id}">
                        Read More <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;

            card.querySelector('.blog-card-btn').addEventListener('click', function() {
                BlogManager.openPost(post.id);
            });

            return card;
        },

        openPost: function(postId) {
            var post = this.posts.find(function(p) { return p.id === postId; });
            if (!post) return;

            var modal = document.createElement('div');
            modal.className = 'blog-modal';
            modal.innerHTML = `
                <div class="blog-modal-content">
                    <button class="blog-modal-close"><i class="fas fa-times"></i></button>
                    <article class="blog-post">
                        <header class="blog-post-header">
                            ${post.featured ? '<div class="blog-post-featured"><i class="fas fa-star"></i> Featured Post</div>' : ''}
                            <h1 class="blog-post-title">${this.escapeHtml(post.title)}</h1>
                            <div class="blog-post-meta">
                                <span><i class="fas fa-user"></i> ${this.escapeHtml(post.author)}</span>
                                <span><i class="far fa-calendar"></i> ${post.date}</span>
                                <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
                            </div>
                            <div class="blog-post-tags">
                                ${post.tags.map(function(tag) {
                                    return '<span class="blog-post-tag">' + tag + '</span>';
                                }).join('')}
                            </div>
                        </header>
                        <div class="blog-post-content">
                            ${post.content}
                        </div>
                        <footer class="blog-post-footer">
                            <div class="blog-post-share">
                                <span>Share this post:</span>
                                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" title="Share on Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" title="Share on LinkedIn">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}" title="Share via Email">
                                    <i class="fas fa-envelope"></i>
                                </a>
                            </div>
                        </footer>
                        <div class="blog-comments">
                            <h3><i class="fas fa-comments"></i> 🌟 Bit-to-Bit Dialogue</h3>
                            <div class="giscus"></div>
                        </div>
                    </article>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(function() { modal.classList.add('active'); }, 10);

            // Initialize Giscus for this post
            this.loadGiscus(post);

            modal.querySelector('.blog-modal-close').addEventListener('click', function() {
                modal.classList.remove('active');
                setTimeout(function() { document.body.removeChild(modal); }, 300);
            });

            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    setTimeout(function() { document.body.removeChild(modal); }, 300);
                }
            });
        },

        renderPagination: function() {
            var totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
            
            if (totalPages <= 1) {
                document.getElementById('blog-pagination').style.display = 'none';
                return;
            }

            document.getElementById('blog-pagination').style.display = 'flex';

            var prevBtn = document.getElementById('prev-page');
            var nextBtn = document.getElementById('next-page');
            var pageNumbers = document.getElementById('page-numbers');

            prevBtn.disabled = this.currentPage === 1;
            nextBtn.disabled = this.currentPage === totalPages;

            pageNumbers.innerHTML = '';
            for (var i = 1; i <= totalPages; i++) {
                var pageBtn = document.createElement('button');
                pageBtn.className = 'blog-page-num' + (i === this.currentPage ? ' active' : '');
                pageBtn.textContent = i;
                pageBtn.dataset.page = i;
                
                (function(page) {
                    pageBtn.addEventListener('click', function() {
                        BlogManager.currentPage = page;
                        BlogManager.renderPosts();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                })(i);

                pageNumbers.appendChild(pageBtn);
            }
        },

        updateBlogCount: function() {
            document.getElementById('total-blogs').textContent = this.posts.length;
        },

        escapeHtml: function(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        loadGiscus: function(post) {
            // Remove existing Giscus if present
            var existingGiscus = document.querySelector('.giscus');
            if (existingGiscus) {
                existingGiscus.innerHTML = '';
            }

            // Create Giscus script
            var script = document.createElement('script');
            script.src = 'https://giscus.app/client.js';
            script.setAttribute('data-repo', 'KashifInayat/kashifinayat.github.io');
            script.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkyNjg4MTQ0NzM=');
            script.setAttribute('data-category', 'Show and tell');
            script.setAttribute('data-category-id', 'DIC_kwDOEAXIic4CzcvH');
            script.setAttribute('data-mapping', 'specific');
            script.setAttribute('data-term', 'blog-post-' + post.id);
            script.setAttribute('data-strict', '0');
            script.setAttribute('data-reactions-enabled', '1');
            script.setAttribute('data-emit-metadata', '0');
            script.setAttribute('data-input-position', 'top');
            script.setAttribute('data-theme', 'light');
            script.setAttribute('data-lang', 'en');
            script.setAttribute('data-loading', 'lazy');
            script.crossOrigin = 'anonymous';
            script.async = true;

            // Append to comments section
            var commentsDiv = document.querySelector('.giscus');
            if (commentsDiv) {
                commentsDiv.appendChild(script);
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            BlogManager.init();
        });
    } else {
        BlogManager.init();
    }

})();
