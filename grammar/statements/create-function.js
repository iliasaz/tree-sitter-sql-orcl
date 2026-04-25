// Oracle CREATE [OR REPLACE] FUNCTION.
// sqlrf/CREATE-FUNCTION.html
//
// Replaces the upstream PostgreSQL `create_function`. Oracle functions
// require a RETURN clause (singular) and a body bracketed by IS/AS ... END.

export default {

  create_function: $ => seq(
    $.keyword_create,
    optional($._or_replace),
    $.keyword_function,
    field("name", $.object_reference),
    optional($.plsql_parameter_list),
    $.keyword_return,
    field("return_type", $._type),
    optional($.plsql_authid_clause),
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
  ),

};
