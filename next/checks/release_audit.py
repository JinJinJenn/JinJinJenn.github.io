#!/usr/bin/env python3
"""Read-only source checks for /next. Not a substitute for browser QA."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import argparse
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
STORIES = {'hello-world.html','how-a-park-became-a-home.html','seven-failed-tries-and-a-robot-tester.html','mods-that-did-nothing.html','moving-from-in-game-and-evicting.html','every-computer-is-a-good-computer.html'}
STATUSES = {'moveanywhere':'In testing','love-notes':'In the workshop','surprise-gifts':'In testing','thinking-of-you':'In the workshop','toasts':'In the workshop','gentle-hearts':'In the workshop','toddler-tv':'In testing'}

REQUIRED_PAGES = STORIES | {'index.html','mods.html','characters.html','journal.html','studio.html'}
ORIGINAL_CAPTURES = {f'img/characters/char-{i:02d}.{ext}' for i in range(1,4) for ext in ('png','webp')} | {f'img/{name}.jpg' for name in ('moveanywhere','lovenotes','surprisegifts','thinkingofyou','toasts','gentlehearts','toddlertv')}

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.refs=[]; self.nodes=[]; self.stack=[]; self.noindex=False; self.issues=[]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); node={'tag':tag,'attrs':attrs,'text':[],'ancestors':tuple(self.stack)}
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

def local_target(root, page, ref):
    """Resolve URL path encoding consistently for both root and relative references."""
    url=urlsplit(ref)
    if url.scheme or url.netloc: return None, ''
    path=unquote(url.path)
    target=((root/path.lstrip('/')) if path.startswith('/') else page.parent/path) if path else page
    target=target.resolve()
    if not target.is_relative_to(root): raise ValueError('reference escapes repository')
    if target.is_dir(): target=target/'index.html'
    return target, unquote(url.fragment)

def audit(root):
    root=root.resolve(); preview=root/'next'; failures=[]; cache={}; references=0
    def document(path):
        if path not in cache: cache[path]=Document(path.read_text(encoding='utf-8'))
        return cache[path]
    pages=sorted(preview.glob('*.html'))
    for name in sorted(REQUIRED_PAGES):
        if not (preview/name).is_file(): failures.append(f'missing required preview page: {name}')
    for page in pages:
        doc=document(page); label=page.relative_to(root).as_posix()
        failures.extend(f'{label}: {issue}' for issue in doc.issues)
        failures.extend(f'{label}: duplicate id #{id_}' for id_,n in Counter(doc.ids).items() if n>1)
        if not doc.noindex: failures.append(f'{label}: preview must remain noindex until coordinated promotion')
        for ref in doc.refs:
            try: target,fragment=local_target(root,page,ref)
            except ValueError as exc:
                failures.append(f'{label}: {exc}: {ref}'); continue
            if target is None: continue
            references+=1
            if not target.is_file():
                failures.append(f'{label}: missing local target: {ref}'); continue
            if fragment and target.suffix=='.html' and fragment not in document(target).ids:
                failures.append(f'{label}: missing fragment: {ref}')
    journal_path=preview/'journal.html'
    if journal_path.is_file():
        journal=document(journal_path); links=set()
        for node in journal.nodes:
            if node['tag']!='a' or 'href' not in node['attrs']: continue
            try: target,_=local_target(root,journal_path,node['attrs']['href'])
            except ValueError: continue  # Already reported above.
            if target is not None: links.add(target)
        for story in sorted(STORIES):
            if preview/story not in links: failures.append(f'journal: missing story link {story}')
    mods_path=preview/'mods.html'
    if mods_path.is_file():
        mods=document(mods_path)
        for project,status in STATUSES.items():
            nodes=[n for n in mods.nodes if n['attrs'].get('id')==project]
            if len(nodes)!=1: failures.append(f'mods: expected one #{project} detail'); continue
            pills=[n for n in mods.nodes if 'pill' in n['attrs'].get('class','').split() and any(parent is nodes[0] for parent in n['ancestors'])]
            texts=[' '.join(' '.join(n['text']).split()) for n in pills]
            if texts != [status]: failures.append(f'mods #{project}: expected documented status pill {status!r}, found {texts!r}; review intentional changes explicitly')
    manifest_path=preview/'checks/original-captures.json'
    try:
        manifest=json.loads(manifest_path.read_text())
        if not isinstance(manifest,dict): raise ValueError('must be a path-to-hash object')
    except (OSError,ValueError) as exc:
        failures.append(f'original capture manifest unreadable or invalid: {exc}')
        manifest={}
    missing=ORIGINAL_CAPTURES-set(manifest)
    extra=set(manifest)-ORIGINAL_CAPTURES
    if missing: failures.append(f'original capture manifest missing required paths: {sorted(missing)}')
    if extra: failures.append(f'original capture manifest has unexpected paths: {sorted(extra)}')
    captures_checked=0
    for name in sorted(ORIGINAL_CAPTURES):
        digest=manifest.get(name)
        if digest is None: continue
        if not isinstance(digest,str) or not re.fullmatch(r'[0-9a-f]{64}',digest):
            failures.append(f'invalid SHA-256 in original capture manifest: {name}'); continue
        captures_checked+=1; path=root/name
        if not path.is_file() or sha256(path.read_bytes()).hexdigest()!=digest:
            failures.append(f'original game capture changed or missing: {name}')
    return {'pages_checked':len(pages),'local_references_checked':references,'original_captures_checked':captures_checked,'failures':failures}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2],help='Repository checkout; only read operations are performed')
    args=parser.parse_args()
    result=audit(args.root)
    print(json.dumps(result,indent=2))
    raise SystemExit(bool(result['failures']))
