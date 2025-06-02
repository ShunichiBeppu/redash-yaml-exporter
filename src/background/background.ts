import { convertDashboardToYaml } from '../utils/yaml-converter';
import { ExportMessage, ExportResponse } from '../utils/types';

// メッセージリスナー
chrome.runtime.onMessage.addListener((
  message: ExportMessage, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: ExportResponse) => void
) => {
  if (message.action === 'exportDashboard') {
    handleDashboardExport(message.dashboardData)
      .then(yamlContent => {
        sendResponse({ success: true, data: yamlContent });
      })
      .catch(error => {
        console.error('Dashboard export failed:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        });
      });
    
    return true; // 非同期レスポンスを示す
  }
});

async function handleDashboardExport(dashboardData: any): Promise<string> {
  try {
    // 入力データの検証
    if (!dashboardData || typeof dashboardData !== 'object') {
      throw new Error('Invalid dashboard data');
    }

    if (!dashboardData.name || !Array.isArray(dashboardData.widgets)) {
      throw new Error('Dashboard data is missing required fields');
    }

    // YAMLに変換
    const yamlContent = convertDashboardToYaml(dashboardData);
    
    if (!yamlContent || yamlContent.trim().length === 0) {
      throw new Error('Failed to generate YAML content');
    }

    return yamlContent;
    
  } catch (error) {
    console.error('Dashboard export error:', error);
    throw error;
  }
}

// Service Worker初期化時の処理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Redash YAML Exporter installed');
  } else if (details.reason === 'update') {
    console.log('Redash YAML Exporter updated');
  }
}); 