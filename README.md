# J-Moshi: Japanese Voice Chat System

[日本語版はこちら](./README.ja.md)

## Quillman + J-Moshi: Japanese Voice Chat System on Modal

This project is a fork of [modal-labs/quillman](https://github.com/modal-labs/quillman), customized based on the Japanese voice chat system [J-Moshi](https://github.com/nu-dialogue/j-moshi).

### Base Repositories:
- ✅ **Forked from:** [modal-labs/quillman](https://github.com/modal-labs/quillman)
- ✅ **Referenced:** [nu-dialogue/j-moshi](https://github.com/nu-dialogue/j-moshi)

This repository provides an environment optimized for Japanese voice chat, with deployment capabilities using Modal.

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

The deployment procedure for this project references the implementation of modal-labs/quillman.

Once you're satisfied with changes, [deploy](https://modal.com/docs/guide/managing-deployments#creating-deployments) the application:

```shell
modal deploy src.app
```

This deploys both the frontend server and the Moshi WebSocket server.

Note that keeping your deployed application in Modal incurs no costs! Modal applications are serverless and scale to zero when not in use.

## Disclaimer

This system is in a prototype stage, and the generated responses may be inaccurate or unnatural. Please use with caution as it may contain biases based on training data. The developers of this project are not responsible for any damages caused by the use of this system.

## Acknowledgments

This project references the following repositories:

- J-Moshi (https://github.com/nu-dialogue/j-moshi) - The base model for the Japanese voice chat system
- modal-labs/quillman (https://github.com/modal-labs/quillman) - Referenced for deployment and streaming implementation on Modal

Thanks to all the original developers.

## License and Notes
This project is released under the **MIT License**.  
However, the J-Moshi trained model used (Hugging Face's `nu-dialogue/j-moshi`) is licensed under **CC BY-NC 4.0** and **cannot be used for commercial purposes**.
