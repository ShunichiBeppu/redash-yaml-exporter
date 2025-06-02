import { RedashDashboard, ExportMessage, ExportResponse } from './types';

export async function sendMessageToBackground(message: ExportMessage): Promise<ExportResponse> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Background script response timeout'));
    }, 30000); // 30秒タイムアウト

    chrome.runtime.sendMessage(message, (response: ExportResponse) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      if (!response) {
        reject(new Error('No response from background script'));
        return;
      }
      
      resolve(response);
    });
  });
}

export async function fetchDashboardData(dashboardId: string): Promise<RedashDashboard> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

  try {
    const response = await fetch(`/api/dashboards/${dashboardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // データの基本的なバリデーション
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid dashboard data received');
    }

    if (!data.id || !data.name || !Array.isArray(data.widgets)) {
      throw new Error('Dashboard data is missing required fields');
    }

    return data as RedashDashboard;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Dashboard data could not be fetched');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred while fetching dashboard data');
  }
} 