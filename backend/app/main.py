from fastapi import FastAPI


app = FastAPI(
    title="PRAVAAH Backend",
    description="Hyper-local flash flood intelligence and decision support API.",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}