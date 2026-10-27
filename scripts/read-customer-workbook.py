"""Extract aggregate customer counts without changing the supplied workbook.

Usage: python scripts/read-customer-workbook.py INPUT.xlsx OUTPUT.json
Requires openpyxl (available in the bundled Codex Python runtime).
"""
import hashlib
import json
import sys
import re
from pathlib import Path
import openpyxl

source, destination = map(Path, sys.argv[1:3])
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
province_rows = list(workbook["สรุปจังหวัด"].iter_rows(values_only=True))
subdistrict_rows = list(workbook["ตำบลทุกจังหวัด"].iter_rows(values_only=True))
timestamp = re.search(r"(\d{2})/(\d{2})/(\d{4}) (\d{2}):(\d{2})", str(province_rows[4][4]))
if not timestamp:
    raise ValueError("Missing source update date")
day, month, year, hour, minute = map(int, timestamp.groups())
updated_at = f"{year - 543 if year > 2400 else year:04d}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00+07:00"

def count(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0 or value != int(value):
        raise ValueError(f"Invalid customer count: {value!r}")
    return int(value)

def summary(label):
    return count(next(row[3] for row in province_rows if len(row) > 3 and row[1] == label))

provinces = []
for number, row in enumerate(province_rows, 1):
    if len(row) > 6 and isinstance(row[1], (int, float)):
        provinces.append({"row": number, "province": row[2], "count": count(row[3]), "unallocated": count(row[6])})

subdistricts, unallocated = [], []
for number, row in enumerate(subdistrict_rows[9:], 10):
    if len(row) < 5 or not row[1] or row[1] in ("ยังระบุจังหวัดไม่ได้", "ต่างประเทศ"):
        continue
    target = unallocated if row[3] == "ยังระบุตำบลไม่ได้" else subdistricts
    target.append({"row": number, "province": row[1], "district": row[2] or "", "subdistrict": row[3], "count": count(row[4])})

result = {
    "sourceFile": source.name,
    "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "updatedAt": updated_at,
    "unit": "รายชื่อในทะเบียน อาจซ้ำบุคคลได้",
    "total": summary("ลูกค้าทั้งหมด (รายชื่อ)"),
    "located": summary("ระบุจังหวัดได้"),
    "unknownProvince": summary("ยังระบุจังหวัดไม่ได้"),
    "foreign": summary("ต่างประเทศ"),
    "provinces": provinces,
    "subdistricts": subdistricts,
    "unallocated": unallocated,
}
assert len(provinces) == 77
assert len(subdistricts) == 7440
assert result["total"] == result["located"] + result["unknownProvince"] + result["foreign"]
assert sum(p["count"] for p in provinces) == result["located"]
assert sum(s["count"] for s in subdistricts) + sum(s["count"] for s in unallocated) == result["located"]
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"provinces": len(provinces), "subdistricts": len(subdistricts), "total": result["total"], "located": result["located"], "unallocatedSubdistrict": sum(s["count"] for s in unallocated)}, ensure_ascii=False))
