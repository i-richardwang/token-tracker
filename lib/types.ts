export interface DashboardSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  promptTokens: number;
  completionTokens: number;
  successRate: number;
}

export interface TokenTrendItem {
  date: string;
  prompt: number;
  completion: number;
}

export interface CostTrendItem {
  date: string;
  cost: number;
}

export interface ProviderDistributionItem {
  provider: string;
  count: number;
  tokens: number;
}

export interface ModelDistributionItem {
  model: string;
  count: number;
  tokens: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  tokenTrend: TokenTrendItem[];
  costTrend: CostTrendItem[];
  providerDistribution: ProviderDistributionItem[];
  modelDistribution: ModelDistributionItem[];
  statusDistribution: StatusDistributionItem[];
}
