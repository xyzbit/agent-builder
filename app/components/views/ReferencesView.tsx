import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Reference } from "~/types";

interface ReferencesViewProps {
  filteredReferences: Reference[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setIsCreateReferenceModalOpen: (open: boolean) => void;
  handleEditReference: (reference: Reference) => void;
  handleDeleteReference: (reference: Reference) => void;
  handleToggleReference: (reference: Reference) => void;
}

export function ReferencesView({
  filteredReferences,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  setIsCreateReferenceModalOpen,
  handleEditReference,
  handleDeleteReference,
  handleToggleReference
}: ReferencesViewProps) {
  return (
    <div className="space-y-6">
      {/* References Library */}
      <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                {safeLucideIcon('Library', 'h-5 w-5')}
                References Library
              </CardTitle>
              <CardDescription className="text-cli-yellow font-mono">
                Browse and search our curated collection of references
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateReferenceModalOpen(true)}
              className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
            >
              {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
              Add Reference
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search references by name..."
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="prompt_template">Prompt Template</SelectItem>
                <SelectItem value="workflow_guide">Workflow Guide</SelectItem>
                <SelectItem value="tool_documentation">Tool Documentation</SelectItem>
                <SelectItem value="best_practice">Best Practice</SelectItem>
                <SelectItem value="example">Example</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* References Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReferences.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-cli-yellow font-mono text-lg mb-2">
                  {searchQuery || selectedCategory !== "all" ? "No matching references found" : "No references available"}
                </div>
                <div className="text-cli-teal font-mono text-sm">
                  {searchQuery || selectedCategory !== "all" ? "Try adjusting your search or filters" : "Create your first reference to get started"}
                </div>
              </div>
            ) : (
              filteredReferences.map((reference) => (
              <Card key={reference.id} className="bg-cli-bg/50 border-cli-teal/20 hover:border-cli-coral/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-cli-teal font-mono text-lg flex items-center gap-2">
                      {safeLucideIcon('FileText', 'h-5 w-5')}
                      {reference.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        "font-mono text-xs",
                        reference.isActive ? "border-cli-green text-cli-green" : "border-cli-coral text-cli-coral"
                      )}>
                        {reference.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={reference.isActive}
                        onCheckedChange={() => handleToggleReference(reference)}
                        className="data-[state=checked]:bg-cli-teal"
                      />
                    </div>
                  </div>
                  <CardDescription className="text-cli-yellow font-mono text-sm">
                    {reference.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-cli-coral">
                      {safeLucideIcon('Tag', 'h-3 w-3')}
                      <span>{reference.category.replace('_', ' ')}</span>
                    </div>

                    <div className="pt-2 border-t border-cli-teal/20">
                      <p className="text-cli-green font-mono text-xs line-clamp-3">
                        {reference.content.substring(0, 120)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cli-yellow font-mono text-xs">
                        Created: {new Date(reference.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReference(reference)}
                      className="flex-1 border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
                    >
                      {safeLucideIcon('Edit', 'mr-1 h-3 w-3')}
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReference(reference)}
                      className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
                    >
                      {safeLucideIcon('Trash2', 'h-3 w-3')}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}