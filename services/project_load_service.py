import os
import zipfile
import shutil
import json
import uuid
import hashlib

def load_projects(project_parent_dictory):
    projects = []
    for entry in os.listdir(project_parent_dictory):
        if os.path.isdir(os.path.join(project_parent_dictory, entry)):
            projects.append(entry)

    projects.remove("PROCESSOR")
    
    return projects[::-1]

def load_processed_projects(project_parent_dictory):
    projects = []
    for entry in os.listdir(project_parent_dictory):
        if os.path.isdir(os.path.join(project_parent_dictory, entry)):
            projects.append(entry)

    projects.remove("PROCESSOR")
    
    return projects[::-1]