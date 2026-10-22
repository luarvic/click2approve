"""Include shared branding assets and resolve environment-specific API links."""

import os
import re
from pathlib import Path

from mkdocs.structure.files import File

_api_base_uri = ""


def on_config(config):
    analytics_id = os.environ.get("GOOGLE_ANALYTICS_ID", "").strip()
    if analytics_id:
        if not re.fullmatch(r"G-[A-Z0-9]+", analytics_id):
            raise ValueError("GOOGLE_ANALYTICS_ID must be a GA4 measurement ID (G-...) or empty.")
        config.extra["analytics"] = {"provider": "google", "property": analytics_id}
    else:
        config.extra.pop("analytics", None)
    return config


def on_startup(command, dirty):
    global _api_base_uri
    default = "http://localhost:5555" if command == "serve" else ""
    _api_base_uri = os.environ.get("DOCS_API_BASE_URI", default).rstrip("/")


def on_page_markdown(markdown, page, config, files):
    return markdown.replace("{{ api_reference_url }}", f"{_api_base_uri}/swagger/")


def on_files(files, config):
    ui_dir = Path(config.config_file_path).parent
    assets = {
        "assets/logo.svg": ui_dir / "public/logo-wall-to-wall.svg",
        "assets/logo-narrow.svg": ui_dir / "public/logo-narrow.svg",
    }
    for weight in (400, 500, 600, 700):
        name = f"sora-latin-{weight}-normal.woff2"
        assets[f"assets/fonts/{name}"] = (
            ui_dir / "node_modules/@fontsource/sora/files" / name
        )

    for destination, source in assets.items():
        if not source.is_file():
            raise FileNotFoundError(f"Missing documentation asset: {source}. Run npm ci in ui/ first.")
        files.append(File.generated(config, destination, abs_src_path=str(source)))
    return files
