import { Badge } from "~/components/ui/badge";
import { ThemeToggle } from "~/components/ui/theme-provider";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { ActiveView } from "~/types";

interface AppHeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export function AppHeader({ activeView, setActiveView }: AppHeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'agents', label: 'Agents', icon: 'Bot' },
    { id: 'builder', label: 'Builder', icon: 'Wrench' },
    { id: 'tools', label: 'Tools', icon: 'Settings' },
    { id: 'references', label: 'References', icon: 'Lightbulb' },
    { id: 'terminal', label: 'Terminal', icon: 'Terminal' },
    { id: 'docs', label: 'Docs', icon: 'Book' },
  ] as const;

  return (
    <div className="-mx-6 -mt-6 border-b border-cli-teal/20 bg-cli-terminal/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {safeLucideIcon('Terminal', 'h-8 w-8 text-cli-teal')}
            <h1 className="font-mono text-xl font-bold text-cli-teal">CLI Prompt Builder</h1>
          </div>
          <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
            v1.0.0
          </Badge>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === item.id
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon(item.icon as any, 'mr-2 h-4 w-4')}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {safeLucideIcon('Settings', 'h-5 w-5 text-cli-coral cursor-pointer hover:text-cli-yellow transition-colors')}
        </div>
      </div>
    </div>
  );
}