const path = require('path');
const crypto = require('crypto');

/** css-loader base64 hashes can include `+`/`/`, which break CSS module selectors. */
function safeLocalIdent(context, _localIdentName, localName) {
  const file = path.basename(context.resourcePath).replace(/\.[^.]+$/, '');
  const hash = crypto
    .createHash('md5')
    .update(`${context.resourcePath}\0${localName}`)
    .digest('hex')
    .slice(0, 6);
  return `${file}_${localName}_${hash}`;
}

function patchCssModules(rules = []) {
  for (const rule of rules) {
    if (rule.oneOf) patchCssModules(rule.oneOf);
    if (rule.rules) patchCssModules(rule.rules);

    const uses = Array.isArray(rule.use) ? rule.use : rule.use ? [rule.use] : [];
    for (const use of uses) {
      const loader = typeof use === 'object' ? use.loader : '';
      if (!loader || !loader.includes('css-loader')) continue;
      const options = use.options || (use.options = {});
      if (!options.modules || options.modules === false) continue;
      if (options.modules === true) {
        options.modules = { getLocalIdent: safeLocalIdent };
      } else if (typeof options.modules === 'object') {
        options.modules.getLocalIdent = safeLocalIdent;
      }
    }
  }
}

module.exports = {
  webpack: {
    configure: (config) => {
      patchCssModules(config.module?.rules || []);
      return config;
    },
  },
};
