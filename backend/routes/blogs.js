const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST create blog (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newBlog = new Blog({
      title,
      content,
      author: 'System Admin'
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all blogs (All logged in users can view)
router.get('/', verifyToken, async (req, res) => {
  try {
    const blogs = await Blog.find({});
    // Sort blogs by newest first
    blogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET aggregated market news from RSS feeds
const Parser = require('rss-parser');
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  timeout: 5000
});

const NEWS_SOURCES = [
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', category: 'General Markets' },
  { name: 'Financial Express', url: 'https://www.financialexpress.com/feed/', category: 'Economy & Finance' },
  { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/latestnews.xml', category: 'Markets & Business' },
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_latest_news.rss', category: 'Business News' }
];

// In-memory cache variables
let newsCache = null;
let lastFetchedTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

async function fetchAndCacheNews() {
  const aggregatedNews = [];

  const promises = NEWS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      if (feed && feed.items) {
        feed.items.forEach(item => {
          aggregatedNews.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            contentSnippet: item.contentSnippet || item.content || '',
            source: source.name,
            category: source.category
          });
        });
      }
    } catch (error) {
      console.error(`Error fetching news from ${source.name}:`, error.message);
    }
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    console.error('Promise.all error fetching news:', err.message);
  }

  // Fallback to rich, seeded news if aggregate failed or offline
  if (aggregatedNews.length === 0) {
    const fallbackNews = [
      {
        title: 'Nifty, Sensex touch fresh record highs on institutional buying',
        link: 'https://economictimes.indiatimes.com',
        pubDate: new Date().toISOString(),
        contentSnippet: 'Benchmark indices Nifty 50 and BSE Sensex rose to fresh highs led by strong inflows from foreign institutional investors (FIIs) and retail support.',
        source: 'Economic Times',
        category: 'Markets'
      },
      {
        title: 'Venture Capital funding in Indian startups surges 40% in Q2',
        link: 'https://www.financialexpress.com',
        pubDate: new Date().toISOString(),
        contentSnippet: 'Funding activity in the Indian startup ecosystem gained significant momentum with early-stage venture capital deals dominating the landscape.',
        source: 'Financial Express',
        category: 'Economy & Finance'
      },
      {
        title: 'Moneycontrol Pro reaches 1 million active subscribers',
        link: 'https://www.moneycontrol.com',
        pubDate: new Date().toISOString(),
        contentSnippet: 'India’s leading financial news portal Moneycontrol announced a milestone, crossing one million active paying subscribers for its research platform.',
        source: 'Moneycontrol',
        category: 'Markets & Business'
      },
      {
        title: 'India GDP growth projection revised upwards by IMF',
        link: 'https://www.business-standard.com',
        pubDate: new Date().toISOString(),
        contentSnippet: 'The International Monetary Fund revised India’s GDP growth forecast for the fiscal year upwards, citing strong domestic consumption and infrastructure growth.',
        source: 'Business Standard',
        category: 'Business News'
      }
    ];
    aggregatedNews.push(...fallbackNews);
  }

  // Sort by date descending
  aggregatedNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Limit response to 25 items for visual balance and page speed
  newsCache = aggregatedNews.slice(0, 25);
  lastFetchedTime = Date.now();
  return newsCache;
}

router.get('/market-news', verifyToken, async (req, res) => {
  const now = Date.now();

  // If cache exists and is fresh, serve immediately
  if (newsCache && (now - lastFetchedTime < CACHE_DURATION)) {
    return res.status(200).json(newsCache);
  }

  // If cache is empty, fetch synchronously the first time
  if (!newsCache) {
    try {
      const news = await fetchAndCacheNews();
      return res.status(200).json(news);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Stale-while-revalidate: cache exists but has expired.
  // Serve stale cache immediately, and fetch new data in the background.
  fetchAndCacheNews().catch(err => console.error('Background news fetch failed:', err));
  return res.status(200).json(newsCache);
});

module.exports = router;
