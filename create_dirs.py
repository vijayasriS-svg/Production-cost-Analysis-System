import os
import zipfile
import shutil

BASE_DIR = "production_cost_springboot"

def create_project_structure():
    if os.path.exists(BASE_DIR):
        shutil.rmtree(BASE_DIR)
    
    dirs = [
        f"{BASE_DIR}/database",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/config",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/controller",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/entity",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/model",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/security",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/service",
        f"{BASE_DIR}/src/main/java/Production/Cost/Analysis/System/repository",
        f"{BASE_DIR}/src/main/resources/static/css",
        f"{BASE_DIR}/src/main/resources/static/js",
        f"{BASE_DIR}/src/main/resources/static/image",
        f"{BASE_DIR}/src/main/resources/templates",
        f"{BASE_DIR}/src/test/java/Production/Cost/Analysis/System"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print("Directories created successfully.")

if __name__ == "__main__":
    create_project_structure()
