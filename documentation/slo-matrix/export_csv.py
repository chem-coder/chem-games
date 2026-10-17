#!/usr/bin/env python3
"""Refresh SLO_MATRIX.csv from SLO_MATRIX.xlsx. Run after editing the xlsx:
    python3 documentation/slo-matrix/export_csv.py
Count is recomputed here (the number of 1s across the exam columns), because
openpyxl cannot read formula results that Excel has not cached."""
import csv, sys
from pathlib import Path
from openpyxl import load_workbook

here = Path(__file__).resolve().parent
src, dst = here / "SLO_MATRIX.xlsx", here / "SLO_MATRIX.csv"
ws = load_workbook(src)["SLO Matrix"]
rows = list(ws.iter_rows(values_only=True))
head = list(rows[0])
sent = next(i for i, h in enumerate(head) if str(h).startswith("◄"))
first = head.index("Count") + 1
keep = [i for i in range(len(head)) if i != sent]
with open(dst, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow([head[i] for i in keep])
    for r in rows[1:]:
        if r[3] is None:
            continue
        r = list(r)
        r[head.index("Count")] = sum(1 for v in r[first:sent] if v == 1)
        w.writerow(["" if r[i] is None else r[i] for i in keep])
print(f"wrote {dst} ({len(rows) - 1} rows)")
