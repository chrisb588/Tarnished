# conftest.py (at project root, NOT inside tests/)
import os

from dotenv import load_dotenv

load_dotenv(dotenv_path="tests/.env.test", override=True)
