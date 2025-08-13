import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { safeLucideIcon } from "~/components/ui/icon";
import { useToast } from "~/hooks/use-toast";
import type { Agent } from "~/types";

interface InstallModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

type Platform = "cursor" | "trae";

export function InstallModal({ agent, isOpen, onClose }: InstallModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("cursor");
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  if (!agent) return null;

  const handleCopyCommand = async () => {
    setIsInstalling(true);
    try {
      // Generate installation command
      const installCommand = generateInstallCommand();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(installCommand);
      
      toast({
        title: "复制成功",
        description: "安装命令已复制到剪贴板，请在终端中运行",
      });
      onClose();
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "复制失败",
        description: error instanceof Error ? error.message : "复制命令时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const generateInstallCommand = () => {
    const baseUrl = window.location.origin;
    const agentId = agent.id;
    
    return `curl -sSL "${baseUrl}/install/${agentId}?platform=${selectedPlatform}" | bash`;
  };


  const getInstallPaths = () => {
    const paths = {
      cursor: {
        docs: ".cursor/rules/docs",
        tools: ".cursor/rules/tools",
        agent: ".cursor/rules/agent",
        mcp: ".cursor"
      },
      trae: {
        docs: ".trae/rules/docs",
        tools: ".trae/rules/tools", 
        agent: ".trae/rules/agent",
        mcp: ".trae"
      }
    };
    
    return paths[selectedPlatform];
  };

  const installPaths = getInstallPaths();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cli-terminal border-cli-teal/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-cli-teal font-mono flex items-center gap-2">
            {safeLucideIcon('Copy', 'h-5 w-5')}
            获取安装命令: {agent.name}
          </DialogTitle>
          <DialogDescription className="text-cli-yellow font-mono">
            选择安装平台，系统将生成安装命令供您在终端中执行
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-cli-yellow font-mono">选择平台</Label>
            <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as Platform)}>
              <SelectTrigger className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono">
                <SelectValue placeholder="选择平台" />
              </SelectTrigger>
              <SelectContent className="bg-cli-terminal border-cli-teal/30">
                <SelectItem value="cursor" className="text-cli-green font-mono">
                  <span className="flex items-center gap-2">
                    {safeLucideIcon('Code', 'h-4 w-4')}
                    Cursor
                  </span>
                </SelectItem>
                <SelectItem value="trae" className="text-cli-green font-mono">
                  <span className="flex items-center gap-2">
                    {safeLucideIcon('Terminal', 'h-4 w-4')}
                    Trae
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Installation Paths Info */}
          <div className="bg-cli-bg/30 p-4 rounded-lg border border-cli-teal/20">
            <h3 className="text-cli-teal font-mono text-sm mb-3">安装路径预览:</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-cli-yellow">References:</span>
                <span className="text-cli-green">{installPaths.docs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cli-yellow">Tools:</span>
                <span className="text-cli-green">{installPaths.tools}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cli-yellow">MCP Config:</span>
                <span className="text-cli-green">{installPaths.mcp}</span>
              </div>
            </div>
          </div>

          {/* Command Preview */}
          <div className="bg-cli-bg/30 p-4 rounded-lg border border-cli-teal/20">
            <h3 className="text-cli-teal font-mono text-sm mb-3">安装命令:</h3>
            <div className="bg-cli-terminal/50 p-3 rounded font-mono text-cli-green overflow-x-auto">
              <code className="text-sm">{generateInstallCommand()}</code>
            </div>
            <p className="text-cli-yellow text-xs mt-2">
              💡 复制此命令并在终端中运行，将自动下载所有必需的配置文件到 {selectedPlatform.toUpperCase()} 的用户配置目录
            </p>
          </div>

          {/* Agent Info */}
          <div className="bg-cli-bg/30 p-4 rounded-lg border border-cli-teal/20">
            <h3 className="text-cli-teal font-mono text-sm mb-3">Agent 信息:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
                  {agent.type}
                </Badge>
                <Badge variant="outline" className="border-cli-green text-cli-green font-mono text-xs">
                  {agent.status}
                </Badge>
              </div>
              <p className="text-cli-yellow font-mono text-sm">{agent.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              disabled={isInstalling}
            >
              取消
            </Button>
            <Button
              onClick={handleCopyCommand}
              disabled={isInstalling}
              className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
            >
              {isInstalling ? (
                <>
                  {safeLucideIcon('Loader2', 'mr-2 h-4 w-4 animate-spin')}
                  复制中...
                </>
              ) : (
                <>
                  {safeLucideIcon('Copy', 'mr-2 h-4 w-4')}
                  复制安装命令
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
