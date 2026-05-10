import ReasoningCanvas from "@/components/canvas/ReasoningCanvas";
import HistoryPanel from "@/components/history/HistoryPanel";
import StatusBar from "@/components/ui/StatusBar";

export default function Home() {
  return (
    <main 
      className="w-screen h-screen overflow-hidden bg-slate-50 relative focus:outline-none" 
      tabIndex={0}
      autoFocus
    >
      <ReasoningCanvas />
      <HistoryPanel />
      <StatusBar />
    </main>
  );
}
