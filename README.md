# mitsumori.AI

スマホのWebブラウザから仕入れ見積書PDFをアップロードし、自動的に項目・数量・原価を抽出して見積書を作成するWebアプリケーション

## 機能

### 主要機能
- **PDFアップロード**: スマホブラウザ（Safari）対応のPDFファイルアップロード
- **自動データ抽出**: DifyAPIを使用したPDFからの項目・数量・原価の自動抽出
- **見積書編集**: 抽出されたデータの確認・編集、顧客名・販売価格の入力
- **PDF生成**: 完成した見積書のPDF出力・ダウンロード
- **レスポンシブデザイン**: スマホ・タブレット・デスクトップ対応

### 技術スタック
- **フロントエンド**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **PDF処理**: DifyAPI統合
- **PDF生成**: jsPDF
- **デプロイ**: Vercel対応

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone <repository-url>
cd mitsumori-ai

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.localファイルを編集してDifyAPIの設定を行う
```

### 環境変数
```env
# Dify API Configuration
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key
DIFY_WORKFLOW_ID=your_workflow_id

# Environment
NODE_ENV=development
```

### 開発サーバー起動
```bash
npm run dev
```
http://localhost:3000 でアクセス

### プロダクションビルド
```bash
npm run build
npm start
```

## API エンドポイント

### POST /api/upload
PDFファイルをアップロードし、DifyAPIで解析

**リクエスト**:
- Content-Type: multipart/form-data
- Body: PDFファイル

**レスポンス**:
```json
{
  "success": true,
  "estimateId": "est_1234567890",
  "extractedData": {
    "items": [
      {
        "id": "1",
        "itemName": "商品A",
        "quantity": 10,
        "unitCost": 100,
        "unitPrice": 100
      }
    ]
  }
}
```

### GET /api/estimates/[id]
見積書データの取得

### PUT /api/estimates/[id]
見積書データの更新

### POST /api/estimates/[id]/pdf
見積書PDFの生成・ダウンロード

## デプロイ

### Vercelデプロイ
1. Vercelアカウントにログイン
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ実行

### 環境変数設定（Vercel）
- `DIFY_API_URL`: https://api.dify.ai/v1
- `DIFY_API_KEY`: DifyのAPIキー
- `DIFY_WORKFLOW_ID`: DifyのワークフローID
- `NODE_ENV`: production

## 使用方法

1. **PDFアップロード**: 仕入れ見積書PDFをアップロード
2. **データ確認**: 自動抽出された項目・数量・原価を確認
3. **見積書編集**: 顧客名を入力し、販売価格を設定
4. **PDF生成**: 完成した見積書をPDF形式でダウンロード

## 開発情報

### プロジェクト構成
```
mitsumori-ai/
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   ├── globals.css    # グローバルスタイル
│   │   ├── layout.tsx     # レイアウトコンポーネント
│   │   └── page.tsx       # メインページ
│   └── lib/
│       ├── dify.ts        # DifyAPI統合
│       └── pdf-generator.ts # PDF生成
├── public/                # 静的ファイル
├── .env.example          # 環境変数例
├── vercel.json           # Vercelデプロイ設定
└── README.md
```

### 主要コンポーネント
- **メインページ** (`src/app/page.tsx`): ユーザーインターフェース
- **DifyClient** (`src/lib/dify.ts`): PDF解析API統合
- **PDFGenerator** (`src/lib/pdf-generator.ts`): 見積書PDF生成

## ライセンス
MIT License

## サポート
問題や質問がある場合は、GitHubのIssuesをご利用ください。

