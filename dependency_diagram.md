# QuillMan 依存関係図

```mermaid
graph TD
    subgraph "フロントエンド"
        F_INDEX[index.html]
        F_APP[app.jsx]
        F_INDEX --> F_APP
        
        subgraph "外部ライブラリ"
            REACT[React]
            TAILWIND[TailwindCSS]
            OPUS_REC[Opus Recorder]
            OPUS_DEC[Opus Decoder]
            F_APP --> REACT
            F_APP --> TAILWIND
            F_APP --> OPUS_REC
            F_APP --> OPUS_DEC
        end
    end

    subgraph "バックエンド"
        B_COMMON[common.py]
        B_APP[app.py]
        B_MOSHI[moshi.py]
        
        B_COMMON -->|Modal App| B_APP
        B_COMMON -->|Modal App| B_MOSHI
        B_APP -->|imports| B_MOSHI

        subgraph "外部パッケージ"
            MODAL[Modal]
            FASTAPI[FastAPI]
            MOSHI_PKG[Moshi]
            HF[HuggingFace Hub]
            TORCH[PyTorch]
            SPHN[SPHN]
            
            B_COMMON --> MODAL
            B_APP --> FASTAPI
            B_MOSHI --> MOSHI_PKG
            B_MOSHI --> HF
            B_MOSHI --> TORCH
            B_MOSHI --> SPHN
        end
    end

    subgraph "通信"
        WS{WebSocket}
        STATIC{Static Files}
        
        F_APP -->|Audio Data| WS
        WS -->|Audio/Text| F_APP
        B_MOSHI -->|Handles| WS
        B_APP -->|Serves| STATIC
        STATIC -->|Loads| F_INDEX
    end

    subgraph "モデル"
        MIMI[Mimi Model]
        MOSHI_MODEL[Moshi Model]
        TEXT_TOK[Text Tokenizer]
        
        B_MOSHI --> MIMI
        B_MOSHI --> MOSHI_MODEL
        B_MOSHI --> TEXT_TOK
    end