"""Regression checks for shared assets used by independent documentation portals."""

import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from mkdocs.config import load_config

import hooks


class PortalAssetsTests(unittest.TestCase):
    def test_localized_robots_points_to_the_merged_root_sitemap(self):
        with tempfile.TemporaryDirectory() as output:
            config = load_config(config_file=str(hooks.UI / "mkdocs.yml"), site_dir=output)
            config.site_url = "https://service.example/fr/"
            config.extra["public_site_url"] = "https://service.example/"
            files = config.plugins.on_files([], config=config)
            robots = next(file for file in files if file.src_uri == "robots.txt")
            self.assertIn("Sitemap: https://service.example/sitemap.xml", robots.content_string)
            self.assertNotIn("/fr/sitemap.xml", robots.content_string)

    def test_commercial_preview_watches_shared_assets_and_its_own_templates(self):
        with tempfile.TemporaryDirectory() as temporary:
            portal = Path(temporary)
            overrides = portal / "docs/overrides"
            overrides.mkdir(parents=True)
            watched = []
            server = SimpleNamespace(watch=watched.append)
            config = SimpleNamespace(
                config_file_path=str(portal / "mkdocs.yml"),
                docs_dir=str(portal / "docs/content"),
            )
            self.assertIs(hooks.on_serve(server, config, None), server)
            for source in (
                hooks.UI / "docs/content/stylesheets",
                hooks.UI / "docs/content/javascripts",
                hooks.UI / "docs/overrides",
                hooks.UI / "public",
                overrides,
            ):
                self.assertIn(str(source), watched)


if __name__ == "__main__":
    unittest.main()
