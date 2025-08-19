import React from "react";
import { Link } from "react-router-dom";
import Linkify from "react-linkify";

/**
 * Component that renders text with clickable @username mentions
 * @param {Object} props
 * @param {string} props.children - The text content to render
 * @param {string} props.className - Optional CSS class name
 */
const MentionText = ({ children, className = "" }) => {
  if (!children) return null;

  // Function to render mentions as links
  const renderTextWithMentions = (text) => {
    // Split text by mentions while preserving the mention pattern
    // Only match mentions at start or after whitespace to avoid inside URLs/emails
    const mentionRegex = /(\s|^)@([a-zA-Z0-9_-]{3,30})\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
          key: `text-${lastIndex}`,
        });
      }

      // Add the mention as a link
      // match[2] is the username because of the leading group
      parts.push({
        type: "mention",
        content: match[0].trimStart(), // preserve without leading space
        username: match[2],
        key: `mention-${match.index}`,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last mention
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
        key: `text-${lastIndex}`,
      });
    }

    // If no mentions found, return the original text
    if (parts.length === 0) {
      return text;
    }

    return parts.map((part) => {
      if (part.type === "mention") {
        return (
          <>
            {" "}
            <Link
              key={part.key}
              to={`/u/${part.username}`}
              className="mention-link text-primary fw-bold text-decoration-none"
              style={{
                color: "var(--brand-color)",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = "none";
              }}
            >
              {part.content.trim()}
            </Link>
          </>
        );
      }
      return part.content;
    });
  };

  return (
    <Linkify properties={{ target: "_blank" }}>
      <span className={className}>{renderTextWithMentions(children)}</span>
    </Linkify>
  );
};

export default MentionText;
