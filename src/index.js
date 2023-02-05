import * as dayjs from 'dayjs'
import searchPosts from './reddit-api'
import * as relativeTime from 'dayjs/plugin/relativeTime'

// Use relativeTime plugin
dayjs.extend(relativeTime)

const searchForm = document.getElementById('search-form')
const searchContainer = document.getElementById('search-container')
const searchInput = document.getElementById('search-input')

function showEmptySearchAlert() {
  // Alert if query is empty
  let alertDiv = document.getElementById('search-empty-alert')

  // Do nothing is alert message is already displayed
  if (alertDiv !== null) {
    return false
  }

  alertDiv = document.createElement('div')
  alertDiv.textContent = 'Please enter a search term'
  alertDiv.className = 'alert alert-warning'
  alertDiv.id = 'search-empty-alert'
  searchContainer.insertBefore(alertDiv, searchForm)

  // Remove alert after 2.5 seconds
  setTimeout(() => alertDiv.remove(), 2500)
}

function clearPosts() {
  // Clear existing posts
  const postsDiv = document.getElementById('posts')
  if (postsDiv !== null) {
    postsDiv.remove()
  }
}

function showPosts(posts) {
  // Show all posts in a grid
  const containerDiv = document.createElement('div')
  containerDiv.id = 'posts'
  containerDiv.className = 'row row-cols-1 row-cols-md-3 g-4'

  // Append container div to document
  document.getElementById('results').appendChild(containerDiv)

  const redditLogoUrl =
    'https://www.redditinc.com/assets/images/site/redditinc_external_graphic.png'

  // Add card to containerDiv for each post
  posts.forEach((post, index) => {
    const postDiv = document.createElement('div')

    postDiv.className = 'col'
    postDiv.innerHTML = `
      <div class="card h-100">
        <img src="${
          post.img_url || redditLogoUrl
        }" class="card-img-top" alt="..." style="height: 200px; object-fit: cover">
        <div class="card-body">
          <h5 class="card-title" id="post-title-${index}"></h5>
          <p class="card-text" id="post-text-${index}"></p>
          <a href="${post.url}" class="stretched-link"></a>
        </div>
        <div class="card-footer d-flex justify-content-between">          
          <small class="text-muted">${dayjs(post.date).fromNow()}</small>
          <small class="text-muted ms-1">${post.subreddit}</small>
        </div>
        
      </div>
    `

    containerDiv.appendChild(postDiv)

    // Add to textContent to prevent XSS
    document.getElementById(`post-title-${index}`).textContent = post.title
    document.getElementById(`post-text-${index}`).textContent = `${truncText(
      post.text,
      200
    )}`
  })
}

searchForm.addEventListener('submit', (e) => {
  // Get form details and submit

  e.preventDefault()
  // Empty search query
  if (searchInput.value === '') {
    return showEmptySearchAlert()
  }

  // Get values from form.
  const sortBy = document.querySelector("input[name='sortby']:checked").value
  const limit = document.getElementById('search-limit').value

  // Search and show posts
  searchPosts(searchInput.value, limit, sortBy).then((posts) => {
    clearPosts() // Clear existing posts
    showPosts(posts)
  })
})

function truncText(input, cap) {
  // Truncate text without cutting words
  // Credits https://github.com/bevacqua/trunc-text
  // License MIT
  const delimiter = '…'
  const limit = Number(cap)
  if (isNaN(limit)) {
    return delimiter
  }
  if (input.length <= limit) {
    return input
  }
  const result = input.substr(0, limit)
  const i = result.lastIndexOf(' ')
  if (i === -1) {
    // assume that we'd otherwise slash a word
    return delimiter
  }
  // truncate up to the last space
  return result.substr(0, i) + ' ' + delimiter
}
