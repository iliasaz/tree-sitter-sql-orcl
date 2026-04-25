// Oracle CREATE [OR REPLACE] PROCEDURE.
// sqlrf/CREATE-PROCEDURE.html
//
// Replaces the upstream PostgreSQL/T-SQL/MySQL `create_procedure` so the
// rule's body is Oracle PL/SQL and there is no GLR conflict between dialects.
import { paren_list } from "../helpers.js";

export default {

  create_procedure: $ => seq(
    $.keyword_create,
    optional($._or_replace),
    $.keyword_procedure,
    field("name", $.object_reference),
    optional($.plsql_parameter_list),
    optional($.plsql_authid_clause),
    choice($.keyword_is, $.keyword_as),
    optional(repeat1($.plsql_declaration)),
    $.keyword_begin,
    repeat($._plsql_statement),
    optional($.plsql_exception_section),
    $.keyword_end,
    optional(field("end_label", $.identifier)),
  ),

  // Oracle parameter mode keywords. `IN OUT` is two tokens; `INOUT` (single
  // word) is also accepted as a synonym for tools that emit it.
  plsql_parameter_mode: $ => choice(
    seq($.keyword_in, $.keyword_out),
    $.keyword_in,
    $.keyword_out,
    $.keyword_inout,
  ),

  plsql_parameter_list: $ => paren_list($.plsql_parameter, true),

  plsql_parameter: $ => seq(
    field("name", $.identifier),
    optional($.plsql_parameter_mode),
    optional($.keyword_nocopy),
    field("type", $._type),
    optional(seq(
      choice(':=', $.keyword_default),
      field("default", $._expression),
    )),
  ),

  plsql_authid_clause: $ => seq(
    $.keyword_authid,
    choice($.keyword_current_user, $.keyword_definer),
  ),

};
