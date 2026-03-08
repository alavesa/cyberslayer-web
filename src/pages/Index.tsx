import { useState } from "react";
import { Sword, Shield, Zap, Heart, Star, Skull } from "lucide-react";

const Index = () => {
  const [health] = useState(85);
  const [energy] = useState(60);
  const [xp] = useState(45);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden habbo-grid">
      {/* Decorative corner pixels */}
      <div className="fixed top-0 left-0 w-8 h-8 bg-primary" />
      <div className="fixed top-0 right-0 w-8 h-8 bg-secondary" />
      <div className="fixed bottom-0 left-0 w-8 h-8 bg-accent" />
      <div className="fixed bottom-0 right-0 w-8 h-8 bg-primary" />

      <div className="relative z-10">
        {/* Header Bubble */}
        <div className="mb-12 text-center">
          <div className="bubble inline-block px-8 py-4 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold tracking-wide">
              <span className="text-primary">CYBER</span>
              <span className="text-secondary">SLAYER</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              ★ HABBO HOTEL STYLE ★
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Panel - Isometric */}
          <div className="bg-card pixel-border isometric-panel p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Health */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-destructive">
                  <Heart className="w-4 h-4" />
                  <span>HEALTH</span>
                  <span className="ml-auto">{health}/100</span>
                </div>
                <div className="pixel-progress h-6 relative">
                  <div 
                    className="h-full bg-destructive pixel-progress-fill transition-all"
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Zap className="w-4 h-4" />
                  <span>ENERGY</span>
                  <span className="ml-auto">{energy}/100</span>
                </div>
                <div className="pixel-progress h-6 relative">
                  <div 
                    className="h-full bg-primary pixel-progress-fill transition-all"
                    style={{ width: `${energy}%` }}
                  />
                </div>
              </div>

              {/* XP */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-accent">
                  <Star className="w-4 h-4" />
                  <span>XP</span>
                  <span className="ml-auto">{xp}/100</span>
                </div>
                <div className="pixel-progress h-6 relative">
                  <div 
                    className="h-full bg-accent pixel-progress-fill transition-all"
                    style={{ width: `${xp}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Combat Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Enemy Card - Pixel Style */}
            <div className="bg-card pixel-border-pink p-4 isometric-lift">
              <div className="flex items-center gap-2 text-secondary font-bold text-lg mb-4 border-b-4 border-secondary/30 pb-2">
                <Skull className="w-5 h-5" />
                <span>SHADOW DRONE</span>
              </div>
              
              {/* Pixel Art Enemy */}
              <div className="flex items-center justify-center h-32 mb-4 bg-muted/30 pixel-border">
                <pre className="text-secondary text-xs leading-none font-mono">
{`  ████████████  
 ██░░░░░░░░░░██ 
██░░██░░░░██░░██
██░░░░░░░░░░░░██
██░░████████░░██
 ██░░░░░░░░░░██ 
  ████████████  
   ██      ██   
   ██      ██   `}
                </pre>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-muted/30 px-3 py-1 pixel-border">
                  <span className="text-muted-foreground">STATUS:</span>
                  <span className="text-secondary font-bold">HOSTILE</span>
                </div>
                <div className="flex justify-between bg-muted/30 px-3 py-1 pixel-border">
                  <span className="text-muted-foreground">HP:</span>
                  <span className="text-secondary font-bold">42/50</span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-card pixel-border-blue p-4 isometric-lift">
              <div className="text-primary font-bold text-lg mb-4 border-b-4 border-primary/30 pb-2">
                ▶ COMBAT ACTIONS
              </div>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 h-14 bg-primary text-primary-foreground pixel-btn px-4 font-bold">
                  <span className="bg-primary-foreground/20 px-2 py-1 text-xs">[1]</span>
                  <Sword className="w-5 h-5" />
                  <span>LASER BLADE</span>
                  <span className="ml-auto text-xs bg-primary-foreground/20 px-2 py-1">DMG:15</span>
                </button>

                <button className="w-full flex items-center gap-3 h-14 bg-secondary text-secondary-foreground pixel-btn px-4 font-bold">
                  <span className="bg-secondary-foreground/20 px-2 py-1 text-xs">[2]</span>
                  <Zap className="w-5 h-5" />
                  <span>PLASMA BURST</span>
                  <span className="ml-auto text-xs bg-secondary-foreground/20 px-2 py-1">DMG:25</span>
                </button>

                <button className="w-full flex items-center gap-3 h-14 bg-accent text-accent-foreground pixel-btn px-4 font-bold">
                  <span className="bg-accent-foreground/20 px-2 py-1 text-xs">[3]</span>
                  <Shield className="w-5 h-5" />
                  <span>DEFLECT</span>
                  <span className="ml-auto text-xs bg-accent-foreground/20 px-2 py-1">SHD:+10</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zone Info - Bubble Style */}
          <div className="bubble p-4 mr-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-bold">ZONE: 03/10</p>
                <h3 className="text-primary font-bold text-lg">
                  CORPORATE WASTELAND
                </h3>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-bold">RANK:</p>
                <p className="text-accent font-bold text-lg">★ STRIKER ★</p>
              </div>
            </div>
          </div>

          {/* Style Note */}
          <div className="text-center space-y-2 mt-8">
            <div className="inline-flex gap-2 items-center bg-card pixel-border px-6 py-3">
              <span className="w-3 h-3 bg-primary" />
              <span className="w-3 h-3 bg-secondary" />
              <span className="w-3 h-3 bg-accent" />
              <span className="font-bold text-foreground ml-2">PIXEL BLOCKS</span>
              <span className="w-3 h-3 bg-accent" />
              <span className="w-3 h-3 bg-secondary" />
              <span className="w-3 h-3 bg-primary" />
            </div>
            <p className="text-muted-foreground text-sm font-bold">
              [ HABBO HOTEL INSPIRED AESTHETIC ]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
