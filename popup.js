const features = [
  "css-inspector",
  "live-text-editor",
  "fonts-changer",
  "list-fonts",
  "color-picker",
  "color-palette",
  "move-element",
  "delete-element",
  "export-element",
  "extract-images",
  "page-ruler",
  "page-outliner",
  "image-replacer",
  "take-screenshot",
];

features.forEach((feature) => {
  document.getElementById(feature).addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: [`features/${feature}.js`],
      });
    });
  });
});
