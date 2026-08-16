/**
 * @fileoverview eslint-plugin-local
 *
 * Local ESLint rules for frontend-shell. Currently exposes:
 *   - no-emoji: Design System guard (Change 020). Reject emoji
 *               characters in JSX text, strings, and template
 *               literals.
 */
'use strict';

const noEmoji = require('../no-emoji');

module.exports = {
  rules: {
    'no-emoji': noEmoji,
  },
};
