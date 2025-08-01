const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to clean text
const cleanText = (text) => {
  return text ? text.trim().replace(/\s+/g, ' ') : '';
};

// Helper function to resolve relative URLs
const resolveUrl = (baseUrl, relativeUrl) => {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return relativeUrl;
  }
};

// Generic scraping function
const scrapeWebsite = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const scrapedData = [];

    // Common selectors for different types of content
    const selectors = {
      // E-commerce products
      products: [
        '.product-item',
        '.product-card',
        '.product',
        '[data-product]',
        '.item'
      ],
      // Articles/Blog posts
      articles: [
        'article',
        '.post',
        '.article',
        '.blog-post',
        '.news-item'
      ],
      // General content containers
      containers: [
        '.card',
        '.box',
        '.item',
        '.entry',
        '.content-item'
      ]
    };

    // Try different selector strategies
    let elements = $();
    
    // First try product selectors
    for (const selector of selectors.products) {
      elements = $(selector);
      if (elements.length > 0) break;
    }

    // If no products found, try article selectors
    if (elements.length === 0) {
      for (const selector of selectors.articles) {
        elements = $(selector);
        if (elements.length > 0) break;
      }
    }

    // If still nothing, try general containers
    if (elements.length === 0) {
      for (const selector of selectors.containers) {
        elements = $(selector);
        if (elements.length > 0) break;
      }
    }

    // If still no structured content, try to extract from common elements
    if (elements.length === 0) {
      // Look for lists
      const listItems = $('li');
      if (listItems.length > 3) {
        elements = listItems;
      } else {
        // Fallback to divs with some content
        elements = $('div').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 20 && text.length < 500;
        });
      }
    }

    elements.each((index, element) => {
      const $el = $(element);
      
      // Extract various data points
      const item = {
        id: `item-${index + 1}`,
        title: '',
        description: '',
        url: '',
        image: '',
        price: '',
        category: '',
        date: '',
        author: ''
      };

      // Title extraction
      const titleSelectors = ['h1', 'h2', 'h3', '.title', '.name', '.product-name', '.article-title'];
      for (const selector of titleSelectors) {
        const titleEl = $el.find(selector).first();
        if (titleEl.length && titleEl.text().trim()) {
          item.title = cleanText(titleEl.text());
          break;
        }
      }

      // If no title found in children, use element's own text (first line)
      if (!item.title) {
        const text = cleanText($el.text());
        item.title = text.split('\n')[0].substring(0, 100);
      }

      // Description extraction
      const descSelectors = ['.description', '.summary', '.excerpt', 'p', '.content'];
      for (const selector of descSelectors) {
        const descEl = $el.find(selector).first();
        if (descEl.length && descEl.text().trim()) {
          item.description = cleanText(descEl.text()).substring(0, 200);
          break;
        }
      }

      // URL extraction
      const linkEl = $el.find('a').first();
      if (linkEl.length) {
        const href = linkEl.attr('href');
        if (href) {
          item.url = resolveUrl(url, href);
        }
      }

      // Image extraction
      const imgEl = $el.find('img').first();
      if (imgEl.length) {
        const src = imgEl.attr('src') || imgEl.attr('data-src');
        if (src) {
          item.image = resolveUrl(url, src);
        }
      }

      // Price extraction
      const priceSelectors = ['.price', '.cost', '.amount', '[class*="price"]'];
      for (const selector of priceSelectors) {
        const priceEl = $el.find(selector).first();
        if (priceEl.length && priceEl.text().trim()) {
          item.price = cleanText(priceEl.text());
          break;
        }
      }

      // Category extraction
      const categorySelectors = ['.category', '.tag', '.label', '.type'];
      for (const selector of categorySelectors) {
        const catEl = $el.find(selector).first();
        if (catEl.length && catEl.text().trim()) {
          item.category = cleanText(catEl.text());
          break;
        }
      }

      // Date extraction
      const dateSelectors = ['.date', '.time', 'time', '[datetime]'];
      for (const selector of dateSelectors) {
        const dateEl = $el.find(selector).first();
        if (dateEl.length) {
          const dateText = dateEl.text().trim() || dateEl.attr('datetime');
          if (dateText) {
            item.date = cleanText(dateText);
            break;
          }
        }
      }

      // Author extraction
      const authorSelectors = ['.author', '.by', '.writer', '.creator'];
      for (const selector of authorSelectors) {
        const authorEl = $el.find(selector).first();
        if (authorEl.length && authorEl.text().trim()) {
          item.author = cleanText(authorEl.text());
          break;
        }
      }

      // Only add items that have at least a title
      if (item.title && item.title.length > 3) {
        scrapedData.push(item);
      }
    });

    return scrapedData;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    console.log(`Scraping URL: ${url}`);
    const data = await scrapeWebsite(url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url,
        totalItems: data.length,
        data,
        scrapedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};