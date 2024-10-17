from utils.project_processing_utils import unzip_file, build_folder_structure
import os
import shutil
import json
from services.project_load_service import load_projects

class ProjectProcessor():
    def __init__(self, projects_folder):
        self.projects_folder = projects_folder
        self.processing_status = self.load_projects_load_history()
        self.folder_file_structure_for_projects = {}
    
    def load_projects(self):
        projects = load_projects(self.projects_folder)
        result = []
        for project in projects:
            proj_object = {
                "name": project,
                "loaded": False
            }
            if project in self.processing_status:
                proj_object["loaded"] = True
            result.append(proj_object)
        return result


    def get_process_status(self, project_name):
        if project_name in self.processing_status:
            folder_file_structure = {}
            if not project_name in self.folder_file_structure_for_projects:
                projects_directory = self.projects_folder
                processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ALL-PDFS")

                os.makedirs(processed_project_directory, exist_ok=True)
                folder_file_structure = self.build_folder_file_structure(processed_project_directory, project_name)
                print("'''mMMMMMM ", )
                self.folder_file_structure_for_projects[project_name] = folder_file_structure
            else:
                folder_file_structure = self.folder_file_structure_for_projects[project_name]
            return {
                "status": self.processing_status[project_name]["status"],
                "file_count": self.processing_status[project_name]["file_count"],
                "folder_file_structure": folder_file_structure
            }
        return {
            "status": "Not found",
            "file_count": 0,
            "folder_file_structure": {}
        }
    

    def load_projects_load_history(self):
        projects_directory = self.projects_folder
        processed_projects_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED')

        os.makedirs(processed_projects_directory, exist_ok=True)
        process_history_file_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', "ProcessHistory.json")
        
        if not os.path.exists(process_history_file_path):
            return {}
        with open(process_history_file_path, 'r') as history_file:
            data = json.load(history_file)
        return data
    
    def update_projects_load_history(self, project_name, file_count):
        projects_directory = self.projects_folder
        processed_projects_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED')

        os.makedirs(processed_projects_directory, exist_ok=True)
        process_history_file_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', "ProcessHistory.json")
        if not os.path.exists(process_history_file_path):
            history = {}
        else:
            with open(process_history_file_path, 'r') as history_file:
                history = json.load(history_file)
        history[project_name] = {
            "status": "Completed",
            "file_count": file_count
        }
        with open(process_history_file_path, 'w') as f:
            json.dump(history, f, indent=2)

    def load_search_history_for_project(self, project_name):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_history_file = os.path.join(processed_project_directory, "SearchHistory.json")

        with open(search_history_file) as history_file:
            search_history = json.load(history_file)

        return search_history
    

    def make_processed_files_folder_for_project(self, project_name):
        projects_directory = self.projects_folder
        processed_files_folder = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ALL-PDFS")
        os.makedirs(processed_files_folder, exist_ok=True)
        return processed_files_folder
    
    def error_log_file_for_project(self, project_name):
        projects_directory = self.projects_folder
        error_file_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ErrorLog.json")
        processed_files_folder = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        if not processed_files_folder:
            os.makedirs(processed_files_folder, exist_ok=True)
        f = open(error_file_path, "a")
        return error_file_path
                
        
    async def pre_process_project_for_search(self, project_name):
        all_projects = load_projects(self.projects_folder)
        if not project_name in all_projects:
            return False

        source_folder = os.path.join(self.projects_folder, project_name)
        dest_folder = self.make_processed_files_folder_for_project(project_name)
        error_log = self.error_log_file_for_project(project_name)
        
        if not project_name in self.processing_status:
            self.processing_status[project_name] = {
                "status": "Uncompleted",
                "file_count": 0
            }
        file_count = 0

        for root, dirs, files in os.walk(source_folder):
            relative_path = os.path.relpath(root, source_folder)
            
            dest_path = os.path.join(dest_folder, relative_path)
            os.makedirs(dest_path, exist_ok=True)
            for file_name in files:
                file_path = os.path.join(root, file_name)
                
                if file_name.lower().endswith('.zip'):
                    zip_dest_dir = os.path.join(dest_path, f"{os.path.splitext(file_name)[0]}-unzipped")
                    os.makedirs(zip_dest_dir, exist_ok=True)
                    pdf_files_count = unzip_file(file_path, zip_dest_dir, error_log)
                    file_count += pdf_files_count
                elif file_name.lower().endswith('.pdf'):
                    file_count += 1
                    shutil.copy2(file_path, dest_path)
                else:
                    print(f"Skipping non-PDF file: {file_name}")

        print("SSTT: ", project_name, self.processing_status, self.processing_status[project_name])
        self.processing_status[project_name]["status"] = "Completed"
        self.processing_status[project_name]["file_count"] = file_count
        self.update_projects_load_history(project_name, file_count)
        self.save_folder_structure(project_name)

        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)
        os.makedirs(processed_project_directory, exist_ok=True)
        folder_file_structure = self.build_folder_file_structure(processed_project_directory, project_name)

        self.folder_file_structure_for_projects[project_name] = folder_file_structure

    def return_folder_structure_for_clientside_file_explorer(self, project_name):
        projects_directory = self.projects_folder
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ALL-PDFS")

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_structure_data = build_folder_structure(processed_project_directory, project_name)
        return folder_structure_data
        
            
    def save_folder_structure(self, project_name):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ALL-PDFS")

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_structure_file = os.path.join(processed_project_directory, "FolderStructure.json")
        folder_structure_data = self.return_folder_structure_for_clientside_file_explorer(project_name)

        with open(folder_structure_file, 'w') as f:
            json.dump(folder_structure_data, f, indent=2)

    def build_folder_file_structure(self, path, project_name=""):
        """
        Builds a JSON structure where keys are folder IDs and values are arrays of file IDs
        contained within that folder and its subfolders.
        """
        structure = {}
        
        def traverse(current_path, isTopmost=False):
            if isTopmost and project_name:
                folder_name = project_name
            else:
                folder_name = os.path.basename(current_path)
            current_id = folder_name
            structure[current_id] = []
            
            for item in os.listdir(current_path):
                item_path = os.path.join(current_path, item)
                if os.path.isfile(item_path):

                    folder_name = os.path.basename(item_path)
                    if isTopmost and project_name:
                        folder_name = project_name
                    file_id = folder_name
                    structure[current_id].append(file_id)
                elif os.path.isdir(item_path):
                    subfolder_id = traverse(item_path)
                    structure[current_id].extend(structure[subfolder_id])
            
            return current_id
        
        traverse(path, True)
        print('SSSTTRT ', structure)
        return structure
    

    def search_term_in_search_history(self, search_term, project_name):
        isPresent = False
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)
        os.makedirs(processed_project_directory, exist_ok=True)

        search_history_file = os.path.join(processed_project_directory, "SearchHistory.json")
        
        with open(search_history_file) as history_file:
            search_history = json.load(history_file)
            if search_term in search_history:
                isPresent = True
        return isPresent
