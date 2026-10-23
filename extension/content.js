(() => {
  const pageText = document.body?.innerText?.trim() ?? "";
  if (pageText.length < 500) return;

  const jobTerms =
    /\b(job description|responsibilities|what you.ll do|required qualifications|requirements|preferred qualifications|about the role|we are looking for|key responsibilities)\b/i;
  const hits = pageText.match(
    /\b(job description|responsibilities|qualifications|requirements|about the role|what you.ll do|we are looking for)\b/gi,
  );

  if (!jobTerms.test(pageText) || !hits || hits.length < 2) return;

  const text = pageText.slice(0, 40_000);
  chrome.runtime.sendMessage({
    type: "JOB_DESCRIPTION_DETECTED",
    title: document.title,
    text,
  });
})();
