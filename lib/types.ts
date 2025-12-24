export interface DashboardSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  completionTokens: number;
  avgLatency: number;
  avgTps: number;
  avgTokensPerRequest: number;
  avgCostPerRequest: number;
  successRate: number;
}

export interface TokensTrendItem {
  date: string;
  prompt: number;
  completion: number;
}

export interface CostTrendItem {
  date: string;
  cost: number;
}

export interface RequestsTrendItem {
  date: string;
  requests: number;
}

export interface ByProviderItem {
  provider: string;
  tokens: number;
  cost: number;
}

export interface TokensByModelItem {
  model: string;
  tokens: number;
}

export interface TpsByModelItem {
  model: string;
  tps: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  tokensTrend: TokensTrendItem[];
  costTrend: CostTrendItem[];
  requestsTrend: RequestsTrendItem[];
  byProvider: ByProviderItem[];
  tokensByModel: TokensByModelItem[];
  tpsByModel: TpsByModelItem[];
}
