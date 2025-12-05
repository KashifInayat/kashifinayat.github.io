/**
 * Binary Thoughts - Blog Data
 * 
 * HOW TO ADD A NEW BLOG POST:
 * ===========================
 * 
 * 1. Copy the blog post template below
 * 2. Fill in your blog details:
 *    - id: Unique number (increment from last post)
 *    - title: Your blog post title
 *    - summary: Brief description (2-3 sentences)
 *    - content: Full blog content (supports HTML formatting)
 *    - date: Publication date (format: "Month DD, YYYY")
 *    - author: Your name
 *    - tags: Array of relevant tags (e.g., ["VLSI", "ML"])
 *    - readTime: Estimated reading time in minutes
 *    - featured: true/false (featured posts appear at top)
 * 
 * 3. Add your new post to the blogPosts array below
 * 
 * FORMATTING TIPS:
 * ================
 * Basic Formatting:
 * - Use <p> tags for paragraphs
 * - Use <h3> or <h4> for section headings
 * - Use <code> for inline code: <code>int x = 42;</code>
 * - Use <pre><code> for code blocks
 * - Use <ul><li> for bullet lists
 * - Use <strong> for bold text
 * - Use <em> for italic text
 * - Use <span class="highlight">text</span> for highlighted text
 * 
 * Images:
 * - Add images: <img src="img/your-image.jpg" alt="Description">
 * - Add caption: <p class="img-caption">Your caption here</p>
 * - Image grid: <div class="img-grid"><img src="..."><img src="..."></div>
 * 
 * Colored Callout Boxes:
 * - Info box: <div class="callout callout-info"><h4>Info</h4><p>Content</p></div>
 * - Success: <div class="callout callout-success"><h4>Success</h4><p>Content</p></div>
 * - Warning: <div class="callout callout-warning"><h4>Warning</h4><p>Content</p></div>
 * - Danger: <div class="callout callout-danger"><h4>Important</h4><p>Content</p></div>
 * - Note: <div class="callout callout-note"><h4>Note</h4><p>Content</p></div>
 * 
 * Quotes:
 * - Use blockquote: <blockquote><p>Quote text here</p></blockquote>
 * 
 * Comments:
 * - Comments powered by Giscus (GitHub Discussions)
 * - 100% Free, no ads, open-source
 * - Visitors comment using GitHub accounts
 * - You can reply directly on GitHub Discussions
 * - See setup instructions below
 * 
 */

var blogPosts = [
    {
        id: 1,
        title: "Where Bits Meet Life: A Journey Beyond Silicon",
        summary: "Welcome to Binary Thoughts - where technology meets humanity. This isn't just about circuits and code; it's about the profound connections between silicon and life, between logic gates and human experiences, between the art of engineering and the art of living.",
        content: `
            <p>Welcome to <strong>Binary Thoughts</strong> - a space where the digital and the human converge, where technical precision meets philosophical inquiry, where silicon meets soul.</p>
            
            <div class="callout callout-note">
                <h4><i class="fas fa-lightbulb"></i> The Philosophy Behind This Blog</h4>
                <p><em>"Where bits meet life insights — exploring humanity, computers, ICs: the art of silicon and life."</em></p>
                <p>This isn't your typical tech blog. It's a reflection on how our creations mirror our humanity.</p>
            </div>

            <h3>Beyond the Binary</h3>
            <p>In computer science, we're taught to think in binary - ones and zeros, true and false, on and off. But life rarely fits into such neat categories. The most profound insights emerge at the <span class="highlight">intersection of technology and humanity</span>.</p>

            <p>When I design a chip, I'm not just arranging transistors on silicon. I'm encoding human intentions into matter. Every logic gate carries a piece of human thought. Every circuit pathway reflects a decision, a priority, a vision of how things should work.</p>

            <h3>What You'll Find Here</h3>
            <p>This blog explores the convergence of multiple worlds:</p>

            <h4>🔬 The Technical Realm</h4>
            <ul>
                <li><strong>Computer Architecture:</strong> How we organize complexity into coherent systems</li>
                <li><strong>VLSI Design:</strong> The art of turning abstract ideas into physical reality</li>
                <li><strong>Machine Learning Accelerators:</strong> Teaching silicon to learn, to recognize patterns, to "think"</li>
                <li><strong>Integrated Circuits:</strong> Billions of components working in perfect harmony</li>
            </ul>

            <h4>🧠 The Human Element</h4>
            <ul>
                <li><strong>Design Philosophy:</strong> Why we build what we build</li>
                <li><strong>Research Journeys:</strong> The struggles, breakthroughs, and lessons from academia and industry</li>
                <li><strong>Life in Tech:</strong> Balancing innovation with humanity</li>
                <li><strong>Career Reflections:</strong> From classrooms to Qualcomm, from theory to practice</li>
            </ul>

            <h4>💡 The Synthesis</h4>
            <ul>
                <li>How constraints in chip design mirror constraints in life</li>
                <li>What debugging code teaches us about solving problems</li>
                <li>The parallels between system architecture and life organization</li>
                <li>Finding elegance in both equations and existence</li>
            </ul>

            <blockquote>
                <p>"We shape our tools, and thereafter our tools shape us." — Marshall McLuhan</p>
            </blockquote>

            <h3>The Art of Silicon and Life</h3>
            <p>There's an artistry to engineering that goes beyond functionality. A well-designed circuit has rhythm, balance, elegance - much like a well-lived life. Both require:</p>

            <div class="callout callout-info">
                <h4>Shared Principles</h4>
                <ul>
                    <li><strong>Efficiency:</strong> Doing more with less, whether power budgets or time</li>
                    <li><strong>Resilience:</strong> Handling failures gracefully, continuing despite errors</li>
                    <li><strong>Optimization:</strong> Finding the best path among countless possibilities</li>
                    <li><strong>Trade-offs:</strong> Balancing speed vs. power, work vs. life, precision vs. pragmatism</li>
                </ul>
            </div>

            <h3>My Journey</h3>
            <p>From the academic halls of research to the fast-paced world of industry at Qualcomm and Barcelona Supercomputing Center, I've learned that the best innovations come from understanding <em>both</em> the technical and the human sides of engineering.</p>

            <p>This blog is my attempt to share those insights - not just the "what" and "how" of technology, but the <span class="highlight">"why" and "so what?"</span></p>

            <div class="callout callout-success">
                <h4><i class="fas fa-compass"></i> What to Expect</h4>
                <p>You'll find deep technical dives alongside philosophical musings. Code snippets next to life lessons. Circuit diagrams paired with reflections on purpose and meaning. Because at the end of the day, we're not just building chips - we're building the future, one transistor and one choice at a time.</p>
            </div>

            <h3>Join the Conversation</h3>
            <p>Whether you're a fellow engineer, a curious student, or someone interested in how technology shapes our world, I invite you to join this exploration. Comment, question, challenge, and share your own insights.</p>

            <p>Because the most valuable insights emerge not from isolation, but from connection - whether it's transistors on a die or minds in discussion.</p>

            <p><em>Welcome to Binary Thoughts. Where bits meet life.</em></p>

            <p><strong>- Kashif Inayat</strong><br>
            <em>December 2024</em></p>
        `,
        date: "December 5, 2024",
        author: "Kashif Inayat",
        tags: ["Philosophy", "Introduction", "Life", "Silicon", "Humanity"],
        readTime: 5,
        featured: true
    },

    // ============================================
    // ADD YOUR NEW BLOG POSTS BELOW THIS LINE
    // ============================================
    
    /* TEMPLATE - COPY THIS TO ADD A NEW POST:
    
    {
        id: 2,  // Increment this number
        title: "Your Blog Title Here",
        summary: "A brief 2-3 sentence summary that appears on the blog grid. Make it engaging and informative.",
        content: `
            <p>Your full blog post content goes here. You can use HTML formatting.</p>
            
            <h3>Adding Images</h3>
            <img src="img/your-image.jpg" alt="Description of image">
            <p class="img-caption">Caption for your image (optional)</p>
            
            <h3>Using Colored Callout Boxes</h3>
            <div class="callout callout-info">
                <h4><i class="fas fa-info-circle"></i> Information</h4>
                <p>Use this for informational notes. Perfect for additional context!</p>
            </div>

            <div class="callout callout-success">
                <h4><i class="fas fa-check-circle"></i> Success Tip</h4>
                <p>Highlight successful approaches or best practices.</p>
            </div>

            <div class="callout callout-warning">
                <h4><i class="fas fa-exclamation-triangle"></i> Warning</h4>
                <p>Use this to warn about common pitfalls or things to watch out for.</p>
            </div>

            <div class="callout callout-danger">
                <h4><i class="fas fa-times-circle"></i> Critical Note</h4>
                <p>For critical information that readers must pay attention to.</p>
            </div>

            <div class="callout callout-note">
                <h4><i class="fas fa-sticky-note"></i> Quick Note</h4>
                <p>Personal notes or side observations.</p>
            </div>

            <h3>Code and Quotes</h3>
            <p>Inline code looks like this: <code>int result = compute();</code></p>
            
            <p>Code blocks:</p>
            <pre><code>def example_function():
    # Your code here
    return "Binary Thoughts!"</code></pre>

            <blockquote>
                <p>"Quotes look elegant and professional. Use them for citations or memorable statements."</p>
            </blockquote>

            <h3>Highlighting Important Text</h3>
            <p>You can <span class="highlight">highlight important phrases</span> to draw attention.</p>

            <h3>Multiple Images Grid</h3>
            <div class="img-grid">
                <img src="img/image1.jpg" alt="Image 1">
                <img src="img/image2.jpg" alt="Image 2">
                <img src="img/image3.jpg" alt="Image 3">
            </div>

            <h4>Comments</h4>
            <p>Scroll down to join the discussion! Anyone can comment and I'll reply.</p>

            <p><em>Happy blogging!</em></p>
        `,
        date: "Month DD, YYYY",  // e.g., "January 15, 2025"
        author: "Kashif Inayat",
        tags: ["Tag1", "Tag2", "Tag3"],  // Choose relevant tags
        readTime: 5,  // Estimated minutes to read
        featured: false  // Set to true to feature this post
    },
    
    */

    // Add more blog posts here...
    
];

// Available tags (will be auto-generated from posts, but you can reference these)
// Common tags: "VLSI", "Computer Architecture", "Machine Learning", "Systolic Arrays", 
//              "FPGA", "ASIC", "Research", "Industry", "Tutorial", "Opinion"
