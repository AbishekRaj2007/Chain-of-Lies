import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, User } from "lucide-react";
import type { Player } from "@/types/lobby";

interface PlayerListProps {
  players: Player[];
  currentUserId?: string;
}

function getInitials(name: string): string {
  const parts = name.split(/[\s-_]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function PlayerList({ players, currentUserId }: PlayerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Players</span>
          <Badge variant="secondary">
            {players.length}/8
          </Badge>
        </CardTitle>
        <CardDescription>Waiting for players to join...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => {
            const isCurrentUser = player.id === currentUserId;
            
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCurrentUser
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/10 text-foreground/90">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {player.name}
                      {isCurrentUser && (
                        <span className="text-primary ml-1">(You)</span>
                      )}
                    </span>
                    {player.isHost && (
                      <Badge className="bg-primary/15 text-primary border-primary/30">
                        <Crown className="h-3 w-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {player.isHost ? "Party Leader" : "Player"}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-white/10 bg-white/5 opacity-50"
            >
              <div className="h-10 w-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                Waiting for player...
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
