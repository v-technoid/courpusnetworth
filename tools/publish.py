# -*- coding: utf-8 -*-
"""Copy the public site into dist/ for Cloudflare Pages.

Cloudflare Pages has no ignore file, so this does the job of Vercel's
.vercelignore: it reads .pagesignore at the project root and copies every
other file into dist/. Cloudflare's build settings are then:

    Build command:           python3 tools/publish.py
    Build output directory:  dist

It only copies files, it does not rebuild pages, so the result is exactly
what is committed. It also checks Cloudflare Pages' free plan limits.
Needs only Python 3 (Cloudflare's build image has it)."""
import fnmatch, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'dist')
MAX_FILES, MAX_BYTES, MAX_HEADER_RULES = 20000, 25 * 1024 * 1024, 100
MUST_HAVE = ['index.html', '404.html', '_headers', 'sw.js', 'robots.txt', 'sitemap.xml']

def patterns():
    p = os.path.join(ROOT, '.pagesignore')
    if not os.path.exists(p): return []
    return [l.strip() for l in open(p, encoding='utf-8') if l.strip() and not l.lstrip().startswith('#')]

def ignored(rel, is_dir, pats):
    name = rel.rsplit('/', 1)[-1]
    for pat in pats:
        if pat.endswith('/'):
            if not is_dir: continue
            pat = pat[:-1]
        target = rel if '/' in pat else name
        if fnmatch.fnmatch(target, pat): return True
    return False

def header_rules():
    p = os.path.join(ROOT, '_headers')
    if not os.path.exists(p): return 0
    return sum(1 for l in open(p, encoding='utf-8') if l.strip() and not l.startswith((' ', '\t', '#')))

def main():
    pats = patterns()
    if os.path.exists(OUT): shutil.rmtree(OUT)
    copied, problems = [], []
    for dp, dn, fn in os.walk(ROOT):
        rel_dir = os.path.relpath(dp, ROOT).replace(os.sep, '/')
        rel_dir = '' if rel_dir == '.' else rel_dir + '/'
        dn[:] = sorted(d for d in dn if not ignored(rel_dir + d, True, pats))
        for f in sorted(fn):
            rel = rel_dir + f
            if ignored(rel, False, pats): continue
            src = os.path.join(dp, f)
            if os.path.getsize(src) > MAX_BYTES:
                problems.append(f'{rel} is over 25 MiB, Cloudflare Pages will refuse it')
            dst = os.path.join(OUT, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            copied.append(rel)
    for m in MUST_HAVE:
        if m not in copied: problems.append(f'{m} is missing from the published files')
    if len(copied) > MAX_FILES: problems.append(f'{len(copied)} files, over the {MAX_FILES} file limit')
    n = header_rules()
    if n > MAX_HEADER_RULES: problems.append(f'_headers has {n} rules, Cloudflare reads only {MAX_HEADER_RULES}')
    size = sum(os.path.getsize(os.path.join(OUT, c)) for c in copied)
    print(f'published {len(copied)} files ({size / 1048576:.1f} MiB) to dist/, {n} header rules')
    if problems:
        print('PROBLEMS:\n  ' + '\n  '.join(problems))
        sys.exit(1)

if __name__ == '__main__':
    main()
