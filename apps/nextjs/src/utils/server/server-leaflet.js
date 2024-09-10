import SandboxedModule from "sandboxed-module"

module.exports = SandboxedModule.require("leaflet", {
  sourceTransformers: {
    wrapToInjectGlobals: function (source) {
      return `
        module.exports = function (window, document) {
          var navigator = window.navigator;
          ${source}
          return window.L.noConflict();
        }`;
    },
  },
});
