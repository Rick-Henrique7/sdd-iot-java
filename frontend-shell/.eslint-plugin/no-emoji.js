/**
 * @fileoverview no-emoji
 *
 * Design System guard (Change 020): reject emoji characters in any
 * string literal, JSX text, JSX attribute value, or template literal.
 *
 * Why custom (and not eslint-plugin-no-emoji):
 *   - We control the regex exactly.
 *   - No new dependency in package.json.
 *   - Easy to extend with the exact ranges we care about.
 *
 * Ranges covered (covers all standard pictographic + dingbat blocks
 * that show up in modern UIs):
 *   U+1F300 - U+1FAFF  Miscellaneous Symbols and Pictographs, Emoticons,
 *                       Ornamental, Transport, Geometric, Supplemental
 *   U+2600  - U+27BF   Miscellaneous Symbols, Dingbats, Arrows
 *
 * Anything else (e.g. CJK ideographs, Latin punctuation) is allowed.
 *
 * Reports as `error` (not warning) so CI fails the build.
 */
'use strict';

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow emoji characters in JSX text, strings, and template literals (Design System).',
      category: 'Design System',
      recommended: true,
    },
    schema: [],
    messages: {
      noEmoji:
        'Emoji character "{{char}}" (U+{{code}}) is not allowed. Use a lucide-react icon instead.',
    },
  },

  create(context) {
    function report(node, value) {
      const match = EMOJI_RE.exec(value);
      if (!match) return;
      const code = match[0]
        .codePointAt(0)
        .toString(16)
        .toUpperCase()
        .padStart(4, '0');
      context.report({
        node,
        messageId: 'noEmoji',
        data: { char: match[0], code },
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          report(node, node.value);
        }
      },

      TemplateElement(node) {
        // TemplateElement.value.cooked is the static slice between
        // ${} expressions. Skip it if it doesn't exist (rare).
        const raw = node.value && node.value.cooked;
        if (typeof raw === 'string') {
          report(node, raw);
        }
      },

      JSXText(node) {
        if (typeof node.value === 'string') {
          report(node, node.value);
        }
      },

      JSXAttribute(node) {
        // Only string-literal attribute values; expression containers
        // are covered by their inner Literal/TemplateElement visits.
        if (
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string'
        ) {
          report(node, node.value.value);
        }
      },
    };
  },
};
