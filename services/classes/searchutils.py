import os
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
import time
from threading import Timer
import json
import hashlib




class SearchUtilsClass():
# Character replacement dictionary
    char_replacements = {
        'ä': 'ae',
        'ü': 'ue',
        'ö': 'oe',
        'Ä': 'ae',
        'Ü': 'ue',
        'Ö': 'oe',
        'ß': 'ss'
    }

    folder_filter_json = {}

    def __init__(self):
        self.search_history_status = {

        }

    def load_previous_search_status(self, project_name):
        projects_directory = self.projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_status_file = os.path.join(processed_project_directory, "SearchStatus.json")

        if not os.path.exists(search_status_file):
            return {}
        
        search_history = {}
        with open(search_status_file, 'r') as history_file:
            search_history = json.load(history_file)

        return search_history


    def process_file(self, file_path):
        result = {}
        current_file = None
        current_file_name = None
        current_full_file_path = None

        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                if line.startswith("File: "):
                    current_file = line[6:]  # Remove "File: " prefix
                    current_full_file_path = current_file
                    file_name = os.path.basename(current_file)
                    current_file_name = file_name
                    file_id = generate_id(file_name)
                    result[file_id] = {}
                elif line.startswith("Pages with occurrences: "):
                    pages = line[24:].strip('[]').split(', ')
                    # Convert to integers and remove duplicates
                    result[file_id] = {}
                    result[file_id]['pages'] = list(set(int(page) for page in pages if page.isdigit()))
                    result[file_id]['fileName'] = current_file_name
                    result[file_id]['id'] = file_id
                    result[file_id]['fullPath'] = current_full_file_path
        return result


    def generate_id(self, name):
        """
        Generates a unique ID based on the file or folder name.
        """
        return name
        # Use SHA-256 hash of the name, truncated to 8 characters
        return hashlib.sha256(name.encode()).hexdigest()[:12]

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
    
    def build_folder_structure(self, path, project_name=""):
        """
        Recursively builds a JSON structure representing the folder hierarchy.
        """
        name = os.path.basename(path)
        structure = {
            "name": project_name if project_name else name,
            "id": project_name if project_name else name,
            "active": False,
            "toggled": True if project_name else False
        }
        
        if os.path.isdir(path):
            structure["children"] = []
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                structure["children"].append(self.build_folder_structure(item_path))
            
            if structure["children"]:
                structure["toggled"] = False
        
        return structure

    def save_search_occurences_to_json(self, search_term, project_name):
        projects_directory = self.projects_folder
        search_history_directory = replace_german_characters(os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, 'SEARCH-HISTORY', search_term))
        output_directory = search_history_directory

        occurrences_file_path = os.path.join(output_directory, f"{search_term}-occurrences.txt")
        input_file = occurrences_file_path
        processed_data = self.process_file(input_file)
        file_page_occurrences_file = os.path.join(output_directory,  f"{search_term}-file_page_occurrences.json")

        with open(file_page_occurrences_file, 'w') as f:
            json.dump(processed_data, f, indent=2)


    def replace_german_characters(self, text, log_file=None):
        """
        Replace German characters with their English equivalents.
        Optionally log the changes to a file.
        """
        original_text = text
        for german_char, english_rep in char_replacements.items():
            text = text.replace(german_char, english_rep)
        
        if log_file and original_text != text:
            with open(log_file, 'a') as log:
                log.write(f"Original: {original_text}\nReplaced: {text}\n")
        
        return text

    def perform_ocr_on_pdf(self, pdf_path):
        """
        Converts each page of the PDF to an image and performs OCR to extract text.
        """
        text = ""
        try:
            # Convert PDF pages to images
            images = convert_from_path(pdf_path)
            
            # Perform OCR on each image
            for image in images:
                text += pytesseract.image_to_string(image)
            
        except Exception as e:
            text = None
        return text

    def highlight_text_in_pdf(self, pdf_path, search_term, pages_with_occurrences, output_directory, error_log_path):
        try:
            # Open the original PDF
            doc = fitz.open(pdf_path)

            for page_number in pages_with_occurrences:
                page = doc.load_page(page_number - 1)  # page_number is 1-based, load_page is 0-based
                text_instances = page.search_for(search_term, quads=True)  # Search for the keyword and return quads
                
                for quad in text_instances:
                    # Highlight the text with a red color and translucent fill
                    highlight = page.add_highlight_annot(quad.rect)
                    highlight.set_colors(stroke=(1, 0, 0, 0.1), fill=(1, 0.8, 0.8, 0.2))  # Red stroke, light red translucent fill
                    highlight.update()

                    # Draw a full-width rectangle across the sentence's line with translucent fill
                    sentence_rect = fitz.Rect(0, quad.rect.y0 - 10, page.rect.width, quad.rect.y1 + 10)
                    shape = page.new_shape()
                    shape.draw_rect(sentence_rect)
                    shape.finish(color=(1, 0, 0, 0.1), fill=(1, 0.8, 0.8, 0.1), fill_opacity=0.2, stroke_opacity=0.2, width=0.5)  # Red stroke, light red translucent fill
                    shape.commit()

            # Create the new highlighted PDF file path
            base_name = os.path.basename(pdf_path)
            print("OOOOOUTTTTDDASFDASFADSF ", output_directory)
            highlighted_pdf_path = os.path.join(output_directory, base_name)
            
            # Save the new highlighted PDF
            doc.save(highlighted_pdf_path)
            doc.close()
            
            return highlighted_pdf_path
        except Exception as e:
            # Log the error instead of raising it
            with open(error_log_path, 'a') as error_file:
                error_message = f"Error highlighting PDF {pdf_path}: {str(e)}"
                error_file.write(f"{error_message}\n")
            return None
        
    def build_folder_structure_for_search_result(self, search_term, project_name):

        projects_directory = self.projects_folder
        search_history_directory = self.replace_german_characters(os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, 'SEARCH-HISTORY', search_term))
        output_directory = search_history_directory

        folder_structure = self.build_folder_structure(output_directory)
        folder_structure["name"] = "root"
        folder_structure["toggled"] = True
        root_folder_id = folder_structure['id']

        json_file_path = os.path.join(output_directory, 'folder_structure.json')
        with open(json_file_path, 'w') as json_file:
            json.dump(folder_structure, json_file, indent=2)

        pass

    async def list_files_in_directory_with_keyword_search(self, projects_folder, directory, search_term, project_name):
        projects_directory = projects_folder

        search_history_directory = self.replace_german_characters(os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, 'SEARCH-HISTORY', search_term))
        os.makedirs(search_history_directory, exist_ok=True)
        error_log_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "ErrorLog.txt") # TODO: Convert to JSON
        skipped_files_log_path = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name, "SkippedFiles.txt") # TODO: Convert to JSON


        output_directory = search_history_directory 

        file_count = 0

        def log_error(file, error):
            with open(error_log_path, 'a') as error_file:
                error_file.write(f"Error processing file {file}: {error}\n")

        def log_skipped_file(file, search_term):
            with open(skipped_files_log_path, 'a') as skipped_file:
                skipped_file.write(f"Skipped file {file} for search term '{search_term}' due to timeout.\n")

        def process_pdf_file(file_path, search_term):
            occurences_json = {}
            try:
                pdf_doc = fitz.open(file_path)
                pages_with_occurrences = []
                found_keyword = False

                for page_num in range(len(pdf_doc)):
                    page = pdf_doc[page_num]
                    text = page.get_text()  # Extract text using PyMuPDF

                    # If text extraction fails (e.g., for scanned images), perform OCR
                    # PS: This function does not go the further step of letting us know what pages have the text. It only tells us the text exists.
                    if not text.strip():
                        text = self.perform_ocr_on_pdf(file_path)
                        if text is None:
                            # log_error(file_path, "OCR failed.")
                            return

                    if search_term.lower() in text.lower():
                        found_keyword = True
                        pages_with_occurrences.append(page_num + 1)
                
                if found_keyword:
                    # Compute relative path and create corresponding output subdirectory
                    relative_path = os.path.relpath(file_path, directory)
                    output_subdir = os.path.join(output_directory, self.replace_german_characters(os.path.dirname(relative_path), 'replaced_german_chars.txt'))
                    
                    os.makedirs(output_subdir, exist_ok=True)
                    highlighted_pdf_path = self.highlight_text_in_pdf(file_path, search_term, pages_with_occurrences, output_subdir, error_log_path)
                    file_name = os.path.basename(highlighted_pdf_path)

                    occurences_json = {
                        "pages": pages_with_occurrences,
                        "fileName": file_name,
                        "id": file_name,
                        "fullPath": highlighted_pdf_path
                    }
                pdf_doc.close()
            except Exception as e:
                log_error(file_path, str(e))
                
            return occurences_json

        def search_in_pdf(file_path, search_term):
            occurences_json_for_file = {}
            def timeout_handler():
                nonlocal processing_completed
                processing_completed = False

            processing_completed = True
            timer = Timer(60, timeout_handler)  # 60-second timeout
            timer.start()

            try:
                occurrences_for_file = process_pdf_file(file_path, search_term)
                occurences_json_for_file = occurrences_for_file
            except Exception as e:
                log_error(file_path, str(e))
            finally:
                timer.cancel()
                if not processing_completed:
                    log_skipped_file(file_path, search_term)

            return occurences_json_for_file


        if not project_name in self.search_history_status:
            self.search_history_status[project_name] = {}
            self.search_history_status[project_name][search_term] = {
                "status": "Searching",
                "file_count": 0
            }

        projects_directory = projects_folder
        processed_project_directory = os.path.join(projects_directory, 'PROCESSOR', 'PROCESSED', project_name)

        os.makedirs(processed_project_directory, exist_ok=True)
        search_status_file = os.path.join(processed_project_directory, "SearchStatus.json")
        if not os.path.exists(search_status_file):
            previous_history = {}
        else:
            with open(search_status_file) as history_file:
                previous_history = json.load(history_file)

        
        occurences_json = {}

        file_count = 0
        for root, dirs, files in os.walk(directory):
            for file in files:
                file_count += 1

                self.search_history_status[project_name][search_term] = {
                    "status": "Searching",
                    "file_count": file_count
                }

                file_path = os.path.join(root, file)
                if file.lower().endswith('.pdf'):
                    occurences_json_for_file = search_in_pdf(file_path, search_term)
                    file_name = os.path.basename(file_path)
                    
                    occurences_json[file_name] = occurences_json_for_file


        self.search_history_status[project_name][search_term] = {
            "status": "Completed",
            "file_count": file_count
        }

        previous_history = {
            **previous_history,
            project_name: {
                search_term: {
                    "status": "Completed",
                    "file_count": file_count
                }
            }
        }

        with open(search_status_file, 'w') as f:
            json.dump(previous_history, f, indent=2)
        

            # NEW: Generate JSON structure
        folder_structure = self.build_folder_structure(output_directory, project_name)
        # folder_structure["name"] = "root" # This should probably be project name

        folder_structure["toggled"] = False
        folder_file_structure = self.build_folder_file_structure(output_directory, project_name)
        return folder_structure, folder_file_structure, occurences_json




























# Character replacement dictionary
char_replacements = {
    'ä': 'ae',
    'ü': 'ue',
    'ö': 'oe',
    'Ä': 'ae',
    'Ü': 'ue',
    'Ö': 'oe',
    'ß': 'ss'
}

folder_filter_json = {}


def process_file(file_path):
    result = {}
    current_file = None
    current_file_name = None
    current_full_file_path = None

    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            if line.startswith("File: "):
                current_file = line[6:]  # Remove "File: " prefix
                current_full_file_path = current_file
                file_name = os.path.basename(current_file)
                current_file_name = file_name
                file_id = generate_id(file_name)
                result[file_id] = {}
            elif line.startswith("Pages with occurrences: "):
                pages = line[24:].strip('[]').split(', ')
                # Convert to integers and remove duplicates
                result[file_id] = {}
                result[file_id]['pages'] = list(set(int(page) for page in pages if page.isdigit()))
                result[file_id]['fileName'] = current_file_name
                result[file_id]['id'] = file_id
                result[file_id]['fullPath'] = current_full_file_path
    return result


def generate_id(name):
    """
    Generates a unique ID based on the file or folder name.
    """
    return name
    # Use SHA-256 hash of the name, truncated to 8 characters
    return hashlib.sha256(name.encode()).hexdigest()[:12]


def build_folder_file_structure(path):
    """
    Builds a JSON structure where keys are folder IDs and values are arrays of file IDs
    contained within that folder and its subfolders.
    """
    structure = {}
    
    def traverse(current_path):
        folder_name = os.path.basename(current_path)
        current_id = generate_id(folder_name)
        structure[current_id] = []
        
        for item in os.listdir(current_path):
            item_path = os.path.join(current_path, item)
            if os.path.isfile(item_path):

                folder_name = os.path.basename(item_path)
                file_id = generate_id(folder_name)
                structure[current_id].append(file_id)
            elif os.path.isdir(item_path):
                subfolder_id = traverse(item_path)
                structure[current_id].extend(structure[subfolder_id])
        
        return current_id
    
    root_id = traverse(path)
    return structure

def build_folder_structure(path):
    """
    Recursively builds a JSON structure representing the folder hierarchy.
    """
    name = os.path.basename(path)
    structure = {
        "name": name,
        "id": name, # str(uuid.uuid4()),
        "active": False,
        "toggled": False
    }
    
    if os.path.isdir(path):
        structure["children"] = []
        structure["id"] = generate_id(name)
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            structure["children"].append(build_folder_structure(item_path))
        
        if structure["children"]:
            structure["toggled"] = False
    
    return structure

def replace_german_characters(text, log_file=None):
    """
    Replace German characters with their English equivalents.
    Optionally log the changes to a file.
    """
    original_text = text
    for german_char, english_rep in char_replacements.items():
        text = text.replace(german_char, english_rep)
    
    if log_file and original_text != text:
        with open(log_file, 'a') as log:
            log.write(f"Original: {original_text}\nReplaced: {text}\n")
    
    return text