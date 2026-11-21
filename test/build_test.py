"""Package compatibility regression checks against Alfred 5 node schemas."""
import importlib.util
import unittest
import tempfile
import subprocess
import os
import json
import hashlib
from zipfile import ZipFile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build", ROOT / "apps/alfred/scripts/build.py")
if spec is None or spec.loader is None:
    raise ImportError("Cannot load the Alfred build module")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class BuildTests(unittest.TestCase):
    def test_archive_runs_outside_repository_with_local_shared_package(self):
        build.main()
        archive = build.DIST / f"Alfred-FelixDict-{build.VERSION}.alfredworkflow"
        with tempfile.TemporaryDirectory(prefix="felixdict-package-") as temporary:
            target = Path(temporary)
            with ZipFile(archive) as package:
                self.assertIn("dist/cli.js", package.namelist())
                self.assertFalse(any(name.startswith("docs/screenshots/") for name in package.namelist()))
                self.assertIn(b"https://github.com/AndreGeng/FelixDict", package.read("README.md"))
                self.assertIn("node_modules/@felixdict/core/dist/providers.js", package.namelist())
                if build.BUILD_PANEL:
                    for name in ("FelixDictPanel", "index.html", "panel.css", "panel.js", "icon.png"):
                        self.assertIn(f"panel/{name}", package.namelist())
                    self.assertTrue(package.getinfo("panel/FelixDictPanel").external_attr >> 16 & 0o111)
                    self.assertEqual(package.read("panel/icon.png"), package.read("icon.png"))
                self.assertFalse(any(name.endswith((".ts", ".tsx", ".mjs")) for name in package.namelist()))
                package.extractall(target)
            cache = target / "cache"
            cache.mkdir()
            import time
            key = hashlib.sha256(json.dumps([6, "hello", ["Youdao", "YoudaoTranslate", "Suggest"], "zh", "en"], separators=(",", ":")).encode()).hexdigest()
            (cache / f"{key}.json").write_text(json.dumps({
                "updated": int(time.time() * 1000), "results": {"Youdao": {"senses": [{"text": "packaged result"}]}},
                "errors": {}, "pending": []
            }))
            env = {**os.environ, "alfred_workflow_cache": str(cache), "providers": "Youdao",
                   "target_language": "zh", "secondary_language": "en"}
            output = subprocess.check_output(["node", "dist/cli.js", "--query", "hello"], cwd=target, env=env, text=True)
            items = json.loads(output)["items"]
            self.assertEqual(items[0]["arg"], "packaged result")
            panel_rows = [row for row in items if row.get("variables", {}).get("action") == "panel"]
            self.assertEqual([row["arg"] for row in panel_rows], ["hello"] if build.BUILD_PANEL else [])
            panel_key = hashlib.sha256(json.dumps(
                [6, ":ja hello", ["YoudaoTranslate"], "zh", "en"], separators=(",", ":")
            ).encode()).hexdigest()
            (cache / f"panel-{panel_key}.json").write_text(json.dumps({
                "updated": int(time.time() * 1000), "results": {"YoudaoTranslate": "こんにちは"},
                "errors": {}, "pending": []
            }))
            output = subprocess.check_output(["node", "dist/cli.js", "--panel-translate"], cwd=target, env={**env, "providers": "Youdao,Bing"},
                                             text=True, input=json.dumps({"text": "hello", "target": "ja"}) + "\n")
            start, result = map(json.loads, output.splitlines())
            self.assertEqual(start, {"type": "start", "names": ["YoudaoTranslate"]})
            self.assertEqual(result["results"], {"YoudaoTranslate": "こんにちは"})
            self.assertEqual(result["pending"], [])

    def test_brand_and_keyword(self):
        manifest = build.manifest()
        self.assertEqual(manifest["name"], "FelixDict for Alfred")
        settings = {s["variable"]: s for s in manifest["userconfigurationconfig"]}
        self.assertEqual(settings["keyword"]["config"]["default"], "fd")
        self.assertEqual(manifest["bundleid"], "local.alfred-easydict")

    def test_speech_keeps_window_open_without_affecting_copy(self):
        connections = build.manifest()["connections"]["SEARCH"]
        normal = next(c for c in connections if c["modifiers"] == 0)
        speech = next(c for c in connections if c["modifiers"] == 1048576)
        self.assertFalse(normal["vitoclose"])
        self.assertTrue(speech["vitoclose"])
        self.assertEqual(speech["destinationuid"], "SPEECH")
        self.assertNotIn("SPEECH", build.manifest()["connections"])
        speech_object = next(o for o in build.manifest()["objects"] if o["uid"] == "SPEECH")
        self.assertNotIn("printf", speech_object["config"]["script"])

    def test_alfred_5_object_versions(self):
        supported = {
            "alfred.workflow.input.scriptfilter": 3,
            "alfred.workflow.input.keyword": 1,
            "alfred.workflow.action.script": 2,
            "alfred.workflow.trigger.universalaction": 1,
        }
        for obj in build.manifest()["objects"]:
            with self.subTest(type=obj["type"]):
                self.assertEqual(obj["version"], supported[obj["type"]])

    def test_language_settings_are_exposed_with_compatible_defaults(self):
        settings = {s["variable"]: s for s in build.manifest()["userconfigurationconfig"]}
        self.assertEqual(settings["target_language"]["config"]["default"], "zh")
        self.assertEqual(settings["secondary_language"]["config"]["default"], "en")

    def test_search_passes_query_as_argv(self):
        objects = build.manifest()["objects"]
        search = next(o for o in objects if o["type"] == "alfred.workflow.input.scriptfilter")
        self.assertEqual(search["config"]["scriptargtype"], 1)
        self.assertIn('--query "$1"', search["config"]["script"])

    def test_panel_entries_pass_text_as_argv(self):
        manifest = build.manifest(include_panel=True)
        objects = {obj["uid"]: obj for obj in manifest["objects"]}
        panel = objects["PANEL"]["config"]
        self.assertEqual(panel["scriptargtype"], 1)
        self.assertIn('--panel "$1"', panel["script"])
        self.assertTrue(objects["PANEL_SELECTION"]["config"]["acceptstext"])
        for entry in ("PANEL_KEYWORD", "PANEL_SELECTION"):
            self.assertEqual(manifest["connections"][entry][0]["destinationuid"], "PANEL")


if __name__ == "__main__":
    unittest.main()
