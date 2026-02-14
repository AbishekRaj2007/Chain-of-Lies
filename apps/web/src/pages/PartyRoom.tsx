import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLobby } from "@/contexts/LobbyContext";
import PlayerList from "@/components/lobby/PlayerList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Play, Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function PartyRoom() {
  const [, setLocation] = useLocation();
  const {
    user,
    currentParty,
    error,
    leaveParty,
    startGame,
    clearError,
  } = useLobby();

  const [copied, setCopied] = useState(false);

  // Redirect if not in a party
  useEffect(() => {
    if (!currentParty) {
      setLocation("/lobby");
    }
  }, [currentParty, setLocation]);

  // Navigate to game when started
  useEffect(() => {
    // Listen for party_started event
    // This will be handled by the socket listener in LobbyContext
    // For now, we'll just log it
  }, []);

  if (!currentParty || !user) {
    return null;
  }

  const isHost = currentParty.players.some(
    (p) => p.id === user.id && p.isHost
  );

  const handleLeaveParty = () => {
    leaveParty();
    setLocation("/lobby");
  };

  const handleStartGame = () => {
    startGame();
    // Navigate to game after a short delay
    setTimeout(() => {
      setLocation("/game");
    }, 500);
  };

  const handleCopyPartyId = () => {
    navigator.clipboard.writeText(currentParty.partyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleLeaveParty}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Leave Party
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {currentParty.hostName}'s Party
              </h1>
              <p className="text-muted-foreground">
                Share the party code with players to join
              </p>
            </div>
            {isHost && (
              <Badge className="bg-primary/15 text-primary border-primary/30">
                You are the host
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-auto p-1"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Party Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Party Code Card */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle>Party Code</CardTitle>
                <CardDescription>Share this code with players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-background border border-primary/30 rounded text-2xl font-mono font-bold text-center tracking-widest text-primary">
                      {currentParty.partyCode}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPartyId}
                    className="w-full gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Game Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Game Settings</CardTitle>
                <CardDescription>Current configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Players</span>
                  <span className="font-semibold">{currentParty.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Players</span>
                  <span className="font-semibold">{currentParty.players.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Waiting</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Start Game Button */}
            {isHost && (
              <Button
                onClick={handleStartGame}
                disabled={currentParty.players.length < 2}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-lg font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Game
              </Button>
            )}

            {!isHost && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    Waiting for host to start the game...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Player List */}
          <div className="lg:col-span-2">
            <PlayerList
              players={currentParty.players}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
