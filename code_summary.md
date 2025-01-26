# QuillMan コード解析サマリー

## 1. プロジェクト構成

### ディレクトリ構造
src/ ├── app.py # フロントエンドの静的ファイル配信用FastAPIサーバー ├── common.py # 共通のModal Appインスタンス定義 ├── moshi.py # Moshi音声対話モデルのwebsocketサーバー └── frontend/ # フロントエンドのReactアプリケーション ├── app.jsx # メインのReactコンポーネント └── index.html # エントリーポイントHTML


## 2. バックエンド実装

### common.py
- `modal.App`インスタンスを作成し、"quillman"という名前で設定
- 他のモジュールで共有される中心的なAppインスタンスを提供

### moshi.py
主要なバックエンド実装を含むモジュール

#### 環境設定
- Modal Image設定
  - Python 3.11のDebian Slim
  - 必要なパッケージ: moshi, fastapi, huggingface_hub, hf_transfer, sphn
  - HuggingFace転送の有効化

#### Moshiクラス
- GPUインスタンス管理と音声対話処理を担当
- デコレータ:
  - `@app.cls`: A10G GPU使用、300秒のアイドルタイムアウト
  - `@modal.build`: モデルのダウンロード
  - `@modal.enter`: モデルの初期化とGPUウォームアップ

主要なメソッド：
1. `download_model()`: 必要なモデルファイルをダウンロード
2. `enter()`: 
   - GPUデバイスの設定
   - Mimiモデルの初期化（音声エンコーダー/デコーダー）
   - Moshiモデルの初期化（言語モデル）
   - テキストトークナイザーの設定
   - GPUのウォームアップ処理
3. `reset_state()`: 
   - Opusストリームの初期化
   - チャット履歴のリセット
4. `web()`: WebSocket通信を処理するFastAPIアプリケーション

WebSocket処理の特徴：
- 3つの非同期ループを使用:
  1. `recv_loop()`: クライアントからの音声データ受信
  2. `inference_loop()`: 音声認識と応答生成
  3. `send_loop()`: 生成された音声の送信
- 双方向リアルタイム通信の実現
- Opusフォーマットによる効率的な音声データ転送

### app.py
フロントエンド配信用のFastAPIサーバー

特徴：
- 静的ファイルの配信設定
- CORSミドルウェアの設定
- キャッシュ無効化の実装
- 同時接続100までの対応

## 3. フロントエンド実装

### index.html
- 必要なライブラリの読み込み:
  - React
  - TailwindCSS
  - Opus関連（録音・デコード用）
- カスタムカラーテーマの設定

### app.jsx
Reactを使用したSPAの実装

#### 主要コンポーネント
1. `App`: メインコンポーネント
   - 状態管理: マイク入力、音声再生、WebSocket接続
   - 音声処理の初期化と管理
   - UIレイアウトの構成

2. `AudioControl`: マイク制御UI
   - 音声入力の可視化
   - ミュート機能の提供

3. `TextOutput`: テキスト出力表示
   - 音声認識結果の表示
   - 自動スクロール機能

#### 主要機能
1. 音声入力処理:
   - OpusRecorderを使用したマイク録音
   - リアルタイム音量表示
   - 録音ゲイン制御

2. 音声出力処理:
   - Opus形式の音声データをPCMにデコード
   - Web Audio APIによるシームレスな音声再生
   - バッファリングによる途切れのない再生

3. WebSocket通信:
   - バイナリデータの送受信
   - 音声データとテキストデータの分離処理
   - 接続状態の管理

## 4. 外部依存関係

### Python パッケージ
- modal: サーバーレスコンピューティング基盤
- fastapi: Webアプリケーションフレームワーク
- moshi: 音声対話モデル
- huggingface_hub: モデルファイル管理
- sphn: 音声処理ユーティリティ
- torch: 深層学習フレームワーク
- sentencepiece: テキストトークナイザー

### JavaScript ライブラリ
- React: UIフレームワーク
- Opus Recorder: 音声録音・エンコード
- Ogg Opus Decoder: 音声デコード
- TailwindCSS: スタイリング

## 5. 重要なデータ構造

### 音声データフロー
1. クライアント側:
マイク入力 → PCM → Opus エンコード → WebSocket → サーバー


2. サーバー側:
Opus → PCM → Mimi エンコード → Moshi 処理 → Mimi デコード → Opus → WebSocket → クライアント


### モデル状態管理
- チャット履歴: LMGenクラスで管理
- 音声バッファ: OpusStream形式で管理
- セッション状態: WebSocketコネクションごとに初期化