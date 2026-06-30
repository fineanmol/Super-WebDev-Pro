export const state = {
  isSidebarOpen: false,
  activeTool: null, // "css-inspector", "live-text-editor", etc.
  sidebarEl: null,
  drawerEl: null,
  shadowRoot: null,
  hostDiv: null,
  hostEl: null,
  toastEl: null,

  // Tool specific state
  hoverEl: null,
  highlightOverlay: null,
  originalStyles: new WeakMap(),
  originalText: new WeakMap(),
  selectedElementForCss: null,
  activeInspectorTab: "all",
  outlinerColor: "rgba(184, 163, 252, 0.65)",

  // Responsive Viewer
  activeListeners: [], activeIFrames: [],
  deviceList: [],

  // Ruler
  rulerCanvas: null,

  disabledStyles: new WeakMap(),
  disabledStyleValues: new WeakMap(),

  // Font Changer: original page body font, restored on deactivate
  originalBodyFont: undefined,

  // Move Element: original inline transform per element (for accurate reset)
  moveOriginalTransforms: new WeakMap(),
  selectedElementForMove: null,

  // Undo stacks for various tools
  undoStacks: {
    textEdits: [],
    deletedElements: [],
    movedElements: [],
    swappedImages: []
  }
};

