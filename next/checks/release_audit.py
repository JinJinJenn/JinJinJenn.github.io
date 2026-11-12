#!/usr/bin/env python3
"""Read-only source checks for /next. Not a substitute for browser QA."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import argparse
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
STORIES = {'hello-world.html','how-a-park-became-a-home.html','seven-failed-tries-and-a-robot-tester.html','mods-that-did-nothing.html','moving-from-in-game-and-evicting.html','every-computer-is-a-good-computer.html'}
STATUSES = {'moveanywhere':'In testing','love-notes':'In the workshop','surprise-gifts':'In testing','thinking-of-you':'In the workshop','toasts':'In the workshop','gentle-hearts':'In the workshop','toddler-tv':'In testing'}

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.refs=[]; self.nodes=[]; self.stack=[]; self.noindex=False; self.issues=[]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); node={'tag':tag,'attrs':attrs,'text':[]}
        self.nodes.append(node)
        if attrs.get('id'): self.ids.append(attrs['id'])
        if tag=='meta' and attrs.get('name','').lower()=='robots':
            self.noindex |= 'noindex' in {part.strip() for part in attrs.get('content','').lower().split(',')}
        if tag=='img' and 'alt' not in attrs: self.issues.append('image lacks alt attribute')
        for key in ('href','src','poster'):
            if key in attrs: self.refs.append(attrs[key])
        for candidate in attrs.get('srcset','').split(','):
            if candidate.strip(): self.refs.append(candidate.strip().split()[0])
        if tag not in VOID: self.stack.append(node)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i]['tag']==tag:
                del self.stack[i:]; break
    def handle_data(self, data):
        for node in self.stack: node['text'].append(data)

def audit(root):
    root=root.resolve(); preview=root/'next'; failures=[]; cache={}; references=0
    def document(path):
        if path not in cache: cache[path]=Document(path.read_text(encoding='utf-8'))
        return cache[path]
    pages=sorted(preview.glob('*.html'))
    for page in pages:
        doc=document(page); label=page.relative_to(root).as_posix()
        failures.extend(f'{label}: {issue}' for issue in doc.issues)
        failures.extend(f'{label}: duplicate id #{id_}' for id_,n in Counter(doc.ids).items() if n>1)
        if not doc.noindex: failures.append(f'{label}: preview must remain noindex until coordinated promotion')
        for ref in doc.refs:
            url=urlsplit(ref)
            if url.scheme or url.netloc: continue
            references+=1
            target=(root/url.path.lstrip('/') if url.path.startswith('/') else page.parent/unquote(url.path)) if url.path else page
            target=target.resolve()
            if not target.is_relative_to(root):
                failures.append(f'{label}: reference escapes repository: {ref}'); continue
            if target.is_dir(): target=target/'index.html'
            if not target.is_file():
                failures.append(f'{label}: missing local target: {ref}'); continue
            if url.fragment and target.suffix=='.html' and unquote(url.fragment) not in document(target).ids:
                failures.append(f'{label}: missing fragment: {ref}')
    journal=document(preview/'journal.html')
    links={urlsplit(ref).path for ref in journal.refs}
    for story in sorted(STORIES):
        if story not in links: failures.append(f'journal: missing story link {story}')
    mods=document(preview/'mods.html')
    for project,status in STATUSES.items():
        nodes=[n for n in mods.nodes if n['attrs'].get('id')==project]
        if len(nodes)!=1: failures.append(f'mods: expected one #{project} detail'); continue
        text=' '.join(' '.join(nodes[0]['text']).split())
        if status not in text: failures.append(f'mods #{project}: expected documented status {status!r}; review intentional changes explicitly')
    manifest=json.loads((preview/'checks/original-captures.json').read_text())
    for name,digest in manifest.items():
        path=root/name
        if not path.is_file() or sha256(path.read_bytes()).hexdigest()!=digest:
            failures.append(f'original game capture changed or missing: {name}')
    return {'pages_checked':len(pages),'local_references_checked':references,'original_captures_checked':len(manifest),'failures':failures}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2],help='Repository checkout; only read operations are performed')
    args=parser.parse_args()
    result=audit(args.root)
    print(json.dumps(result,indent=2))
    raise SystemExit(bool(result['failures']))
