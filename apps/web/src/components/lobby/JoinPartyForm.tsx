import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Hash } from "lucide-react";

interface JoinPartyFormProps {
  onJoinParty: (partyCode: string, name: string) => void;
  isLoading?: boolean;
}

export default function JoinPartyForm({ onJoinParty, isLoading }: JoinPartyFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [partyCode, setPartyCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && partyCode.trim()) {
      onJoinParty(partyCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handlePartyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setPartyCode(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          Join Party
        </CardTitle>
        <CardDescription>Enter a party code to join an existing game</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Your Name</Label>
            <Input
              id="player-name"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isLoading}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="party-code">Party Code</Label>
            <Input
              id="party-code"
              placeholder="Enter 6-character code..."
              value={partyCode}
              onChange={handlePartyCodeChange}
              disabled={isLoading}
              className="bg-white/5 border-white/10 font-mono text-lg tracking-wider text-center"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Ask the host for the party code
            </p>
          </div>
          <Button
            type="submit"
            disabled={!playerName.trim() || partyCode.length !== 6 || isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Joining...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Join Party
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
