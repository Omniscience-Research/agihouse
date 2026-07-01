#!/usr/bin/env python3
"""
Align 27 headshots to a uniform face position/scale.

Pipeline:
  1. Run detect-faces.swift (macOS Vision framework) over every source image to
     get eye-center landmarks (+ face bounding box fallback) in top-left pixel coords.
  2. Compute a similarity transform (rotate+uniform-scale+translate) so that in the
     600x600 output: eye midpoint -> (300,250), inter-ocular distance -> 150px, eyes level.
  3. Resample with Pillow (Image.transform AFFINE) and save as high-quality JPEG.
  4. Build a contact-sheet montage with a guide line at y=250 to verify alignment.

Tool used: macOS Vision (VNDetectFaceLandmarksRequest) via Swift, Pillow for the transform.
"""
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw

SRC_ROOT = Path("/Users/juliusritter/agihouse/roommates-research/headshots")
OUT_ROOT = Path("/Users/juliusritter/agihouse/newlander/assets/network")
SWIFT = Path("/Users/juliusritter/agihouse/newlander/detect-faces.swift")
MONTAGE = Path("/private/tmp/claude-501/-Users-juliusritter/"
               "81f08f21-76c8-4c1b-840f-40106ddb4de9/scratchpad/facegrid.jpg")

OUT = 600
EYE_MID = (300.0, 250.0)   # target eye-midpoint
INTEROC = 150.0            # target inter-ocular distance (px)


def slug_for(folder_name: str) -> str:
    toks = folder_name.split("_")
    return f"{toks[0]}-{toks[1]}".lower()


def similarity_affine(p1, p2, q1, q2):
    """Return Pillow AFFINE coeffs mapping OUTPUT->INPUT for the similarity that
    sends source p1->q1, p2->q2 (q are the target/output coords)."""
    # forward (input->output): out = C*in + T   (complex)
    p1c = complex(*p1); p2c = complex(*p2)
    q1c = complex(*q1); q2c = complex(*q2)
    C = (q2c - q1c) / (p2c - p1c)
    T = q1c - C * p1c
    # inverse (output->input): in = A*out + B
    A = 1.0 / C
    B = -T / C
    ax, ay = A.real, A.imag
    Bx, By = B.real, B.imag
    # in_x = ax*x - ay*y + Bx ; in_y = ay*x + ax*y + By
    return (ax, -ay, Bx, ay, ax, By)


def pick_face(faces):
    """Pick the largest face; return (eyes_dict_or_None, bbox)."""
    if not faces:
        return None, None
    faces = sorted(faces, key=lambda f: f["bboxArea"], reverse=True)
    f = faces[0]
    return f.get("eyes"), f["bbox"]


def main():
    folders = sorted([d for d in SRC_ROOT.iterdir() if d.is_dir()])
    imgs = [str(d / "headshot.jpg") for d in folders]

    # Batch-run Vision detector.
    proc = subprocess.run(["swift", str(SWIFT)] + imgs,
                          capture_output=True, text=True)
    det = {}
    for line in proc.stdout.strip().splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        det[obj["path"]] = obj

    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    results = []  # (slug, out_path, method_note)

    for d in folders:
        slug = slug_for(d.name)
        src = str(d / "headshot.jpg")
        out_path = OUT_ROOT / f"{slug}.jpg"
        info = det.get(src)
        note = "eyes"
        if not info or not info.get("faces"):
            note = "NO-FACE"
            print(f"[WARN] no face detected: {d.name}")
            results.append((slug, out_path, note, None))
            continue

        eyes, bbox = pick_face(info["faces"])
        if eyes:
            le = tuple(eyes["leftEye"])
            re = tuple(eyes["rightEye"])
            # order by x so orientation is preserved (leftmost eye -> left target)
            if le[0] <= re[0]:
                pL, pR = le, re
            else:
                pL, pR = re, le
        else:
            # bbox fallback: eye line at 42% of box height, eyes at 45%/55% of width span
            note = "bbox-fallback"
            bx, by, bw, bh = bbox
            eye_y = by + 0.42 * bh
            # assume interocular ~= 0.46 * face width
            cx = bx + 0.5 * bw
            half = 0.23 * bw
            pL = (cx - half, eye_y)
            pR = (cx + half, eye_y)
            print(f"[INFO] bbox fallback used: {d.name}")

        qL = (EYE_MID[0] - INTEROC / 2, EYE_MID[1])
        qR = (EYE_MID[0] + INTEROC / 2, EYE_MID[1])
        coeffs = similarity_affine(pL, pR, qL, qR)

        im = Image.open(src).convert("RGB")
        out = im.transform((OUT, OUT), Image.AFFINE, coeffs,
                           resample=Image.BICUBIC, fillcolor=(238, 238, 238))
        out.save(out_path, "JPEG", quality=92)
        results.append((slug, out_path, note, (pL, pR)))
        print(f"[OK] {slug:26s} {note}")

    build_montage(results)
    return results


def build_montage(results):
    cols = 5
    cell = 200
    pad = 6
    label_h = 16
    rows = (len(results) + cols - 1) // cols
    W = cols * (cell + pad) + pad
    H = rows * (cell + label_h + pad) + pad
    sheet = Image.new("RGB", (W, H), (30, 30, 30))
    draw = ImageDraw.Draw(sheet)
    for i, (slug, out_path, note, _) in enumerate(results):
        r, c = divmod(i, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        if out_path.exists():
            th = Image.open(out_path).resize((cell, cell), Image.BICUBIC)
            sheet.paste(th, (x, y))
        # guide line at y=250/600 of the cell
        gy = y + int(cell * 250 / 600)
        draw.line([(x, gy), (x + cell, gy)], fill=(255, 0, 0), width=1)
        color = (255, 255, 255) if note in ("eyes",) else (255, 200, 0)
        draw.text((x + 2, y + cell + 2), f"{slug} [{note}]", fill=color)
    MONTAGE.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(MONTAGE, "JPEG", quality=90)
    print(f"[montage] {MONTAGE}")


if __name__ == "__main__":
    main()
