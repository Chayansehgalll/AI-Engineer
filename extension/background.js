chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "JOB_DESCRIPTION_DETECTED" || !sender.tab?.id) {
    return;
  }

  chrome.storage.session.set({
    activeJob: {
      title: message.title,
      url: sender.tab.url,
      text: message.text,
      detectedAt: Date.now(),
    },
  });
});
