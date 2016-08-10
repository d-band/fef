module.exports = function(cfg) {
  cfg.babel.plugins.push('transform-runtime');
  return cfg;
};