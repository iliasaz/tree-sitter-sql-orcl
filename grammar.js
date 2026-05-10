import keyword_rules from "./grammar/keywords.js";
import type_rules from "./grammar/types.js";
import column_list_rules from "./grammar/column-lists.js";
import expression_rules from "./grammar/expressions.js";
import transaction_rules from "./grammar/transactions.js";
import statement_rules from "./grammar/statements/index.js";

export default grammar({
  name: 'sql_orcl',

  extras: $ => [
    /\s\n/,
    /\s/,
    $.hint_line,
    $.hint,
    $.comment,
    $.marginalia,
  ],


  externals: $ => [
    $._dollar_quoted_string_start_tag,
    $._dollar_quoted_string_end_tag,
    $._dollar_quoted_string,
    // Bare `/` on its own line — Oracle SQL*Plus's "execute the previous
    // unit" directive. Made a structural token so multi-unit worksheets
    // parse cleanly and the parser has a recovery anchor between units
    // even when one of them is mid-typing.
    $.slash_terminator,
  ],

  conflicts: $ => [
    [$.object_reference, $._qualified_field],
    [$.field, $._qualified_field],
    [$._column, $._qualified_field],
    [$.object_reference],
    [$.between_expression, $.binary_expression],
    [$.time],
    [$.timestamp],
    [$.block, $.plsql_block],
    [$._qualified_field, $.plsql_assignment],
    [$.transaction, $.block, $._plsql_statement],
  ],

  precedences: $ => [
    [
      'binary_is',
      'unary_not',
      'binary_exp',
      'binary_times',
      'binary_plus',
      'unary_other',
      'binary_other',
      'binary_in',
      'binary_compare',
      'binary_relation',
      'pattern_matching',
      'between',
      'clause_connective',
      'clause_disjunctive',
    ],
  ],

  word: $ => $._identifier,

  rules: {
    program: $ => seq(
      // any number of transactions, statements, or blocks with a terminating
      // `;`, optionally followed by a SQL*Plus `/` execution directive;
      // bare `/` lines are also allowed as standalone separators so the
      // parser snaps cleanly even when an in-progress unit is malformed.
      repeat(
        choice(
          seq(
            choice(
              $.transaction,
              $.statement,
              $.block,
            ),
            ';',
            optional($.slash_terminator),
          ),
          // Oracle PL/SQL anonymous block, ;-terminated.
          seq($.plsql_block, ';', optional($.slash_terminator)),
          $.slash_terminator,
        ),
      ),
      // optionally, a single statement without a terminating ;
      optional(
        $.statement,
      ),
    ),

    // Oracle optimizer hint, line form: --+ hint
    hint_line: _ => token(prec(2, /--\+[^\n]*/)),
    // Oracle optimizer hint, block form: /*+ hint */
    hint: _ => token(prec(2, /\/\*\+[^*]*\*+(?:[^/*][^*]*\*+)*\//)),
    comment: _ => /--.*/,
    // https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment
    marginalia: _ => /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//,

    ...keyword_rules,
    ...type_rules,
    ...column_list_rules,
    ...expression_rules,
    ...transaction_rules,
    ...statement_rules,

  }

});
