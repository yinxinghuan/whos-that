#!/usr/bin/env python3
"""Generate the formal Who's That poster through the Aigram transit endpoint."""

import io
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ENDPOINT = "https://chat.aiwaves.tech/aigram/api/gen-image"
SOURCE = ROOT / "_production" / "poster-source.webp"
OUTPUT = ROOT / "public" / "poster.png"
PROVENANCE = ROOT / "_production" / "poster-provenance.json"

PROMPT = """Refine this square premium editorial game poster. Keep the exact large English title WHO'S THAT? in the upper 20 percent and allow absolutely no other words or symbols. Keep the central fictional Black woman's portrait hidden by matte black photo masks, with only a narrow vertical slice of her eyes, nose and smile revealed. Keep the red and cobalt crop marks. Place exactly two small circular candidate portraits, one at middle left and one at middle right, both above the 70 percent height line. Remove every portrait and every object from the lower 30 percent; that entire bottom area must be calm warm cream paper texture so app buttons may cover it safely. Use only the diverse Western adults from the reference image, no East Asian subjects. Realistic photography, warm cream uncoated paper, black ink, cobalt and vermilion accents, analogue contact-sheet energy. No Chinese text, no extra letters, no logos, no watermark, no phone UI, no rounded app cards. Make the title and central face instantly readable at 160x160."""


def reference_url() -> str:
    existing = ROOT / "_production" / "poster-provenance.json"
    if existing.exists():
        record = json.loads(existing.read_text(encoding="utf-8"))
        if record.get("result_url"):
            return record["result_url"]
    demo_record = json.loads((ROOT / "_production" / "demo-contact-sheet-provenance.json").read_text(encoding="utf-8"))
    return demo_record["result_url"]


def request_image() -> str:
    body = json.dumps({"prompt": PROMPT, "ref_url": reference_url()}).encode("utf-8")
    for attempt, delay in enumerate((0, 3, 8, 15), start=1):
        if delay:
            time.sleep(delay)
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={"Content-Type": "application/json", "Origin": "https://aigram.app", "User-Agent": "Mozilla/5.0"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=360) as response:
                payload = json.load(response)
            url = payload.get("url") or payload.get("data", {}).get("url")
            if not url:
                raise RuntimeError(f"missing url: {payload}")
            return url
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
    raise RuntimeError("unreachable")


def main() -> None:
    url = request_image()
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=120) as response:
        raw = response.read()
    SOURCE.write_bytes(raw)
    image = Image.open(io.BytesIO(raw)).convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
    image.save(OUTPUT, "PNG", optimize=True)
    PROVENANCE.write_text(json.dumps({"endpoint": ENDPOINT, "origin": "https://aigram.app", "prompt": PROMPT, "ref_url": reference_url(), "result_url": url, "source": "_production/poster-source.webp", "output": "public/poster.png"}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"url": url, "size": image.size, "output": str(OUTPUT)}))


if __name__ == "__main__":
    main()
