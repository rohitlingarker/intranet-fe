// src/pages/TestDesign/ScenarioList.jsx

import { useEffect, useState } from "react";
import { getScenariosByStory } from "../testDesignApi";
import { Folder, FolderOpen } from "lucide-react";

export default function ScenarioList({ onSelectScenario }) {
  const [stories] = useState([1, 2]); // Example: these are testStoryIds
  const [data, setData] = useState({});
  const [openFolder, setOpenFolder] = useState(null);

  useEffect(() => {
    stories.forEach(async (storyId) => {
      const res = await getScenariosByStory(storyId);
      setData((prev) => ({ ...prev, [storyId]: res }));
    });
  }, []);

  return (
    <div className="mt-4">
      {stories.map((storyId) => (
        <div key={storyId} className="mb-3">

          {/* Folder header */}
          <div 
            className="flex items-center gap-2 cursor-pointer font-semibold"
            onClick={() => setOpenFolder(openFolder === storyId ? null : storyId)}
          >
            {openFolder === storyId ? <FolderOpen size={18} /> : <Folder size={18} />}
            Story #{storyId}
          </div>

          {/* Folder content */}
          {openFolder === storyId && (
            <div className="pl-6 mt-2 flex flex-col gap-2">
              {data[storyId]?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectScenario(item.id)}
                  className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.caseCount} Cases • {item.priority} Priority
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
