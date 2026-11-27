#!/usr/bin/env python3
"""Importe un tome de manga de fan (zip d'images) dans la liseuse du site.

Exemple :
  python3 tools/importer-doujinshi.py tome1.zip --slug wakfu-ball --titre "Wakfu Ball" \
      --auteur "Pseudo" --tome 1 --resume "Court résumé." --sens rtl

- Les images du zip sont triées « naturellement » (page2 avant page10), converties en WebP
  (hauteur max 1600 px, qualité 80) et numérotées 001.webp, 002.webp…
- Ajoute ou met à jour doujinshi/<slug>/oeuvre.json et doujinshi/catalogue.json.
- La couverture est la première page du premier tome (cover.webp en miniature).
"""
import argparse, json, re, shutil, sys, tempfile, zipfile
from pathlib import Path
from PIL import Image

EXT = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'}

def naturel(p):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', p.name)]

def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('zip'); a.add_argument('--slug', required=True); a.add_argument('--titre', required=True)
    a.add_argument('--auteur', required=True); a.add_argument('--tome', type=int, default=1)
    a.add_argument('--titre-tome', default=''); a.add_argument('--resume', default='')
    a.add_argument('--sens', choices=['rtl', 'ltr'], default='rtl')
    a.add_argument('--credit', default='')
    a.add_argument('--site', default=str(Path(__file__).resolve().parent.parent), help='racine du site')
    o = a.parse_args()
    if not re.fullmatch(r'[a-z0-9-]+', o.slug): sys.exit('slug invalide : minuscules, chiffres et tirets uniquement')
    site = Path(o.site); base = site / 'doujinshi' / o.slug; dest = base / f'tome-{o.tome}'
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(o.zip) as z:
            for m in z.infolist():  # protection contre les chemins piégés
                t = (Path(tmp) / m.filename).resolve()
                if not str(t).startswith(str(Path(tmp).resolve())): sys.exit('zip refusé : chemin suspect')
            z.extractall(tmp)
        imgs = sorted([p for p in Path(tmp).rglob('*') if p.suffix.lower() in EXT and not p.name.startswith(('.', '__')) and '__MACOSX' not in p.parts], key=naturel)
        if not imgs: sys.exit('aucune image trouvée dans le zip')
        if dest.exists(): shutil.rmtree(dest)
        dest.mkdir(parents=True)
        for i, p in enumerate(imgs, 1):
            im = Image.open(p).convert('RGB')
            if im.height > 1600: im = im.resize((round(im.width * 1600 / im.height), 1600), Image.LANCZOS)
            im.save(dest / f'{i:03d}.webp', quality=80, method=6)
        first = Image.open(dest / '001.webp')
    j = base / 'oeuvre.json'
    data = json.loads(j.read_text(encoding='utf-8')) if j.exists() else {'tomes': []}
    data.update({'slug': o.slug, 'titre': o.titre, 'auteur': o.auteur, 'sens': o.sens})
    if o.resume: data['resume'] = o.resume
    if o.credit: data['credit'] = o.credit
    data['tomes'] = sorted([t for t in data['tomes'] if t['n'] != o.tome] + [{'n': o.tome, 'titre': o.titre_tome, 'pages': len(imgs)}], key=lambda t: t['n'])
    if o.tome == data['tomes'][0]['n']:
        c = first.copy(); c.thumbnail((600, 800)); c.save(base / 'cover.webp', quality=82, method=6)
    data['couverture'] = 'cover.webp'
    j.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    cj = site / 'doujinshi' / 'catalogue.json'
    cat = json.loads(cj.read_text(encoding='utf-8')) if cj.exists() else {'oeuvres': []}
    entry = {k: data[k] for k in ('slug', 'titre', 'auteur', 'couverture', 'tomes') if k in data}
    if 'resume' in data: entry['resume'] = data['resume']
    cat['oeuvres'] = [x for x in cat['oeuvres'] if x['slug'] != o.slug] + [entry]
    cj.write_text(json.dumps(cat, ensure_ascii=False, indent=2), encoding='utf-8')
    mo = sum(f.stat().st_size for f in dest.glob('*.webp')) / 1e6
    print(f'OK : {len(imgs)} pages importées dans {dest} ({mo:.1f} Mo)')

if __name__ == '__main__': main()
