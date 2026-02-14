import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLobby } from "@/contexts/LobbyContext";
import JoinPartyForm from "@/components/lobby/JoinPartyForm";
import CreatePartyForm from "@/components/lobby/CreatePartyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LobbyPage() {
  const [, setLocation] = useLocation();
  const {
    currentParty,
    isLoading,
    error,
    createParty,
    joinParty,
    clearError,
  } = useLobby();

  // Navigate to party room when joined
  useEffect(() => {
    if (currentParty) {
      setLocation("/party");
    }
  }, [currentParty, setLocation]);

  const handleCreateParty = (name: string, adminPassword: string) => {
    createParty(name, adminPassword);
  };

  const handleJoinParty = (partyCode: string, name: string) => {
    joinParty(partyCode, name);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
          <p className="text-muted-foreground">
            Create a party as admin or join using a party code
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Left Column - Create Party (Admin) */}
          <div>
            <CreatePartyForm
              onCreateParty={handleCreateParty}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Join Party */}
          <div>
            <JoinPartyForm
              onJoinParty={handleJoinParty}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Admins:</span> Create a party with the admin password. 
                You'll receive a 6-character party code to share with players.
              </p>
              <p>
                <span className="font-semibold text-foreground">Players:</span> Get the party code from your host 
                and enter it along with your name to join the game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
