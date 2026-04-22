async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    try {
        const response = await fetch('/posts/posts.json');
        const data = await response.json();

        // Sort posts by date in descending order
        const sortedPosts = data.posts.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        // Build each post via DOM nodes (no innerHTML on user-supplied data)
        postsList.replaceChildren();
        sortedPosts.forEach(post => {
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-');

            const article = document.createElement('article');
            article.className = 'post-entry';

            const time = document.createElement('time');
            time.dateTime = post.date;
            time.textContent = formattedDate;

            const link = document.createElement('a');
            link.href = `/posts/${encodeURIComponent(post.slug)}.html`;
            link.textContent = post.title;

            article.append(time, link);
            postsList.appendChild(article);
        });
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Unable to load posts. Please try again later.';
        postsList.replaceChildren(errorDiv);
    }
}

// Load posts when the page loads
document.addEventListener('DOMContentLoaded', loadPosts);
