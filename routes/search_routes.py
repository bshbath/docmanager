from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.exceptions import HTTPException
import os
from pydantic import BaseModel

from services.classes.ProjectSearch import ProjectSearch

router = APIRouter()
projects_folder = "../../"

class SearchRequest(BaseModel):
    project_name: str
    search_term: str

class LoadFileRequest(BaseModel):
    file_path: str

searcher = ProjectSearch(projects_folder)

@router.post('/search')
async def search_project(request: SearchRequest, background_tasks: BackgroundTasks):
    project_name = request.project_name
    search_term = request.search_term

    result = await searcher.search_for_term_in_project(project_name, search_term)
    return result

@router.post('/status')
async def search_project(request: SearchRequest):
    project_name = request.project_name
    search_term = request.search_term

    result = await searcher.search_for_term_in_project(project_name, search_term)
    return result

@router.post("/file")
async def get_pdf(request: LoadFileRequest):
    file_path = request.file_path
    file_name = os.path.basename(file_path)
    
    if not file_path.endswith('.pdf'):
        file_path += '.pdf'
    
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(file_path, media_type='application/pdf', filename=file_name)