#!/usr/bin/env python3
import os
import shutil

BASE = "production_cost_springboot"

def ensure_dirs():
    os.makedirs(f"{BASE}/database", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/config", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/controller", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/entity", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/model", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/security", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/service", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/java/Production/Cost/Analysis/System/repository", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/resources/static/css", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/resources/static/js", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/resources/static/image", exist_ok=True)
    os.makedirs(f"{BASE}/src/main/resources/templates", exist_ok=True)
    os.makedirs(f"{BASE}/src/test/java/Production/Cost/Analysis/System", exist_ok=True)

def write_file(rel_path, content):
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {rel_path}")

print("Directory creation setup ready.")
