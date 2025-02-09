# J-Moshi: 日本語音声対話システム

[English version here](./README.md)

日本語に特化した音声対話システムです。音声から音声へのストリーミング対話を実現します。

バックエンドには[Moshi](https://github.com/nu-dialogue/j-moshi)モデルを使用しており、ユーザーの発話を継続的にリッスンし、適切なタイミングで応答を生成します。[Mimi](https://huggingface.co/kyutai/mimi)ストリーミングエンコーダー/デコーダーモデルを使用して途切れのない双方向の音声ストリームを維持し、会話の文脈を理解して自然な対話を実現します。

双方向WebSocketストリーミングと[Opusオーディオコーデック](https://opus-codec.org/)による効率的な音声圧縮により、良好なインターネット環境下では人間の会話に近い自然なレスポンスタイムを実現しています。

デモは[こちら](https://modal-labs--quillman-web.modal.run/)でご覧いただけます。

![J-Moshi](https://github.com/user-attachments/assets/afda5874-8509-4f56-9f25-d734b8f1c40a)

このリポジトリは、言語モデルベースのアプリケーション開発の出発点として、また実験のためのプレイグラウンドとして機能することを目的としています。貢献は歓迎されます！

[注: このコードは例示目的で提供されています。商用利用の際はモデルのライセンスを必ず確認してください]

## ファイル構造

1. Reactフロントエンド ([`src/frontend/`](./src/frontend/)) - [`src/app.py`](./src/app.py)が提供
2. Moshi WebSocketサーバー ([`src/moshi.py`](./src/moshi.py))

## ローカル開発

### 必要条件

- Pythonの仮想環境に`modal`がインストールされていること (`pip install modal`)
- [Modal](http://modal.com/)アカウント (`modal setup`で設定)
- 環境にModalトークンが設定されていること (`modal token new`で生成)

### 推論モジュールの開発

Moshiサーバーは[Modalクラス](https://modal.com/docs/reference/modal.Cls#modalcls)モジュールとして実装されており、モデルのロードとストリーミング状態の維持を行います。[FastAPI](https://fastapi.tiangolo.com/)HTTPサーバーを通じてWebSocketインターフェースをインターネット経由で公開します。

Moshiモジュールの[開発サーバー](https://modal.com/docs/guide/webhooks#developing-with-modal-serve)を起動するには、リポジトリのルートで以下のコマンドを実行します：

```shell
modal serve src.moshi
```

ターミナル出力にWebSocket接続用のURLが表示されます。

`modal serve`プロセスが実行中の間、プロジェクトファイルへの変更は自動的に適用されます。`Ctrl+C`でアプリを停止できます。

### WebSocket接続のテスト
別のターミナルから、`tests/moshi_client.py`クライアントを使用してWebSocket接続を直接コマンドラインでテストできます。

標準以外の依存関係が必要で、以下のコマンドでインストールできます：
```shell
python -m venv venv
source venv/bin/activate
pip install -r requirements/requirements-dev.txt
```

依存関係をインストールしたら、以下のコマンドでターミナルクライアントを実行します：
```shell
python tests/moshi_client.py
```

マイクとスピーカーが有効になっていることを確認して、話し始めてください！

### HTTPサーバーとフロントエンドの開発

`src/app.py`のHTTPサーバーは、フロントエンドを静的ファイルとして提供する2つ目の[FastAPI](https://fastapi.tiangolo.com/)アプリケーションです。

以下のコマンドで[開発サーバー](https://modal.com/docs/guide/webhooks#developing-with-modal-serve)を起動できます：

```shell
modal serve src.app
```

`src/app.py`は`src/moshi.py`モジュールをインポートするため、これによってMoshi WebSocketサーバーも起動します。

ターミナル出力にアプリケーションにアクセスするためのURLが表示されます。
`modal serve`プロセスが実行中の間、プロジェクトファイルへの変更は自動的に適用されます。`Ctrl+C`でアプリを停止できます。

フロントエンドの変更については、ブラウザのキャッシュをクリアする必要がある場合があります。

### Modalへのデプロイ

変更に満足したら、アプリケーションを[デプロイ](https://modal.com/docs/guide/managing-deployments#creating-deployments)します：

```shell
modal deploy src.app
```

これによりフロントエンドサーバーとMoshi WebSocketサーバーの両方がデプロイされます。

なお、Modalにデプロイしたアプリケーションを残しておいても費用は発生しません！Modalアプリケーションはサーバーレスで、使用されていない時はゼロにスケールダウンします。