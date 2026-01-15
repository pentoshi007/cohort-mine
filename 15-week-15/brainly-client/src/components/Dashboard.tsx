import { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { AddContentModal } from "./AddContentModal";
import { ShareIcon, PlusIcon } from "../icons/icons";
import { contentApi, brainApi } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Content, ContentType } from "../types";

interface DashboardProps {
  activeFilter?: ContentType | null;
}

const filterTitles: Record<ContentType | "all", string> = {
  all: "All Notes",
  tweet: "Tweets",
  video: "Videos",
  note: "Notes",
  link: "Links",
};

export function Dashboard({ activeFilter = null }: DashboardProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contentApi.getAll(activeFilter || undefined);
      setContents(response.content);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch contents");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete content");
    }
  };

  const handleShare = async () => {
    try {
      const response = await brainApi.share(true);
      if ("hash" in response) {
        const link = `${window.location.origin}/shared/${response.hash}`;
        navigator.clipboard.writeText(link);
        alert("Share link copied to clipboard!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create share link");
    }
  };

  const title = filterTitles[activeFilter || "all"];

  return (
    <main className="flex-1 bg-gray-50 p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            startIcon={<ShareIcon size="sm" />}
            onClick={handleShare}
          >
            Share Brain
          </Button>
          <Button
            variant="primary"
            startIcon={<PlusIcon size="md" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Content
          </Button>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No content yet</p>
          <Button
            variant="primary"
            startIcon={<PlusIcon size="md" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add your first content
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              title={item.title}
              type={item.type}
              link={item.link}
              content={item.content}
              tags={item.tags}
              createdAt={item.createdAt}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContentAdded={fetchContents}
      />
    </main>
  );
}

