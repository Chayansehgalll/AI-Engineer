# Resume Tailor browser extension

Resume Tailor is a Chrome/Brave Manifest V3 extension with a local FastAPI
backend. It detects likely job descriptions on web pages, lets you edit or
paste the description, compares it with up to four of your resumes, and
downloads a tailored one-page LaTeX resume for Overleaf.

It does not edit job-site pages, submit applications, or send information to an
AI provider until you choose to generate a resume.

## What it does

- Checks page text for common job-listing language and stores a likely match
  for the popup to show. Detection is a simple text heuristic, so you can also
  paste a job description manually.
- Extracts text from PDF, DOCX, and TXT resumes using the local backend.
- Keeps extracted resume text in this browser's extension storage. Add,
  remove, or clear saved profiles in the popup. Resume labels (Backend,
  GenAI, Fullstack, and Frontend) are for your reference.
- Optionally replaces the saved library with supported files in
  `extension/resumes`. Put no more than four files there.
- Sends the selected resume text and job description to Groq when you click
  **Generate one-page LaTeX resume**. The generated `.tex` file can be
  uploaded to Overleaf and compiled with pdfLaTeX.

The generator is instructed to use source-supported candidate details, keep
held role titles and dates unchanged, and tailor the content to the job. The
template uses a single column and standard sections to support ATS parsing;
ATS behavior varies, so compatibility is not guaranteed. Review the LaTeX and
compiled PDF for accuracy and readability before using them. Scanned PDFs
without embedded text need OCR before they can be used.

## Requirements

- Google Chrome or Brave
- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/)
- A Groq API key

## Start the local backend

From the repository, open PowerShell in the `extension` directory:

```powershell
cd C:\path\to\AI-Engineer\extension
```

Create an `.env` file in this directory and add your Groq key:

```env
GROQ_API_KEY=your_groq_api_key
```

Keep this key private and do not commit `.env`. Install dependencies and start
the API:

```powershell
uv sync
uv run uvicorn resume_api:app --app-dir backend --host 127.0.0.1 --port 8000
```

Leave the terminal running while you use the extension. The API binds to the
local computer; `http://127.0.0.1:8000` should return a status response when it
is ready. The backend reads the key from `extension/.env` when generating a
resume.

## Load the extension

1. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `extension` directory.
4. Pin **Resume Tailor** to the browser toolbar.
5. Open a job listing and click the extension, or paste a job description in
   the popup.
6. Add one or more resumes, then select **Generate one-page LaTeX resume**.

To add a resume, choose its label and select a PDF, DOCX, or TXT file. The
backend extracts the text and the extension saves that text in browser storage;
the original upload is not saved by the backend. To use files in
`extension/resumes`, choose **Replace library with extension/resumes files**
and confirm. This replaces the existing library.

## Limits and output

- Up to four resume profiles can be saved or loaded from the folder.
- Resume files must be 8 MB or smaller. At least 50 characters of text must
  be extractable. Scanned PDFs without a text layer are not OCR'd.
- A job description must contain at least 100 characters.
- Long job descriptions and resumes may be shortened before the AI request;
  the popup warns you when that happens.
- The backend uses Groq's `openai/gpt-oss-120b` model. A keyword coverage
  score and prioritized keywords are shown only when the model returns a
  complete keyword analysis. The score is an estimate, not a hiring
  prediction.
- Generated resumes are downloaded as `.tex` files. Upload one to Overleaf
  and compile with pdfLaTeX. The one-page layout may scale content down to fit,
  so check the compiled result.

## Privacy and permissions

The content script runs on HTTP and HTTPS pages to inspect visible page text
for job-description terms. When it detects a likely listing, it stores up to
40,000 characters in temporary browser session storage for the popup. This
page text is not sent to the backend or Groq just by opening a page.

Resume file contents are sent to the local backend for text extraction and
then stored as text in the browser's extension storage. When you generate a
resume, the selected resumes and job description are sent from the browser to
the local backend and then to Groq for processing. The backend does not save
resume uploads or generation inputs to disk. Review Groq's policies before
sending personal information to its service.

The extension requests browser storage and access to HTTP/HTTPS pages for
job-description detection, plus permission to contact the local backend.
