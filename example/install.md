
安装可以选择平台，目前支持 Cursor,Trae, 可选择安装到用户级别还是项目级别（项目级别需要选择目录）安装逻辑如下：
1. 获取安装的内容：
- reference+tool文件：内容中提取 reference id 和 tool id，查询出来
- prompt内容

根据平台和级别安装到不同目录，规则如下：
tools 特殊处理规则：
mcp类型的工具需要单独生成一个`mcp.json`文件，合成规则：
完整mcp.json如下
{
  "mcpServers": {   
    "openmemory": {
      "command": "npx",
      "args": [
        "-y",
        "openmemory"
      ],
      "env": {
        "OPENMEMORY_API_KEY": "om-gcxutb8fwbux2ntcbhisobd5atgx6emu",
        "CLIENT_NAME": "cursor"
      }
    }
  }
}
需要在代码里将 openmemory 这一级别的多个 tool 包在一起

- Cursor + 用户级别：安装到本机的 .cursor/rules 文件夹下（没有自动创建），reference 放在 .cursor/rules/docs 中、tools 放在 .cursor/rules/tools, 文件的后缀为mdc(markdown增强格式)。 mcp.json 放在 .cursor/rules 下。
- Cursor + 项目级别：安装到选择目录的 .cursor/rules 文件夹下（没有自动创建），reference 放在 选择目录的.cursor/rules/docs 中、tools 放在 选择目录的.cursor/rules/tools, 文件的后缀为mdc(markdown增强格式)，mcp.json 放在 选择目录的.cursor/ 下。
- Trae + 用户级别：安装到本机的.trae/rules 文件夹下（没有自动创建），reference 放在 .trae/rules/docs 中、tools 放在 .trae/rules/tools, 文件的后缀为md，mcp.json 放在 .cursor/rules 下。
- Trae + 项目级别: 安装到选择目录的.trae/rules 文件夹下（没有自动创建），reference 放在 选择目录的.trae/rules/docs 中、tools 放在 选择目录的.trae/rules/tools, 文件的后缀为md，mcp.json 放在 选择目录的.cursor/ 下。
