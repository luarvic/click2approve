"""Regression checks for publishing incomplete or misleading translated documentation."""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import localization


class TranslationPublicationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        ui = Path(self.temporary.name)
        self.content = ui / "docs/content"
        self.catalogs = ui / "docs/i18n"
        self.translations = ui / "docs/translations"
        for folder in (self.content, self.catalogs, self.translations / "ru"):
            folder.mkdir(parents=True)
        (self.content / "index.md").write_text(
            "# Requests\n\nChoose **Requests**. [Open app](/app/)\n"
        )
        (self.catalogs / "en.json").write_text(json.dumps({"messages": {"Language": "Language"}}))
        (self.catalogs / "product-labels.json").write_text(json.dumps(["Requests"]))
        self.page = self.translations / "ru/index.md"
        self.page.write_text("# Запросы\n\nВыберите **Requests**. [Открыть приложение](/app/)\n")
        self.patcher = patch.multiple(
            localization,
            UI=ui,
            CONTENT=self.content,
            CATALOGS=self.catalogs,
            TRANSLATIONS=self.translations,
            ENGLISH={"Language": "Language"},
            LOCALES=[{"path": "en"}, {"path": "ru"}],
        )
        self.patcher.start()
        self.addCleanup(self.patcher.stop)
        self.catalog = self.catalogs / "ru.json"
        self.catalog.write_text(
            json.dumps(
                {
                    "messages": {"Language": "Язык"},
                    "source_hashes": localization.source_hashes(),
                }
            )
        )

    def test_complete_translation_can_be_published(self):
        localization.validate_translations()

    def test_preview_rebuild_reloads_languages_and_source_catalog(self):
        locales = [
            {"path": "en", "theme": "en", "direction": "ltr", "search": "en"},
            {"path": "pl"},
        ]
        (localization.UI / "locales.json").write_text(json.dumps(locales))
        messages = {
            "Home": "Overview",
            "Document workflows, clear decisions, and a shared record of what happens next.": "Updated description",
            "Switch to dark mode": "Dark mode",
        }
        (self.catalogs / "en.json").write_text(json.dumps({"messages": messages}))
        config = SimpleNamespace(
            extra={"locale_build": True},
            site_url="https://example.test/",
            theme={"palette": [{"scheme": "default", "toggle": {"name": "Before rebuild"}}]},
            nav=[{"Home": "index.md"}],
            plugins={},
        )
        localization.on_config(config)
        self.assertEqual([item["path"] for item in localization.LOCALES], ["en", "pl"])
        self.assertEqual(localization.ENGLISH, messages)
        self.assertEqual(config.nav, [{"Overview": "index.md"}])

    def test_changed_english_requires_translation_update(self):
        source = self.content / "index.md"
        source.write_text(source.read_text() + "New behavior.\n")
        with self.assertRaisesRegex(ValueError, "Stale translations"):
            localization.validate_translations()

    def test_missing_page_cannot_fall_back_to_english(self):
        self.page.unlink()
        with self.assertRaisesRegex(ValueError, "Missing or extra translated pages"):
            localization.validate_translations()

    def test_missing_shared_copy_is_rejected(self):
        data = json.loads(self.catalog.read_text())
        data["messages"].clear()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Incomplete translation catalog"):
            localization.validate_translations()

    def test_translating_literal_app_control_is_rejected(self):
        self.page.write_text(self.page.read_text().replace("**Requests**", "**Запросы**"))
        with self.assertRaisesRegex(ValueError, "Translated product controls"):
            localization.validate_translations()

    def test_changing_app_or_guide_destinations_is_rejected(self):
        self.page.write_text(self.page.read_text().replace("(/app/)", "(/ru/app/)"))
        with self.assertRaisesRegex(ValueError, "Changed link destinations"):
            localization.validate_translations()

    def test_malformed_translation_cannot_drop_table_columns(self):
        source = self.content / "index.md"
        source.write_text(source.read_text() + "\n| Plan | Price |\n| --- | --- |\n| Free | 0 |\n")
        self.page.write_text(
            self.page.read_text() + "\n| План | Цена |\n| --- | --- |\n| Бесплатно 0 |\n"
        )
        data = json.loads(self.catalog.read_text())
        data["source_hashes"] = localization.source_hashes()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Changed table structure"):
            localization.validate_translations()

    def test_broken_link_text_is_rejected_even_when_target_is_preserved(self):
        self.page.write_text(
            self.page.read_text().replace("[Открыть приложение]", "[Открыть] приложение]")
        )
        with self.assertRaisesRegex(ValueError, "Malformed Markdown link"):
            localization.validate_translations()

    def test_emphasis_cannot_be_split_across_paragraphs(self):
        self.page.write_text(self.page.read_text().replace("**Requests**", "**Requests\n\n**"))
        with self.assertRaisesRegex(ValueError, "Broken emphasis"):
            localization.validate_translations()

    def test_invalid_metadata_cannot_leak_into_content_or_search(self):
        source = self.content / "index.md"
        source.write_text("---\ntitle: Home\nsearch:\n  exclude: true\n---\n" + source.read_text())
        self.page.write_text("---\ntitle: Заголовок: с двоеточием\n---\n" + self.page.read_text())
        data = json.loads(self.catalog.read_text())
        data["source_hashes"] = localization.source_hashes()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Invalid page metadata"):
            localization.validate_translations()

    def test_translation_cannot_change_search_exclusions(self):
        source = self.content / "index.md"
        source.write_text("---\nsearch:\n  exclude: true\n---\n" + source.read_text())
        self.page.write_text("---\nsearch:\n  exclude: false\n---\n" + self.page.read_text())
        data = json.loads(self.catalog.read_text())
        data["source_hashes"] = localization.source_hashes()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Changed page behavior metadata"):
            localization.validate_translations()

    def test_numbered_instructions_cannot_become_prose(self):
        source = self.content / "index.md"
        source.write_text(source.read_text() + "\n1. Open the page.\n")
        self.page.write_text(self.page.read_text() + "\n1 откройте. Страницу.\n")
        data = json.loads(self.catalog.read_text())
        data["source_hashes"] = localization.source_hashes()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Changed numbered instructions"):
            localization.validate_translations()

    def test_explicit_anchors_must_survive_translation(self):
        source = self.content / "index.md"
        source.write_text(source.read_text().replace("# Requests", "# Requests {#requests}"))
        data = json.loads(self.catalog.read_text())
        data["source_hashes"] = localization.source_hashes()
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Changed heading anchors"):
            localization.validate_translations()


if __name__ == "__main__":
    unittest.main()
