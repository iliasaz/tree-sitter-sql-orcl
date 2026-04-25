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

  // -----------------------------------------------------------------------
  // CREATE [OR REPLACE] PACKAGE  /  CREATE [OR REPLACE] PACKAGE BODY
  // sqlrf/CREATE-PACKAGE-statement.html and CREATE-PACKAGE-BODY-statement.html
  // -----------------------------------------------------------------------
  create_package: $ => seq(
    $.keyword_create,
    optional($._or_replace),
    $.keyword_package,
    field("name", $.object_reference),
    optional($.plsql_authid_clause),
    choice($.keyword_is, $.keyword_as),
    repeat($._package_spec_item),
    $.keyword_end,
    optional(field("end_label", $.identifier)),
  ),

  create_package_body: $ => seq(
    $.keyword_create,
    optional($._or_replace),
    $.keyword_package,
    $.keyword_body,
    field("name", $.object_reference),
    choice($.keyword_is, $.keyword_as),
    repeat($._package_body_item),
    optional(seq(
      $.keyword_begin,
      repeat($._plsql_statement),
      optional($.plsql_exception_section),
    )),
    $.keyword_end,
    optional(field("end_label", $.identifier)),
  ),

  _package_spec_item: $ => choice(
    $.plsql_subprogram_declaration,
    $.plsql_declaration,
  ),

  _package_body_item: $ => choice(
    $.package_procedure,
    $.package_function,
    $.plsql_declaration,
  ),

  // Subprogram forward-declarations in a package spec (no body).
  plsql_subprogram_declaration: $ => seq(
    choice(
      seq(
        $.keyword_procedure,
        field("name", $.identifier),
        optional($.plsql_parameter_list),
      ),
      seq(
        $.keyword_function,
        field("name", $.identifier),
        optional($.plsql_parameter_list),
        $.keyword_return,
        field("return_type", $._type),
      ),
    ),
    repeat(choice(
      $.keyword_deterministic,
      $.keyword_pipelined,
    )),
    ';',
  ),

  // Procedures/functions inside PACKAGE BODY use IS/AS but no CREATE keyword
  // and end with `;`. They reuse the same parameter/declaration/body shape
  // as the standalone CREATE PROCEDURE/FUNCTION rules.
  package_procedure: $ => seq(
    $.keyword_procedure,
    field("name", $.identifier),
    optional($.plsql_parameter_list),
    choice($.keyword_is, $.keyword_as),
    optional(repeat1($.plsql_declaration)),
    $.keyword_begin,
    repeat($._plsql_statement),
    optional($.plsql_exception_section),
    $.keyword_end,
    optional(field("end_label", $.identifier)),
    ';',
  ),

  package_function: $ => seq(
    $.keyword_function,
    field("name", $.identifier),
    optional($.plsql_parameter_list),
    $.keyword_return,
    field("return_type", $._type),
    repeat(choice(
      $.keyword_deterministic,
      $.keyword_pipelined,
    )),
    choice($.keyword_is, $.keyword_as),
    optional(repeat1($.plsql_declaration)),
    $.keyword_begin,
    repeat($._plsql_statement),
    optional($.plsql_exception_section),
    $.keyword_end,
    optional(field("end_label", $.identifier)),
    ';',
  ),

};
