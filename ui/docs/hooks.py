"""Include the app's existing branding assets without maintaining duplicate files."""

from pathlib import Path

from mkdocs.structure.files import File


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
