import os
import json

base_dir = "production_cost_springboot"
files_data = []

for root, dirs, files in os.walk(base_dir):
    for f in sorted(files):
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, base_dir)
        if f.endswith(".png") or f.endswith(".jar"):
            continue
        try:
            with open(full_path, "r", encoding="utf-8") as fp:
                content = fp.read()
            ext = f.split(".")[-1] if "." in f else "txt"
            files_data.append({
                "path": rel_path,
                "name": f,
                "category": rel_path.split(os.sep)[0],
                "extension": ext,
                "size": len(content),
                "content": content
            })
        except Exception:
            pass

os.makedirs("src/data", exist_ok=True)

ts_content = f"""// Auto-generated project files catalog
export interface ProjectFile {{
  path: string;
  name: string;
  category: string;
  extension: string;
  size: number;
  content: string;
}}

export const PROJECT_FILES: ProjectFile[] = {json.dumps(files_data, indent=2)};
"""

with open("src/data/projectFiles.ts", "w", encoding="utf-8") as out:
    out.write(ts_content)

print(f"Generated TS catalog with {len(files_data)} files.")
