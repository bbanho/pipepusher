import ReasoningCanvas from "@/components/canvas/ReasoningCanvas";
import HistoryPanel from "@/components/history/HistoryPanel";

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <ReasoningCanvas />
      <HistoryPanel />
    </main>
  );
}
