# LLMeter

A modern dashboard for monitoring LLM API token usage and costs.

## Features

- **Real-time Monitoring** - Track token usage, costs, and request metrics
- **Multi-provider Support** - Monitor OpenAI, Anthropic, and other LLM providers
- **Time Range Analysis** - View data by 1 day, 7 days, 30 days, or all time
- **Visual Analytics** - Interactive charts for trends and distributions
- **Model Comparison** - Compare performance (TPS) and usage across models

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Charts**: Recharts
- **UI**: Tailwind CSS 4 + shadcn/ui

## Data Source

This dashboard reads data from [Bifrost](https://github.com/maximhq/bifrost) LLM Gateway's database. If you're using a different LLM gateway or API proxy, you'll need to adapt the database schema and queries accordingly.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/llmeter
```

## Dashboard Overview

| Metric | Description |
|--------|-------------|
| Total Requests | Number of API calls |
| Total Tokens | Prompt + Completion tokens |
| Total Cost | Cumulative cost in USD |
| Success Rate | Percentage of successful requests |
| Avg TPS | Average tokens per second |
| Avg Latency | Average response time |

## License

MIT
