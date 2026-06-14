const fs = require('fs');

const lines = fs.readFileSync('old-content.js', 'utf8').split('\n');

function writeModule(path, imports, ranges) {
  let out = imports.join('\n') + (imports.length ? '\n\n' : '');
  
  for (const [start, end] of ranges) {
    // start and end are 1-indexed. end is exclusive (i.e. starts the next function)
    const slice = lines.slice(start - 1, end - 1);
    const code = slice.join('\n');
    // Prefix 'export ' to '  function ' or '  async function '
    const exportCode = code.replace(/^(\s*)(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/, 'export $1$2function $3(');
    out += exportCode + '\n\n';
  }
  
  fs.writeFileSync(path, out);
}

writeModule('src/utils.js', [], [
  [41, 59], [59, 68], [68, 75], [75, 94], [94, 133]
]);

writeModule('src/ui/hud.js', [
  "import { state } from '../state.js';",
  "import { activateTool, deactivateCurrentTool, openCommandPalette } from '../core/tool-manager.js';",
  "import { openDrawer, closeDrawer } from './drawer.js';",
  "import { showToast } from './toast.js';"
], [
  [133, 1834], [1834, 1845], [1845, 1856], [1856, 1880], [1880, 1885], [1885, 1898], [1898, 1990], [1990, 2003]
]);

writeModule('src/ui/toast.js', ["import { state } from '../state.js';"], [[2003, 2014]]);

writeModule('src/ui/drawer.js', [
  "import { state } from '../state.js';",
  "import { ensureHUD } from './hud.js';"
], [[2014, 2025], [2025, 2031], [2031, 2048]]);

writeModule('src/ui/highlight.js', ["import { state } from '../state.js';"], [
  [2048, 2082], [2082, 2088], [2088, 2099], [2099, 2268]
]);

writeModule('src/core/tool-manager.js', [
  "import { state } from '../state.js';",
  "import { ensureHUD, updateSidebarActiveBtn } from '../ui/hud.js';",
  "import { hideHighlight } from '../ui/highlight.js';",
  "import { closeDrawer } from '../ui/drawer.js';",
  "import { showToast } from '../ui/toast.js';",
  "import { setupCSSInspector } from '../features/css-inspector.js';",
  "import { setupLiveTextEditor } from '../features/live-text-editor.js';",
  "import { setupFontsChanger } from '../features/fonts-changer.js';",
  "import { setupListFonts } from '../features/list-fonts.js';",
  "import { setupColorPicker } from '../features/color-picker.js';",
  "import { setupColorPalette } from '../features/color-palette.js';",
  "import { setupExtractImages } from '../features/extract-images.js';",
  "import { setupMoveElement } from '../features/move-element.js';",
  "import { setupDeleteElement } from '../features/delete-element.js';",
  "import { setupExportElement } from '../features/export-element.js';",
  "import { setupPageRuler } from '../features/page-ruler.js';",
  "import { setupPageOutliner } from '../features/page-outliner.js';",
  "import { setupImageReplacer } from '../features/image-replacer.js';",
  "import { setupTakeScreenshot } from '../features/take-screenshot.js';",
  "import { setupResponsiveViewer } from '../features/responsive-viewer.js';",
  "import { setupSettings } from '../features/settings.js';",
  "import { setupTechStack } from '../features/tech-stack.js';",
  "import { setupSeoMeta } from '../features/seo-meta.js';",
  "import { setupA11yAudit } from '../features/a11y-audit.js';"
], [
  [2268, 2342], [2342, 2370], [2370, 2375], [2375, 2385], [2385, 2504]
]);

const features = [
  ['src/features/tech-stack.js', [[2504, 2587]]],
  ['src/features/seo-meta.js', [[2587, 2651]]],
  ['src/features/a11y-audit.js', [[2651, 2718]]],
  ['src/features/css-inspector.js', [[2718, 2870], [2870, 2880], [2880, 3358]]],
  ['src/features/live-text-editor.js', [[3358, 3437]]],
  ['src/features/color-picker.js', [[3437, 3504]]],
  ['src/features/move-element.js', [[3504, 3674]]],
  ['src/features/delete-element.js', [[3674, 3747]]],
  ['src/features/export-element.js', [[3747, 3782], [3782, 3858]]],
  ['src/features/page-outliner.js', [[3858, 3924]]],
  ['src/features/image-replacer.js', [[3924, 3985], [3985, 4030]]],
  ['src/features/take-screenshot.js', [[4030, 4059], [4059, 4094]]],
  ['src/features/dashboard.js', [[4094, 4122]]],
  ['src/features/fonts-changer.js', [[4122, 4180]]],
  ['src/features/list-fonts.js', [[4180, 4218]]],
  ['src/features/color-palette.js', [[4218, 4290]]],
  ['src/features/extract-images.js', [[4290, 4554]]],
  ['src/features/page-ruler.js', [[4554, 4670]]],
  // responsive-viewer.js is skipped here because we already rewrote it!
  ['src/features/settings.js', [[4826, 5144]]]
];

for (const [path, ranges] of features) {
  writeModule(path, [
    "import { state } from '../state.js';",
    "import { openDrawer, closeDrawer, showPremiumLockedDrawer } from '../ui/drawer.js';",
    "import { ensureHUD } from '../ui/hud.js';",
    "import { showToast } from '../ui/toast.js';",
    "import { showHighlight, hideHighlight, updateInspectorTooltip, isHUDElement } from '../ui/highlight.js';",
    "import { deactivateCurrentTool, trackListener } from '../core/tool-manager.js';",
    "import { formatElementSelector, getFirstFontFamily, hexToRgb, rgbToHsl, extractColor } from '../utils.js';"
  ], ranges);
}

// Content.js entry
const contentBody = lines.slice(5144 - 1).join('\n');
fs.writeFileSync('src/content.js', [
  "import { state } from './state.js';",
  "import { ensureHUD } from './ui/hud.js';",
  "import { activateTool, deactivateCurrentTool } from './core/tool-manager.js';",
  contentBody
].join('\n\n'));

console.log("Perfect split complete!");
