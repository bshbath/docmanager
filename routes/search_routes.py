from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.exceptions import HTTPException
import os
from pydantic import BaseModel
from typing import List

from services.classes.ProjectSearch import ProjectSearch

router = APIRouter()
projects_folder = "../../"

class SearchRequest(BaseModel):
    project_name: str
    search_term: str

class SearchHistoryRequest(BaseModel):
    project_name: str
class LoadFileRequest(BaseModel):
    file_path: str
    search_term: str
    pages: List[int]

searcher = ProjectSearch(projects_folder)

@router.post('/search')
async def search_project(request: SearchRequest, background_tasks: BackgroundTasks):
    project_name = request.project_name
    search_term = request.search_term

    background_tasks.add_task(searcher.search_for_term_in_project, project_name, search_term)

    return {
        "status": "Searching"
    }

@router.post('/status')
async def search_project(request: SearchRequest):
    project_name = request.project_name
    search_term = request.search_term

    result = searcher.get_search_status(project_name, search_term)
    return result


@router.post('/history')
async def search_project(request: SearchHistoryRequest):
    project_name = request.project_name

    result = searcher.get_search_history(project_name)
    return result

@router.post("/file")
async def get_pdf(request: LoadFileRequest):
    file_path = request.file_path
    pages = request.pages
    search_term = request.search_term

    file_name = os.path.basename(file_path)
    
    if not file_path.endswith('.pdf'):
        file_path += '.pdf'

    pdf_bytes = await searcher.highlight_and_return(file_path, pages, search_term)

    if not pdf_bytes:
        print("File path: NOT FOUND : ", file_path, file_name)
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return StreamingResponse(
        pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=highlighted_document.pdf"}
    )