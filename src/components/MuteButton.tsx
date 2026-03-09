import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, toggleMute } from "@/lib/sounds";

export default function MuteButton() {
  const [muted, setMuted] = useState(isMuted());
  return (
    <button
      onClick={() => setMuted(toggleMute())}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border/30 bg-card/50 text-muted-foreground hover:text-primary transition-colors"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
