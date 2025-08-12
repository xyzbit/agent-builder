import { useState, useCallback, useRef, useEffect } from "react";
import type { CLICommand, Agent, Tool, Reference } from "~/types";

export function useTerminal(
  cliCommands: CLICommand[], 
  agents: Agent[], 
  tools: Tool[], 
  references: Reference[]
) {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to CLI Prompt Builder v1.0.0",
    "Type 'help' for available commands",
    "Type 'refs list' to view references",
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTerminalActive, setIsTerminalActive] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Terminal command handler
  const handleTerminalCommand = useCallback((command: string) => {
    if (!command.trim()) return;

    const newHistory = [...terminalHistory, `$ ${command}`];

    // Simple command processing
    if (command === "help") {
      newHistory.push("Available commands:");
      cliCommands.forEach(cmd => {
        newHistory.push(`  ${cmd.command} - ${cmd.description}`);
      });
    } else if (command === "clear") {
      setTerminalHistory(["Welcome to CLI Prompt Builder v1.0.0", "Type 'help' for available commands", ""]);
      setCurrentCommand("");
      return;
    } else if (command.startsWith("agent list")) {
      newHistory.push("Available agents:");
      agents.forEach((agent, index) => {
        newHistory.push(`  ${index + 1}. ${agent.name} (${agent.type}) - ${agent.status}`);
      });
    } else if (command.startsWith("tools list")) {
      newHistory.push("Available tools:");
      tools.forEach((tool, index) => {
        newHistory.push(`  ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    } else if (command.startsWith("refs")) {
      newHistory.push("Available references:");
      references.slice(0, 5).forEach((reference, index) => {
        newHistory.push(`  ${index + 1}. ${reference.name} (${reference.category})`);
      });
    } else {
      newHistory.push(`Executing: ${command}...`);
    }

    newHistory.push("");
    setTerminalHistory(newHistory);
    setCurrentCommand("");
  }, [terminalHistory, cliCommands, agents, tools, references]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  return {
    terminalHistory,
    setTerminalHistory,
    currentCommand,
    setCurrentCommand,
    isTerminalActive,
    setIsTerminalActive,
    terminalRef,
    handleTerminalCommand,
  };
}