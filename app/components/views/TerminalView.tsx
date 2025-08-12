import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { CLICommand } from "~/types";

interface TerminalViewProps {
  terminalHistory: string[];
  currentCommand: string;
  setCurrentCommand: (command: string) => void;
  handleTerminalCommand: (command: string) => void;
  isTerminalActive: boolean;
  setIsTerminalActive: (active: boolean) => void;
  terminalRef: React.RefObject<HTMLDivElement>;
  cliCommands: CLICommand[];
}

export function TerminalView({
  terminalHistory,
  currentCommand,
  setCurrentCommand,
  handleTerminalCommand,
  isTerminalActive,
  setIsTerminalActive,
  terminalRef,
  cliCommands
}: TerminalViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-mono font-bold text-cli-teal">Interactive Terminal</h2>
        <p className="text-cli-yellow font-mono">Execute CLI commands and interact with your agents</p>
      </div>

      <Card className="bg-cli-terminal border-cli-teal/30 shadow-terminal animate-terminal-glow">
        <CardContent className="p-0">
          <div
            ref={terminalRef}
            className="h-96 overflow-y-auto p-4 font-mono text-sm bg-cli-bg/30"
            onClick={() => setIsTerminalActive(true)}
          >
            {terminalHistory.map((line, index) => (
              <div key={index} className={cn(
                "mb-1",
                line.startsWith('$') ? 'text-cli-coral' : 'text-cli-green',
                line.includes('✓') && 'text-cli-teal',
                line.includes('Error') && 'text-red-400'
              )}>
                {line}
              </div>
            ))}
            <div className="flex items-center">
              <span className="text-cli-coral mr-2">$</span>
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTerminalCommand(currentCommand);
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-cli-green font-mono"
                placeholder="Type a command..."
                autoFocus={isTerminalActive}
              />
              <span className="text-cli-green animate-blink">|</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command Reference */}
      <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
        <CardHeader>
          <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
            {safeLucideIcon('BookOpen', 'h-5 w-5')}
            Command Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cliCommands.map((cmd, index) => (
              <div key={index} className="p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                <div className="space-y-2">
                  <code className="text-cli-coral font-mono font-semibold">{cmd.command}</code>
                  <p className="text-cli-yellow font-mono text-sm">{cmd.description}</p>
                  <code className="text-cli-green font-mono text-xs block bg-cli-terminal/50 p-2 rounded">
                    {cmd.example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}