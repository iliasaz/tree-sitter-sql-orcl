// Oracle PL/SQL constructs (lnpls/Block.html and surrounding language pages).
// v1 scope: anonymous blocks, IF/CASE/LOOP/FOR/WHILE, exception handlers,
// assignment, RAISE/RETURN/NULL/EXIT/CONTINUE, embedded SQL, nested blocks,
// CREATE [OR REPLACE] PROCEDURE/FUNCTION/PACKAGE [BODY]/TRIGGER (Oracle style).
import { comma_list, paren_list, wrapped_in_parenthesis } from "../helpers.js";

export default {

  // -----------------------------------------------------------------------
  // Anonymous block:  [DECLARE ...] BEGIN ... [EXCEPTION ...] END [label] ;
  // -----------------------------------------------------------------------
  plsql_block: $ => seq(
    optional($.plsql_declare_section),
    $.keyword_begin,
    repeat($._plsql_statement),
    optional($.plsql_exception_section),
    $.keyword_end,
    optional(field("label", $.identifier)),
  ),

  plsql_declare_section: $ => seq(
    $.keyword_declare,
    repeat1($.plsql_declaration),
  ),

  // Loose declaration form covering scalar variables and constants.
  // %TYPE / %ROWTYPE / cursor / record decls are left for a later pass.
  plsql_declaration: $ => seq(
    field("name", $.identifier),
    optional($.keyword_constant),
    field("type", $._type),
    optional($._not_null),
    optional(seq(
      choice(':=', $.keyword_default),
      field("value", $._expression),
    )),
    ';',
  ),

  plsql_exception_section: $ => seq(
    $.keyword_exception,
    repeat1($.plsql_exception_handler),
  ),

  plsql_exception_handler: $ => seq(
    $.keyword_when,
    field("exception", choice(
      $.keyword_others,
      seq($.identifier, repeat(seq($.keyword_or, $.identifier))),
    )),
    $.keyword_then,
    repeat($._plsql_statement),
  ),

  // -----------------------------------------------------------------------
  // PL/SQL statements
  // -----------------------------------------------------------------------
  _plsql_statement: $ => choice(
    $.plsql_assignment,
    $.plsql_if,
    $.plsql_basic_loop,
    $.plsql_for_loop,
    $.plsql_while_loop,
    $.plsql_return,
    $.plsql_raise,
    $.plsql_null,
    $.plsql_exit,
    $.plsql_continue,
    $.plsql_procedure_call,
    seq($.plsql_block, ';'),
    seq($.statement, ';'),
  ),

  plsql_assignment: $ => seq(
    field("target", choice(
      $.identifier,
      alias($._qualified_field, $.field),
    )),
    ':=',
    field("value", $._expression),
    ';',
  ),

  plsql_if: $ => seq(
    $.keyword_if,
    field("condition", $._expression),
    $.keyword_then,
    repeat($._plsql_statement),
    repeat($.plsql_elsif),
    optional($.plsql_else),
    $.keyword_end,
    $.keyword_if,
    ';',
  ),

  plsql_elsif: $ => seq(
    $.keyword_elsif,
    field("condition", $._expression),
    $.keyword_then,
    repeat($._plsql_statement),
  ),

  plsql_else: $ => seq(
    $.keyword_else,
    repeat($._plsql_statement),
  ),

  plsql_basic_loop: $ => seq(
    $.keyword_loop,
    repeat($._plsql_statement),
    $.keyword_end,
    $.keyword_loop,
    ';',
  ),

  plsql_for_loop: $ => seq(
    $.keyword_for,
    field("index", $.identifier),
    $.keyword_in,
    optional($.keyword_reverse),
    field("low", $._expression),
    $._range_dotdot,
    field("high", $._expression),
    $.keyword_loop,
    repeat($._plsql_statement),
    $.keyword_end,
    $.keyword_loop,
    ';',
  ),

  // Higher-prec literal so the lexer prefers `..` over splitting `1..10`
  // into `1.` (decimal) + `.10` (decimal).
  _range_dotdot: _ => token(prec(3, '..')),

  plsql_while_loop: $ => seq(
    $.keyword_while,
    field("condition", $._expression),
    $.keyword_loop,
    repeat($._plsql_statement),
    $.keyword_end,
    $.keyword_loop,
    ';',
  ),

  plsql_return: $ => seq(
    $.keyword_return,
    optional(field("value", $._expression)),
    ';',
  ),

  plsql_raise: $ => seq(
    $.keyword_raise,
    optional(field("exception", $.identifier)),
    ';',
  ),

  plsql_null: $ => seq($.keyword_null, ';'),

  plsql_exit: $ => seq(
    $.keyword_exit,
    optional(field("label", $.identifier)),
    optional(seq($.keyword_when, field("condition", $._expression))),
    ';',
  ),

  plsql_continue: $ => seq(
    $.keyword_continue,
    optional(field("label", $.identifier)),
    optional(seq($.keyword_when, field("condition", $._expression))),
    ';',
  ),

  plsql_procedure_call: $ => seq(
    choice(
      $.invocation,
      $.object_reference, // parameterless call
    ),
    ';',
  ),

  // Note: Oracle CREATE PROCEDURE / FUNCTION / PACKAGE / PACKAGE BODY /
  // TRIGGER are deferred. Wiring them into the existing _create_statement
  // choice triggered conflicts with the upstream PostgreSQL/T-SQL versions
  // and grew the LR parse table past tree-sitter's 65535 action limit.
  // A future iteration could either (a) gate them behind a different
  // top-level rule (e.g. an Oracle-specific source file mode) or
  // (b) replace the existing create_function/procedure with a Lattice
  // permissive form that handles both syntaxes.

};
