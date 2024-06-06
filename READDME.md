# Super Web Dev Extension

## Description
Super Web Dev Extension is a comprehensive Chrome extension designed to provide web developers with a suite of tools to enhance their development workflow. This extension includes features like CSS inspection and editing, live text editing, font management, color picking, and much more, all in a modern and user-friendly interface.

## Features
- **CSS Inspector**: Inspect and edit the CSS properties of a website with autocomplete and save, copy, or export your changes.
- **Live Text Editor**: Easily edit the text of a website in a single click and undo changes in case of a mistake.
- **Fonts Changer**: Experiment with 1100+ Google and local fonts on a website, and save, copy, or export your changes.
- **List All Fonts**: Identify all fonts used on a website with their sizes, weights, and how they look, and copy or export all data.
- **Color Picker**: Pick colors from a website at pixel level and copy or export them in HEX, RGB, or HSL color format.
- **Color Palette**: Discover all colors used on a website and copy or export them in HEX, RGB, or HSL color format.
- **Move Element**: Easily move different website elements in a single click and undo changes in case of a mistake.
- **Delete Element**: Easily delete or hide website elements in a single click and undo changes in case of a mistake.
- **Export Element**: Export your favorite element from a website to CodePen or an HTML file in a single click.
- **Extract Images**: Extract all kinds of images from a website in a single click and export them at once or individually.
- **Page Ruler**: Measure distances between everything you see on a website in real-time; works like magic everywhere.
- **Page Outliner**: Outline entire website or an HTML tag with red, green, blue, or randomly generated colors.
- **Image Replacer**: Easily replace website images with local images from your device and undo changes in case of a mistake.
- **Take Screenshot**: Capture visible area, custom area, or full page screenshot of a website in PNG, JPEG, or PDF format.

## Installation

### From Source
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/super-web-dev-extension.git
    cd super-web-dev-extension
    ```

2. Open Chrome and go to `chrome://extensions/`.

3. Enable "Developer mode" using the toggle switch in the top right corner.

4. Click on the "Load unpacked" button and select the `super-web-dev-extension` directory.

### From Chrome Web Store
*(Once published)*

1. Go to the Chrome Web Store.
2. Search for "Super Web Dev Extension".
3. Click "Add to Chrome".

## Usage
1. Click on the Super Web Dev Extension icon in the Chrome toolbar.
2. Select the feature you want to use from the popup menu.
3. Follow the on-screen instructions to use the selected feature.

## Development

### Project Structure
```
super-web-dev-extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── styles.css
├── features/
│   ├── css-inspector.js
│   ├── live-text-editor.js
│   ├── fonts-changer.js
│   ├── list-fonts.js
│   ├── color-picker.js
│   ├── color-palette.js
│   ├── move-element.js
│   ├── delete-element.js
│   ├── export-element.js
│   ├── extract-images.js
│   ├── page-ruler.js
│   ├── page-outliner.js
│   ├── image-replacer.js
│   └── take-screenshot.js
└── assets/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png

```


### manifest.json
Defines the permissions and files used in the extension.

### background.js
Handles background processes and events for the extension.

### content.js
Injects scripts into the webpage and interacts with the DOM.

### popup.html
The main user interface of the extension, providing buttons to access each feature.

### popup.js
Contains the logic to handle user interactions from the popup menu and execute the corresponding feature scripts.

### styles.css
Defines the styles for the popup user interface.

### features/
Contains individual JavaScript files for each feature, providing the functionality described above.

## Future Features
Here are some additional features that could be added to the Super Web Dev Extension in the future:
- **Responsive Design Tester**: Test how a website looks and behaves on various screen sizes and devices.
- **Performance Analyzer**: Analyze the performance of a website and provide suggestions for improvements.
- **Accessibility Checker**: Check a website for accessibility issues and provide recommendations for fixing them.
- **SEO Analyzer**: Analyze the SEO performance of a website and provide suggestions for improvements.
- **Form Filler**: Automatically fill out forms on a website with predefined or random data for testing purposes.
- **JavaScript Console**: A built-in JavaScript console to run scripts directly from the extension.
- **Network Monitor**: Monitor and log network requests made by the website.
- **Storage Inspector**: Inspect and manage local storage, session storage, and cookies used by the website.
- **Style Editor**: A more advanced CSS editor with features like SASS/SCSS support and live preview.
- **Code Beautifier**: Beautify and format HTML, CSS, and JavaScript code on a webpage.
- **Version Control Integration**: Integrate with Git or other version control systems to manage changes directly from the extension.

## Contributing
Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
