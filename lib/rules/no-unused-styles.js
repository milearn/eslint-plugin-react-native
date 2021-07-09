/**
 * @fileoverview Detects unused styles
 * @author Tom Hastjarjanto
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('module');

const Traverser = require('eslint/lib/shared/traverser');

const Components = require('../util/Components');
const styleSheet = require('../util/stylesheet');

const { StyleSheets } = styleSheet;
const { astHelpers } = styleSheet;

function parse(src, parserPath, parserOptions) {
  const parser = require(parserPath);
  try {
    return parser.parse(src, parserOptions);
  } catch (err) {
    return null;
  }
}
const traverser = new Traverser();
module.exports = Components.detect((context, components) => {
  const target = context.getFilename();
  const basedir = path.dirname(target);
  const styleSheets = new StyleSheets();
  const styleReferences = new Set();

  function reportUnusedStyles(unusedStyles) {
    Object.keys(unusedStyles).forEach((key) => {
      if ({}.hasOwnProperty.call(unusedStyles, key)) {
        const styles = unusedStyles[key];
        styles.forEach((node) => {
          const message = [
            'Unused style detected: ',
            key,
            '.',
            node.key.name,
          ].join('');

          context.report(node, message);
        });
      }
    });
  }
  function read(filename) {
    try {
      return fs.readFileSync(filename, 'utf8');
    } catch (err) {
      return null;
    }
  }

  function trace(filename) {
    // raw text for Style file
    const src = read(filename);

    const ast = parse(src, context.parserPath, context.parserOptions);
    traverser.traverse(ast, {
      enter: function (node, parent) {
        if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
          const styleSheetName = astHelpers.getStyleSheetName(node);
          const styles = astHelpers.getStyleDeclarations(node);

          styleSheets.add(styleSheetName, styles);
        }
        // var start = node.range ? node.range[0] : node.start;
        // var end = node.range ? node.range[1] : node.end;
        // var section = src.slice(start, end);
        // if (!searchRe.test(section)) return this.skip();

        // if (helpers.isRequireCall(node) ||
        //   helpers.isImport(node) ||
        //   (options.types && helpers.isImportType(node)) ||
        //   helpers.isExportFrom(node)) {
        //   var id = helpers.getModuleId(node);
        //   var resolved = resolver(id, basedir);
        //   if (resolved) found.push(resolved);
        // }
      }
    });
  }
  return {
    // styles.name
    // styles.container
    // this.props.name

    MemberExpression: function (node) {
      const styleRef = astHelpers.getPotentialStyleReferenceFromMemberExpression(node);
      if (styleRef) {
        styleReferences.add(styleRef);
      }
    },
    // const styles = StyleSheet.create({
    // name: {},
    // container: {}
    // })
    // const dlsStyles = DlsStyleSheet.create
    CallExpression: function (node) {
      if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
        // styles
        // dlsStyles
        const styleSheetName = astHelpers.getStyleSheetName(node);
        const styles = astHelpers.getStyleDeclarations(node);

        styleSheets.add(styleSheetName, styles);
      }
    },
    ImportDeclaration: function (node) {
      // get this from context.settings;
      const styleFileRegex = new RegExp('(S|s)tyles?$');
      // import CommonStyles from ".././commonStyles";
      // Users/milan.g/....
      if (node && node.source && node.source.value && styleFileRegex.test(node.source.value)) {
        const styleImportSource = node.source.value + ".ts";
        const absoluteStyleSourcePath = path.resolve(basedir, styleImportSource);
        // path.resolve(node_modules/. styleImpotrSource)
        trace(absoluteStyleSourcePath);
      }
    },

    'Program:exit': function () {
      const list = components.all();
      if (Object.keys(list).length > 0) {
        styleReferences.forEach((reference) => {
          styleSheets.markAsUsed(reference);
        });
        reportUnusedStyles(styleSheets.getUnusedReferences());
      }
    },
  };
});

module.exports.schema = [];
