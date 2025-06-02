export class DOMObserver {
  private observer: MutationObserver | null = null;
  private callbacks: Set<() => void> = new Set();

  start(): void {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      this.callbacks.forEach(callback => callback());
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  addCallback(callback: () => void): void {
    this.callbacks.add(callback);
  }

  removeCallback(callback: () => void): void {
    this.callbacks.delete(callback);
  }
}

export function waitForElement(
  selector: string, 
  timeout: number = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export function findRefreshButton(): HTMLElement | null {
  // より具体的で堅牢なセレクター戦略
  const selectors = [
    // Refreshテキストを含むボタン
    'button:has(span):has(.zmdi-refresh)',
    // zmdi-refreshアイコンを含むボタン（親要素を取得）
    'button .zmdi-refresh',
    // aria-labelやtitleでRefreshを含むボタン
    'button[title*="Refresh"], button[aria-label*="Refresh"]',
    // 一般的なrefreshクラス
    '.btn-refresh, .refresh-btn'
  ];

  for (const selector of selectors) {
    try {
      if (selector === 'button .zmdi-refresh') {
        // .zmdi-refreshアイコンを含む親ボタンを取得
        const icon = document.querySelector('.zmdi-refresh') as HTMLElement;
        if (icon) {
          const button = icon.closest('button');
          if (button) return button;
        }
      } else {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) return element;
      }
    } catch (error) {
      // :has()がサポートされていない場合はスキップ
      continue;
    }
  }

  // フォールバック: テキストベースの検索
  const buttons = document.querySelectorAll('button');
  for (const button of Array.from(buttons)) {
    const buttonText = button.textContent?.toLowerCase() || '';
    const hasRefreshIcon = button.querySelector('.zmdi-refresh') !== null;
    const hasRefreshText = buttonText.includes('refresh');
    
    if (hasRefreshIcon || hasRefreshText) {
      return button;
    }
  }

  return null;
}

export function findButtonContainer(): HTMLElement | null {
  // ボタングループコンテナを探す
  const containerSelectors = [
    '.ant-btn-group',
    '.dashboard-control .hidden-print',
    '.dashboard-control',
    '.btn-group',
    '.button-group'
  ];

  for (const selector of containerSelectors) {
    const container = document.querySelector(selector) as HTMLElement;
    if (container) {
      return container;
    }
  }

  return null;
} 