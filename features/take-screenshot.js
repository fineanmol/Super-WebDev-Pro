chrome.runtime.sendMessage({action: 'takeScreenshot'}, (response) => {
    const img = document.createElement('img');
    img.src = response.screenshotUrl;
    img.style.position = 'fixed';
    img.style.top = '10px';
    img.style.right = '10px';
    img.style.zIndex = '9999';
    document.body.appendChild(img);
  });
  