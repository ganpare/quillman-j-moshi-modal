# J-Moshi: 日本語音声対話システム

[English version here](./README.md)

日本語に特化した音声対話システムです。音声から音声へのストリーミング対話を実現します。

バックエンドには J-Moshi モデルを使用しており、ユーザーの発話を継続的にリッスンし、適切なタイミングで応答を生成します。Mimi ストリーミングエンコーダー/デコーダーモデルを使用して途切れのない双方向の音声ストリームを維持し、会話の文脈を理解して自然な対話を実現します。

双方向WebSocketストリーミングと Opusオーディオコーデック による効率的な音声圧縮により、良好なインターネット環境下では人間の会話に近い自然なレスポンスタイムを実現しています。

このリポジトリは、言語モデルベースのアプリケーション開発の出発点として、また実験のためのプレイグラウンドとして機能することを目的としています。貢献は歓迎されます！


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

本プロジェクトのデプロイ手順は、modal-labs/quillman の実装を参考にしています。

変更に満足したら、アプリケーションを[デプロイ](https://modal.com/docs/guide/managing-deployments#creating-deployments)します：

```shell
modal deploy src.app
```

これによりフロントエンドサーバーとMoshi WebSocketサーバーの両方がデプロイされます。

なお、Modalにデプロイしたアプリケーションを残しておいても費用は発生しません！Modalアプリケーションはサーバーレスで、使用されていない時はゼロにスケールダウンします。

## 免責事項（Disclaimer）

本システムは試作段階であり、生成される応答が不正確または不自然な場合があります。また、学習データに基づくバイアスが含まれる可能性があるため、慎重に利用してください。本プロジェクトの開発者は、本システムの利用によって発生したいかなる損害についても責任を負いません。

## Acknowledgments（謝辞）

本プロジェクトは以下のリポジトリを参考にしています：

- J-Moshi(https://github.com/nu-dialogue/j-moshi)日本語音声対話システムのベースとなるモデル
- modal-labs/quillman(https://github.com/modal-labs/quillman) - Modal上でのデプロイおよびストリーミング処理の実装を参考にしました

オリジナルの開発者の皆様に感謝いたします。

## ライセンス

このリポジトリは CC BY-NC 4.0 のライセンスの下で公開されています。商用利用はできませんので、ご注意ください。

