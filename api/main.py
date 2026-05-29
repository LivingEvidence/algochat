from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import getCorsOrigins
from routes import chat

app = FastAPI(title="Algochat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=getCorsOrigins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
