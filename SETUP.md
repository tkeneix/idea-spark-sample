# SETUP MANUAL
## next.js

  1. 新しいリポジトリの作成とコピー

  # 新しいディレクトリを作成
  mkdir tane-lab-v2
  cd tane-lab-v2

  # 新しいgitリポジトリを初期化
  git init

  # 元のリポジトリからファイルをコピー（.gitフォルダ以外）
  cp -r /Users/paddy/WK/20.PRG/Github/v0-tane-lab-v2/* .
  cp /Users/paddy/WK/20.PRG/Github/v0-tane-lab-v2/.[!.]* . 2>/dev/null || true

  # .gitディレクトリは除外されるので、一から新しいgit管理を開始
  git add .
  git commit -m "Initial commit: Import v0 generated project"

  2. Node.js実行環境のセットアップ

  # pnpmがインストールされていない場合
  npm install -g pnpm

  # 依存関係のインストール
  pnpm install

  # 開発サーバーの起動
  pnpm dev

  3. 環境変数の設定（必要な場合）

  プロジェクトにSupabaseが含まれているため、.env.localファイルが必要です：

  # .env.localファイルを作成
  touch .env.local

  必要な環境変数をSupabaseの設定に応じて追加してください。

⏺ Update Todos
  ⎿  ☒ 現在のリポジトリ構造を確認             
     ☒ package.jsonとNext.js設定を確認
     ☒ 新しいリポジトリへのコピー手順を説明
     ☒ Next.js実行環境のセットアップ手順を説明

⏺ これでローカル環境でNext.jsアプリケーションが起動できるはずです。http://localhost:3000でアクセスできます。



## postgres
⏺ PostgreSQL 17.6用のdocker-compose.ymlを作成しました。

  使用方法:
  - docker-compose up -d で起動
  - docker-compose down で停止

PostgreSQL 17.6への移行が完了しました！

  完了した作業

  データベース移行:
  - Supabaseスキーマの分析と理解
  - PostgreSQL 17.6用のDDLスクリプト作成 (scripts/init-database.sql)
  - 初期データのシードスクリプト作成 (scripts/seed-data.sql)
  - PostgreSQL接続設定の作成 (lib/postgresql.ts)
  - データベース操作の抽象化 (lib/database.ts)

  コードの置き換え:
  - 全APIルートをPostgreSQLクライアントに変更
  - Supabaseクライアントコードを標準のPostgreSQLクライアントに置換

  セットアップスクリプト:
  - ./scripts/setup-database.sh - データベース初期化
  - ./scripts/connect-database.sh - データベース接続
  - ./scripts/reset-database.sh - データベースリセット

  設定ファイル:
  - docker-compose.yml - PostgreSQL 17.6コンテナ設定
  - .env.example - 環境変数テンプレート
  - README-DATABASE.md - 詳細な移行ガイド

  使用方法

  1. データベース起動:
  ./scripts/setup-database.sh

  2. 接続確認:
  ./scripts/connect-database.sh

  3. 環境変数設定:
  cp .env.example .env
  # OpenAI APIキーなどを設定

  