#!/usr/bin/env python3
"""Generate one six-person contact sheet through Aigram transit and crop demo avatars."""

import io
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "demo"
SOURCE = ROOT / "_production" / "demo-contact-sheet-source.webp"
PROVENANCE = ROOT / "_production" / "demo-contact-sheet-provenance.json"
ENDPOINT = "https://chat.aiwaves.tech/aigram/api/gen-image"

PROMPT = """A premium editorial casting contact sheet containing exactly six different fictional adult friends, arranged as a perfectly even 3 columns by 2 rows grid. Each cell is one separate head-and-shoulders photographic portrait against the same warm light gray studio background. Diverse Western urban friend group: Black woman with short natural curls, white man with red hair, Latina woman with a dark bob, South Asian man with wavy hair, white woman with platinum pixie hair, Black man with close-cropped hair. Ages 25 to 45. Natural expressions, direct or slight three-quarter gaze, soft window light, consistent camera distance, realistic skin, contemporary casual solid-color tops. Clear gutters between all six cells, no overlap, no text, no letters, no numbers, no logos, no frames, no watermarks, no collage decorations. Square 1024x1024 image."""


def request_image() -> str:
    body = json.dumps({"prompt": PROMPT}).encode("utf-8")
    for attempt, delay in enumerate((0, 3, 8, 15), start=1):
        if delay:
            time.sleep(delay)
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://aigram.app",
                "User-Agent": "Mozilla/5.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=360) as response:
                payload = json.load(response)
            url = payload.get("url") or payload.get("data", {}).get("url")
            if not url:
                raise RuntimeError(f"missing url in response: {payload}")
            return url
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
    raise RuntimeError("unreachable")


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    url = request_image()
    raw = download(url)
    SOURCE.write_bytes(raw)
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = image.size
    cell_w = width / 3
    cell_h = height / 2
    size = int(min(cell_w, cell_h) * 0.86)
    names = ("amara", "owen", "sofia", "dev", "claire", "malik")
    for index, name in enumerate(names):
        col = index % 3
        row = index // 3
        center_x = int((col + 0.5) * cell_w)
        center_y = int((row + 0.5) * cell_h)
        left = max(0, center_x - size // 2)
        top = max(0, center_y - size // 2)
        avatar = image.crop((left, top, left + size, top + size)).resize((640, 640), Image.Resampling.LANCZOS)
        avatar.save(OUT / f"{name}.webp", "WEBP", quality=92, method=6)
    PROVENANCE.write_text(
        json.dumps(
            {
                "endpoint": ENDPOINT,
                "origin": "https://aigram.app",
                "prompt": PROMPT,
                "result_url": url,
                "source": str(SOURCE.relative_to(ROOT)),
                "outputs": [f"public/demo/{name}.webp" for name in names],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"url": url, "source_size": image.size, "avatars": len(names)}))


if __name__ == "__main__":
    main()
