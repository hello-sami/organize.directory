async function loadPosts() {
    try {
        const response = await fetch('/posts/posts.json');
        const data = await response.json();
        const postsList = document.getElementById('posts-list');
        
        // Sort posts by date in descending order
        const sortedPosts = data.posts.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        // Create HTML for each post
        const postsHTML = sortedPosts.map(post => {
            // Format date as DD-MM-YYYY
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-');

            return `
                <article class="post-entry">
                    <time datetime="${post.date}">${formattedDate}</time>
                    <a href="/posts/${post.slug}.html">${post.title}</a>
                </article>
            `;
        }).join('');

        postsList.innerHTML = postsHTML;
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-list').innerHTML = `
            <div class="error-message">
                Unable to load posts. Please try again later.
            </div>
        `;
    }
}

// Load posts when the page loads
document.addEventListener('DOMContentLoaded', loadPosts); 