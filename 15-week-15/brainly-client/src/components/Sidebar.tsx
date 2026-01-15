import {
  BrainIcon,
  TwitterIcon,
  VideoIcon,
  DocumentIcon,
  LinkIcon,
  HashtagIcon,
} from "../icons/icons";
import { SidebarItem, Logo } from "./SidebarComponents";
import type { ContentType } from "../types";

interface SidebarProps {
  activeFilter: ContentType | null;
  onFilterChange: (filter: ContentType | null) => void;
}

export function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
      <Logo icon={<BrainIcon size="lg" />} title="Second Brain" />

      <nav className="flex flex-col gap-1">
        <SidebarItem
          icon={<TwitterIcon />}
          label="Tweets"
          active={activeFilter === "tweet"}
          onClick={() => onFilterChange(activeFilter === "tweet" ? null : "tweet")}
        />
        <SidebarItem
          icon={<VideoIcon />}
          label="Videos"
          active={activeFilter === "video"}
          onClick={() => onFilterChange(activeFilter === "video" ? null : "video")}
        />
        <SidebarItem
          icon={<DocumentIcon />}
          label="Notes"
          active={activeFilter === "note"}
          onClick={() => onFilterChange(activeFilter === "note" ? null : "note")}
        />
        <SidebarItem
          icon={<LinkIcon />}
          label="Links"
          active={activeFilter === "link"}
          onClick={() => onFilterChange(activeFilter === "link" ? null : "link")}
        />
        <SidebarItem icon={<HashtagIcon />} label="Tags" />
      </nav>
    </aside>
  );
}

