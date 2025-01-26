# プロジェクト解説

## 1. プロジェクト構成

```
quillman/
├── src/
│   ├── app.py         # メインのWebアプリケーション
│   ├── moshi.py       # 音声処理とLLMの核となるロジック
│   ├── common.py      # Modal appの共通設定
│   └── frontend/      # フロントエンドのアセット
└── requirements/      # 依存関係の管理

```

## 2. Modalの利用について

### ローカル環境とModal環境の違い

1. **ローカル環境**
   - 開発時に使用する環境
   - `conda activate modal`で専用の環境をアクティベート
   - モデルや依存関係のテスト、コード編集を行う
   - `modal serve`でローカルでの動作確認が可能

2. **Modal環境**
   - クラウドで実行される本番環境
   - GPUリソース（A10G）を使用
   - 依存関係は`modal.Image`で管理
   - モデルは`@modal.build()`で自動的にダウンロード

### Modalの主要コンポーネント

1. **アプリケーション定義**
```python
# common.py
app = App(name="quillman")
```

2. **イメージの設定（moshi.py）**
```python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "moshi==0.1.0",
        "fastapi==0.115.5",
        "huggingface_hub==0.24.7",
        # その他の依存関係
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)
```

3. **モデルの管理**
```python
@modal.build()  # モデルのダウンロードを制御
def download_model(self):
    hf_hub_download(loaders.DEFAULT_REPO, loaders.MOSHI_NAME)
    # その他のモデルファイル
```

4. **Webアプリケーション（app.py）**
```python
@app.function(
    mounts=[modal.Mount.from_local_dir(static_path, remote_path="/assets")],
    container_idle_timeout=600,
    timeout=600,
    allow_concurrent_inputs=100,
    image=modal.Image.debian_slim(python_version="3.11").pip_install(
        "fastapi==0.115.5"
    ),
)
@modal.asgi_app()
def web():
    # FastAPIアプリケーションの定義
```

## 3. 開発からデプロイまでのフロー

1. **ローカル開発**
   ```bash
   conda activate modal  # Modal用の環境をアクティベート
   modal serve src.app  # ローカルでの動作確認
   ```

2. **デプロイ**
   ```bash
   conda activate modal
   modal deploy src.app
   ```

3. **デプロイ後のエンドポイント**
   - フロントエンド: https://ganpare--quillman-web.modal.run
   - WebSocket: https://ganpare--quillman-moshi-web.modal.run

## 4. 重要なポイント

1. **依存関係の管理**
   - ローカル環境: `requirements.txt`でmodalパッケージのみ管理
   - Modal環境: `modal.Image`内で必要なパッケージを定義

2. **リソース管理**
   - GPU: Modalで自動的にA10Gを割り当て
   - ストレージ: モデルファイルは`@modal.build()`で自動管理
   - スケーリング: `allow_concurrent_inputs=100`で同時接続を制御

3. **デバッグとモニタリング**
   - ローカル環境: `modal serve`でログ確認
   - Modal環境: Modalのダッシュボードでモニタリング