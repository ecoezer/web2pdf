import axios from 'axios';
import { load } from 'cheerio';

// Helper function to clean text
const cleanText = (text) => {
  return text ? text.trim().replace(/\s+/g, ' ') : '';
};

// Match data scraping function
const scrapeMatchData = async (url, selectors = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = load(response.data);
    const scrapedData = [];

    // Find match containers - try different possible containers
    const containerSelectors = [
      'div', // Generic div containers
      'article',
      'section',
      '.match',
      '.game',
      '.fixture'
    ];

    let elements = $();
    
    // Try to find containers that have match data
    for (const containerSelector of containerSelectors) {
      const potentialElements = $(containerSelector);
      
      // Filter elements that contain match-related selectors
      const matchElements = potentialElements.filter((i, el) => {
        const $el = $(el);
        const hasHomeTeam = $el.find(selectors.homeTeam || 'a.left-block-team-name').length > 0;
        const hasAwayTeam = $el.find(selectors.awayTeam || 'a.r-left-block-team-name').length > 0;
        const hasScore = $el.find(selectors.score || 'div.match-score').length > 0;
        
        return hasHomeTeam || hasAwayTeam || hasScore;
      });
      
      if (matchElements.length > 0) {
        elements = matchElements;
        console.log(`Found ${elements.length} match containers using selector: ${containerSelector}`);
        break;
      }
    }

    // If no containers found, try to find individual match data elements
    if (elements.length === 0) {
      const homeTeams = $(selectors.homeTeam || 'a.left-block-team-name');
      const awayTeams = $(selectors.awayTeam || 'a.r-left-block-team-name');
      const scores = $(selectors.score || 'div.match-score');
      
      const maxLength = Math.max(homeTeams.length, awayTeams.length, scores.length);
      
      for (let i = 0; i < maxLength; i++) {
        const item = {
          id: `match-${i + 1}`,
          title: '',
          description: '',
          homeTeam: '',
          awayTeam: '',
          score: '',
          halftime: ''
        };

        // Get home team
        if (homeTeams.eq(i).length) {
          item.homeTeam = cleanText(homeTeams.eq(i).text());
        }

        // Get away team
        if (awayTeams.eq(i).length) {
          item.awayTeam = cleanText(awayTeams.eq(i).text());
        }

        // Get score
        if (scores.eq(i).length) {
          item.score = cleanText(scores.eq(i).text());
        }

        // Create title and description
        if (item.homeTeam && item.awayTeam) {
          item.title = `${item.homeTeam} - ${item.awayTeam}`;
          item.description = `${item.homeTeam} vs ${item.awayTeam}`;
        }

        // Only add if we have at least some match data
        if (item.homeTeam || item.awayTeam || item.score) {
          scrapedData.push(item);
        }
      }
    } else {
      // Process each container
      elements.each((index, element) => {
        const $el = $(element);
        
        const item = {
          id: `match-${index + 1}`,
          title: '',
          description: '',
          homeTeam: '',
          awayTeam: '',
          score: '',
          halftime: ''
        };

        // Extract home team
        const homeTeamEl = $el.find(selectors.homeTeam || 'a.left-block-team-name').first();
        if (homeTeamEl.length) {
          item.homeTeam = cleanText(homeTeamEl.text());
        }

        // Extract away team
        const awayTeamEl = $el.find(selectors.awayTeam || 'a.r-left-block-team-name').first();
        if (awayTeamEl.length) {
          item.awayTeam = cleanText(awayTeamEl.text());
        }

        // Extract score
        const scoreEl = $el.find(selectors.score || 'div.match-score').first();
        if (scoreEl.length) {
          item.score = cleanText(scoreEl.text());
        }

        // Try to extract halftime score if available
        const halftimeSelectors = ['.halftime', '.ht-score', '.first-half'];
        for (const htSelector of halftimeSelectors) {
          const htEl = $el.find(htSelector).first();
          if (htEl.length && htEl.text().trim()) {
            item.halftime = cleanText(htEl.text());
            break;
          }
        }

        // Create title and description
        if (item.homeTeam && item.awayTeam) {
          item.title = `${item.homeTeam} - ${item.awayTeam}`;
          item.description = `${item.homeTeam} vs ${item.awayTeam}`;
        }

        // Only add if we have at least some match data
        if (item.homeTeam || item.awayTeam || item.score) {
          scrapedData.push(item);
        }
      });
    }

    return scrapedData;
  } catch (error) {
    console.error('Match scraping error:', error.message);
    throw new Error(`Match scraping failed: ${error.message}`);
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

    console.log(`Scraping match data from URL: ${url}`);
    console.log('Using selectors:', customSelectors);
    
    const data = await scrapeMatchData(url, customSelectors);
    console.log(`Scraped ${data.length} matches`);

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