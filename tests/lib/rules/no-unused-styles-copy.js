/**
 * @fileoverview No unused styles defined in javascript files
 * @author Tom Hastjarjanto
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-unused-styles');

require('babel-eslint');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
const tests = {
  valid: [{
    code: `
      const styles = StyleSheet.create({
        name: {},
      });
      const Hello = React.createClass({
        render: function() {
          return <Text textStyle={styles.name}>Hello {this.props.name}</Text>;
        }
      });
    `,
  }],
  invalid: [{
    filename: path.join(__dirname, '../unused-styles/TestComponent.tsx'),
    code: fs.readFileSync(path.join(__dirname, '../unused-styles/TestComponent.tsx'), 'utf8'),
    errors: [{
      message: 'Unused style detected: styles.someFailStyle',
    }, {
      message: 'Unused style detected: styles.getItHere',
    }],
  }],
};
const config = {
  parser: require.resolve('babel-eslint'),
  parserOptions: {
    ecmaFeatures: {
      classes: true,
      jsx: true,
    },
  },
  settings: {
    'react-native/style-sheet-object-names': ['StyleSheet', 'OtherStyleSheet'],
  },
};


const TSConfig = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};

// tests.valid.forEach((t) => Object.assign(t, config));
// tests.invalid.forEach((t) => Object.assign(t, config));

// ruleTester.run('no-unused-styles-copy', rule, tests);

tests.valid.forEach((t) => Object.assign(t, TSConfig));
tests.invalid.forEach((t) => Object.assign(t, TSConfig));

ruleTester.run('no-unused-styles-copy', rule, tests);
