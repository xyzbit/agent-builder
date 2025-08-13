import { db } from '../app/drizzle/config.server';
import { agentsTable, toolsTable, referencesTable } from '../app/drizzle/schema/schema.server';
import { sql } from 'drizzle-orm';

async function initializeData() {
  console.log('开始初始化数据注入...');

  try {
    // 检查并初始化工具数据
    const toolsCount = await db.execute(sql`SELECT COUNT(*) as count FROM tools`);
    const toolsCountValue = Number(toolsCount.rows[0]?.count || 0);
    
    if (toolsCountValue === 0) {
      console.log('正在插入示例工具数据...');
      
      const sampleTools = [
        {
          name: "pandas",
          description: "Data manipulation and analysis library for Python",
          category: "Data Analysis",
          toolType: "cli" as const,
          usage: "pip install pandas\nimport pandas as pd\ndf = pd.read_csv('file.csv')\n# Use pandas for data manipulation",
          isActive: true
        },
        {
          name: "eslint",
          description: "JavaScript linting tool for code quality",
          category: "Code Quality",
          toolType: "cli" as const,
          usage: "npm install -g eslint\neslint --init\neslint yourfile.js",
          isActive: true
        },
        {
          name: "security-scanner",
          description: "Security vulnerability scanner",
          category: "Security",
          toolType: "cli" as const,
          usage: "npm install -g security-scanner\nsecurity-scanner scan --target ./project",
          isActive: true
        },
        {
          name: "matplotlib",
          description: "Python plotting library for data visualization",
          category: "Visualization",
          toolType: "cli" as const,
          usage: "pip install matplotlib\nimport matplotlib.pyplot as plt\nplt.plot([1,2,3], [4,5,6])\nplt.show()",
          isActive: true
        },
        {
          name: "sonarqube",
          description: "Code quality and security analysis platform",
          category: "Code Quality",
          toolType: "mcp" as const,
          usage: "Configure SonarQube server\nRun sonar-scanner on your project\nReview results in SonarQube dashboard",
          isActive: true
        }
      ];

      await db.insert(toolsTable).values(sampleTools);
      console.log(`✅ 已插入 ${sampleTools.length} 个示例工具`);
    } else {
      console.log(`ℹ️ 工具表已有 ${toolsCountValue} 条数据，跳过工具初始化`);
    }

    // 检查并初始化代理数据
    const agentsCount = await db.execute(sql`SELECT COUNT(*) as count FROM agents`);
    const agentsCountValue = Number(agentsCount.rows[0]?.count || 0);
    
    if (agentsCountValue === 0) {
      console.log('正在插入示例代理数据...');
      
      const sampleAgents = [
        {
          name: "Data Analysis Agent",
          description: "Analyze datasets and generate insights with statistical analysis",
          type: "agent" as const,
          taskRequirements: "Analyze CSV data files, identify trends, generate visualizations",
          configuration: {
            tools: ["pandas", "matplotlib", "seaborn"],
            parameters: {
              output_format: "detailed",
              include_charts: true,
              statistical_tests: true
            }
          }
        },
        {
          name: "Code Review Workflow",
          description: "Systematic code review process with security and performance checks",
          type: "workflow" as const,
          taskRequirements: "Review code for best practices, security vulnerabilities, performance issues",
          configuration: {
            tools: ["eslint", "sonarqube", "security-scanner"],
            workflow_steps: [
              {
                step: "syntax_check",
                tool: "eslint",
                description: "Check for syntax errors and code style issues"
              },
              {
                step: "security_scan",
                tool: "security-scanner",
                description: "Scan for security vulnerabilities"
              },
              {
                step: "quality_analysis",
                tool: "sonarqube",
                description: "Analyze code quality metrics and technical debt"
              }
            ]
          }
        }
      ];

      await db.insert(agentsTable).values(sampleAgents);
      console.log(`✅ 已插入 ${sampleAgents.length} 个示例代理`);
    } else {
      console.log(`ℹ️ 代理表已有 ${agentsCountValue} 条数据，跳过代理初始化`);
    }

    // 检查并初始化引用数据
    const refsCount = await db.execute(sql`SELECT COUNT(*) as count FROM "references"`);
    const refsCountValue = Number(refsCount.rows[0]?.count || 0);
    
    if (refsCountValue === 0) {
      console.log('正在插入示例引用数据...');
      
      const sampleRefs = [
        {
          name: "Agent Prompt Template",
          description: "Standard template for agent prompts",
          category: "prompt_template" as const,
          content: "You are a helpful AI assistant. Your task is to: {task_description}\n\nPlease follow these guidelines:\n- Be clear and concise\n- Provide step-by-step instructions when needed\n- Ask for clarification if the request is unclear",
          isActive: true
        },
        {
          name: "Workflow Step Template",
          description: "Template for defining workflow steps",
          category: "workflow_guide" as const,
          content: "Step: {step_name}\nDescription: {step_description}\nTool: {tool_name}\nExpected Output: {expected_output}\nNext Step: {next_step}",
          isActive: true
        }
      ];

      await db.insert(referencesTable).values(sampleRefs);
      console.log(`✅ 已插入 ${sampleRefs.length} 个示例引用`);
    } else {
      console.log(`ℹ️ 引用表已有 ${refsCountValue} 条数据，跳过引用初始化`);
    }

    console.log('🎉 数据初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
    throw error;
  }
}

// 执行初始化
initializeData()
  .then(() => {
    console.log('初始化脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('初始化脚本执行失败:', error);
    process.exit(1);
  });