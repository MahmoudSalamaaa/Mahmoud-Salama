#!/usr/bin/env python3
r"""
Apply the status-color UI/UX layer to every HTML page in the Career Intelligence project.

Usage:
    python apply_status_color_uiux.py
    python apply_status_color_uiux.py "C:\path\to\organizations"
"""

from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path

CSS_NAME = "job-status-color-uiux.css"
JS_NAME = "job-status-color-uiux.js"

CSS_TAG = f'<link rel="stylesheet" href="./assets/{CSS_NAME}" data-status-color-uiux="css">'
JS_TAG = f'<script src="./assets/{JS_NAME}" data-status-color-uiux="js"></script>'

def detect_project_root(argument: str | None) -> Path:
    candidates: list[Path] = []

    if argument:
        candidates.append(Path(argument).expanduser().resolve())

    current = Path.cwd().resolve()
    candidates.extend([
        current,
        current / "organizations",
        Path(__file__).resolve().parent / "organizations",
        Path(__file__).resolve().parent.parent / "organizations",
    ])

    for candidate in candidates:
        if candidate.is_dir() and (candidate / "index.html").exists():
            return candidate

    raise FileNotFoundError(
        "Could not find the project folder. Run this file from inside the "
        "'organizations' folder or pass its full path."
    )

def insert_before_case_insensitive(text: str, closing_tag: str, insertion: str) -> str:
    lower = text.lower()
    index = lower.rfind(closing_tag.lower())
    if index == -1:
        return text.rstrip() + "\n" + insertion + "\n"
    return text[:index] + insertion + "\n" + text[index:]

def patch_html(path: Path) -> bool:
    original = path.read_text(encoding="utf-8", errors="replace")
    updated = original

    if f'assets/{CSS_NAME}' not in updated:
        updated = insert_before_case_insensitive(updated, "</head>", f"  {CSS_TAG}")

    if f'assets/{JS_NAME}' not in updated:
        updated = insert_before_case_insensitive(updated, "</body>", f"  {JS_TAG}")

    if updated == original:
        return False

    path.write_text(updated, encoding="utf-8", newline="\n")
    return True

def validate(root: Path, html_files: list[Path]) -> list[str]:
    errors: list[str] = []

    for asset in [root / "assets" / CSS_NAME, root / "assets" / JS_NAME]:
        if not asset.exists():
            errors.append(f"Missing asset: {asset.relative_to(root)}")

    for html in html_files:
        content = html.read_text(encoding="utf-8", errors="replace")
        rel = html.relative_to(root)

        if f'assets/{CSS_NAME}' not in content:
            errors.append(f"CSS not linked: {rel}")
        if f'assets/{JS_NAME}' not in content:
            errors.append(f"JavaScript not linked: {rel}")
        if "../assets/job-status-color-uiux" in content:
            errors.append(f"Invalid parent-relative asset path: {rel}")

    return errors

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Add accessible status-based colors to all Career Intelligence HTML pages."
    )
    parser.add_argument(
        "project",
        nargs="?",
        help="Path to the organizations folder. Auto-detected when omitted."
    )
    args = parser.parse_args()

    root = detect_project_root(args.project)
    source_assets = Path(__file__).resolve().parent / "assets"
    target_assets = root / "assets"
    target_assets.mkdir(parents=True, exist_ok=True)

    # Preserve a timestamped copy only for the two shared files if they already exist.
    backup_dir = root / "status-uiux-backup"
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

    for name in [CSS_NAME, JS_NAME]:
        source = source_assets / name
        target = target_assets / name

        # The update folder may be copied directly into the project.
        # In that case source and target are the same file and no copy is required.
        if source.resolve() == target.resolve():
            continue

        if target.exists():
            backup_dir.mkdir(exist_ok=True)
            shutil.copy2(target, backup_dir / f"{target.stem}-{stamp}{target.suffix}")
        shutil.copy2(source, target)

    # Project policy places all HTML pages in the organizations folder.
    html_files = sorted(root.glob("*.html"))
    if not html_files:
        print(f"No HTML files found in: {root}", file=sys.stderr)
        return 2

    changed = sum(patch_html(path) for path in html_files)
    errors = validate(root, html_files)

    print("=" * 68)
    print("Job Status Color UI/UX Update")
    print("=" * 68)
    print(f"Project folder : {root}")
    print(f"HTML pages     : {len(html_files)}")
    print(f"Pages updated  : {changed}")
    print(f"Pages unchanged: {len(html_files) - changed}")
    print(f"CSS asset      : assets/{CSS_NAME}")
    print(f"JS asset       : assets/{JS_NAME}")

    if errors:
        print("\nVALIDATION FAILED")
        for error in errors:
            print(f" - {error}")
        return 1

    print("\nVALIDATION PASSED")
    print("All HTML pages load the accessible status-color layer.")
    print("Open index.html or jobs.html and change a status to test it.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
