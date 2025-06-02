# Chrome拡張機能 インストール・動作確認ガイド

## 📦 インストール手順

### 1. Chrome拡張機能として読み込み

1. **Chromeを開く**
   - Google Chromeを起動します

2. **拡張機能ページにアクセス**
   - アドレスバーに `chrome://extensions/` を入力
   - またはメニュー → その他のツール → 拡張機能

3. **デベロッパーモードを有効化**
   - 右上の「デベロッパーモード」トグルをONにします

4. **拡張機能を読み込み**
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - プロジェクトフォルダ全体を選択
   - 「Redash YAML Exporter」が拡張機能リストに表示されることを確認

## 🔧 動作確認

### 前提条件

拡張機能は以下のURLパターンでのみ動作します：
- `http://localhost:*/dashboards/*`
- `https://*.redash.io/dashboards/*`

### テスト手順

#### 1. 基本動作テスト

1. **Redashダッシュボードにアクセス**
   ```
   例: http://localhost:5000/dashboards/1
   例: https://yourcompany.redash.io/dashboards/123
   ```

2. **エクスポートボタンの確認**
   - ページ右上のRefreshボタンの左隣に「Export YAML」ボタンが表示されること
   - ボタンがRedashのUIに自然に統合されていること

3. **エクスポート機能の確認**
   - 「Export YAML」ボタンをクリック
   - ボタンが「Exporting...」に変わり、ローディング状態になること
   - 成功時に緑色の通知メッセージが表示されること
   - YAMLファイルが自動的にダウンロードされること

#### 2. エラーハンドリングテスト

1. **ネットワークエラーのテスト**
   - Developer Tools (F12) → Network → Offline にチェック
   - エクスポートボタンをクリック
   - 赤色のエラーメッセージが表示されること

2. **無効なダッシュボードのテスト**
   - 存在しないダッシュボードURL (例: `/dashboards/999999`)
   - 適切なエラーメッセージが表示されること

## 🐛 トラブルシューティング

### よくある問題

#### 1. エクスポートボタンが表示されない

**原因と解決策:**
- **URLが対象外**: サポートされているURLパターンか確認
- **ページ読み込み問題**: ページをリロードしてみる
- **拡張機能無効**: `chrome://extensions/` で拡張機能が有効になっているか確認

#### 2. エクスポートが失敗する

**原因と解決策:**
- **認証問題**: Redashにログインしているか確認
- **権限問題**: ダッシュボードの閲覧権限があるか確認
- **ネットワーク問題**: インターネット接続を確認

#### 3. YAMLファイルがダウンロードされない

**原因と解決策:**
- **ブラウザのダウンロード設定**: ダウンロードがブロックされていないか確認
- **ポップアップブロック**: ポップアップブロッカーを無効にする
- **セキュリティソフト**: ウイルス対策ソフトが干渉していないか確認

### デバッグ方法

#### 1. Developer Tools での確認

1. **Console ログの確認**
   ```
   F12 → Console タブ
   - エラーメッセージの確認
   - 拡張機能の動作ログの確認
   ```

2. **Network タブでAPI確認**
   ```
   F12 → Network タブ
   - `/api/dashboards/` へのリクエストが成功しているか確認
   - レスポンスの内容を確認
   ```

#### 2. 拡張機能の内部確認

1. **拡張機能のバックグラウンドページ**
   ```
   chrome://extensions/ → Redash YAML Exporter → 詳細
   → バックグラウンドページを調査
   ```

2. **コンテンツスクリプトの確認**
   ```
   対象ページでF12 → Sources → Content scripts
   → chrome-extension://... → dashboard.js
   ```

## 📊 出力ファイルの確認

### ファイル名形式
```
dashboard_{ダッシュボード名}_{YYYY-MM-DD_HH-MM-SS}.yml
例: dashboard_sales_metrics_2024-01-15_14-30-25.yml
```

### YAML内容の確認
```yaml
_id: "ランダム生成ID"
schema_version: "1.3.0"
name: "ダッシュボード名"
palette_key: "DEFAULT"
pages:
  - _id: "ページID"
    kind: "DEFAULT"
    name: "クエリ名"
    body:
      type: "doc"
      content:
        - type: "heading"
          attrs:
            level: 2
            linkId: "..."
          content:
            - type: "text"
              text: "クエリ名"
        - type: "sqlBlock"
          attrs:
            linkId: "..."
            sqlId: "..."
            connId: "..."
          content:
            - type: "sqlBlockName"
              content:
                - type: "text"
                  text: "クエリ名"
            - type: "sqlBlockBody"
              content:
                - type: "text"
                  text: "SELECT * FROM table..."
```

## 🔄 拡張機能の更新

コードを変更した場合の更新手順：

1. **ビルドの実行**
   ```bash
   npm run build
   ```

2. **拡張機能の再読み込み**
   ```
   chrome://extensions/ → Redash YAML Exporter → 更新ボタン
   ```

3. **ページのリロード**
   ```
   対象のRedashページをリロード (F5 または Ctrl+R)
   ```

## 🎯 動作確認チェックリスト

- [ ] 拡張機能がインストールされている
- [ ] 対象URLでエクスポートボタンが表示される
- [ ] ボタンクリックでエクスポートが実行される
- [ ] 成功時にYAMLファイルがダウンロードされる
- [ ] エラー時に適切なメッセージが表示される
- [ ] 複数のダッシュボードで正常に動作する
- [ ] ページナビゲーション後もボタンが再表示される

この動作確認が完了すれば、Chrome拡張機能は正常に機能しています。 