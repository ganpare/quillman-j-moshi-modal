# J-Moshi: 日本語音声対話システム

[J-Moshi](https://github.com/nu-dialogue/j-moshi)は、Modalを使用して構築された完全な日本語音声対話アプリケーションです。あなたが話しかけると、AIがリアルタイムで応答します！

核となるのは、[J-Moshi](https://github.com/nu-dialogue/j-moshi)モデルです。このモデルは継続的にユーザーの発話を聞き、応答を計画し、自然な対話を実現します。

双方向WebSocketストリーミングと[Opusオーディオ圧縮](https://opus-codec.org/)のおかげで、良好なインターネット環境では人間の会話に近い応答性を実現しています。

デモは[こちら](https://modal-labs--quillman-web.modal.run/)でご覧いただけます。

![J-Moshi](https://github.com/user-attachments/assets/afda5874-8509-4f56-9f25-d734b8f1c40a)

フロントエンドからモデルのバックエンドまで、すべてがModalでサーバーレスにデプロイされており、自動的にスケールし、使用したコンピュートリソースに対してのみ課金されます。

このページでは、[GitHubリポジトリ](https://github.com/nu-dialogue/j-moshi)のハイレベルな概要を説明します。

## コードの概要

従来、J-Moshiのような双方向ストリーミングWebアプリケーションの構築には多大な労力が必要で、特に複数の同時ユーザーを処理し、堅牢でスケーラブルにすることは困難でした。

しかしModalを使用すると、2つのクラスを書いてCLIコマンドを実行するだけで実現できます。

プロジェクト構造は以下の通りです：

1. [Moshi WebSocketサーバー](https://modal.com/docs/examples/llm-voice-chat#moshi-websocket-server): Moshiモデルのインスタンスをロードし、クライアントとの双方向WebSocket接続を維持します。
2. [Reactフロントエンド](https://modal.com/docs/examples/llm-voice-chat#react-frontend): クライアントサイドのインタラクションロジックを実行します。

それぞれのコンポーネントについて詳しく見ていきましょう。

### FastAPIサーバー

フロントエンドとバックエンドの両方が[FastAPIサーバー](https://fastapi.tiangolo.com/)を通じて提供されます。これは、REST APIを構築するための人気のあるPythonウェブフレームワークです。

Modalでは、関数やクラスメソッドに[`@app.asgi_app()`](https://modal.com/docs/reference/modal.asgi_app#modalasgi_app)デコレータを付けてFastAPIアプリを返すことで、ウェブエンドポイントとして公開できます。ミドルウェアの追加、静的ファイルの提供、WebSocketの実行など、FastAPIサーバーを自由に設定できます。

### Moshi WebSocketサーバー

従来の音声対話アプリでは、音声認識、テキスト変換、音声合成という3つの異なるモジュールが必要でした。これらのモジュール間のデータ受け渡しがボトルネックとなり、アプリケーションの速度を制限し、不自然な順番待ち会話を強いられていました。

[J-Moshi](https://github.com/nu-dialogue/j-moshi)はすべてのモダリティを1つのモデルにバンドルすることで、レイテンシーを削減し、アプリケーションをシンプルにしています。

内部では、[Mimi](https://huggingface.co/kyutai/mimi)ストリーミングエンコーダー/デコーダーモデルを使用して途切れのない音声の入出力ストリームを維持しています。エンコードされた音声は[音声-テキスト基盤モデル](https://huggingface.co/kyutai/moshiko-pytorch-bf16)で処理され、内部モノローグを使用して応答のタイミングと内容を決定します。

ストリーミングモデルの使用には、通常の推論バックエンドでは見られない以下のような課題があります：

1. モデルには_状態_があり、これまでの会話の文脈を維持します。これは、モデルインスタンスをユーザーセッション間で共有できないことを意味し、ユーザーセッションごとに固有のGPUを実行する必要があります。これは通常、簡単なことではありません！
2. モデルは_ストリーミング_なので、インターフェースは単純なPOSTリクエストのようにはいきません。音声データを双方向にストリーミングし、シームレスな再生のために十分な速度で処理する必要があります。

これらの課題は`src/moshi.py`で、いくつかのModal機能を使用して解決しています。

状態の問題は、同時ユーザーごとに新しいGPUをスピンアップすることで解決します。
Modalではこれが簡単です！

```python
@app.cls(
    image=image,
    gpu="A10G",
    container_idle_timeout=300,
    ...
)
class Moshi:
    # ...
```

この設定により、新しいユーザーが接続すると、新しいGPUインスタンスが作成されます！ユーザーが切断すると、そのモデルの状態がリセットされ、GPUインスタンスは再利用のためのウォームプールに返されます（最大300秒間）。ユーザーごとにGPUを使用するのはコストがかかることに注意してください。しかし、これがユーザーセッションを確実に分離する最もシンプルな方法です。

ストリーミングについては、FastAPIの双方向WebSocketサポートを使用しています。これにより、クライアントはセッション開始時に単一の接続を確立し、双方向に音声データをストリーミングできます。

FastAPIサーバーがModalの関数から実行できるのと同様に、Modalのクラスメソッドにも接続できます。これにより、事前にウォームアップされたMoshiモデルをWebSocketセッションに結合できます。

```python
    @modal.asgi_app()
    def web(self):
        from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect

        web_app = FastAPI()
        @web_app.websocket("/ws")
        async def websocket(ws: WebSocket):
            with torch.no_grad():
                await ws.accept()

                # ユーザーセッションの処理

                # 非同期I/O用のループを生成
                async def recv_loop():
                    while True:
                        data = await ws.receive_bytes()
                        # データを推論ストリームに送信...

                async def send_loop():
                    while True:
                        await asyncio.sleep(0.001)
                        msg = self.opus_stream_outbound.read_bytes()
                        # 推論出力をユーザーに送信...
```

Moshiモジュールの[開発サーバー](https://modal.com/docs/guide/webhooks#developing-with-modal-serve)を実行するには、リポジトリのルートで以下のコマンドを実行します。

```shell
modal serve src.moshi
```

ターミナル出力にWebSocket接続用のURLが表示されます。

### Reactフロントエンド

フロントエンドは`src/frontend`ディレクトリにある静的なReactアプリで、`src/app.py`で提供されています。

[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)を使用してユーザーのマイクから音声を録音し、モデルからの音声応答を再生します。

効率的な音声伝送のために、[Opusコーデック](https://opus-codec.org/)を使用してネットワーク経由で音声を圧縮します。Opusの録音と再生は[`opus-recorder`](https://github.com/chris-rudmin/opus-recorder)と[`ogg-opus-decoder`](https://github.com/eshaz/wasm-audio-decoders/tree/master/src/ogg-opus-decoder)ライブラリでサポートされています。

フロントエンドアセットを提供するには、リポジトリのルートで以下のコマンドを実行します：

```shell
modal serve src.app
```

`src/app.py`は`src/moshi.py`モジュールをインポートするため、この`serve`コマンドはMoshi WebSocketサーバーも独自のエンドポイントとして提供します。

## デプロイ

準備が整ったら、`deploy`コマンドを使用してアプリケーションをModalにデプロイします。

```shell
modal deploy src.app
```

## このコードを活用する

このサンプル全体のコードは[GitHubで公開](https://github.com/nu-dialogue/j-moshi)されています。フォークして自由にカスタマイズしてください！
