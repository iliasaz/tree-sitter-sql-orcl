import XCTest
import SwiftTreeSitter
import TreeSitterSQLOrcl

final class TreeSitterSQLOrclTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_sql_orcl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Oracle SQL/PL-SQL grammar")
    }
}
