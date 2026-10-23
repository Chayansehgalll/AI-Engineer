const API_URL = "http://127.0.0.1:8000";
const form = document.querySelector("#resume-form");
const fileInput = document.querySelector("#resume-file");
const categoryInput = document.querySelector("#category");
const uploadButton = document.querySelector("#upload-button");
const folderButton = document.querySelector("#folder-button");
const resumeList = document.querySelector("#resume-list");
const jobDescription = document.querySelector("#job-description");
const jobStatus = document.querySelector("#job-status");
const generateButton = document.querySelector("#generate-button");
const result = document.querySelector("#result");
const clearButton = document.querySelector("#clear-button");

function showResult(message, isError = false) {
  result.textContent = message;
  result.classList.toggle("error", isError);
}

async function getResumes() {
  const { resumeProfiles = [] } = await chrome.storage.local.get("resumeProfiles");
  return resumeProfiles;
}

async function renderResumes() {
  const resumes = await getResumes();
  resumeList.replaceChildren();

  for (const [index, resume] of resumes.entries()) {
    const row = document.createElement("li");
    const label = document.createElement("span");
    const remove = document.createElement("button");
    label.textContent = `${resume.category}: ${resume.filename}`;
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Remove";
    remove.addEventListener("click", async () => {
      resumes.splice(index, 1);
      await chrome.storage.local.set({ resumeProfiles: resumes });
      await renderResumes();
    });
    row.append(label, remove);
    resumeList.append(row);
  }
}

async function loadActiveJob() {
  const { activeJob } = await chrome.storage.session.get("activeJob");
  if (activeJob?.text) {
    jobDescription.value = activeJob.text;
    jobStatus.textContent = `Detected on ${activeJob.url}`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  const resumes = await getResumes();
  if (resumes.length >= 4) {
    showResult("You can save up to four resume versions. Remove one before adding another.", true);
    return;
  }

  uploadButton.disabled = true;
  showResult("Extracting resume text locally…");
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${API_URL}/extract-resume`, {
      method: "POST",
      body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Could not read this resume.");

    const profile = {
      category: categoryInput.value,
      filename: file.name,
      text: data.text,
    };
    resumes.push(profile);
    await chrome.storage.local.set({ resumeProfiles: resumes });
    fileInput.value = "";
    await renderResumes();
    showResult("Resume saved in this browser.");
  } catch (error) {
    showResult(error.message || "Could not add the resume.", true);
  } finally {
    uploadButton.disabled = false;
  }
});

folderButton.addEventListener("click", async () => {
  if (!window.confirm("Replace the saved resume library with files from extension/resumes?")) return;

  folderButton.disabled = true;
  showResult("Reading resumes from extension/resumes…");
  try {
    const response = await fetch(`${API_URL}/folder-resumes`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Could not load resumes from the extension/resumes folder.");

    await chrome.storage.local.set({ resumeProfiles: data.resumes });
    await renderResumes();
    showResult(`Replaced the library with ${data.resumes.length} resume version(s) from extension/resumes.`);
  } catch (error) {
    showResult(error.message || "Could not load resumes from the folder.", true);
  } finally {
    folderButton.disabled = false;
  }
});

generateButton.addEventListener("click", async () => {
  const jobText = jobDescription.value.trim();
  const resumes = await getResumes();
  if (!resumes.length) {
    showResult("Add at least one resume profile first.", true);
    return;
  }
  if (jobText.length < 100) {
    showResult("Add a longer job description (at least 100 characters).", true);
    return;
  }

  generateButton.disabled = true;
  showResult("Generating your tailored resume…");
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_description: jobText,
        resumes,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Resume generation failed.");
    }

    const filename = response.headers.get("content-disposition")
      ?.match(/filename="?([^";]+)"?/i)?.[1] || "tailored-resume.tex";
    const score = response.headers.get("x-resume-match-score");
    const keywords = response.headers.get("x-resume-keywords");
    const inputWasTrimmed = response.headers.get("x-resume-input-trimmed") === "true";
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    const keywordList = keywords ? decodeURIComponent(keywords) : "";
    showResult(
      `Overleaf LaTeX downloaded${score ? ` · ${score}% keyword coverage` : ""}. Upload the .tex file to Overleaf and compile with pdfLaTeX.${inputWasTrimmed ? "\nLong input was shortened to fit the AI request; review that the selected resume details are complete." : ""}${keywordList ? `\nPrioritized keywords: ${keywordList}` : ""}`,
    );
  } catch (error) {
    showResult(error.message || "Resume generation failed.", true);
  } finally {
    generateButton.disabled = false;
  }
});

clearButton.addEventListener("click", async () => {
  await chrome.storage.local.remove("resumeProfiles");
  await renderResumes();
  showResult("Saved resume profiles cleared.");
});

await Promise.all([renderResumes(), loadActiveJob()]);
