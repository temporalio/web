<template>
  <div class="workflow-filter-autocomplete">
    <input
      type="search"
      class="query"
      placeholder="Query"
      v-model="query"
      @keyup="onKeypress"
      ref="query"
    />

    <ul class="suggestions" v-show="showSuggestions">
      <li
        class="suggestion"
        v-for="(suggestion, i) in suggestions"
        :key="i"
        @click="onSuggestionPick(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script>
import {
  OPERATORS_RELATIONAL_LIST,
  SUGGESTION_STATES,
  OPERATORS_LOGICAL_LIST,
  OPERATORS_LOGICAL,
  OPERATORS_RELATIONAL,
} from './constants';
import { attributeTypeToRule } from './helpers';

export default {
  name: 'workflow-filter-autocomplete',
  props: ['searchAttributes'],
  data() {
    return {
      query: '',
      showSuggestions: false,
      suggestions: [],
      currentRule: {},
      rules: [],
    };
  },
  computed: {
    wordCurrent() {
      const cursorPos = this.$refs.query.selectionStart;
      const word = this.wordAt(cursorPos);
      return word;
    },
    wordPrevious() {
      let { start: i } = this.wordCurrent;
      if (i === undefined || i == 0) {
        return undefined;
      }
      const word = this.wordAt(i - 1);
      return word;
    },
    suggestionState() {
      const wordPrevInfo = this.wordPrevious;
      if (!wordPrevInfo) {
        return SUGGESTION_STATES.selectSearchAttribute;
      }

      const wordPrev = wordPrevInfo.word.toLowerCase();

      const isPrevWordSearchAttribute = this.rules
        .map((r) => r.id.toLowerCase())
        .includes(wordPrev);
      if (isPrevWordSearchAttribute) {
        return SUGGESTION_STATES.selectOperatorRelational;
      }

      const isPrevWordOperatorRelational = OPERATORS_RELATIONAL_LIST.includes(
        wordPrev
      );
      if (isPrevWordOperatorRelational) {
        return SUGGESTION_STATES.selectValue;
      }

      const isPrevWordOperatorLogical = OPERATORS_LOGICAL_LIST.includes(
        wordPrev
      );
      if (isPrevWordOperatorLogical) {
        if (wordPrev == OPERATORS_LOGICAL.parenthesisClose) {
          return SUGGESTION_STATES.selectOperatorLogical;
        }
        return SUGGESTION_STATES.selectSearchAttribute;
      }

      return SUGGESTION_STATES.selectOperatorLogical;
    },
  },
  methods: {
    onKeypress(event) {
      this.filterSuggestions();
      if (this.suggestions.length > 0) {
        this.showSuggestions = true;
      }
    },
    filterSuggestions() {
      let suggestions = [];
      switch (this.suggestionState) {
        case SUGGESTION_STATES.selectSearchAttribute:
          suggestions = this.rules.map((r) => r['id']);
          break;
        case SUGGESTION_STATES.selectOperatorRelational:
          suggestions = this.currentRule.operators;
          break;
        case SUGGESTION_STATES.selectOperatorLogical:
          suggestions = OPERATORS_LOGICAL_LIST;
          break;
        case SUGGESTION_STATES.selectValue:
          suggestions = this.currentRule.defaultSuggestions;
          break;
        default:
          suggestions = [];
          return;
      }

      if (!suggestions?.length) {
        return [];
      }

      const { word: wordCurrent } = this.wordCurrent;
      this.suggestions = suggestions.filter((s) =>
        String(s).includes(wordCurrent)
      );
    },
    onSuggestionPick(suggestion) {
      if (this.suggestionState == SUGGESTION_STATES.selectSearchAttribute) {
        this.currentRule = this.rules.find((r) => r.id === suggestion);
      }
      this.autocomplete(suggestion);
    },
    autocomplete(suggestion) {
      const { word, start, end } = this.wordCurrent;
      const left = this.query.slice(0, start);
      const right = this.query.slice(end, this.query.length - 1);
      this.query = left + suggestion + (right || ' ');
      this.showSuggestions = false;
      this.suggestions = [];
    },
    wordAt(i) {
      const cursorPos = i;

      let [start, end] = [cursorPos, cursorPos];
      while (start > 0 && this.query[start - 1] != ' ') {
        start--;
      }
      while (end < this.query.length && this.query[end] != ' ') {
        end++;
      }

      const word = this.query.slice(start, end);
      return { word, start, end };
    },
  },
  watch: {
    query() {
      this.$emit('filterChanged', this.query);
    },
    searchAttributes() {
      if (!this.searchAttributes?.keys) {
        return;
      }

      this.rules = Object.entries(this.searchAttributes.keys)
        .map(([key, value]) => ({
          id: key,
          label: key,
          ...attributeTypeToRule(value),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

.workflow-filter-autocomplete {
  position: relative;
  width: 100%;
  .query {
    width: 100%;
  }

  .suggestions {
    position: absolute;
    padding: 0.25rem;
    height: auto
    max-height: 340px;
    min-width: 200px;
    max-width: 340px;
    overflow: auto;
    background-color: temporal-white;
    box-shadow: card-shadow;
  }

  .suggestion {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

  .suggestion:hover {
    background-color: temporal-purple;
  }
}
</style>
