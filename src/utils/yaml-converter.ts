import yaml from 'js-yaml';
import { RedashDashboard, YamlOutput, YamlPage } from './types';

export function convertDashboardToYaml(dashboard: RedashDashboard): string {
  try {
    // クエリを含むウィジェットのみを抽出
    const queryWidgets = dashboard.widgets.filter(widget => 
      widget.visualization?.query?.query
    );

    const yamlObj: YamlOutput = {
      _id: generateRandomId(),
      schema_version: '1.3.0',
      icon: null,
      name: dashboard.name,
      palette_key: 'DEFAULT',
      pages: [],
      notebook_param_widgets: []
    };

    queryWidgets.forEach((widget, index) => {
      const visualization = widget.visualization;
      if (!visualization?.query) return;
      
      const query = visualization.query;
      
      const page: YamlPage = {
        _id: generateRandomId(),
        kind: 'DEFAULT',
        name: query.name || `Query ${index + 1}`,
        body: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {
                level: 2,
                hideDefault: false,
                disabledHide: false,
                linkId: generateRandomId()
              },
              content: [
                {
                  type: 'text',
                  text: query.name || `Query ${index + 1}`
                }
              ]
            },
            {
              type: 'sqlBlock',
              attrs: {
                linkId: generateRandomId(),
                sqlId: generateRandomId(),
                connId: generateRandomId(), // 実際の接続IDは動的に設定する必要がある
                args: []
              },
              content: [
                {
                  type: 'sqlBlockName',
                  content: [
                    {
                      type: 'text',
                      text: query.name || `Query ${index + 1}`
                    }
                  ]
                },
                {
                  type: 'sqlBlockBody',
                  content: [
                    {
                      type: 'text',
                      text: query.query
                    }
                  ]
                }
              ]
            }
          ]
        },
        order: index + 1,
        width: {
          fixed_width: 800,
          width_type: 'RANGE',
          max_width: 800
        },
        notebook_param_widget_values: [],
        page_param_widgets: [],
        page_param_widget_values: []
      };

      yamlObj.pages.push(page);
    });

    return yaml.dump(yamlObj, {
      indent: 2,
      noRefs: true,
      sortKeys: false,
      lineWidth: -1,
      noCompatMode: true
    });

  } catch (error) {
    console.error('YAML conversion error:', error);
    throw new Error(`Failed to convert dashboard to YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateRandomId(): string {
  // より堅牢なID生成
  const chars = '0123456789abcdef';
  return Array.from({ length: 24 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function downloadYamlFile(yamlContent: string, filename: string): void {
  try {
    const blob = new Blob([yamlContent], { 
      type: 'text/yaml;charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // メモリリークを防ぐ
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('File download error:', error);
    throw new Error('Failed to download YAML file');
  }
}

export function generateFilename(dashboardName: string): string {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19); // YYYY-MM-DD_HH-MM-SS
    
  const sanitizedName = dashboardName
    .replace(/[^\w\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .slice(0, 50); // 長すぎるファイル名を防ぐ
    
  return `dashboard_${sanitizedName}_${timestamp}.yml`;
} 