import axios from 'axios';
import { load } from 'cheerio';

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
const scrapeWebsite = async (url, customSelectors = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = load(response.data);
    const scrapedData = [];

    // Check if this is sports mode (has sports-specific selectors)
    const isSportsMode = customSelectors.homeTeam || customSelectors.awayTeam || customSelectors.score;

    // Use custom selectors if provided, otherwise use default strategy
    let elements = $();

    if (customSelectors.container && customSelectors.container.trim()) {
      // Use custom container selector
      elements = $(customSelectors.container);
      console.log(`Using custom container selector: ${customSelectors.container}, found ${elements.length} elements`);
    } else {
      // Default selector strategy
      const selectors = {
        // Sports-specific selectors
        sports: [
          'div',
          'article',
          'section',
          '.container'
        ],
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

      // If sports mode, try sports selectors first
      if (isSportsMode) {
        for (const selector of selectors.sports) {
          elements = $(selector);
          if (elements.length > 0) break;
        }
      }

      // First try product selectors
      if (elements.length === 0) {
        for (const selector of selectors.products) {
          elements = $(selector);
          if (elements.length > 0) break;
        }
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
    }

    elements.each((index, element) => {
      const $el = $(element);
      
      // Extract various data points
      const item = {
        id: `item-${index + 1}`,
        title: '', // Will be league name for sports
        description: '', // Will be team names for sports
        url: '',
        image: '',
        price: '',
        category: '',
        date: '',
        author: '',
        // Sports-specific fields
        league: '',
        homeTeam: '',
        awayTeam: '',
        score: '',
        halftime: '',
        matchDate: ''
      };

      if (isSportsMode) {
        // Sports-specific extraction
        
        // Home team
        const homeTeamSelectors = customSelectors.homeTeam 
          ? [customSelectors.homeTeam] 
          : ['a.left-block-team-name'];
        
        for (const selector of homeTeamSelectors) {
          const homeEl = $el.find(selector).first();
          if (homeEl.length && homeEl.text().trim()) {
            item.homeTeam = cleanText(homeEl.text());
            break;
          }
        }

        // Away team
        const awayTeamSelectors = customSelectors.awayTeam 
          ? [customSelectors.awayTeam] 
          : ['a.r-left-block-team-name'];
        
        for (const selector of awayTeamSelectors) {
          const awayEl = $el.find(selector).first();
          if (awayEl.length && awayEl.text().trim()) {
            item.awayTeam = cleanText(awayEl.text());
            break;
          }
        }

        // Score
        const scoreSelectors = customSelectors.score 
          ? [customSelectors.score] 
          : ['div.match-score'];
        
        for (const selector of scoreSelectors) {
          const scoreEl = $el.find(selector).first();
          if (scoreEl.length && scoreEl.text().trim()) {
            item.score = cleanText(scoreEl.text());
            break;
          }
        }

        // Create description from team names
        if (item.homeTeam && item.awayTeam) {
          item.description = `${item.homeTeam} vs ${item.awayTeam}`;
        }
        
        // Set title from team names if available
        if (item.homeTeam && item.awayTeam) {
          item.title = `${item.homeTeam} - ${item.awayTeam}`;
        }
      }

      // Title extraction
      if (!item.title) {
        const titleSelectors = customSelectors.title 
          ? [customSelectors.title] 
          : ['h1', 'h2', 'h3', '.title', '.name', '.product-name', '.article-title'];
          
        for (const selector of titleSelectors) {
          const titleEl = $el.find(selector).first();
          if (titleEl.length && titleEl.text().trim()) {
            item.title = cleanText(titleEl.text());
            break;
          }
        }
      }

      // If no title found in children, use element's own text (first line)
      if (!item.title) {
        const text = cleanText($el.text());
        item.title = text.split('\n')[0].substring(0, 100);
      }

      // Description extraction
      if (!item.description) {
        const descSelectors = customSelectors.description 
          ? [customSelectors.description] 
          : ['.description', '.summary', '.excerpt', 'p', '.content'];
          
        for (const selector of descSelectors) {
          const descEl = $el.find(selector).first();
          if (descEl.length && descEl.text().trim()) {
            item.description = cleanText(descEl.text()).substring(0, 200);
            break;
          }
        }
      }

      // URL extraction
      const linkSelector = customSelectors.link || 'a';
      const linkEl = $el.find(linkSelector).first();
      if (linkEl.length) {
        const href = linkEl.attr('href');
        if (href) {
          item.url = resolveUrl(url, href);
        }
      }

      // Image extraction
      const imgSelector = customSelectors.image || 'img';
      const imgEl = $el.find(imgSelector).first();
      if (imgEl.length) {
        const src = imgEl.attr('src') || imgEl.attr('data-src');
        if (src) {
          item.image = resolveUrl(url, src);
        }
      }

      // Price extraction
      const priceSelectors = customSelectors.price 
        ? [customSelectors.price] 
        : ['.price', '.cost', '.amount', '[class*="price"]'];
        
      for (const selector of priceSelectors) {
        const priceEl = $el.find(selector).first();
        if (priceEl.length && priceEl.text().trim()) {
          item.price = cleanText(priceEl.text());
          break;
        }
      }

      // Category extraction
      const categorySelectors = customSelectors.category 
        ? [customSelectors.category] 
        : ['.category', '.tag', '.label', '.type'];
        
      for (const selector of categorySelectors) {
        const catEl = $el.find(selector).first();
        if (catEl.length && catEl.text().trim()) {
          item.category = cleanText(catEl.text());
          break;
        }
      }

      // Date extraction
      if (!item.date) {
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

      // Only add items that have at least a title or sports data
      if ((item.title && item.title.length > 3) || (isSportsMode && (item.homeTeam || item.awayTeam || item.score))) {
        scrapedData.push(item);
      }
    });

    return scrapedData;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, customSelectors } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Scraping URL: ${url}`);
    console.log('Custom selectors:', customSelectors);
    const data = await scrapeWebsite(url, customSelectors);
    console.log(`Scraped ${data.length} items`);

    return res.status(200).json({
      success: true,
      url,
      totalItems: data.length,
      data,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}