import axios from "axios";
import { load } from "cheerio";

// URL regex to detect URLs in text
const URL_REGEX =
  /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)/gi;

// Supported embed types
const EMBED_TYPES = {
  TWITTER: "twitter",
  YOUTUBE: "youtube",
  GENERIC: "generic",
  IMAGE: "image",
};

/**
 * Extract URLs from text
 */
function extractUrls(text) {
  const urls = text.match(URL_REGEX);
  return urls || [];
}

/**
 * Determine embed type based on URL
 */
function getEmbedType(url) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return EMBED_TYPES.TWITTER;
  }

  if (
    lowerUrl.includes("youtube.com/watch") ||
    lowerUrl.includes("youtu.be/")
  ) {
    return EMBED_TYPES.YOUTUBE;
  }

  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return EMBED_TYPES.IMAGE;
  }

  return EMBED_TYPES.GENERIC;
}

/**
 * Extract Twitter tweet ID from URL
 */
function extractTwitterId(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  return match ? match[1] : null;
}

/**
 * Fetch generic metadata from a webpage
 */
async function fetchGenericMetadata(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
    });

    const $ = load(response.data);

    // Extract Open Graph or meta tags
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      "Link";

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";

    const siteName =
      $('meta[property="og:site_name"]').attr("content") ||
      new URL(url).hostname;

    return {
      title: title.trim(),
      description: description.trim().substring(0, 200),
      image,
      siteName,
      url,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
    return {
      title: "Link",
      description: "",
      image: "",
      siteName: new URL(url).hostname,
      url,
    };
  }
}

/**
 * Generate embed data for a URL
 */
async function generateEmbedData(url) {
  const embedType = getEmbedType(url);

  switch (embedType) {
    case EMBED_TYPES.TWITTER: {
      const tweetId = extractTwitterId(url);
      if (tweetId) {
        return {
          type: EMBED_TYPES.TWITTER,
          id: tweetId,
          url,
          data: { tweetId },
        };
      }
      break;
    }

    case EMBED_TYPES.YOUTUBE: {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return {
          type: EMBED_TYPES.YOUTUBE,
          id: videoId,
          url,
          data: {
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
          },
        };
      }
      break;
    }

    case EMBED_TYPES.IMAGE: {
      return {
        type: EMBED_TYPES.IMAGE,
        url,
        data: { imageUrl: url },
      };
    }

    case EMBED_TYPES.GENERIC: {
      const metadata = await fetchGenericMetadata(url);
      return {
        type: EMBED_TYPES.GENERIC,
        url,
        data: metadata,
      };
    }
  }

  return null;
}

/**
 * Process text and extract the first embeddable URL
 */
async function processMessageForEmbed(message) {
  const urls = extractUrls(message);

  if (urls.length === 0) {
    return null;
  }

  // Process the first URL found
  const firstUrl = urls[0];
  return await generateEmbedData(firstUrl);
}

export default {
  processMessageForEmbed,
  extractUrls,
  getEmbedType,
  EMBED_TYPES,
};
