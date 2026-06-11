export const state = {
  isSidebarOpen: false,
  activeTool: null, // "css-inspector", "live-text-editor", etc.
  sidebarEl: null,
  drawerEl: null,
  shadowRoot: null,
  hostDiv: null,

  // Tool specific state
  hoverEl: null,
  highlightOverlay: null,
  originalStyles: new WeakMap(),
  originalText: new WeakMap(),
  selectedElementForCss: null,
  activeInspectorTab: "all",

  // Responsive Viewer
  activeIFrames: [],
  deviceList: [],

  // Ruler
  rulerCanvas: null,

  disabledStyles: new WeakMap(),
  disabledStyleValues: new WeakMap()
};
