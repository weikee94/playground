# next-ml-image-classifier

Image classification app using **MobileNetV2** (pretrained) with **FastAPI** backend + **Next.js** frontend.

## How it works

```
Upload image → FastAPI receives file
                  → transformers.pipeline("image-classification")
                  → MobileNetV2 inference
                  → Returns top 5 predictions with confidence scores
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18 |
| Backend | FastAPI, HuggingFace transformers |
| Model | google/mobilenet_v2_1.0_224 (~14MB) |
| Deploy | Vercel (frontend) + Render / HuggingFace Spaces (backend) |

## Local Development

### 1. Start backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

First request will be slow (~10s) as the model loads into memory.

### 2. Start frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### 3. Test

Upload any image in the browser, or via curl:

```bash
curl -F "file=@photo.jpg" http://localhost:8000/api/classify
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/classify | Upload image, returns top 5 predictions |
| GET | /api/health | Health check |

## Deploy

- **Backend → Render**: Root directory `next-ml-image-classifier/backend`, runtime Docker
- **Frontend → Vercel**: Root directory `next-ml-image-classifier/frontend`, env `NEXT_PUBLIC_API_URL`
