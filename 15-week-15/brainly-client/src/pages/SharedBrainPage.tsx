import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { brainApi } from "../api";
import { Card } from "../components/Card";
import { BrainIcon } from "../icons/icons";
import type { Content } from "../types";

export function SharedBrainPage() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSharedBrain() {
      if (!shareLink) return;
      try {
        const response = await brainApi.getShared(shareLink);
        setContents(response.contents);
        setUsername(response.username);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load shared brain");
      } finally {
        setLoading(false);
      }
    }
    fetchSharedBrain();
  }, [shareLink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <a href="/" className="text-purple-600 hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-purple-600">
            <BrainIcon size="lg" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Second Brain</span>
        </div>
        <p className="text-gray-600 mb-8">Shared by {username}</p>

        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No content in this brain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((item) => (
              <Card
                key={item._id}
                id={item._id}
                title={item.title}
                link={item.link}
                createdAt={item.createdAt}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
