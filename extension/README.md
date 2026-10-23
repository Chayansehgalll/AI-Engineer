# Resume Tailor Chrome/Brave extension

The extension watches pages locally for job-description language. When it
detects a likely job listing, open the extension, review or edit the extracted
description, and generate a one-page Overleaf-ready LaTeX resume. It never edits
a resume on a website or submits an application.

## 1. Set up and start the local backend

This folder is self-contained; it does not use the Python project in
`week2/day10` or any files outside `extension`.

Install Python 3.12 or newer and [uv](https://docs.astral.sh/uv/). Create an
`.env` file in this `extension` folder using `.env.example` as a template, and
add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key
```

Keep the key private and do not commit the `.env` file. In PowerShell, change
to this `extension` folder and install the backend dependencies:

```powershell
cd C:\path\to\AI-Engineer\extension
uv sync
uv run uvicorn resume_api:app --app-dir backend --host 127.0.0.1 --port 8000
```

Keep this terminal open. Visit `http://127.0.0.1:8000` to check that the API
is running. It binds only to the local computer. Resume uploads are parsed in
memory; the backend does not save them.

If generation fails, read the popup's error message. For an HTTP 401, check
that the key in `extension/.env` is valid, save the file, and restart the
backend. For HTTP 429, check your Groq account's rate limits or usage quota.
The backend parses the model's JSON response locally rather than enabling
Groq's JSON response mode, so malformed model JSON is reported as a response
format error rather than a provider-side JSON-mode 400. For other HTTP 400
errors, the popup includes Groq's request-validation reason.
If the AI response does not match the expected structure, the popup names the
invalid response field without showing your resume contents.
Long job descriptions and resumes are shortened for the AI request when needed;
the popup warns you when this happens. Review the generated resume against your
original source files.
For HTTP 404, check that the model ID is active in GroqCloud. This project uses
`openai/gpt-oss-120b`, Groq's recommended replacement for the retired
`llama-3.3-70b-versatile` model. See Groq's
[model deprecation guidance](https://console.groq.com/docs/deprecations).

## 2. Load the extension

1. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this `extension` folder.
4. Pin **Resume Tailor** to the toolbar.
5. Add up to four versions of your resume. You can use the same label more than
   once; labels are for your reference, and the AI compares all saved resumes
   with the job description.

Adding a resume extracts its text through the local API and stores the text in
the browser's extension storage. The AI selects relevant, supported details
across the saved versions for each job description. Remove individual resumes
or clear the library from the extension popup at any time.

Alternatively, put up to four PDF, DOCX, or TXT files in `extension/resumes`
and select **Replace library with extension/resumes files** in the popup. After
you confirm, the local API extracts those files and the popup replaces its
saved resume library with their text; it does not upload or persist the source
files.

## Privacy and output

The content script needs access to pages to detect job descriptions. Detection
and extraction happen locally; page text is not sent to the backend until you
click **Generate one-page LaTeX resume**. That action sends the selected resume text
and job description to the local backend, which sends them to Groq using the
key in `extension/.env`. The backend does not persist either input.

Generated resumes are downloaded as `.tex` files. Upload a file to Overleaf and
compile it with pdfLaTeX. The generated template is single-column and keeps the
source section order (Professional Summary, Technical Skills, Professional
Experience, Projects, Education). It uses a single text column, plain-text
skill categories, standard headings, and selectable text to improve ATS
parsing; ATS systems vary, so compatibility cannot be guaranteed. The AI tailors
the summary to the job description while leading with the candidate's actual
source-supported professional identity; it does not force the target title into
the summary as a headline, but includes the exact target title once in a natural
summary sentence when the job description states one. The name and contact line
have added spacing, and detected email addresses and web links are clickable.
The template uses increased text leading and section/list spacing to reduce
unused space at the bottom. Content flows from the first page instead of being
placed in a single page-sized box that can shift to a blank first page.
It aims for a substantive 60-80 word summary when supported by your source
resumes, about 4 evidence-backed bullets per role when available, and 3-4 per
selected project when supported by the source. If the summary or bullet lists
are too short, the backend retries with specific feedback rather than returning
the incomplete result. It includes relevant
skill categories and technologies supported by
the sources instead of over-compressing them. Closely related JD skills may
appear inline in the relevant skill category, marked with a verification note
and the related source skill; remove any that do not accurately describe you
before applying. For example, Python DSA experience does not establish Java
DSA experience, so Java DSA may only appear as a clearly marked suggestion in
the skills list, never as confirmed experience. The template uses
10-point body text and more vertical spacing. Check the compiled PDF for
readability and page count in Overleaf. The AI is
instructed to compare all saved resume versions with the job description, use
only source-supported facts, keep role titles and dates unchanged, use exact
job-description keywords only when supported by the source, and omit
unsupported qualifications. Review the compiled PDF for accuracy before using
it. A keyword coverage score is shown only when the AI returns a complete
keyword analysis; it is a rough estimate, not a hiring prediction.
Scanned PDFs without an embedded text layer need OCR before they can be used.
