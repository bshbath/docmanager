from fastapi import APIRouter
from services.project_load_service import load_projects
from services.classes.ProjectProcessor import ProjectProcessor
from pydantic import BaseModel

router = APIRouter()

class SetupRequest(BaseModel):
    project_name: str

projects_folder = "../../"
processor = ProjectProcessor(projects_folder)

@router.get('/all')
async def load_all_projects():
    projects = processor.load_projects()
    return projects

@router.post('/setup')
async def load_all_projects(request: SetupRequest):
    project_name = request.project_name
    project_found = await processor.pre_process_project_for_search(project_name)
    
    return {
        "status": "Setup Initiated..." if project_found else "Project not found"
    }

@router.post('/folderstructure')
async def get_folder_structure(request: SetupRequest):
    project_name = request.project_name
    folder_structure = processor.return_folder_structure_for_clientside_file_explorer(project_name)
    return folder_structure

# This should be a GET, with the project id in the path
@router.post('/status')
async def get_process_status(request: SetupRequest):
    project_name = request.project_name
    project_status = processor.get_process_status(project_name)

    return project_status

