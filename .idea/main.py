from fastapi import FASTAPI

app = FASTAPI()

@app.get("/")
async def root():
    return{"message": "hello world"}




