"""Synthetic mutation tests. No source checkout files are edited."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from release_audit import audit, STATUSES, STORIES, REQUIRED_PAGES, ORIGINAL_CAPTURES

class AuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name); self.next=self.root/'next'
        (self.next/'checks').mkdir(parents=True)
        self.prefix='<meta name="robots" content="noindex">'
        self.write('index.html','<h1 id="top">Home</h1><a href="#top">Top</a><img src="capture.png" srcset="capture.png 320w" alt="A test capture">')
        self.write('journal.html',''.join(f'<a href="{s}">{s}</a>' for s in STORIES))
        for name in REQUIRED_PAGES-{'index.html','journal.html','mods.html'}:self.write(name,'<h1>Page</h1>')
        self.write('mods.html',''.join(f'<article id="{id_}"><span class="pill">{s}</span></article>' for id_,s in STATUSES.items()))
        (self.next/'capture.png').write_bytes(b'fixture')
        for name in ORIGINAL_CAPTURES:
            path=self.root/name; path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(b'fixture')
        (self.next/'checks/original-captures.json').write_text(json.dumps({name:hashlib.sha256(b'fixture').hexdigest() for name in ORIGINAL_CAPTURES}))
    def write(self,name,body): (self.next/name).write_text(self.prefix+body)
    def failures(self): return '\n'.join(audit(self.root)['failures'])
    def test_valid_fixture(self): self.assertEqual(self.failures(),'')
    def test_missing_asset_and_srcset(self):
        self.write('index.html','<img src="gone.png" srcset="other.png 320w" alt="">')
        self.assertIn('gone.png',self.failures());self.assertIn('other.png',self.failures())
    def test_fragment_and_duplicate(self):
        self.write('index.html','<h1 id="a"></h1><p id="a"></p><a href="#missing">Go</a>')
        self.assertIn('duplicate id',self.failures());self.assertIn('missing fragment',self.failures())
    def test_preview_indexing_and_alt(self):
        (self.next/'index.html').write_text('<img src="capture.png">')
        self.assertIn('noindex',self.failures());self.assertIn('alt attribute',self.failures())
    def test_missing_story(self):
        self.write('journal.html','<h1>Archive accidentally removed</h1>')
        self.assertIn('missing story link',self.failures())
    def test_changed_status(self):
        p=self.next/'mods.html';p.write_text(p.read_text().replace('In testing','Released'))
        self.assertIn('expected documented status',self.failures())
    def test_original_change(self):
        (self.root/sorted(ORIGINAL_CAPTURES)[0]).write_bytes(b'not the original')
        self.assertIn('original game capture changed',self.failures())
    def test_external_ignored_and_escape_rejected(self):
        self.write('index.html','<a href="https://example.com/missing">External</a><a href="../../outside.html">Escape</a>')
        self.assertIn('escapes repository',self.failures());self.assertNotIn('example.com',self.failures())

    def test_missing_unlinked_page(self):
        (self.next/'index.html').unlink()
        self.assertIn('missing required preview page: index.html',self.failures())
    def test_empty_manifest_cannot_hide_changes(self):
        (self.root/sorted(ORIGINAL_CAPTURES)[0]).write_bytes(b'changed')
        (self.next/'checks/original-captures.json').write_text('{}')
        self.assertIn('manifest missing required paths',self.failures())
    def test_invalid_manifest_shapes_and_hashes(self):
        p=self.next/'checks/original-captures.json'
        for invalid in ('[]','not json'):
            p.write_text(invalid)
            self.assertIn('manifest unreadable or invalid',self.failures())
        p.write_text(json.dumps({name:'bad hash' for name in ORIGINAL_CAPTURES}))
        self.assertIn('invalid SHA-256',self.failures())
    def test_partial_and_extra_manifest_entries(self):
        p=self.next/'checks/original-captures.json'; data=json.loads(p.read_text())
        del data[sorted(ORIGINAL_CAPTURES)[0]];data['../../outside']=hashlib.sha256(b'fixture').hexdigest()
        p.write_text(json.dumps(data))
        self.assertIn('manifest missing required paths',self.failures())
        self.assertIn('manifest has unexpected paths',self.failures())
    def test_status_substrings_are_not_status(self):
        p=self.next/'mods.html';p.write_text(p.read_text().replace('In testing','Not In testing'))
        self.assertIn('expected documented status pill',self.failures())
    def test_status_in_prose_does_not_replace_pill(self):
        p=self.next/'mods.html';p.write_text(p.read_text().replace('<span class="pill">In testing</span>','<p>In testing</p><span class="pill">Released</span>'))
        self.assertIn('expected documented status pill',self.failures())
    def test_image_cannot_replace_story_link(self):
        self.write('journal.html',''.join(f'<img src="{s}" alt="">' for s in STORIES))
        self.assertIn('missing story link',self.failures())
    def test_encoded_root_and_relative_links(self):
        self.write('journal.html',''.join(f'<a href="/next/%{ord(s[0]):02x}{s[1:]}">Story</a>' for s in STORIES))
        self.write('index.html','<h1 id="hello world">Hi</h1><a href="/next/%69ndex.html#hello%20world">Root</a><a href="%69ndex.html#hello%20world">Relative</a>')
        self.assertEqual(self.failures(),'')
    def test_missing_special_pages_report_without_crash(self):
        (self.next/'mods.html').unlink(); (self.next/'journal.html').unlink()
        self.assertIn('missing required preview page: mods.html',self.failures())
        self.assertIn('missing required preview page: journal.html',self.failures())

if __name__=='__main__': unittest.main()
