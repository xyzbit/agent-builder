import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Tool } from "~/types";

interface ToolsViewProps {
  allTools: Tool[];
  handleEditTool: (tool: Tool) => void;
  handleDeleteTool: (tool: Tool) => void;
  handleToggleTool: (tool: Tool) => void;
  setIsCreateModalOpen: (open: boolean) => void;
}

export function ToolsView({
  allTools,
  handleEditTool,
  handleDeleteTool,
  handleToggleTool,
  setIsCreateModalOpen
}: ToolsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-mono font-bold text-cli-teal">Tools Management</h2>
          <p className="text-cli-yellow font-mono mt-2">Manage your MCP, CLI, and OpenAPI tools</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
        >
          {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
          Add Tool
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTools.map((tool) => (
          <Card key={tool.id} className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal hover:shadow-cli-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-cli-teal font-mono text-lg flex items-center gap-2">
                  {safeLucideIcon(
                    tool.toolType === 'mcp' ? 'Plug' :
                      tool.toolType === 'cli' ? 'Terminal' : 'Globe',
                    'h-5 w-5'
                  )}
                  {tool.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "font-mono text-xs",
                    tool.toolType === 'mcp' ? "border-cli-teal text-cli-teal" :
                      tool.toolType === 'cli' ? "border-cli-yellow text-cli-yellow" :
                        "border-cli-coral text-cli-coral"
                  )}>
                    {tool.toolType.toUpperCase()}
                  </Badge>
                  <Switch
                    checked={tool.isActive}
                    onCheckedChange={() => handleToggleTool(tool)}
                    className="data-[state=checked]:bg-cli-teal"
                  />
                </div>
              </div>
              <CardDescription className="text-cli-yellow font-mono">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cli-coral font-mono">Category:</span>
                  <Badge variant="secondary" className="bg-cli-bg/50 text-cli-green font-mono">
                    {tool.category}
                  </Badge>
                </div>
                {tool.usage && (
                  <div className="space-y-2">
                    <span className="text-cli-coral font-mono text-sm">Usage:</span>
                    <p className="text-cli-green font-mono text-xs bg-cli-bg/50 p-2 rounded border border-cli-teal/20 line-clamp-3">
                      {tool.usage}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cli-coral font-mono">Created:</span>
                  <span className="text-cli-yellow font-mono">
                    {new Date(tool.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTool(tool)}
                  className="flex-1 border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
                >
                  {safeLucideIcon('Edit', 'mr-1 h-3 w-3')}
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTool(tool)}
                  className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
                >
                  {safeLucideIcon('Trash2', 'h-3 w-3')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {allTools.length === 0 && (
        <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              {safeLucideIcon('Settings', 'h-12 w-12 text-cli-teal/50 mx-auto')}
              <div>
                <h3 className="text-cli-teal font-mono text-lg font-semibold">No Tools Configured</h3>
                <p className="text-cli-yellow font-mono mt-2">Start by adding your first tool to enhance your agent workflows</p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
                Add Your First Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}