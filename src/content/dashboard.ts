import { DOMObserver, findRefreshButton, findButtonContainer } from '../utils/dom-utils';
import { fetchDashboardData } from '../utils/api';
import { sendMessageToBackground } from '../utils/api';
import { downloadYamlFile, generateFilename } from '../utils/yaml-converter';

class DashboardExporter {
  private exportButton: HTMLButtonElement | null = null;
  private domObserver: DOMObserver;
  private isInitialized: boolean = false;

  constructor() {
    this.domObserver = new DOMObserver();
    this.init();
  }

  private init(): void {
    // DOMが読み込まれるまで待機
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExporter());
    } else {
      this.setupExporter();
    }
  }

  private setupExporter(): void {
    if (this.isInitialized) return;
    
    this.domObserver.addCallback(() => this.injectButton());
    this.domObserver.start();
    this.injectButton();
    this.isInitialized = true;
  }

  private async injectButton(): Promise<void> {
    try {
      // 既にボタンが存在する場合はスキップ
      if (document.getElementById('redash-yaml-export-btn')) {
        return;
      }

      // まずボタンコンテナを探す
      const buttonContainer = findButtonContainer();
      const refreshButton = findRefreshButton();

      console.log('Button injection attempt:', {
        buttonContainer: !!buttonContainer,
        refreshButton: !!refreshButton,
        containerSelector: buttonContainer?.className,
        refreshButtonSelector: refreshButton?.className
      });

      let insertionTarget: HTMLElement | null = null;
      let insertionMethod: 'before' | 'prepend' | 'append' = 'before';

      if (buttonContainer) {
        // ボタンコンテナが見つかった場合、その中の最初に挿入
        insertionTarget = buttonContainer;
        insertionMethod = 'prepend';
        console.log('Using button container for insertion');
      } else if (refreshButton) {
        // Refreshボタンが見つかった場合、その前に挿入
        insertionTarget = refreshButton;
        insertionMethod = 'before';
        console.log('Using refresh button for insertion');
      } else {
        // 代替案: ダッシュボードコントロール領域を探す
        const dashboardControl = document.querySelector('.dashboard-control') as HTMLElement;
        if (dashboardControl) {
          insertionTarget = dashboardControl;
          insertionMethod = 'append';
          console.log('Using dashboard control for insertion');
        }
      }

      if (!insertionTarget) {
        console.log('No suitable insertion target found');
        return; // 挿入場所が見つからない場合は何もしない
      }

      // Exportボタンを作成
      this.exportButton = this.createExportButton();
      
      // 適切な方法でボタンを挿入
      if (insertionMethod === 'before') {
        insertionTarget.parentNode?.insertBefore(this.exportButton, insertionTarget);
      } else if (insertionMethod === 'prepend') {
        insertionTarget.insertBefore(this.exportButton, insertionTarget.firstChild);
      } else {
        insertionTarget.appendChild(this.exportButton);
      }

      console.log(`Export button successfully injected using method: ${insertionMethod}`);
      
    } catch (error) {
      console.error('Failed to inject export button:', error);
    }
  }

  private createExportButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'redash-yaml-export-btn';
    button.type = 'button';
    button.className = 'ant-btn ant-btn-default';
    
    // 適切なマージンを設定
    button.style.cssText = `
      margin-right: 8px;
      margin-left: 0;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    `;
    
    button.innerHTML = `
      <i class="zmdi zmdi-download m-r-5" aria-hidden="true"></i>
      <span>Export YAML</span>
    `;

    button.addEventListener('click', this.handleExportClick.bind(this));
    
    return button;
  }

  private async handleExportClick(): Promise<void> {
    try {
      // ボタンを無効化（重複実行防止）
      this.setButtonState('loading');

      // 現在のダッシュボードIDを取得
      const dashboardId = this.extractDashboardId();
      
      if (!dashboardId) {
        throw new Error('ダッシュボードIDを取得できませんでした');
      }

      // ダッシュボードデータを直接取得
      const dashboardData = await fetchDashboardData(dashboardId);

      // バックグラウンドスクリプトでYAML変換
      const response = await sendMessageToBackground({
        action: 'exportDashboard',
        dashboardData: dashboardData
      });

      if (response.success) {
        // ファイル名を生成してダウンロード
        const filename = generateFilename(dashboardData.name);
        if (response.data) {
          downloadYamlFile(response.data, filename);
          this.showSuccessMessage();
        } else {
          throw new Error('No YAML data received from background script');
        }
      } else {
        throw new Error(response.error);
      }

    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorMessage(error instanceof Error ? error.message : '不明なエラーが発生しました');
    } finally {
      this.setButtonState('default');
    }
  }

  private setButtonState(state: 'default' | 'loading'): void {
    if (!this.exportButton) return;

    switch (state) {
      case 'loading':
        this.exportButton.disabled = true;
        this.exportButton.innerHTML = `
          <i class="zmdi zmdi-refresh zmdi-hc-spin m-r-5" aria-hidden="true"></i>
          <span>Exporting...</span>
        `;
        break;
      case 'default':
        this.exportButton.disabled = false;
        this.exportButton.innerHTML = `
          <i class="zmdi zmdi-download m-r-5" aria-hidden="true"></i>
          <span>Export YAML</span>
        `;
        break;
    }
  }

  private extractDashboardId(): string | null {
    // URLからダッシュボードIDを抽出
    const match = window.location.pathname.match(/\/dashboards\/(\d+)/);
    return match ? match[1] : null;
  }

  private showSuccessMessage(): void {
    this.showMessage('YAML export completed successfully!', 'success');
  }

  private showErrorMessage(error: string): void {
    this.showMessage(`Export failed: ${error}`, 'error');
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    const message = document.createElement('div');
    message.className = `redash-yaml-export-message redash-yaml-export-message--${type}`;
    message.textContent = text;
    
    const styles = {
      success: {
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        color: '#52c41a'
      },
      error: {
        background: '#fff2f0',
        border: '1px solid #ffccc7',
        color: '#ff4d4f'
      }
    };

    const messageStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '4px',
      zIndex: '9999',
      fontFamily: 'inherit',
      fontSize: '14px',
      ...styles[type]
    };

    Object.assign(message.style, messageStyles);
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (document.body.contains(message)) {
        document.body.removeChild(message);
      }
    }, type === 'error' ? 5000 : 3000);
  }

  public destroy(): void {
    this.domObserver.stop();
    if (this.exportButton?.parentNode) {
      this.exportButton.parentNode.removeChild(this.exportButton);
    }
  }
}

// 初期化
const exporter = new DashboardExporter();

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
  exporter.destroy();
}); 