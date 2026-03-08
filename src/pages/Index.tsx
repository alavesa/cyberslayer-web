import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Zap, Heart, Star, Skull } from "lucide-react";

const Index = () => {
  const [health] = useState(85);
  const [energy] = useState(60);
  const [xp] = useState(45);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2">
            <span className="text-primary text-neon-pink">CYBER</span>
            <span className="text-secondary text-neon-blue">SLAYER</span>
          </h1>
          <p className="text-muted-foreground">Cyberpunk Neon — Visual Preview</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Bar */}
          <Card className="border-2 border-neon-pink bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 text-health" />
                    <span>Health</span>
                    <span className="ml-auto font-mono text-foreground">{health}/100</span>
                  </div>
                  <Progress value={health} className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-secondary" />
                    <span>Energy</span>
                    <span className="ml-auto font-mono text-foreground">{energy}/100</span>
                  </div>
                  <Progress value={energy} className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-accent" />
                    <span>XP</span>
                    <span className="ml-auto font-mono text-foreground">{xp}/100</span>
                  </div>
                  <Progress value={xp} className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-fuchsia-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combat Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Enemy Card */}
            <Card className="border-2 border-neon-blue bg-card/80 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-accent/10 pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-secondary text-neon-blue">
                  <Skull className="w-5 h-5" />
                  Shadow Drone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 border-2 border-secondary/50 flex items-center justify-center neon-glow-blue">
                      <Skull className="w-12 h-12 text-secondary" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">HP</span>
                    <span className="font-mono text-secondary">42/50</span>
                  </div>
                  <Progress value={84} className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-400" />
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-2 border-neon-pink bg-card/80 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-neon-pink">Combat Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3 h-14 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-400 neon-glow-pink text-primary-foreground font-semibold transition-all hover:scale-[1.02]">
                  <Sword className="w-5 h-5" />
                  <span>Laser Blade</span>
                  <span className="ml-auto text-xs bg-black/20 px-2 py-1 rounded">15 DMG</span>
                </Button>
                <Button className="w-full justify-start gap-3 h-14 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 neon-glow-blue text-white font-semibold transition-all hover:scale-[1.02]">
                  <Zap className="w-5 h-5" />
                  <span>Plasma Burst</span>
                  <span className="ml-auto text-xs bg-black/20 px-2 py-1 rounded">25 DMG • 20 Energy</span>
                </Button>
                <Button className="w-full justify-start gap-3 h-14 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 neon-glow-purple text-white font-semibold transition-all hover:scale-[1.02]">
                  <Shield className="w-5 h-5" />
                  <span>Deflect</span>
                  <span className="ml-auto text-xs bg-black/20 px-2 py-1 rounded">+10 Shield</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Zone Info */}
          <Card className="border border-accent/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Zone 3 / 10</p>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Corporate Wasteland
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-lg font-bold text-primary text-neon-pink">STRIKER</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Style Note */}
          <div className="text-center text-muted-foreground text-sm space-y-1">
            <p className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-medium">
              Hot Pink • Electric Blue • Purple Accents
            </p>
            <p>Glowing UI elements • Smooth animations • Cyberpunk aesthetic</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
