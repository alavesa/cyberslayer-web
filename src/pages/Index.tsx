import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Zap, Heart, Star, Skull } from "lucide-react";

const Index = () => {
  const [health] = useState(85);
  const [energy] = useState(60);
  const [xp] = useState(45);
  const [glitchText, setGlitchText] = useState(false);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 150);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden scanlines crt-flicker">
      {/* CRT vignette */}
      <div className="fixed inset-0 pointer-events-none crt-curve" />
      
      {/* Static noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" style={{ animation: 'noise 0.5s steps(5) infinite' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`transition-all duration-100 ${glitchText ? 'translate-x-1' : ''}`}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest mb-2 font-mono">
              <span className="text-primary phosphor-glow">CYBER</span>
              <span className="text-accent phosphor-glow-red">SLAYER</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm tracking-widest">
            [ FULL RETRO CRT — VISUAL PREVIEW ]
          </p>
          <div className="mt-2 text-xs text-primary/60 font-mono">
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Stats Bar */}
          <Card className="border-2 border-glow-green bg-card/90">
            <CardContent className="p-4 font-mono">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-accent uppercase tracking-wider">
                    <Heart className="w-3 h-3" />
                    <span>HEALTH</span>
                    <span className="ml-auto phosphor-glow-red">{health}/100</span>
                  </div>
                  <div className="h-4 bg-muted border border-accent/50 relative overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all"
                      style={{ width: `${health}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[hsl(195,100%,50%)] uppercase tracking-wider">
                    <Zap className="w-3 h-3" />
                    <span>ENERGY</span>
                    <span className="ml-auto">{energy}/100</span>
                  </div>
                  <div className="h-4 bg-muted border border-[hsl(195,100%,50%)]/50 relative overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(195,100%,50%)] transition-all"
                      style={{ width: `${energy}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-secondary uppercase tracking-wider phosphor-glow-amber">
                    <Star className="w-3 h-3" />
                    <span>XP</span>
                    <span className="ml-auto">{xp}/100</span>
                  </div>
                  <div className="h-4 bg-muted border border-secondary/50 relative overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${xp}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combat Area */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Enemy Card */}
            <Card className="border-2 border-accent/70 bg-card/90 relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-accent phosphor-glow-red font-mono text-lg tracking-wider">
                  <Skull className="w-5 h-5" />
                  &gt; SHADOW_DRONE
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono">
                <div className="flex items-center justify-center h-28 mb-4">
                  <pre className="text-accent phosphor-glow-red text-xs leading-tight glitch-hover">
{`    ▄▄▄▄▄▄▄▄▄▄▄    
  ▄█░░░░░░░░░░░█▄  
 ██░▀██░░░░██▀░░██ 
 ██░░░░░░░░░░░░░██ 
 ██░░▄▄▄▄▄▄▄▄░░░██ 
  ▀█░░░░░░░░░░░█▀  
    ▀▀▀▀▀▀▀▀▀▀▀    `}
                  </pre>
                </div>
                <div className="space-y-1 border-t border-accent/30 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">STATUS:</span>
                    <span className="text-accent">HOSTILE</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">HP:</span>
                    <span className="text-accent phosphor-glow-red">████████░░ 42/50</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-2 border-glow-green bg-card/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary phosphor-glow font-mono text-lg tracking-wider">
                  &gt; COMBAT_ACTIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 font-mono">
                <Button className="w-full justify-start gap-3 h-12 bg-primary/20 border-2 border-primary hover:bg-primary/40 text-primary phosphor-glow transition-all glitch-hover rounded-none">
                  <span className="text-xs">[1]</span>
                  <Sword className="w-4 h-4" />
                  <span>LASER_BLADE</span>
                  <span className="ml-auto text-xs">DMG:15</span>
                </Button>
                <Button className="w-full justify-start gap-3 h-12 bg-[hsl(195,100%,50%)]/20 border-2 border-[hsl(195,100%,50%)] hover:bg-[hsl(195,100%,50%)]/40 text-[hsl(195,100%,50%)] transition-all glitch-hover rounded-none">
                  <span className="text-xs">[2]</span>
                  <Zap className="w-4 h-4" />
                  <span>PLASMA_BURST</span>
                  <span className="ml-auto text-xs">DMG:25 EN:20</span>
                </Button>
                <Button className="w-full justify-start gap-3 h-12 bg-secondary/20 border-2 border-secondary hover:bg-secondary/40 text-secondary phosphor-glow-amber transition-all glitch-hover rounded-none">
                  <span className="text-xs">[3]</span>
                  <Shield className="w-4 h-4" />
                  <span>DEFLECT</span>
                  <span className="ml-auto text-xs">SHD:+10</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Zone Info */}
          <Card className="border-2 border-glow-green bg-card/90 font-mono">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">ZONE: 03/10</p>
                  <h3 className="text-primary phosphor-glow tracking-wider">
                    &gt; CORPORATE_WASTELAND
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">RANK:</p>
                  <p className="text-secondary phosphor-glow-amber tracking-wider">STRIKER</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-primary/40">
                ════════════════════════════════════
              </div>
            </CardContent>
          </Card>

          {/* Style Note */}
          <div className="text-center font-mono text-xs space-y-1">
            <p className="text-primary phosphor-glow">
              ▌ SCANLINES ▌ FLICKER ▌ GLITCH ▌ PHOSPHOR GLOW ▌
            </p>
            <p className="text-muted-foreground tracking-widest">
              [ MAXIMUM 80s/90s ARCADE VIBES ]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
