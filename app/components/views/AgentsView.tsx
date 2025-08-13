import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import { InstallModal } from "~/components/modals/InstallModal";
import type { Agent, ActiveView } from "~/types";

// Helper functions to extract tool and reference counts
function extractToolIds(content: string): number[] {
  const regex = /\[([^\]]+)\]\(toolid_(\d+)\)/g;
  const ids: number[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[2]);
    if (id > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

function extractReferenceIds(content: string): number[] {
  const regex = /\[([^\]]+)\]\(refid_(\d+)\)/g;
  const ids: number[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[2]);
    if (id > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

function getAgentStats(agent: Agent) {
  const toolCount = extractToolIds(agent.generatedPrompt || '').length;
  const referenceCount = extractReferenceIds(agent.generatedPrompt || '').length;
  return { toolCount, referenceCount };
}

interface AgentsViewProps {
  agents: Agent[];
  setActiveView: (view: ActiveView) => void;
  setSelectedAgent: (agent: Agent | null) => void;
}

export function AgentsView({ agents, setActiveView, setSelectedAgent }: AgentsViewProps) {
  const [installAgent, setInstallAgent] = useState<Agent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleInstallClick = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation(); // Prevent card click
    setInstallAgent(agent);
    setIsInstallModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-mono font-bold text-cli-teal">Agents & Workflows</h2>
          <p className="text-cli-yellow font-mono mt-2">Manage your AI agents and workflow configurations</p>
        </div>
        <Button
          onClick={() => setActiveView("builder")}
          className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
        >
          {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
          New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const { toolCount, referenceCount } = getAgentStats(agent);
          return (
            <Card key={agent.id} className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal hover:shadow-cli-glow transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedAgent(agent)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cli-teal font-mono text-lg flex items-center gap-2">
                    {safeLucideIcon(agent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5')}
                    {agent.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
                    {agent.type}
                  </Badge>
                </div>
                <CardDescription className="text-cli-yellow font-mono">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-cli-bg/50 p-3 rounded-lg border border-cli-teal/20">
                    <p className="text-xs font-mono text-cli-yellow mb-2">Task Requirements:</p>
                    <p className="text-sm font-mono text-cli-teal truncate">
                      {agent.taskRequirements.substring(0, 80)}...
                    </p>
                  </div>
                  
                  {/* Tools and References Stats */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 text-cli-teal">
                      {safeLucideIcon('Wrench', 'h-3 w-3')}
                      <span>{toolCount} Tools</span>
                    </div>
                    <div className="flex items-center gap-1 text-cli-yellow">
                      {safeLucideIcon('BookOpen', 'h-3 w-3')}
                      <span>{referenceCount} Refs</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-mono">
                    <Badge variant="outline" className={cn(
                      "font-mono",
                      agent.status === 'active' ? "border-cli-green text-cli-green" :
                        agent.status === 'draft' ? "border-cli-yellow text-cli-yellow" : "border-cli-coral text-cli-coral"
                    )}>
                      {agent.status}
                    </Badge>
                    <span className="text-cli-coral">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Install Button */}
                  <div className="mt-3 pt-3 border-t border-cli-teal/20">
                    <Button
                      size="sm"
                      onClick={(e) => handleInstallClick(e, agent)}
                      className="w-full bg-cli-coral hover:bg-cli-coral/80 text-white font-mono text-xs shadow-cli-glow"
                    >
                      {safeLucideIcon('Download', 'mr-2 h-3 w-3')}
                      安装
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Install Modal */}
      <InstallModal
        agent={installAgent}
        isOpen={isInstallModalOpen}
        onClose={() => {
          setIsInstallModalOpen(false);
          setInstallAgent(null);
        }}
      />
    </div>
  );
}