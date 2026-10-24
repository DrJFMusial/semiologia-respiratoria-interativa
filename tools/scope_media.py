"""Restringe as regras dentro de @media (max-width/max-height) ao modo estudo,
para que telas pequenas em modo apresentação (projetor 1024 x 768, tablet)
mantenham a composição de 1600 x 900 escalada."""
import re, sys
def scope_sel(sel):
    out = []
    for s in sel.split(','):
        s = s.strip()
        if not s: continue
        if s.startswith('body.modo-estudo'): out.append(s)
        elif s.startswith('body.') or s.startswith('html') : out.append(s)
        elif s.startswith('.reveal') : out.append('body.modo-estudo ' + s)
        else: out.append('body.modo-estudo ' + s)
    return ', '.join(out)
def process(css):
    res = []; i = 0
    while i < len(css):
        m = re.compile(r'@media[^{]*\((?:max-width|max-height)[^{]*\{').search(css, i)
        if not m: res.append(css[i:]); break
        if 'prefers-reduced-motion' in m.group(0): res.append(css[i:m.end()]); i = m.end(); continue
        res.append(css[i:m.end()]); j = m.end(); depth = 1; body_start = j
        while depth:
            if css[j] == '{': depth += 1
            elif css[j] == '}': depth -= 1
            j += 1
        body = css[body_start:j-1]
        # regras simples: seletor { declarações }
        def rep(mm): return scope_sel(mm.group(1)) + ' {' + mm.group(2) + '}'
        body = re.sub(r'([^{}]+?)\{([^{}]*)\}', rep, body)
        res.append(body + '}'); i = j
    return ''.join(res)
for f in sys.argv[1:]:
    s = open(f).read(); n = process(s); open(f, 'w').write(n); print(f, len(s), len(n))
