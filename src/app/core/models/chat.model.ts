export type ChatSectionType = 'text' | 'chart' | 'table' | 'kpi' | 'list';

export interface ChartConfig {
  chartType: string;
  title: string;
  orientation?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  categories: string[];
  series: { name: string; data: number[] }[];
}

export interface ChatSection {
  type: ChatSectionType;
  body?: string;
  chartConfig?: ChartConfig;
  title?: string;
  columns?: string[];
  rows?: string[][];
  items?: string[];
  kpiValue?: number;
  kpiLabel?: string;
  kpiTrend?: 'up' | 'down' | 'flat';
}

export interface ChatMessage {
  messageId: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'composite';
  content: {
    sections: ChatSection[];
  };
}

export interface ChatResponseTemplate {
  intent: string;
  keywords: string[];
  weight: number;
  response: ChatMessage;
}
