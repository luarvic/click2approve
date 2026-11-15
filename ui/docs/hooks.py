"""Include shared branding assets and resolve environment-specific API links."""

import os
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from mkdocs.plugins import event_priority
from mkdocs.structure.files import File

UI = Path(__file__).resolve().parent.parent
_api_base_uri = ""
_serving = False


def on_config(config):
    config.extra.setdefault(
        "locale", {"path": "en", "code": "en", "name": "English", "direction": "ltr"}
    )
    config.extra.setdefault("language_prefix", "")
    for name in ("terms", "privacy"):
        config.extra[f"{name}_url"] = os.environ.get(
            f"SITE_{name.upper()}_URL", config.extra.get(f"{name}_url", "")
        ).strip()
    overrides = Path(config.config_file_path).parent / "docs/overrides"
    if str(overrides) not in config.theme.dirs and overrides.is_dir():
        config.theme.dirs.insert(0, str(overrides))
    analytics_id = os.environ.get("GOOGLE_ANALYTICS_ID", "").strip()
    if analytics_id:
        if not re.fullmatch(r"G-[A-Z0-9]+", analytics_id):
            raise ValueError("GOOGLE_ANALYTICS_ID must be a GA4 measurement ID (G-...) or empty.")
        config.extra["google_analytics_id"] = analytics_id
    else:
        config.extra.pop("google_analytics_id", None)
    config.extra["analytics_development"] = _serving or config.extra.get(
        "analytics_development", False
    )
    config.extra["docs_api_base_uri"] = config.extra.get("docs_api_base_uri", _api_base_uri)
    return config


def on_startup(command, dirty):
    global _api_base_uri, _serving
    _serving = command == "serve"
    default = "http://localhost:5555" if command == "serve" else ""
    _api_base_uri = os.environ.get("DOCS_API_BASE_URI", default).rstrip("/")


def on_page_markdown(markdown, page, config, files):
    return markdown.replace(
        "{{ api_reference_url }}", f"{config.extra['docs_api_base_uri']}/swagger/"
    )


def on_files(files, config):
    ui_dir = UI
    # Both portals use the same presentation and static assets.
    existing = {file.src_uri for file in files}
    content = ui_dir / "docs/content"
    for source in content.rglob("*"):
        destination = source.relative_to(content).as_posix()
        if source.is_file() and source.suffix != ".md" and destination not in existing:
            files.append(File.generated(config, destination, abs_src_path=str(source)))
    assets = {
        "assets/logo.svg": ui_dir / "public/logo-wall-to-wall.svg",
        "assets/logo-narrow.svg": ui_dir / "public/logo-narrow.svg",
        "assets/favicon-192.png": ui_dir / "public/favicon-192.png",
    }
    for weight in (400, 500, 600, 700):
        name = f"sora-latin-{weight}-normal.woff2"
        assets[f"assets/fonts/{name}"] = ui_dir / "node_modules/@fontsource/sora/files" / name

    for destination, source in assets.items():
        if not source.is_file():
            raise FileNotFoundError(
                f"Missing documentation asset: {source}. Run npm ci in ui/ first."
            )
        files.append(File.generated(config, destination, abs_src_path=str(source)))
    files.append(
        File.generated(
            config, "robots.txt",
            content=(ui_dir / "public/robots.txt").read_text()
            + f"\nSitemap: {urljoin(config.extra.get('public_site_url', config.site_url), 'sitemap.xml')}\n",
        )
    )
    return files


@event_priority(100)
def on_env(env, config, files):
    env.globals["t"] = lambda message: message
    env.globals["site_path"] = lambda path="": urlsplit(
        urljoin(config.site_url, path.lstrip("/"))
    ).path
    env.globals["language_choices"] = []
    return env


def on_page_context(context, page, config, nav):
    context["public_page_path"] = urlsplit(urljoin(config.site_url, page.url)).path
    return context


def on_post_build(config):
    if not config.extra.get("localized"):
        (Path(config.site_dir) / "nginx-languages.conf").write_text(
            "# English-only portal: use the standard missing-page response.\n"
            "map $uri $public_error_page { default /404.html; }\n"
        )


def on_serve(server, config, builder):
    # Commercial content lives outside the shared theme/assets after the portal split.
    sources = [
        UI / "docs/content/stylesheets",
        UI / "docs/content/javascripts",
        UI / "docs/overrides",
        UI / "public",
        Path(config.config_file_path).parent / "docs/overrides",
    ]
    for source in set(sources):
        if source.is_dir() and not source.is_relative_to(Path(config.docs_dir)):
            server.watch(str(source))
    return server
