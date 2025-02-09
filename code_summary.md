# コードの概要

## アーキテクチャ

J-Moshiは以下の主要コンポーネントで構成されています：

1. **Moshiモデル** (`src/moshi.py`)
   - 音声認識、対話生成、音声合成を1つのモデルで処理
   - ユーザーごとに独立したGPUインスタンスで実行
   - WebSocketを介したストリーミング通信

2. **WebSocketサーバー** (`src/moshi.py`)
   - FastAPIベースのWebSocketエンドポイント
   - バイナリOpus音声データの双方向ストリーミング
   - モデルの状態管理とセッション分離

3. **フロントエンドアプリ** (`src/frontend/`)
   - ReactベースのSPA
   - Web Audio APIによる音声録音/再生
   - Opus codec統合によるデータ圧縮

4. **HTTPサーバー** (`src/app.py`)
   - 静的フロントエンドファイルの配信
   - CORSミドルウェア設定
   - 開発/本番環境の統一的な提供

## データフロー

1. クライアント側：
   - マイク入力をOpusでエンコード
   - WebSocket経由でサーバーに送信
   - 受信した音声データをデコードして再生

2. サーバー側：
   - 受信したOpusデータをデコード
   - モデルで処理して応答を生成
   - 生成した音声をOpusでエンコード
   - WebSocket経由でクライアントに送信

## 主要ファイル

- `src/moshi.py`: モデルとWebSocketサーバーの実装
- `src/app.py`: HTTPサーバーとフロントエンド配信
- `src/frontend/app.jsx`: フロントエンドアプリのメイン
- `src/frontend/index.html`: フロントエンドのエントリーポイント

## 依存関係

- Python側：
  - modal: サーバーレスデプロイメント
  - fastapi: WebAPIフレームワーク
  - pytorch: 機械学習フレームワーク
  - transformers: モデルインターフェース

- フロントエンド側：
  - React: UIフレームワーク
  - opus-recorder: 音声エンコーディング
  - ogg-opus-decoder: 音声デコーディング
  - Web Audio API: 音声の録音/再生