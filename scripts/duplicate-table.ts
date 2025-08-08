import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as glob from 'glob';

// Interface to represent a table definition
interface TableDefinition {
  variableName: string;
  tableName: string | null;
  filePath: string;
}

// Function to find all table definitions
function findTableDefinitions(): TableDefinition[] {
  // Use hardcoded schema path
  const schemaPathPattern = 'app/drizzle/schema/*';
  const schemaFiles = glob.sync(schemaPathPattern);
  
  const tables: TableDefinition[] = [];
  
  for (const file of schemaFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    function visit(node: ts.Node) {
      // Look for variable declarations
      if (
        ts.isVariableDeclaration(node) && 
        ts.isIdentifier(node.name) && 
        node.initializer
      ) {
        const variableName = node.name.text;
        const initializer = node.initializer;
        
        // Check if it's a table definition (a call to pgTable, sqliteTable, etc.)
        if (ts.isCallExpression(initializer)) {
          const functionName = initializer.expression.getText(sourceFile);
          
          if (
            functionName === 'pgTable' ||
            functionName === 'mysqlTable' ||
            functionName === 'sqliteTable' ||
            functionName.endsWith('.table') ||
            functionName === 'createTable'
          ) {
            let sqlTableName: string | null = null;
            
            // Extract SQL table name if present
            if (
              initializer.arguments.length > 0 &&
              ts.isStringLiteral(initializer.arguments[0])
            ) {
              sqlTableName = initializer.arguments[0].text;
            }
            
            tables.push({
              variableName,
              tableName: sqlTableName,
              filePath: file
            });
          }
        }
      }
      
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
  }
  
  return tables;
}

// Main function to check for duplicate tables
function checkDuplicateTables(): void {
  const tables = findTableDefinitions();
  
  if (tables.length === 0) {
    return;
  }
  
  // Check for duplicate variable names
  const variableNameMap = new Map<string, TableDefinition[]>();
  for (const table of tables) {
    if (!variableNameMap.has(table.variableName)) {
      variableNameMap.set(table.variableName, []);
    }
    variableNameMap.get(table.variableName)!.push(table);
  }
  
  // Check for duplicate SQL table names
  const sqlTableNameMap = new Map<string, TableDefinition[]>();
  for (const table of tables) {
    if (table.tableName) {
      if (!sqlTableNameMap.has(table.tableName)) {
        sqlTableNameMap.set(table.tableName, []);
      }
      sqlTableNameMap.get(table.tableName)!.push(table);
    }
  }
  
  let hasDuplicates = false;
  
  // Report duplicate variable names
  for (const [name, definitions] of variableNameMap.entries()) {
    if (definitions.length > 1) {
      hasDuplicates = true;
      console.log(`⚠️  Duplicate variable name: '${name}'`);
      console.log('   Defined in:');
      definitions.forEach(def => {
        console.log(`   - ${path.relative(process.cwd(), def.filePath)}`);
      });
    }
  }
  
  // Report duplicate SQL table names
  for (const [name, definitions] of sqlTableNameMap.entries()) {
    if (definitions.length > 1) {
      hasDuplicates = true;
      console.log(`⚠️  Duplicate SQL table name: '${name}'`);
      console.log('   Defined as:');
      definitions.forEach(def => {
        console.log(`   - ${def.variableName} in ${path.relative(process.cwd(), def.filePath)}`);
      });
    }
  }
  
  if (hasDuplicates) {
    console.error('❌ Found duplicate table definitions. Remove duplicate tables. Don\'t rename them.');
    process.exit(1);
  }
  // No output if everything is fine - silently exit with code 0
}

// Run the script
checkDuplicateTables();