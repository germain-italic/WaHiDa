#!/usr/bin/env python3

import os
import sys
from pathlib import Path
import fnmatch

def get_ignore_patterns(file_path, base_path):
    patterns = []
    if file_path.exists():
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(str(base_path / line))
    return patterns

def get_all_ignore_patterns(root_dir):
    patterns = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if '.gitignore' in filenames:
            gitignore_path = Path(dirpath) / '.gitignore'
            patterns.extend(get_ignore_patterns(gitignore_path, root_dir))

    extra_ignore_file = root_dir / '.export_code_ignore'
    if extra_ignore_file.exists():
        patterns.extend(get_ignore_patterns(extra_ignore_file, root_dir))

    return patterns

def is_ignored(path, ignore_patterns):
    path_str = str(path)
    for pattern in ignore_patterns:
        if fnmatch.fnmatch(path_str, pattern) or fnmatch.fnmatch(path_str, f"*/{pattern}"):
            return True
    return False

def is_binary(file_path):
    try:
        with open(file_path, 'tr') as check_file:
            check_file.read()
            return False
    except:
        return True

def custom_tree(directory, ignore_patterns, prefix=""):
    output = []
    contents = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
    for i, path in enumerate(contents):
        if is_ignored(path, ignore_patterns):
            continue
        is_last = i == len(contents) - 1
        current_prefix = "└── " if is_last else "├── "
        output.append(f"{prefix}{current_prefix}{path.name}")
        if path.is_dir():
            extension = "    " if is_last else "│   "
            output.extend(custom_tree(path, ignore_patterns, prefix + extension))
    return output

def get_file_size(file_path):
    size_bytes = os.path.getsize(file_path)
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    output_file = project_root / "docs" / "export_code.txt"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    ignore_patterns = get_all_ignore_patterns(project_root)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("PROJECT CODE EXPORT\n")
        f.write("===================\n\n")
        f.write("Tree structure of the project (excluding ignored files):\n")
        f.write("------------------------------------------------------\n")
        tree_output = custom_tree(project_root, ignore_patterns)
        f.write("\n".join(tree_output))
        f.write("\n\n")
        f.write("Contents of text files:\n")
        f.write("=======================\n\n")

        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if not is_ignored(Path(root) / d, ignore_patterns)]
            for file in files:
                file_path = Path(root) / file
                if not is_ignored(file_path, ignore_patterns) and not is_binary(file_path):
                    relative_path = file_path.relative_to(project_root)
                    f.write(f"File: {relative_path}\n")
                    f.write("=" * (len(str(relative_path)) + 6) + "\n\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as content_file:
                            f.write(content_file.read())
                    except Exception as e:
                        f.write(f"Error reading file: {str(e)}\n")
                    f.write("\n\n")
                    f.write("-" * 80 + "\n\n")

    file_size = get_file_size(output_file)
    print(f"Scan complete. Output written to {output_file} (Size: {file_size})")

if __name__ == "__main__":
    main()