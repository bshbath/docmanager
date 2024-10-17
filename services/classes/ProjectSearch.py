import os
import json
from services.classes.searchutils import list_files_in_directory_with_keyword_search, build_folder_structure
from services.project_load_service import load_projects
from services.classes.searchutils import SearchUtilsClass


utilsClass = SearchUtilsClass()

class ProjectSearch():
    def __init__(self, projects_folder):
        self.projects_folder = projects_folder
        self.all_projects = load_projects(projects_folder)
        self.search_history = {}
        self.folder_file_structure_for_projects = {}

        for project_name in self.all_projects:
            project_search_history = self.load_search_history_for_project(project_name)
            self.search_history[project_name] = project_search_history

    
    async def search_for_term_in_project(self, project_name, search_term):
        if not project_name in self.all_projects:
            return {
                "status": "Not found",
                "file_count": 0
            }
        if project_name in self.search_history:
            project_search_history = self.search_history[project_name]
            if search_term in project_search_history:
                return project_search_history[search_term]


        projects_directory = self.projects_folder
        processed_files_folder = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ALL-PDFS")
        os.makedirs(processed_files_folder, exist_ok=True)
        project_folder_structure, folder_file_structure, search_file_occurences = await utilsClass.list_files_in_directory_with_keyword_search(projects_directory, processed_files_folder, search_term, project_name)
        
        self.folder_file_structure_for_projects[project_name] = folder_file_structure

        self.save_search_history(project_name, search_term, project_folder_structure)

        self.save_folder_structure(project_name, search_term, project_folder_structure)
        self.save_folder_file_structure(project_name, search_term, folder_file_structure)
        self.save_search_page_occurences(project_name, search_term, search_file_occurences)

        return {
            "status": "Searching..."
        }
        # print("FFF: ", project_folder_structure)
        # print("GGG: ", folder_file_structure)
        # print("KKK: ", keyword_occurences)

    def save_search_history(self, project_name, search_term, search_history):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_history_file = os.path.join(processed_project_directory, "SearchHistory.json")

        if not os.path.exists(search_history_file):
            previous_history = {}
        else:
            with open(search_history_file) as history_file:
                previous_history = json.load(history_file)

        previous_history[search_term] = search_history
        
        with open(search_history_file, 'w') as f:
            json.dump(previous_history, f, indent=2)

    def load_search_history_for_project(self, project_name):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_history_file = os.path.join(processed_project_directory, "SearchHistory.json")

        if not os.path.exists(search_history_file):
            return {}
        
        with open(search_history_file, 'r') as history_file:
            search_history = json.load(history_file)

        return search_history
    

    def save_folder_structure(self, project_name, search_term, folder_structure_data):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_structure = os.path.join(processed_project_directory, "FolderStructure.json")

        with open(folder_structure, 'w') as f:
            json.dump(folder_structure_data, f, indent=2)

    def load_folder_structure(self, project_name, search_term):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_structure_file = os.path.join(processed_project_directory, "FolderStructure.json")

        if not os.path.exists(folder_structure_file):
            return {}
        
        folder_structure = {}
        with open(folder_structure_file) as history_file:
            folder_structure = json.load(history_file)

        return folder_structure
    

    def save_folder_file_structure(self, project_name, search_term, file_folder_structure):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_file_structure = os.path.join(processed_project_directory, "FolderFileStructure.json")
        
        with open(folder_file_structure, 'w') as f:
            json.dump(file_folder_structure, f, indent=2)

    def load_file_folder_structure(self, project_name, search_term):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        folder_file_structure = os.path.join(processed_project_directory, "FolderFileStructure.json")

        if not os.path.exists(folder_file_structure):
            return {}
        
        with open(folder_file_structure) as history_file:
            folder_structure = json.load(history_file)

        return folder_structure

    def save_search_page_occurences(self, project_name, search_term, search_occurences):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_page_occurences_file = os.path.join(processed_project_directory, "SearchPageOccurences.json")
        
        with open(search_page_occurences_file, 'w') as f:
            json.dump(search_occurences, f, indent=2)

    def load_search_page_occurences(self, project_name, search_term):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SEARCH-HISTORY", search_term)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_page_ocurences = os.path.join(processed_project_directory, "SearchPageOccurences.json")

        if not os.path.exists(search_page_ocurences):
            return {}
        
        with open(search_page_ocurences) as history_file:
            search_occurences = json.load(history_file)

        return search_occurences

    def error_log_file_for_project(self, project_name):
        projects_directory = self.projects_folder
        error_file_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ErrorLog.json")
        processed_files_folder = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        if not processed_files_folder:
            os.makedirs(processed_files_folder, exist_ok=True)
        f = open(error_file_path, "a")
        return error_file_path 
        

    def create_folder_structure_for_clientside_explorer(self, folder):
        folder_structure = build_folder_structure(folder)
        return folder_structure


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
