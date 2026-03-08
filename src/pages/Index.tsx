import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Zap, Heart, Star, Skull } from "lucide-react";

const Index = () => {
  const [health, setHealth] = useState(85);
  const [energy, setEnergy] = useState(60);
  const [xp, setXp] = useState(45);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
          CYBER<span className="text-primary text-glow-primary">SLAYER</span>
        </h1>
        <p className="text-muted-foreground">Clean Modern Dark — Visual Preview</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Bar */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 text-health" />
                  <span>Health</span>
                  <span className="ml-auto font-mono text-foreground">{health}/100</span>
                </div>
                <Progress value={health} className="h-2 bg-secondary [&>div]:bg-health" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-energy" />
                  <span>Energy</span>
                  <span className="ml-auto font-mono text-foreground">{energy}/100</span>
                </div>
                <Progress value={energy} className="h-2 bg-secondary [&>div]:bg-energy" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-xp" />
                  <span>XP</span>
                  <span className="ml-auto font-mono text-foreground">{xp}/100</span>
                </div>
                <Progress value={xp} className="h-2 bg-secondary [&>div]:bg-xp" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combat Area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Enemy Card */}
          <Card className="border-accent/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-accent">
                <Skull className="w-5 h-5" />
                Shadow Drone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 mb-4">
                <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center animate-pulse-glow">
                  <Skull className="w-12 h-12 text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">HP</span>
                  <span className="font-mono">42/50</span>
                </div>
                <Progress value={84} className="h-2 bg-secondary [&>div]:bg-accent" />
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2">
              <CardTitle className="text-primary">Combat Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3 h-12 glow-primary" variant="default">
                <Sword className="w-5 h-5" />
                <span>Laser Blade</span>
                <span className="ml-auto text-xs opacity-70">15 DMG</span>
              </Button>
              <Button className="w-full justify-start gap-3 h-12" variant="secondary">
                <Zap className="w-5 h-5 text-energy" />
                <span>Plasma Burst</span>
                <span className="ml-auto text-xs opacity-70">25 DMG • 20 Energy</span>
              </Button>
              <Button className="w-full justify-start gap-3 h-12" variant="outline">
                <Shield className="w-5 h-5" />
                <span>Deflect</span>
                <span className="ml-auto text-xs opacity-70">+10 Shield</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Zone Info */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zone 3 / 10</p>
                <h3 className="text-lg font-semibold">Corporate Wasteland</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-lg font-semibold text-primary">STRIKER</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style Note */}
        <div className="text-center text-muted-foreground text-sm">
          <p>Sleek dark UI • Subtle glow effects • Polished animations</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
