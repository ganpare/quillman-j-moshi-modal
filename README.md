# J-Moshi: Japanese Voice Chat System

[日本語版はこちら](./README.ja.md)

A voice chat system specifically designed for Japanese language. Enables streaming dialogue from voice to voice.

The backend uses the [Moshi](https://github.com/nu-dialogue/j-moshi) model, which continuously listens to user utterances and generates responses at appropriate timings. Using the [Mimi](https://huggingface.co/kyutai/mimi) streaming encoder/decoder model, it maintains a seamless bidirectional voice stream, understanding conversation context to enable natural dialogue.

With bidirectional WebSocket streaming and efficient voice compression using the [Opus audio codec](https://opus-codec.org/), it achieves natural response times close to human conversation in good internet environments.

Try the demo [here](https://modal-labs--quillman-web.modal.run/).

![J-Moshi](https://github.com/user-attachments/assets/afda5874-8509-4f56-9f25-d734b8f1c40a)

This repository aims to function as a starting point for language model-based application development and as a playground for experimentation. Contributions are welcome!

[Note: This code is provided for demonstration purposes. Please check model licenses before commercial use.]

## File Structure

1. React Frontend ([`src/frontend/`](./src/frontend/)) - Served by [`src/app.py`](./src/app.py)
2. Moshi WebSocket Server ([`src/moshi.py`](./src/moshi.py))

## Local Development

### Prerequisites

- Python virtual environment with `modal` installed (`pip install modal`)
- [Modal](http://modal.com/) account (set up with `modal setup`)
- Modal token set in environment (`modal token new` to generate)

### Inference Module Development

The Moshi server is implemented as a [Modal class](https://modal.com/docs/reference/modal.Cls#modalcls) module that loads the model and maintains streaming state. It exposes a WebSocket interface through a [FastAPI](https://fastapi.tiangolo.com/) HTTP server over the internet.

To start the Moshi module's [development server](https://modal.com/docs/guide/webhooks#developing-with-modal-serve), run the following command from the repository root:

```shell
modal serve src.moshi
```

The terminal output will show the URL for WebSocket connection.

While the `modal serve` process is running, changes to project files are automatically applied. Use `Ctrl+C` to stop the app.

### Testing WebSocket Connection
From another terminal, you can test the WebSocket connection directly from the command line using the `tests/moshi_client.py` client.

It requires non-standard dependencies, which can be installed with:
```shell
python -m venv venv
source venv/bin/activate
pip install -r requirements/requirements-dev.txt
```

Once dependencies are installed, run the terminal client with:
```shell
python tests/moshi_client.py
```

Make sure your microphone and speakers are enabled, and start talking!

### HTTP Server and Frontend Development

The HTTP server in `src/app.py` is a second [FastAPI](https://fastapi.tiangolo.com/) application that serves the frontend as static files.

You can start the [development server](https://modal.com/docs/guide/webhooks#developing-with-modal-serve) with:

```shell
modal serve src.app
```

Since `src/app.py` imports the `src/moshi.py` module, this also starts the Moshi WebSocket server.

The terminal output will show the URL to access the application.
While the `modal serve` process is running, changes to project files are automatically applied. Use `Ctrl+C` to stop the app.

For frontend changes, you may need to clear your browser cache.

### Deploying to Modal

Once you're satisfied with changes, [deploy](https://modal.com/docs/guide/managing-deployments#creating-deployments) the application:

```shell
modal deploy src.app
```

This deploys both the frontend server and the Moshi WebSocket server.

Note that keeping your deployed application in Modal incurs no costs! Modal applications are serverless and scale to zero when not in use.
