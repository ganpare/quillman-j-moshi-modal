# Modal開発ガイド

## Modalとは

[Modal](https://modal.com)は、機械学習アプリケーションのデプロイを簡単にするクラウドプラットフォームです。以下の特徴があります：

- サーバーレスで自動スケーリング
- GPUインスタンスの効率的な管理
- 使用時のみの課金（アイドル時は無料）
- シンプルなPythonベースのAPI

## セットアップ

1. Modalをインストール：
```bash
pip install modal
```

2. アカウント作成とセットアップ：
```bash
modal setup
```

3. 開発用トークンの生成：
```bash
modal token new
```

## 開発フロー

### 1. ローカル開発

開発サーバーの起動：
```bash
modal serve src.moshi  # Moshiサーバー単体
modal serve src.app    # フロントエンド含む全体
```

変更は自動的に反映されます（ホットリロード）。

### 2. デプロイ

本番環境へのデプロイ：
```bash
modal deploy src.app
```

デプロイ後のURL：
- フロントエンド: `https://[USERNAME]--quillman-web.modal.run`
- WebSocket: `wss://[USERNAME]--quillman-moshi-web.modal.run/ws`

### 3. モニタリング

- [Modalダッシュボード](https://modal.com/dashboard)でアプリの状態を確認
- ログ、エラー、リソース使用量を監視
- コストとパフォーマンスの最適化

## Modalクラス設定

主要なパラメータ：

```python
@app.cls(
    gpu="A10G",                    # GPUタイプ
    container_idle_timeout=300,    # アイドルタイムアウト（秒）
    allow_concurrent_inputs=100,   # 同時接続数
    image=image,                   # コンテナイメージ
)
```

## ベストプラクティス

1. **リソース管理**
   - 適切なタイムアウト値の設定
   - 未使用リソースの早期解放
   - GPUインスタンスの効率的な共有

2. **エラーハンドリング**
   - WebSocket接続の適切な終了処理
   - モデルのリソース解放
   - クライアントエラーの適切な処理

3. **セキュリティ**
   - 環境変数の適切な管理
   - CORSの適切な設定
   - レート制限の実装（必要に応じて）

4. **モニタリング**
   - ログの適切な設定
   - メトリクスの収集
   - アラートの設定

## トラブルシューティング

1. **デプロイ失敗**
   - イメージのビルドログを確認
   - 依存関係の互換性を確認
   - メモリ/ディスク使用量を確認

2. **パフォーマンス問題**
   - GPUメモリの使用状況を確認
   - バッチサイズとモデル設定の最適化
   - ネットワークレイテンシーの確認

3. **接続エラー**
   - WebSocket接続状態の確認
   - ファイアウォール設定の確認
   - CORSの設定を確認

## コスト最適化

1. **GPUインスタンス**
   - 適切なGPUタイプの選択
   - アイドルタイムアウトの最適化
   - インスタンスの再利用

2. **ストレージ**
   - モデルのキャッシュ戦略
   - 一時ファイルの適切な管理

3. **ネットワーク**
   - データ転送量の最適化
   - 圧縮設定の調整

## 参考リソース

- [Modal公式ドキュメント](https://modal.com/docs/)
- [FastAPI WebSocketガイド](https://fastapi.tiangolo.com/advanced/websockets/)
- [Modalサンプルプロジェクト](https://github.com/modal-labs/modal-examples)