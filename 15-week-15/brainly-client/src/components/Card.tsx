import {
  TwitterIcon,
  VideoIcon,
  DocumentIcon,
  LinkIcon,
  ShareIcon,
  TrashIcon,
} from "../icons/icons";
import type { Tag, ContentType } from "../types";
import { Tweet } from "react-tweet";

interface CardProps {
  id: string;
  title: string;
  type?: ContentType;
  link?: string;
  content?: string;
  tags?: Tag[];
  createdAt: string;
  onDelete: (id: string) => void;
}

// Infer type from URL for legacy content that doesn't have type set
function inferTypeFromUrl(url?: string): ContentType {
  if (!url) return "link";
  if (url.includes("twitter.com") || url.includes("x.com")) return "tweet";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "video";
  return "link";
}

function getIcon(type: ContentType) {
  switch (type) {
    case "tweet":
      return <TwitterIcon size="sm" />;
    case "video":
      return <VideoIcon size="sm" />;
    case "note":
      return <DocumentIcon size="sm" />;
    default:
      return <LinkIcon size="sm" />;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getTweetId(url: string): string | null {
  const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function Card({ id, title, type, link, content, tags, createdAt, onDelete }: CardProps) {
  // Use explicit type if set, otherwise infer from URL (for legacy content)
  const effectiveType = type || inferTypeFromUrl(link);
  
  const videoId = effectiveType === "video" && link ? getYouTubeVideoId(link) : null;
  const tweetId = effectiveType === "tweet" && link ? getTweetId(link) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-gray-500 shrink-0">{getIcon(effectiveType)}</span>
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ShareIcon />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-400 hover:text-red-500 cursor-pointer"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Embedded content based on type */}
      {effectiveType === "video" && videoId && (
        <div className="mb-3 rounded-lg overflow-hidden aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {effectiveType === "tweet" && tweetId && (
        <div className="mb-3 max-h-80 overflow-y-auto rounded-lg">
          <Tweet id={tweetId} />
        </div>
      )}

      {effectiveType === "note" && content && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{content}</p>
        </div>
      )}

      {/* Show link for non-note types or when embed fails */}
      {link && (effectiveType === "link" || (effectiveType === "video" && !videoId) || (effectiveType === "tweet" && !tweetId)) && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline text-sm break-all block mb-3"
        >
          {link}
        </a>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span
              key={tag._id}
              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
            >
              #{tag.title}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">Added on {formatDate(createdAt)}</p>
    </div>
  );
}


