"""
Modal app configuration.
"""

import modal

app = modal.App("j-moshi")

# J-Moshi specific configurations
JMOSHI_DEFAULT_REPO = "nu-dialogue/j-moshi-ext"
JMOSHI_MODEL_NAME = "model.safetensors"
JMOSHI_MIMI_NAME = "tokenizer-e351c8d8-checkpoint125.safetensors"
JMOSHI_TOKENIZER_NAME = "tokenizer_spm_32k_3.model"
