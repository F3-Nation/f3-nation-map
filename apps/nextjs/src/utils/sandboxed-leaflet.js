/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// https://www.npmjs.com/package/sandboxed-module
// https://github.com/pimterry/leaflet-map-server-component/blob/master/demo.js
// https://medium.com/@pimterry/building-a-server-rendered-map-component-part-2-using-client-side-libraries-6f1bb751f31c

var SandboxedModule = require("sandboxed-module");

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
