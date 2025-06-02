# Redash YAML Exporter

RedashダッシュボードのクエリをYAML形式でエクスポートするChrome拡張機能です。

## 🚀 機能

- **ワンクリックエクスポート**: ダッシュボードページに「Export YAML」ボタンを追加
- **自動YAML変換**: RedashのクエリデータをDatabricks Notebook形式のYAMLに変換
- **ファイル自動ダウンロード**: タイムスタンプ付きのファイル名で自動保存
- **エラーハンドリング**: 分かりやすいエラーメッセージと進捗表示
- **レスポンシブUI**: Redashの既存UIにシームレスに統合

## 📦 インストール

### 開発者モードでのインストール

1. **リポジトリをクローン**:
   ```bash
   git clone https://github.com/ShunichiBeppu/redash-yaml-exporter
   cd redash-yaml-exporter
   ```

2. **依存関係をインストール**:
   ```bash
   npm install
   ```

3. **プロジェクトをビルド**:
   ```bash
   npm run build
   ```

4. **Chrome拡張機能として読み込み**:
   - Chromeで `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - プロジェクトフォルダ全体を選択

## 🔧 使用方法

1. **Redashダッシュボードにアクセス**:
   - サポートされるURL: `http://localhost:*/dashboards/*`, `https://*.redash.io/dashboards/*`

2. **エクスポートボタンをクリック**:
   - ダッシュボードページの右上にある「Export YAML」ボタンをクリック

3. **ファイルダウンロード**:
   - 自動的にYAMLファイルがダウンロードされます
   - ファイル名形式: `dashboard_{ダッシュボード名}_{タイムスタンプ}.yml`

## 🛠️ 開発

### 前提条件

- Node.js 16+
- npm 8+
- TypeScript 5+

### 開発用スクリプト

```bash
# 開発モードでビルド（ファイル変更を監視）
npm run dev

# 本番用ビルド
npm run build

# TypeScript型チェック
npm run type-check

# ESLintでコード品質チェック
npm run lint

# ビルド出力をクリーンアップ
npm run clean
```

### プロジェクト構造

```
redash-yaml-exporter/
├── manifest.json              # Chrome拡張機能マニフェスト
├── src/
│   ├── content/
│   │   └── dashboard.ts       # コンテンツスクリプト（UI制御）
│   ├── background/
│   │   └── background.ts      # バックグラウンドスクリプト
│   ├── utils/
│   │   ├── api.ts            # API通信処理
│   │   ├── yaml-converter.ts # YAML変換処理
│   │   ├── dom-utils.ts      # DOM操作ユーティリティ
│   │   └── types.ts          # TypeScript型定義
│   └── styles/
│       └── content.css       # コンテンツスクリプト用CSS
├── dist/                     # ビルド出力ディレクトリ
├── webpack.config.js         # Webpack設定
├── tsconfig.json            # TypeScript設定
└── package.json             # プロジェクト設定
```

## 🔒 セキュリティ

### 必要な権限

- `storage`: 設定の保存用
- `host_permissions`: 
  - `http://localhost:*/dashboards/*`
  - `https://*.redash.io/dashboards/*`

### セキュリティ機能

- **CSP対応**: Content Security Policyに準拠
- **限定的権限**: 必要最小限の権限のみ要求
- **データ検証**: API レスポンスの厳密な検証
- **タイムアウト処理**: ネットワーク要求の適切なタイムアウト

## 🧪 テスト

現在のバージョンでは手動テストを推奨します：

1. **基本機能テスト**:
   - 各種Redashダッシュボードでのボタン表示確認
   - YAML エクスポート機能の動作確認
   - エラーハンドリングの確認

2. **ブラウザ互換性**:
   - Chrome 88+ (Manifest V3対応)
   - Edge 88+ 
   - その他Chromiumベースブラウザ

## 📝 YAML出力形式

エクスポートされるYAMLは以下の構造を持ちます：

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
          # ヘッダー情報
        - type: "sqlBlock"
          # SQLクエリブロック
```

## 🤝 コントリビューション

1. プロジェクトをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は `LICENSE` ファイルを参照してください。

## 🐛 バグレポート

バグを発見した場合は、以下の情報と共にIssueを作成してください：

- Chrome バージョン
- Redash バージョン
- エラーメッセージ
- 再現手順

## 🔄 変更履歴

### v1.0.0 (2024-01-XX)
- 初回リリース
- 基本的なYAMLエクスポート機能
- Redash ダッシュボードUI統合
- エラーハンドリングとユーザーフィードバック 
