import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { safeLucideIcon } from "~/components/ui/icon";
import type { Agent } from "~/types";

interface AgentModalProps {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
}

export function AgentModal({ selectedAgent, setSelectedAgent }: AgentModalProps) {
  if (!selectedAgent) return null;

  return (
    <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
      <DialogContent className="bg-cli-terminal border-cli-teal/30 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-cli-teal font-mono flex items-center gap-2">
            {safeLucideIcon(selectedAgent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5')}
            {selectedAgent.name}
          </DialogTitle>
          <DialogDescription className="text-cli-yellow font-mono">
            {selectedAgent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-cli-yellow font-mono">Task Requirements</Label>
            <div className="mt-2 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
              <p className="text-cli-green font-mono text-sm whitespace-pre-wrap">
                {selectedAgent.taskRequirements}
              </p>
            </div>
          </div>

          {selectedAgent.generatedPrompt && (
            <div>
              <Label className="text-cli-yellow font-mono">Generated Prompt</Label>
              <div className="mt-2 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                <p className="text-cli-green font-mono text-sm whitespace-pre-wrap">
                  {selectedAgent.generatedPrompt}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}