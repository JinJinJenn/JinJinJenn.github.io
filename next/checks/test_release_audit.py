"""Synthetic mutation tests. No source checkout files are edited."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from release_audit import audit, STATUSES, STORIES

class AuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name); self.next=self.root/'next'
        (self.next/'checks').mkdir(parents=True)
        self.prefix='<meta name="robots" content="noindex">'
        self.write('index.html','<h1 id="top">Home</h1><a href="#top">Top</a><img src="capture.png" srcset="capture.png 320w" alt="A test capture">')
        self.write('journal.html',''.join(f'<a href="{s}">{s}</a>' for s in STORIES))
        for story in STORIES:self.write(story,'<h1>Story</h1>')
        self.write('mods.html',''.join(f'<article id="{id_}"><span>{s}</span></article>' for id_,s in STATUSES.items()))
        (self.next/'capture.png').write_bytes(b'fixture')
        (self.next/'checks/original-captures.json').write_text(json.dumps({'next/capture.png':hashlib.sha256(b'fixture').hexdigest()}))
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
        (self.next/'capture.png').write_bytes(b'not the original')
        self.assertIn('original game capture changed',self.failures())
    def test_external_ignored_and_escape_rejected(self):
        self.write('index.html','<a href="https://example.com/missing">External</a><a href="../../outside.html">Escape</a>')
        self.assertIn('escapes repository',self.failures());self.assertNotIn('example.com',self.failures())

if __name__=='__main__': unittest.main()
