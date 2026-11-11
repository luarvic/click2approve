"""Build each public-site language independently; URLs determine content and search."""

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree

import yaml
from mkdocs.config import load_config
from mkdocs.commands.build import build
from mkdocs.plugins import event_priority
from mkdocs.structure.files import File

UI = Path(__file__).resolve().parent.parent
CONTENT = UI / "docs/content"
CATALOGS = UI / "docs/i18n"
TRANSLATIONS = UI / "docs/translations"
LOCALES = json.loads((UI / "locales.json").read_text())
ENGLISH = json.loads((CATALOGS / "en.json").read_text())["messages"]


def source_hashes():
    sources = sorted(CONTENT.rglob("*.md")) + [
        CATALOGS / "en.json",
        CATALOGS / "product-labels.json",
    ]
    return {
        path.relative_to(UI).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sources
    }


def validate_translations():
    """Fail closed on missing/stale pages and catalogs instead of publishing fallbacks."""
    hashes = source_hashes()
    product_labels = set(json.loads((CATALOGS / "product-labels.json").read_text()))
    pages = {path.relative_to(CONTENT) for path in CONTENT.rglob("*.md")}
    for locale in (item for item in LOCALES if item["path"] != "en"):
        code = locale["path"]
        catalog = json.loads((CATALOGS / f"{code}.json").read_text())
        if catalog.get("source_hashes") != hashes:
            raise ValueError(
                f"Stale translations for {code}; update translated content and source hashes."
            )
        messages = catalog["messages"]
        if set(messages) != set(ENGLISH) or any(
            not isinstance(value, str) or not value.strip() for value in messages.values()
        ):
            raise ValueError(f"Incomplete translation catalog for {code}.")
        translated = {
            path.relative_to(TRANSLATIONS / code) for path in (TRANSLATIONS / code).rglob("*.md")
        }
        if translated != pages:
            raise ValueError(f"Missing or extra translated pages for {code}: {translated ^ pages}")
        for page in pages:
            text = (TRANSLATIONS / code / page).read_text()
            if not text.strip() or re.search(r"ZXQ\d+QXZ", text):
                raise ValueError(f"Incomplete translated page: {code}/{page}")
            original = (CONTENT / page).read_text()
            metadata_pattern = r"\A---\s*\n(.*?)\n---(?:\n|$)"
            original_metadata = re.match(metadata_pattern, original, re.DOTALL)
            if original_metadata:
                translated_metadata = re.match(metadata_pattern, text, re.DOTALL)
                try:
                    metadata = (
                        yaml.safe_load(translated_metadata[1]) if translated_metadata else None
                    )
                    expected_metadata = yaml.safe_load(original_metadata[1])
                except yaml.YAMLError as error:
                    raise ValueError(f"Invalid page metadata in {code}/{page}.") from error
                if not isinstance(metadata, dict) or any(
                    not isinstance(metadata.get(key), str) or not metadata[key].strip()
                    for key in ("title", "description")
                    if key in expected_metadata
                ):
                    raise ValueError(f"Missing page metadata in {code}/{page}.")
                for key in ("template", "search", "demo_video_id"):
                    if metadata.get(key) != expected_metadata.get(key):
                        raise ValueError(f"Changed page behavior metadata in {code}/{page}: {key}.")
            links = lambda value: Counter(re.findall(r"\]\(([^)]+)\)", value))
            if links(original) != links(text):
                raise ValueError(f"Changed link destinations in {code}/{page}.")
            if any(paragraph.count("**") % 2 for paragraph in text.split("\n\n")):
                raise ValueError(f"Broken emphasis in {code}/{page}.")

            # A preserved target can still have broken translated link text or steps.
            for line in text.splitlines():
                without_links = re.sub(r"\[[^\[\]]*\]\([^)]*\)", "", line)
                without_code = re.sub(r"`[^`]+`", "", without_links)
                if without_code.count("[") != without_code.count("]"):
                    raise ValueError(f"Malformed Markdown link in {code}/{page}.")
            steps = lambda value: len(re.findall(r"^\d+\.\s", value, re.MULTILINE))
            if steps(original) != steps(text):
                raise ValueError(f"Changed numbered instructions in {code}/{page}.")
            expected_anchors = set(re.findall(r"\{#([^}]+)\}", original))
            actual_anchors = set(re.findall(r"\{#([^}]+)\}", text))
            if not expected_anchors <= actual_anchors:
                raise ValueError(f"Changed heading anchors in {code}/{page}.")

            def table_shapes(markdown):
                tables = re.findall(r"(?:^\|[^\n]+\n)+", markdown, re.MULTILINE)
                return [[row.count("|") for row in table.splitlines()] for table in tables]

            if table_shapes(original) != table_shapes(text):
                raise ValueError(f"Changed table structure in {code}/{page}.")
            expected = set(re.findall(r"\*\*([^*\n]+)\*\*", original)) & product_labels
            actual = set(re.findall(r"\*\*([^*\n]+)\*\*", text))
            if not expected <= actual:
                raise ValueError(
                    f"Translated product controls in {code}/{page}: {expected - actual}"
                )


@event_priority(100)
def on_config(config):
    # MkDocs caches hook modules across preview rebuilds; reload watched catalogs.
    global LOCALES, ENGLISH
    LOCALES = json.loads((UI / "locales.json").read_text())
    ENGLISH = json.loads((CATALOGS / "en.json").read_text())["messages"]
    locale = next(item for item in LOCALES if item["path"] == config.extra.get("language", "en"))
    prefix = config.extra.get("language_prefix", "")
    catalog = json.loads((CATALOGS / f'{locale["path"]}.json').read_text())["messages"]
    if not config.extra.get("locale_build"):
        validate_translations()
    config.extra["locale"] = locale
    config.extra["language_prefix"] = prefix
    config.extra["messages"] = catalog
    config.extra["homepage"] = urlsplit(config.site_url).path
    config.theme["language"] = locale["theme"]
    config.theme["direction"] = locale["direction"]
    config.site_description = catalog[
        "Document workflows, clear decisions, and a shared record of what happens next."
    ]
    for palette in config.theme["palette"]:
        palette["toggle"]["name"] = catalog[
            "Switch to dark mode" if palette["scheme"] == "default" else "Switch to light mode"
        ]

    def translate_nav(items):
        return [
            {catalog[label]: translate_nav(value) if isinstance(value, list) else value}
            for item in items
            for label, value in item.items()
        ]

    config.nav = translate_nav(config.nav)
    search = config.plugins.get("material/search") or config.plugins.get("search")
    if search:
        search.config.lang = [locale["search"]]
        # Lunr has no Indonesian or Polish stemmer. Preserve accented Unicode words.
        if "search_pipeline" in locale:
            search.config.pipeline = locale["search_pipeline"]
        if "search_separator" in locale:
            search.config.separator = locale["search_separator"]
    return config


def on_files(files, config):
    if Path(config.docs_dir).resolve() != CONTENT:
        for source in CONTENT.rglob("*"):
            if source.is_file() and source.suffix != ".md":
                destination = source.relative_to(CONTENT).as_posix()
                files.append(File.generated(config, destination, abs_src_path=str(source)))
    return files


def on_env(env, config, files):
    messages = config.extra["messages"]
    env.globals["t"] = lambda message: messages[message]
    env.globals["site_path"] = lambda path="": urlsplit(
        urljoin(config.site_url, path.lstrip("/"))
    ).path
    # Error templates have no Page context, but need the same language controls.
    env.globals["language_choices"] = language_choices(config, "")
    return env


def language_choices(config, page_url):
    base = config.extra.get("public_site_url", config.site_url)
    return [
        {**locale, "url": urlsplit(urljoin(base, f'{locale["path"]}/{page_url}')).path}
        for locale in LOCALES
    ]


def on_page_context(context, page, config, nav):
    base = config.extra.get("public_site_url", config.site_url)
    locale = config.extra["locale"]
    if locale["path"] == "en":
        page.canonical_url = urljoin(base, page.url)
    context["language_choices"] = language_choices(config, page.url)
    context["public_page_path"] = urlsplit(urljoin(config.site_url, page.url)).path
    return context


@event_priority(-100)
def on_post_build(config):
    if config.extra.get("locale_build"):
        return
    base = config.site_url
    output = Path(config.site_dir)
    # One source configuration, one isolated MkDocs/search build per URL language.
    for locale in LOCALES:
        code = locale["path"]
        localized = load_config(
            config_file=config.config_file_path,
            site_dir=str(output / code),
            docs_dir=str(CONTENT if code == "en" else TRANSLATIONS / code),
            site_url=urljoin(base, f"{code}/"),
            extra={
                **config.extra,
                "locale_build": True,
                "language": code,
                "language_prefix": f"/{code}",
                "public_site_url": base,
            },
        )
        build(localized)

    # Canonical pages only: English aliases remain available, without duplicate sitemap entries.
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    xhtml = "http://www.w3.org/1999/xhtml"
    ElementTree.register_namespace("", namespace)
    ElementTree.register_namespace("xhtml", xhtml)
    combined = ElementTree.parse(output / "sitemap.xml")
    for locale in LOCALES:
        folder = output / locale["path"]
        sitemap = folder / "sitemap.xml"
        if locale["path"] != "en":
            combined.getroot().extend(ElementTree.parse(sitemap).getroot())
        sitemap.unlink()
        (folder / "sitemap.xml.gz").unlink(missing_ok=True)
    prefixes = {locale["path"] for locale in LOCALES}
    for entry in combined.getroot():
        address = entry.find(f"{{{namespace}}}loc").text
        page_url = address[len(base) :]
        if page_url.split("/", 1)[0] in prefixes:
            page_url = page_url.split("/", 1)[1]
        for locale in LOCALES:
            prefix = "" if locale["path"] == "en" else f'{locale["path"]}/'
            ElementTree.SubElement(
                entry,
                f"{{{xhtml}}}link",
                {
                    "rel": "alternate",
                    "hreflang": locale["code"],
                    "href": urljoin(base, f"{prefix}{page_url}"),
                },
            )
        ElementTree.SubElement(
            entry,
            f"{{{xhtml}}}link",
            {
                "rel": "alternate",
                "hreflang": "x-default",
                "href": urljoin(base, page_url),
            },
        )
    combined.write(output / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    import gzip

    with gzip.open(output / "sitemap.xml.gz", "wb") as stream:
        stream.write((output / "sitemap.xml").read_bytes())

    languages = "|".join(re.escape(locale["path"]) for locale in LOCALES)
    (output / "nginx-languages.conf").write_text(
        "# Generated from locales.json; installed outside the web root.\n"
        "map $uri $public_error_page {\n"
        "    default /404.html;\n"
        f"    ~^/(?<public_language>{languages})(?:/|$) /$public_language/404.html;\n"
        "}\n"
    )


def on_serve(server, config, builder):
    server.watch(str(CATALOGS))
    server.watch(str(TRANSLATIONS))
    server.watch(str(UI / "locales.json"))
    return server


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Validate translations or acknowledge completed source updates."
    )
    parser.add_argument(
        "--stamp", choices=[item["path"] for item in LOCALES if item["path"] != "en"]
    )
    args = parser.parse_args()
    if args.stamp:
        path = CATALOGS / f"{args.stamp}.json"
        catalog = json.loads(path.read_text())
        catalog["source_hashes"] = source_hashes()
        path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    else:
        validate_translations()
        print(f"Validated {len(LOCALES)} languages.")
