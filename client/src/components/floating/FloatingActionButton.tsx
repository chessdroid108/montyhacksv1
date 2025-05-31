import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MinimizableWindow } from "./MinimizableWindow";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  const [showWindow, setShowWindow] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 bg-blue-600 hover:bg-blue-700"
        onClick={() => setShowWindow(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <MinimizableWindow
        isOpen={showWindow}
        onClose={() => setShowWindow(false)}
      />
    </>
  );
}
