#!/usr/bin/env python3
"""Generate the Joke Flip voice clips with ElevenLabs (voice: Odd Todd).

Reads the JOKES list out of jokes/index.html and writes, for each joke N:
  jokes/audio/N-setup.mp3   and   jokes/audio/N-punch.mp3

The key is ELEVENLABS_API_KEY, loaded from .env.local at the repo root
(written by `npx @elevenlabs/cli onboard`). It never goes in the code.

One-time setup:
  python3 -m venv .venv && .venv/bin/pip install -r jokes/requirements.txt

Then:
  .venv/bin/python jokes/make-audio.py            # every joke still missing audio
  .venv/bin/python jokes/make-audio.py 1          # just joke 1
  .venv/bin/python jokes/make-audio.py 1 --force  # redo joke 1
"""
import json, os, re, sys

from dotenv import load_dotenv
from elevenlabs import ElevenLabs

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "audio")

VOICE_ID = "SDARFhQygpPvpLh7Ad1B"   # Odd Todd - Nerdy, Pompous Professor (ElevenLabs voice library)
MODEL_ID = "eleven_v4"


def load_jokes():
    html = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
    block = re.search(r"const JOKES = \[(.*?)\n\];", html, re.S).group(1)
    return [json.loads(line.strip().rstrip(",")) for line in block.strip().splitlines()]


def spoken(text):
    # Say these the way a person would
    return text.replace("…", "...").replace("9¾", "nine and three quarters")


def main():
    load_dotenv(os.path.join(ROOT, ".env.local"))
    if not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("No ELEVENLABS_API_KEY. Run: npx -y @elevenlabs/cli@latest onboard init")
    # Pass it in: the SDK's own default reads the env var at import time, before .env.local is loaded
    client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])

    nums = [int(a) for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    jokes = load_jokes()
    os.makedirs(OUT, exist_ok=True)

    for n in nums or range(1, len(jokes) + 1):
        _, setup, punch = jokes[n - 1]
        for part, text in (("setup", setup), ("punch", punch)):
            path = os.path.join(OUT, f"{n}-{part}.mp3")
            if os.path.exists(path) and not force:
                continue
            audio = client.text_to_speech.convert(
                text=spoken(text),
                voice_id=VOICE_ID,
                model_id=MODEL_ID,
                output_format="mp3_44100_128",
            )
            with open(path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            print("wrote", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    main()
