# Privacy Policy for Super WebDev Pro

*Last Updated: June 10, 2026*

This Privacy Policy explains how **Super WebDev Pro** ("we", "our", or "the extension") handles user information and data. We are committed to protecting user privacy and ensuring a transparent development tool experience.

## 1. Information Collection & Transmission
Super WebDev Pro is built to run entirely locally in your web browser. 
- **No Personal Data Collection**: We do not collect, store, or transmit any personally identifiable information (PII).
- **No External Data Transmission**: Any actions performed within the extension—including inspecting CSS, editing text, capturing screenshots, harvesting page images, or measuring dimensions—happen completely in your local browser sandbox. No page data, styles, codes, or screenshots are ever transmitted to our servers or any third-party entities.
- **Local Data Only**: The extension utilizes standard local Chrome APIs to perform operations.

## 2. Chrome Extension Permissions Justification
To perform its core developer utility functions, the extension requests the following permissions. Here is why they are needed:

- **`activeTab`**: Required to inspect webpage components, modify font settings, measure dimensions, and capture the visible area viewport for the "Take Screenshot" tool.
- **`scripting`**: Required to inject the local helper coordinator onto the active tab when a tool is activated, ensuring we can highlight elements and listen to user gestures (like drags or clicks) inside the page.
- **`storage`**: Used to persist local states and configurations (such as your Free vs Pro version unlock status) locally on your device.
- **`downloads`**: Used to allow you to save exported HTML/CSS files, cropped screenshots, or extracted page images directly onto your local device's Downloads directory.
- **`host_permissions` (`*://*/*`)**: Allows the extension scripts to run across custom domains where you actively open the extension tools.

## 3. Third-Party Webpages
The extension allows users to export element codes to third-party services like **CodePen** (`codepen.io`). Clicking "Export to CodePen" will redirect you to CodePen's webpage and submit the element code via a standard HTTP POST request. This action is entirely opt-in, and you are subject to CodePen's terms of service and privacy policy when using their website.

## 4. Updates to this Policy
We may update this Privacy Policy from time to time to comply with Chrome Web Store Developer Policies or browser platform changes. We encourage users to check this document regularly.

## 5. Contact Support
If you have any questions or feedback regarding this Privacy Policy, please open an issue in our GitHub repository or contact our support team.
