import React from "react";
import YouTube from "react-youtube";

const EmbedPreview = ({ post }) => {
  if (!post.extraType || !post.extraValue) {
    return null;
  }

  let embedData;
  try {
    embedData = JSON.parse(post.extraValue);
  } catch (error) {
    // Handle legacy format or plain text
    embedData = { value: post.extraValue };
  }

  // Load Twitter widgets script if this is a Twitter embed
  React.useEffect(() => {
    if (post.extraType === "twitter") {
      if (!window.twttr) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.head.appendChild(script);
      } else {
        // Re-render widgets if script already loaded
        window.twttr.widgets.load();
      }
    }
  }, [post.extraType]);

  const renderEmbed = () => {
    switch (post.extraType) {
      case "youtube": {
        const videoId = embedData.data?.videoId || embedData.value;
        if (videoId) {
          return (
            <div className="embed-preview youtube-embed">
              <YouTube
                videoId={videoId}
                opts={{
                  width: "100%",
                  height: "400",
                  playerVars: {
                    rel: 0,
                    modestbranding: 1,
                  },
                }}
              />
            </div>
          );
        }
        break;
      }

      case "twitter": {
        const tweetId = embedData.data?.tweetId || embedData.id;
        if (tweetId) {
          return (
            <div className="embed-preview twitter-embed">
              <blockquote className="twitter-tweet" data-theme="light">
                <a href={`https://twitter.com/twitter/status/${tweetId}`}>
                  Loading tweet...
                </a>
              </blockquote>
            </div>
          );
        }
        break;
      }

      case "image": {
        const imageUrl = embedData.data?.imageUrl || embedData.url;
        if (imageUrl) {
          return (
            <div className="embed-preview image-embed">
              <img
                src={imageUrl}
                alt="Embedded"
                className="img-fluid rounded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
              />
            </div>
          );
        }
        break;
      }

      case "generic": {
        const metadata = embedData.data || embedData;
        if (metadata && metadata.url) {
          return (
            <div className="embed-preview generic-embed">
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                <div className="card border">
                  {metadata.image && (
                    <img
                      src={metadata.image}
                      className="card-img-top"
                      alt={metadata.title || "Link preview"}
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h6 className="card-title text-dark mb-1">
                      {metadata.title || "Link"}
                    </h6>
                    {metadata.description && (
                      <p className="card-text text-muted small mb-2">
                        {metadata.description}
                      </p>
                    )}
                    <small className="text-muted">
                      {metadata.siteName || new URL(metadata.url).hostname}
                    </small>
                  </div>
                </div>
              </a>
            </div>
          );
        }
        break;
      }

      default:
        return null;
    }
  };

  const embed = renderEmbed();

  if (!embed) {
    return null;
  }

  return <div className="mt-3">{embed}</div>;
};

export default EmbedPreview;
