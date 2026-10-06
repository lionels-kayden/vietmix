"""Learn uniform slot medians only from approved, reviewed fits; preserve user values."""
import argparse
import json
from pathlib import Path
from statistics import median


def learn_defaults(fits, existing):
    result=json.loads(json.dumps(existing))
    groups={}
    for row in fits.values():
        if not row.get('approved') or row.get('needs_review',True) or row.get('status')=='FAIL':
            continue
        key=f"{row['gender']}:{row['slot']}"
        groups.setdefault(key,[]).append(row)
    for key,rows in groups.items():
        target=result.setdefault(key,{})
        for field in ('x','y','scale'):
            if field not in target:
                target[field]=median(r[field] for r in rows)
    return result


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('fits');p.add_argument('defaults');p.add_argument('--output',required=True)
    a=p.parse_args(); fits=json.loads(Path(a.fits).read_text()); current=json.loads(Path(a.defaults).read_text())
    if Path(a.output).resolve() in (Path(a.fits).resolve(),Path(a.defaults).resolve()):
        p.error('Output must be a new path, not an input file')
    Path(a.output).write_text(json.dumps(learn_defaults(fits,current),indent=2)+'\n')
