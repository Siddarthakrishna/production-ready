import os
import re

def fix_imports(directory):
    pattern = re.compile(r'from backend\.app\.(.*) import')
    replacement = r'from app.\1 import'
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                modified_content = pattern.sub(replacement, content)
                
                if content != modified_content:
                    print(f"Fixing imports in {file_path}")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    fix_imports(backend_dir)
    print("Import fixes completed!")