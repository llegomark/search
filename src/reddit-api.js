const searchPosts = (query, count, sortBy) => {
  // Search posts with specified query with max results limited to count
  // and sorted by sortBy

  const baseURL = `https://www.reddit.com`
  const posts = []
  return fetch(
    `${baseURL}/search.json?q=${query}&sort=${sortBy}&limit=${count}`
  )
    .then((data) => data.json())
    .then((json) => {
      json.data.children.forEach(({ data }) => {
        // Accept only image extensions
        data.url = /\.png$|\.jpg$|\.jpeg$|\.webp$/.test(data.url)
          ? data.url
          : null

        const post = {
          title: data.title,
          img_url: data.url,
          url: `${baseURL}${data.permalink}`,
          text: data.selftext,
          date: new Date(data.created_utc * 1000), // created_utc is in seconds
          subreddit: data.subreddit_name_prefixed,
        }
        posts.push(post)
      })

      return posts
    })
}

export default searchPosts
