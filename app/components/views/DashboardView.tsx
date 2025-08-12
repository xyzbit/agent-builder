import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Agent, Reference, ActiveView } from "~/types";

interface DashboardViewProps {
  agents: Agent[];
  references: Reference[];
  stats: {
    totalAgents: number;
    totalTools: number;
    activeAgents: number;
    activeSessions: number;
    totalReferences: number;
    lastUpdated: string;
  };
  setActiveView: (view: ActiveView) => void;
  setIsCreateReferenceModalOpen: (open: boolean) => void;
  filteredReferences: Reference[];
  searchQuery: string;
  selectedCategory: string;
}

export function DashboardView({ 
  agents, 
  stats, 
  setActiveView, 
  setIsCreateReferenceModalOpen,
  filteredReferences,
  searchQuery,
  selectedCategory
}: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 rounded-3xl"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200)'
            }}
          />
          <div className="relative p-12 bg-cli-terminal/80 backdrop-blur-sm border border-cli-teal/30 shadow-terminal rounded-3xl">
            <h1 className="text-4xl md:text-6xl font-mono font-bold text-cli-teal mb-4">
              <span className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-cli-coral">
                CLI Prompt Builder
              </span>
            </h1>
            <p className="text-lg text-cli-yellow max-w-2xl mx-auto font-mono leading-relaxed">
              Build and configure agent workflows with references guidance and interactive assistance.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button
                onClick={() => setActiveView("builder")}
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono px-8 py-3 text-lg shadow-cli-glow"
              >
                {safeLucideIcon('Wrench', 'mr-2 h-5 w-5')}
                Start Building
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView("references")}
                className="border-cli-yellow text-cli-yellow hover:bg-cli-yellow/10 font-mono px-8 py-3 text-lg"
              >
                {safeLucideIcon('Lightbulb', 'mr-2 h-5 w-5')}
                References
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cli-yellow font-mono text-sm">Total Agents</p>
                <p className="text-3xl font-mono font-bold text-cli-teal">{stats.totalAgents}</p>
              </div>
              <div className="w-12 h-12 bg-cli-teal/20 rounded-lg flex items-center justify-center">
                {safeLucideIcon('Bot', 'h-6 w-6 text-cli-teal')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cli-terminal/50 border-cli-coral/30 shadow-terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cli-yellow font-mono text-sm">Active Agents</p>
                <p className="text-3xl font-mono font-bold text-cli-coral">{stats.activeAgents}</p>
              </div>
              <div className="w-12 h-12 bg-cli-coral/20 rounded-lg flex items-center justify-center">
                {safeLucideIcon('Activity', 'h-6 w-6 text-cli-coral')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cli-terminal/50 border-cli-yellow/30 shadow-terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cli-yellow font-mono text-sm">Available Tools</p>
                <p className="text-3xl font-mono font-bold text-cli-yellow">{stats.totalTools}</p>
              </div>
              <div className="w-12 h-12 bg-cli-yellow/20 rounded-lg flex items-center justify-center">
                {safeLucideIcon('Wrench', 'h-6 w-6 text-cli-yellow')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cli-terminal/50 border-cli-green/30 shadow-terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cli-yellow font-mono text-sm">Active Sessions</p>
                <p className="text-3xl font-mono font-bold text-cli-green">{stats.activeSessions}</p>
              </div>
              <div className="w-12 h-12 bg-cli-green/20 rounded-lg flex items-center justify-center">
                {safeLucideIcon('MessageSquare', 'h-6 w-6 text-cli-green')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cli-terminal/50 border-cli-amber/30 shadow-terminal">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cli-yellow font-mono text-sm">References</p>
                <p className="text-3xl font-mono font-bold text-cli-amber">{stats.totalReferences}</p>
              </div>
              <div className="w-12 h-12 bg-cli-amber/20 rounded-lg flex items-center justify-center">
                {safeLucideIcon('Lightbulb', 'h-6 w-6 text-cli-amber')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Agents */}
      <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
        <CardHeader>
          <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
            {safeLucideIcon('Clock', 'h-5 w-5')}
            Recent Agents
          </CardTitle>
          <CardDescription className="text-cli-yellow font-mono">
            Your recently created agents and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cli-teal/20 rounded-lg flex items-center justify-center">
                    {safeLucideIcon(agent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5 text-cli-teal')}
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold text-cli-teal">{agent.name}</h3>
                    <p className="text-sm text-cli-yellow font-mono">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono">
                    {agent.type}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "font-mono",
                    agent.status === 'active' ? "border-cli-green text-cli-green" : "border-cli-yellow text-cli-yellow"
                  )}>
                    {agent.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {filteredReferences.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="space-y-4">
                  {safeLucideIcon('FileText', 'h-12 w-12 text-cli-teal/50 mx-auto')}
                  <div>
                    <h3 className="text-cli-teal font-mono text-lg font-semibold">
                      {searchQuery || selectedCategory !== 'all' ? 'No matching references found' : 'No references available'}
                    </h3>
                    <p className="text-cli-yellow font-mono mt-2">
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'Start by adding your first reference to build your knowledge base'
                      }
                    </p>
                  </div>
                  {!searchQuery && selectedCategory === 'all' && (
                    <Button
                      onClick={() => setIsCreateReferenceModalOpen(true)}
                      className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
                    >
                      {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
                      Add Your First Reference
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}