# agent-builder
Agents Prompt sharing platform allows users to install one item into the corresponding IDEA; it also provides a tool to quickly build Agents or Workflow Prompt

## develop
1. start docker：pg db
docker run --name agent_builder_pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=agent_builder -p 5432:5432 -d postgres:15

2. config `.env`
create `.env` file
```
ENV=development
# 使用本地 Postgres 容器连接串
DATABASE_URL=postgres://postgres:postgres@localhost:5432/agent_builder

# OpenAI API配置
OPENAI_MODEL={请填写}
OPENAI_API_KEY={请填写}
OPENAI_BASE_URL={请填写}（如：https://ark.cn-beijing.volces.com/api/v3）
```

