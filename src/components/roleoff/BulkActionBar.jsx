import React from "react";
import { Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BulkActionBar = ({ count, onClear, onCreate }) => {
  if (!count) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          <Layers3 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#081534]">
            {count} role-off requests will be created
          </p>
          <p className="text-xs text-gray-600">
            Each selected allocation will generate a separate request.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onClear}
          className="h-9 border-gray-300 bg-white text-xs"
        >
          Clear Selection
        </Button>
        <Button onClick={onCreate} className="h-9 bg-[#081534] text-xs hover:bg-[#10214f]">
          Create Bulk Role-Off
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;
