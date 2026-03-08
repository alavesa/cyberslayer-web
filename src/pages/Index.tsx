import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Shield, Zap, Heart, Star, Skull } from "lucide-react";

const PixelHeart = ({ filled }: { filled: boolean }) => (
  <div className={`w-4 h-4 ${filled ? 'bg-destructive' : 'bg-muted'}`} 
       style={{ clipPath: 'polygon(50% 0%, 100% 35%, 100% 70%, 50% 100%, 0% 70%, 0% 35%)' }} />
);

const Index = () => {
  const [health] = useState(85);
  const [energy] = useState(60);
  const [xp] = useState(45);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl tracking-tight mb-2">
          <span className="text-primary">CYBER</span>
          <span className="text-destructive">SLAYER</span>
        </h1>
        <p className="text-muted-foreground text-[8px] md:text-[10px]">
          PIXEL ART 8-BIT STYLE
        </p>
        <div className="mt-2 flex justify-center gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-primary" />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Stats Bar */}
        <Card className="pixel-border-primary bg-card rounded-none">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Health */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[8px] text-destructive">
                  <Heart className="w-3 h-3" fill="currentColor" />
                  <span>HP</span>
                  <span className="ml-auto">{health}/100</span>
                </div>
                <div className="h-4 bg-muted pixel-border relative overflow-hidden">
                  <div 
                    className="h-full bg-destructive pixel-bar"
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>
              {/* Energy */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[8px] text-secondary">
                  <Zap className="w-3 h-3" fill="currentColor" />
                  <span>MP</span>
                  <span className="ml-auto">{energy}/100</span>
                </div>
                <div className="h-4 bg-muted pixel-border relative overflow-hidden">
                  <div 
                    className="h-full bg-secondary pixel-bar"
                    style={{ width: `${energy}%` }}
                  />
                </div>
              </div>
              {/* XP */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[8px] text-accent">
                  <Star className="w-3 h-3" fill="currentColor" />
                  <span>XP</span>
                  <span className="ml-auto">{xp}/100</span>
                </div>
                <div className="h-4 bg-muted pixel-border relative overflow-hidden">
                  <div 
                    className="h-full bg-accent pixel-bar"
                    style={{ width: `${xp}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combat Area */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Enemy Card */}
          <Card className="pixel-border-destructive bg-card rounded-none">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-[10px]">
                <Skull className="w-4 h-4" />
                SHADOW DRONE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {/* Pixel Art Enemy */}
              <div className="flex items-center justify-center h-24 mb-3">
                <div className="pixel-bounce">
                  <div className="grid grid-cols-8 gap-0" style={{ width: '64px', height: '64px' }}>
                    {/* Simple pixel art skull pattern */}
                    {[
                      0,0,1,1,1,1,0,0,
                      0,1,1,1,1,1,1,0,
                      1,1,2,1,1,2,1,1,
                      1,1,1,1,1,1,1,1,
                      1,1,1,1,1,1,1,1,
                      0,1,0,1,1,0,1,0,
                      0,1,1,0,0,1,1,0,
                      0,0,1,1,1,1,0,0,
                    ].map((pixel, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 ${
                          pixel === 0 ? 'bg-transparent' : 
                          pixel === 1 ? 'bg-destructive' : 
                          'bg-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1 border-t-4 border-destructive/30 pt-2">
                <div className="flex justify-between text-[8px]">
                  <span className="text-muted-foreground">LVL 5</span>
                  <span className="text-destructive">HP: 42/50</span>
                </div>
                <div className="h-3 bg-muted pixel-border relative overflow-hidden">
                  <div className="h-full bg-destructive" style={{ width: '84%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="pixel-border-primary bg-card rounded-none">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-primary text-[10px]">
                ACTIONS{cursorVisible && <span className="text-foreground">_</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <Button className="w-full justify-start gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 pixel-btn rounded-none text-[8px]">
                <span className="bg-primary-foreground text-primary px-1">A</span>
                <Sword className="w-3 h-3" />
                <span>LASER BLADE</span>
                <span className="ml-auto">DMG 15</span>
              </Button>
              <Button className="w-full justify-start gap-2 h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 pixel-btn rounded-none text-[8px]">
                <span className="bg-secondary-foreground text-secondary px-1">B</span>
                <Zap className="w-3 h-3" />
                <span>PLASMA</span>
                <span className="ml-auto">DMG 25</span>
              </Button>
              <Button className="w-full justify-start gap-2 h-10 bg-accent text-accent-foreground hover:bg-accent/90 pixel-btn rounded-none text-[8px]">
                <span className="bg-accent-foreground text-accent px-1">C</span>
                <Shield className="w-3 h-3" />
                <span>DEFLECT</span>
                <span className="ml-auto">+10 DEF</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Zone Info */}
        <Card className="pixel-border bg-card rounded-none">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-[8px]">
              <div>
                <p className="text-muted-foreground">ZONE 03/10</p>
                <h3 className="text-primary text-[10px]">CORPORATE WASTELAND</h3>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">RANK</p>
                <p className="text-accent text-[10px]">STRIKER</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style Note */}
        <div className="text-center text-[8px] space-y-1">
          <div className="flex justify-center gap-2 text-muted-foreground">
            <span className="text-primary">■</span>
            <span className="text-secondary">■</span>
            <span className="text-destructive">■</span>
            <span className="text-accent">■</span>
            <span className="text-[hsl(280,60%,50%)]">■</span>
          </div>
          <p className="text-primary">LIMITED PALETTE - CHUNKY PIXELS</p>
          <p className="text-muted-foreground">AUTHENTIC 8-BIT AESTHETIC</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
