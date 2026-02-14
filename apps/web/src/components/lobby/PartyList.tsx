import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown } from "lucide-react";
import type { Party } from "@/types/lobby";

interface PartyListProps {
  parties: Party[];
  onJoinParty: (partyId: string) => void;
  isLoading?: boolean;
}

export default function PartyList({ parties, onJoinParty, isLoading }: PartyListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Parties</CardTitle>
          <CardDescription>Loading parties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Parties</CardTitle>
          <CardDescription>No parties available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No parties found. Create one to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Parties</CardTitle>
        <CardDescription>Join a party to start playing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parties.map((party) => (
            <div
              key={party.id}
              className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/7 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{party.hostName}'s Party</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    {party.playerCount}/{party.maxPlayers || 8} players
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {party.playerCount >= (party.maxPlayers || 8) ? (
                  <Badge variant="secondary">Full</Badge>
                ) : (
                  <Button
                    onClick={() => onJoinParty(party.id)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
