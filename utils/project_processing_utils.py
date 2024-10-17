import os
import zipfile
import shutil
import json
import uuid
import hashlib

import os

def get_folder_size(start_path = '.'):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)

    return total_size


def unzip_file(zip_path, dest_dir, error_log):
    """
    Unzips the given zip file into the destination directory.
    Handles password-protected files and logs errors if any occur.
    Returns the count of PDF files extracted.
    """
    pdf_count = 0 
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            try:
                zip_ref.extractall(dest_dir)
                for root, dirs, files in os.walk(dest_dir):
                    for file_name in files:
                        if file_name.lower().endswith('.pdf'):
                            pdf_count += 1

            except RuntimeError as e:
                if 'encrypted' in str(e).lower():
                    error_message = f"Password may be required for file: {zip_path}"
                    print(error_message)
                    with open(error_log, 'a') as log_file:
                        log_file.write(f"{error_message}\n")
                else:
                    raise
    except Exception as e:
        error_message = f"Error unzipping file: {zip_path}, Error: {str(e)}"
        print(error_message)
        with open(error_log, 'a') as log_file:
            log_file.write(f"{error_message}\n")

    return pdf_count

def build_folder_structure(path, project_name=""):
    """
    Recursively builds a JSON structure representing the folder hierarchy.
    """
    name = os.path.basename(path)
    structure = {
        "name": project_name if project_name else name,
        "id": project_name if project_name else name,
        "active": False,
        "toggled": False
    }
    
    if os.path.isdir(path):
        structure["children"] = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            structure["children"].append(build_folder_structure(item_path))
        
        if structure["children"]:
            structure["toggled"] = False
    
    return structure