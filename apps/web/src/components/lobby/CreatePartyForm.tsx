import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Lock } from "lucide-react";

interface CreatePartyFormProps {
  onCreateParty: (name: string, adminPassword: string) => void;
  isLoading?: boolean;
}

export default function CreatePartyForm({ onCreateParty, isLoading }: CreatePartyFormProps) {
  const [partyName, setPartyName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partyName.trim() && adminPassword.trim()) {
      onCreateParty(partyName.trim(), adminPassword.trim());
      setPartyName("");
      setAdminPassword("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Create New Party (Admin Only)
        </CardTitle>
        <CardDescription>Start your own game lobby with admin access</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="party-name">Your Name</Label>
            <Input
              id="party-name"
              placeholder="Enter your name..."
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              disabled={isLoading}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={isLoading}
              className="bg-white/5 border-white/10"
            />
            <p className="text-xs text-muted-foreground">
              For testing: use "admin123"
            </p>
          </div>
          <Button
            type="submit"
            disabled={!partyName.trim() || !adminPassword.trim() || isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Party
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
