import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Agent, ActiveView } from "~/types";

interface AgentsViewProps {
  agents: Agent[];
  setActiveView: (view: ActiveView) => void;
  setSelectedAgent: (agent: Agent | null) => void;
}

export function AgentsView({ agents, setActiveView, setSelectedAgent }: AgentsViewProps) {
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
        {agents.map((agent) => (
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}