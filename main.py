from fastapi import FastAPI

from routes.file_load_routes import router as file_load_router
from routes.project_setup_routes import router as project_setup_router
from routes.search_routes import router as search_router
from routes.work_status_routes import router as work_status_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

@app.get("/")
async def serve_react_app():
    return FileResponse("frontend/build/index.html")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your React frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)

# app.include_router(file_load_router, prefix="/load")
app.include_router(project_setup_router, prefix="/project")
app.include_router(search_router, prefix="/search")
app.include_router(work_status_router, prefix="/status")