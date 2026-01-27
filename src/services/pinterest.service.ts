/**
 * Pinterest API service for extracting themes and colors from Pinterest boards
 */

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
const CACHE_PREFIX = 'pinterest_extraction_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface PinterestPin {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  media?: {
    images?: {
      '564x'?: { url?: string };
      '736x'?: { url?: string };
      'originals'?: { url?: string };
    };
  };
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  pins?: PinterestPin[];
}

export interface ExtractedThemes {
  themes: string[];
  colors: string[];
  keywords: string[];
}

/**
 * Get Pinterest API access token from environment
 */
function getAccessToken(): string | null {
  return import.meta.env.VITE_PINTEREST_ACCESS_TOKEN || null;
}

/**
 * Check if API credentials are available
 */
function hasApiCredentials(): boolean {
  return getAccessToken() !== null;
}

/**
 * Extract board ID and username from Pinterest board URL
 */
export function parseBoardUrl(url: string): { username: string; boardName: string } | null {
  // Match patterns like:
  // https://pinterest.com/username/board-name/
  // https://www.pinterest.com/username/board-name/
  // pinterest.com/username/board-name
  const match = url.match(/pinterest\.com\/([^\/]+)\/([^\/\?]+)/);
  if (match) {
    return {
      username: match[1],
      boardName: match[2].replace(/\/$/, ''),
    };
  }
  return null;
}

/**
 * Extract basic keywords from board name/URL (fallback when API not available)
 */
function extractKeywordsFromBoardName(boardName: string): string[] {
  const keywords: string[] = [];
  const commonThemes = [
    'rustic', 'elegant', 'modern', 'vintage', 'bohemian', 'classic', 'romantic',
    'garden', 'beach', 'outdoor', 'indoor', 'minimalist', 'luxury', 'boho',
    'industrial', 'country', 'coastal', 'tropical', 'winter', 'summer',
    'spring', 'fall', 'autumn', 'wedding', 'bridal', 'reception', 'ceremony',
  ];

  const lowerName = boardName.toLowerCase();
  commonThemes.forEach((theme) => {
    if (lowerName.includes(theme)) {
      keywords.push(theme);
    }
  });

  return keywords;
}

/**
 * Extract theme keywords from pin descriptions and titles
 */
function extractThemesFromPins(pins: PinterestPin[]): string[] {
  const themeKeywords = new Set<string>();
  const commonThemes = [
    'rustic', 'elegant', 'modern', 'vintage', 'bohemian', 'classic', 'romantic',
    'garden', 'beach', 'outdoor', 'indoor', 'minimalist', 'luxury', 'boho',
    'industrial', 'country', 'coastal', 'tropical', 'winter', 'summer',
    'spring', 'fall', 'autumn', 'wedding', 'bridal', 'reception', 'ceremony',
    'floral', 'greenery', 'white', 'gold', 'blush', 'navy', 'burgundy',
    'rose', 'ivory', 'cream', 'champagne', 'peach', 'sage', 'eucalyptus',
  ];

  pins.forEach((pin) => {
    const text = `${pin.title || ''} ${pin.description || ''}`.toLowerCase();
    commonThemes.forEach((theme) => {
      if (text.includes(theme)) {
        themeKeywords.add(theme);
      }
    });
  });

  return Array.from(themeKeywords);
}

/**
 * Extract color keywords from pin content
 */
function extractColorsFromPins(pins: PinterestPin[]): string[] {
  const colors = new Set<string>();
  const colorKeywords = [
    'white', 'ivory', 'cream', 'beige', 'blush', 'pink', 'rose', 'coral',
    'peach', 'gold', 'champagne', 'yellow', 'sage', 'green', 'eucalyptus',
    'navy', 'blue', 'burgundy', 'red', 'wine', 'purple', 'lavender', 'mauve',
    'black', 'grey', 'gray', 'silver', 'bronze', 'copper',
  ];

  pins.forEach((pin) => {
    const text = `${pin.title || ''} ${pin.description || ''}`.toLowerCase();
    colorKeywords.forEach((color) => {
      if (text.includes(color)) {
        colors.add(color);
      }
    });
  });

  return Array.from(colors);
}

/**
 * Get cached extraction result
 */
function getCachedExtraction(boardUrl: string): ExtractedThemes | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${boardUrl}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to read cache', e);
  }
  return null;
}

/**
 * Cache extraction result
 */
function cacheExtraction(boardUrl: string, data: ExtractedThemes): void {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${boardUrl}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.error('Failed to cache extraction', e);
  }
}

/**
 * Fetch board from Pinterest API
 */
async function fetchBoardFromApi(username: string, boardName: string): Promise<PinterestBoard | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    // Pinterest API v5 endpoint for getting board
    const response = await fetch(
      `${PINTEREST_API_BASE}/boards/${username}/${boardName}?board_fields=id,name,description`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.status}`);
    }

    const boardData = await response.json();
    return {
      id: boardData.id,
      name: boardData.name,
      description: boardData.description,
    };
  } catch (error) {
    console.error('Failed to fetch board from API', error);
    return null;
  }
}

/**
 * Fetch pins from a Pinterest board
 */
async function fetchBoardPins(boardId: string, limit: number = 25): Promise<PinterestPin[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(
      `${PINTEREST_API_BASE}/boards/${boardId}/pins?pin_fields=id,title,description,link,media&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch pins from API', error);
    return [];
  }
}

/**
 * Extract themes and colors from a Pinterest board URL
 */
export async function extractThemesFromBoard(boardUrl: string): Promise<ExtractedThemes> {
  // Check cache first
  const cached = getCachedExtraction(boardUrl);
  if (cached) {
    return cached;
  }

  const parsed = parseBoardUrl(boardUrl);
  if (!parsed) {
    throw new Error('Invalid Pinterest board URL');
  }

  const { username, boardName } = parsed;

  // If API credentials available, use API
  if (hasApiCredentials()) {
    try {
      const board = await fetchBoardFromApi(username, boardName);
      if (board) {
        const pins = await fetchBoardPins(board.id);
        const themes = extractThemesFromPins(pins);
        const colors = extractColorsFromPins(pins);
        const keywords = [...themes, ...colors];

        const result: ExtractedThemes = {
          themes: Array.from(new Set(themes)),
          colors: Array.from(new Set(colors)),
          keywords: Array.from(new Set(keywords)),
        };

        cacheExtraction(boardUrl, result);
        return result;
      }
    } catch (error) {
      console.error('API extraction failed, falling back to basic extraction', error);
    }
  }

  // Fallback: extract from board name
  const keywords = extractKeywordsFromBoardName(boardName);
  const result: ExtractedThemes = {
    themes: keywords,
    colors: [],
    keywords,
  };

  cacheExtraction(boardUrl, result);
  return result;
}

export const pinterestService = {
  /**
   * Authenticate with Pinterest (stub - requires OAuth implementation)
   */
  async authenticate(): Promise<void> {
    throw new Error('Pinterest OAuth not yet implemented. Please set VITE_PINTEREST_ACCESS_TOKEN in environment variables.');
  },

  /**
   * Search for wedding inspiration (stub)
   */
  async searchInspiration(_query: string): Promise<any[]> {
    throw new Error('Pinterest search not yet implemented');
  },

  /**
   * Save pin to board (stub)
   */
  async savePin(_pinId: string, _boardId: string): Promise<void> {
    throw new Error('Pinterest save pin not yet implemented');
  },

  /**
   * Extract themes from a Pinterest board
   */
  extractThemesFromBoard,

  /**
   * Parse board URL
   */
  parseBoardUrl,

  /**
   * Check if API credentials are available
   */
  hasApiCredentials,
};
