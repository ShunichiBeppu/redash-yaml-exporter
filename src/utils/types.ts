export interface RedashQuery {
  id: number;
  name: string;
  description: string | null;
  query: string;
  created_at: string;
  updated_at: string;
  api_key?: string;
  data_source_id: number;
}

export interface RedashVisualization {
  id: number;
  name: string;
  query: RedashQuery;
  type: string;
  options: Record<string, any>;
}

export interface RedashWidget {
  id: number;
  width: number;
  height: number;
  options: Record<string, any>;
  visualization?: RedashVisualization;
  text?: string;
}

export interface RedashDashboard {
  id: number;
  name: string;
  slug: string;
  user_id: number;
  layout: string;
  dashboard_filters_enabled: boolean;
  widgets: RedashWidget[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface YamlPage {
  _id: string;
  kind: string;
  name: string;
  body: {
    type: string;
    content: Array<{
      type: string;
      attrs?: Record<string, any>;
      content?: Array<{
        type: string;
        text?: string;
        attrs?: Record<string, any>;
        content?: any[];
      }>;
    }>;
  };
  order: number;
  width: {
    fixed_width: number;
    width_type: string;
    max_width: number;
  };
  notebook_param_widget_values: any[];
  page_param_widgets: any[];
  page_param_widget_values: any[];
}

export interface YamlOutput {
  _id: string;
  schema_version: string;
  icon: null;
  name: string;
  palette_key: string;
  pages: YamlPage[];
  notebook_param_widgets: any[];
}

export interface ExportMessage {
  action: 'exportDashboard';
  dashboardData: RedashDashboard;
}

export interface ExportResponse {
  success: boolean;
  data?: string;
  error?: string;
} 