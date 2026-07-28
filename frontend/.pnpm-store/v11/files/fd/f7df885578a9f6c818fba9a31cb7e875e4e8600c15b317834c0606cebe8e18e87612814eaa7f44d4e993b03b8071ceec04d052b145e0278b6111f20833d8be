Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const browser = require('@sentry/browser');
const core = require('@sentry/core');

function instrumentVueRouter(router, options, startNavigationSpanFn) {
  let hasHandledFirstPageLoad = false;
  const isLegacyRouter = "mode" in router;
  router.onError((error) => browser.captureException(error, { mechanism: { handled: false } }));
  router.beforeEach((to, _from, ...rest) => {
    const activePageLoadSpan = !hasHandledFirstPageLoad ? getActivePageLoadSpan() : void 0;
    const attributes = {};
    for (const key of Object.keys(to.params)) {
      attributes[`url.path.parameter.${key}`] = to.params[key];
      attributes[`params.${key}`] = to.params[key];
    }
    for (const key of Object.keys(to.query)) {
      const value = to.query[key];
      if (value) {
        attributes[`query.${key}`] = value;
      }
    }
    let spanName = to.path;
    let transactionSource = "url";
    if (to.name && options.routeLabel !== "path") {
      spanName = to.name.toString();
      transactionSource = "custom";
    } else if (to.matched.length > 0) {
      const lastIndex = to.matched.length - 1;
      spanName = to.matched[lastIndex].path;
      transactionSource = "route";
    }
    core.getCurrentScope().setTransactionName(spanName);
    if (options.instrumentPageLoad && activePageLoadSpan) {
      const existingAttributes = core.spanToJSON(activePageLoadSpan).data;
      if (existingAttributes[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] !== "custom") {
        activePageLoadSpan.updateName(spanName);
        activePageLoadSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, transactionSource);
      }
      activePageLoadSpan.setAttributes({
        ...attributes,
        [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.vue"
      });
      hasHandledFirstPageLoad = true;
    }
    if (options.instrumentNavigation && !activePageLoadSpan) {
      startNavigationSpanFn({
        name: spanName,
        op: "navigation",
        attributes: {
          ...attributes,
          [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.vue",
          [core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: transactionSource
        }
      });
    }
    if (isLegacyRouter) {
      const next = rest[0];
      if (typeof next === "function") {
        next();
      }
    }
  });
}
function getActivePageLoadSpan() {
  const span = core.getActiveSpan();
  const rootSpan = span && core.getRootSpan(span);
  if (!rootSpan) {
    return void 0;
  }
  const op = core.spanToJSON(rootSpan).op;
  return op === "pageload" ? rootSpan : void 0;
}

exports.instrumentVueRouter = instrumentVueRouter;
//# sourceMappingURL=router.js.map
