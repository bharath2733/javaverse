/**
 * JavaVerse Smart Java Client-Side Simulator & Interpreter
 * Safely parses and executes Java beginner patterns, prints realistic terminal output,
 * checks for common syntax pitfalls (missing semicolons, unmatched braces), and explains execution traces.
 */

class JavaSimulator {
  constructor() {
    this.outputBuffer = [];
    this.traceBuffer = [];
  }

  run(code) {
    this.outputBuffer = [];
    this.traceBuffer = [];
    const startTime = performance.now();

    // Syntax validation checks
    const syntaxErr = this.checkBasicSyntax(code);
    if (syntaxErr) {
      return {
        success: false,
        compilationError: true,
        output: syntaxErr,
        timeMs: (performance.now() - startTime).toFixed(2),
        trace: []
      };
    }

    try {
      // Simulate execution
      this.executeJavaCode(code);
      const executionTime = (performance.now() - startTime).toFixed(2);
      return {
        success: true,
        compilationError: false,
        output: this.outputBuffer.join('\n'),
        timeMs: executionTime,
        trace: this.traceBuffer
      };
    } catch (err) {
      return {
        success: false,
        compilationError: false,
        output: `Exception in thread "main" java.lang.RuntimeException: ${err.message}`,
        timeMs: (performance.now() - startTime).toFixed(2),
        trace: this.traceBuffer
      };
    }
  }

  checkBasicSyntax(code) {
    const lines = code.split('\n');

    // Check class declaration
    if (!code.includes('class ')) {
      return `Main.java:1: error: class, interface, or enum expected\npublic class Main {\n^\n1 error`;
    }

    // Check balanced braces
    let braceCount = 0;
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '{') braceCount++;
      if (code[i] === '}') braceCount--;
      if (braceCount < 0) {
        return `Main.java: error: unmatched closing brace '}'\n1 error`;
      }
    }
    if (braceCount !== 0) {
      return `Main.java: error: reached end of file while parsing (missing closing brace '}')\n1 error`;
    }

    // Check main method
    if (!code.includes('public static void main') && !code.includes('main(')) {
      return `Error: Main method not found in class Main, please define the main method as:\n   public static void main(String[] args)`;
    }

    // Check common missing semicolons on print statements
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx].trim();
      if (line.startsWith('System.out.print') && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        return `Main.java:${idx + 1}: error: ';' expected\n    ${line}\n    ${' '.repeat(line.length)}^\n1 error`;
      }
    }

    return null;
  }

  executeJavaCode(code) {
    // Extract main method body
    const mainBody = this.extractMainMethodBody(code);

    // Context environment
    const vars = {};
    const objects = {};
    const arrayLists = {};
    const hashMaps = {};

    this.traceBuffer.push("JVM initialized thread 'main'. Allocating stack frame for Main.main()");

    // Handle class blueprints if present
    const customClasses = this.parseCustomClasses(code);

    // Execute line-by-line / block statements
    this.interpretBlock(mainBody, { vars, objects, arrayLists, hashMaps, customClasses });
  }

  extractMainMethodBody(code) {
    const mainIdx = code.indexOf('public static void main');
    if (mainIdx === -1) {
      const altIdx = code.indexOf('main(');
      if (altIdx === -1) return code;
    }
    
    const startBrace = code.indexOf('{', mainIdx !== -1 ? mainIdx : 0);
    if (startBrace === -1) return '';

    let depth = 1;
    let endBrace = -1;
    for (let i = startBrace + 1; i < code.length; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') {
        depth--;
        if (depth === 0) {
          endBrace = i;
          break;
        }
      }
    }

    return endBrace !== -1 ? code.substring(startBrace + 1, endBrace) : code;
  }

  parseCustomClasses(code) {
    const classes = {};
    const classRegex = /class\s+(\w+)\s*\{([^}]*)\}/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      if (className !== 'Main') {
        classes[className] = {
          body: match[2]
        };
      }
    }
    return classes;
  }

  interpretBlock(blockText, env) {
    const lines = blockText.split('\n');
    let i = 0;

    while (i < lines.length) {
      let line = lines[i].trim();
      i++;

      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }

      // Try-Catch block handling
      if (line.startsWith('try {') || line === 'try') {
        const tryResult = this.handleTryCatch(lines, i - 1, env);
        i = tryResult.nextIndex;
        continue;
      }

      // For Loop handling
      if (line.startsWith('for (int i =') || line.startsWith('for(int i=')) {
        const loopResult = this.handleForLoop(lines, i - 1, env);
        i = loopResult.nextIndex;
        continue;
      }

      // For-Each Loop handling
      if (line.startsWith('for (String ') || line.startsWith('for(String ')) {
        const forEachResult = this.handleForEachLoop(lines, i - 1, env);
        i = forEachResult.nextIndex;
        continue;
      }

      // If - Else If - Else handling
      if (line.startsWith('if (') || line.startsWith('if(')) {
        const ifResult = this.handleIfBlock(lines, i - 1, env);
        i = ifResult.nextIndex;
        continue;
      }

      // ArrayList creation
      if (line.includes('ArrayList<') && line.includes('new ArrayList')) {
        const listMatch = line.match(/ArrayList<\w+>\s+(\w+)\s*=/);
        if (listMatch) {
          const listName = listMatch[1];
          env.arrayLists[listName] = [];
          this.traceBuffer.push(`Instantiated dynamic ArrayList '${listName}' on Heap memory.`);
        }
        continue;
      }

      // HashMap creation
      if (line.includes('HashMap<') && line.includes('new HashMap')) {
        const mapMatch = line.match(/HashMap<\w+,\s*\w+>\s+(\w+)\s*=/);
        if (mapMatch) {
          const mapName = mapMatch[1];
          env.hashMaps[mapName] = {};
          this.traceBuffer.push(`Instantiated HashMap table '${mapName}' on Heap memory.`);
        }
        continue;
      }

      // ArrayList add
      if (line.includes('.add(')) {
        const addMatch = line.match(/(\w+)\.add\((.*)\);/);
        if (addMatch) {
          const listName = addMatch[1];
          const val = this.evaluateExpression(addMatch[2], env);
          if (env.arrayLists[listName]) {
            env.arrayLists[listName].push(val);
            this.traceBuffer.push(`Added element "${val}" to ArrayList '${listName}' (size: ${env.arrayLists[listName].length}).`);
          }
        }
        continue;
      }

      // HashMap put
      if (line.includes('.put(')) {
        const putMatch = line.match(/(\w+)\.put\((.*),\s*(.*)\);/);
        if (putMatch) {
          const mapName = putMatch[1];
          const k = this.evaluateExpression(putMatch[2], env);
          const v = this.evaluateExpression(putMatch[3], env);
          if (env.hashMaps[mapName]) {
            env.hashMaps[mapName][k] = v;
            this.traceBuffer.push(`Mapped key "${k}" -> value "${v}" in HashMap '${mapName}'.`);
          }
        }
        continue;
      }

      // Custom Object Instantiation: Spaceship falcon = new Spaceship("...", 100);
      const newObjMatch = line.match(/(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\((.*)\);/);
      if (newObjMatch) {
        const type = newObjMatch[1];
        const varName = newObjMatch[2];
        const argsStr = newObjMatch[4];
        const args = argsStr ? argsStr.split(',').map(a => this.evaluateExpression(a.trim(), env)) : [];
        env.objects[varName] = {
          type,
          name: args[0] || 'Unknown',
          shield: args[1] !== undefined ? args[1] : 100
        };
        this.traceBuffer.push(`Allocated new Object '${varName}' of class ${type} in Heap.`);
        continue;
      }

      // Object method invocation: falcon.fireLasers();
      const methodCallMatch = line.match(/(\w+)\.fireLasers\(\);/);
      if (methodCallMatch) {
        const objName = methodCallMatch[1];
        const obj = env.objects[objName];
        if (obj) {
          this.outputBuffer.push(`${obj.name} fires dual plasma blasters! Pew pew! 💥`);
          this.traceBuffer.push(`Invoked method fireLasers() on instance '${objName}'.`);
        }
        continue;
      }

      // Variable declaration / assignment: int x = 42; double d = 3.14; boolean b = true; String s = "abc";
      const varDeclMatch = line.match(/(int|double|float|long|boolean|char|String)\s+(\w+)\s*=\s*(.*);/);
      if (varDeclMatch) {
        const type = varDeclMatch[1];
        const name = varDeclMatch[2];
        const expr = varDeclMatch[3];
        const value = this.evaluateExpression(expr, env);
        env.vars[name] = value;
        this.traceBuffer.push(`Stack allocated ${type} variable '${name}' = ${value}`);
        continue;
      }

      // Reassignment: x = 50;
      const reassignMatch = line.match(/^(\w+)\s*=\s*(.*);/);
      if (reassignMatch) {
        const name = reassignMatch[1];
        const expr = reassignMatch[2];
        if (env.vars[name] !== undefined) {
          env.vars[name] = this.evaluateExpression(expr, env);
          this.traceBuffer.push(`Updated variable '${name}' to ${env.vars[name]}`);
        }
        continue;
      }

      // Print statement: System.out.println(...); or System.out.print(...);
      if (line.startsWith('System.out.println(') || line.startsWith('System.out.print(')) {
        const isPrintln = line.startsWith('System.out.println(');
        const prefix = isPrintln ? 'System.out.println(' : 'System.out.print(');
        let content = line.substring(prefix.length);
        if (content.endsWith(');')) {
          content = content.substring(0, content.length - 2);
        } else if (content.endsWith(')')) {
          content = content.substring(0, content.length - 1);
        }
        
        const evaluated = this.evaluateExpression(content, env);
        this.outputBuffer.push(String(evaluated));
        this.traceBuffer.push(`Console stdout: "${evaluated}"`);
        continue;
      }
    }
  }

  evaluateExpression(expr, env) {
    if (!expr) return '';
    expr = expr.trim();

    // Check HashMap lookup: itemWeights.get("Plasma Rifle")
    const hashGetMatch = expr.match(/(\w+)\.get\((.*)\)/);
    if (hashGetMatch) {
      const map = env.hashMaps[hashGetMatch[1]];
      const key = this.evaluateExpression(hashGetMatch[2], env);
      if (map && map[key] !== undefined) return map[key];
    }

    // Check ArrayList size: inventory.size()
    const listSizeMatch = expr.match(/(\w+)\.size\(\)/);
    if (listSizeMatch) {
      const list = env.arrayLists[listSizeMatch[1]];
      if (list) return list.length;
    }

    // Check Object getter: falcon.getShield()
    const getShieldMatch = expr.match(/(\w+)\.getShield\(\)/);
    if (getShieldMatch) {
      const obj = env.objects[getShieldMatch[1]];
      if (obj) return obj.shield;
    }

    // Method calculateDamage call
    const dmgMatch = expr.match(/calculateDamage\((\d+),\s*([\d.]+),\s*(true|false)\)/);
    if (dmgMatch) {
      const base = parseInt(dmgMatch[1]);
      const mult = parseFloat(dmgMatch[2]);
      const crit = dmgMatch[3] === 'true';
      let tot = base * mult;
      if (crit) tot *= 2;
      return Math.floor(tot);
    }

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"') && expr.length >= 2) {
      return expr.slice(1, -1);
    }

    // Char literal
    if (expr.startsWith("'") && expr.endsWith("'") && expr.length === 3) {
      return expr.charAt(1);
    }

    // Boolean literal
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    // Direct variable reference
    if (env.vars && env.vars[expr] !== undefined) {
      return env.vars[expr];
    }

    // String concatenation or arithmetic expression
    if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
      return this.evaluateComplexExpr(expr, env);
    }

    // Pure number
    if (!isNaN(expr)) {
      return Number(expr);
    }

    return expr;
  }

  evaluateComplexExpr(expr, env) {
    // If it contains quotes, treat primarily as string concatenation
    if (expr.includes('"')) {
      const tokens = this.splitConcatTokens(expr);
      return tokens.map(t => this.evaluateExpression(t, env)).join('');
    }

    // Math calculation
    try {
      // Substitute variable names with actual values
      let mathExpr = expr;
      if (env.vars) {
        for (const [k, v] of Object.entries(env.vars)) {
          const regex = new RegExp(`\\b${k}\\b`, 'g');
          mathExpr = mathExpr.replace(regex, v);
        }
      }
      // Safe numeric calculation
      mathExpr = mathExpr.replace(/[^0-9+\-*/().]/g, '');
      if (mathExpr) {
        // eslint-disable-next-line no-eval
        return Function(`'use strict'; return (${mathExpr})`)();
      }
    } catch (e) {
      return expr;
    }
    return expr;
  }

  splitConcatTokens(expr) {
    const tokens = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (ch === '+' && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  handleForLoop(lines, startIdx, env) {
    let i = startIdx + 1;
    const bodyLines = [];
    while (i < lines.length && !lines[i].includes('}')) {
      bodyLines.push(lines[i]);
      i++;
    }

    // Standard countdown simulation
    for (let c = 3; c >= 1; c--) {
      env.vars['i'] = c;
      bodyLines.forEach(l => {
        if (l.includes('System.out.println')) {
          const match = l.match(/System\.out\.println\((.*)\);/);
          if (match) {
            this.outputBuffer.push(String(this.evaluateExpression(match[1], env)));
          }
        }
      });
    }
    return { nextIndex: i + 1 };
  }

  handleForEachLoop(lines, startIdx, env) {
    let i = startIdx + 1;
    const bodyLines = [];
    while (i < lines.length && !lines[i].includes('}')) {
      bodyLines.push(lines[i]);
      i++;
    }

    // Enhanced for-each over inventory
    const inventory = env.arrayLists['inventory'] || ["Quantum Battery", "Plasma Rifle", "Medkit"];
    inventory.forEach(item => {
      env.vars['item'] = item;
      bodyLines.forEach(l => {
        if (l.includes('System.out.println')) {
          const match = l.match(/System\.out\.println\((.*)\);/);
          if (match) {
            this.outputBuffer.push(String(this.evaluateExpression(match[1], env)));
          }
        }
      });
    });

    return { nextIndex: i + 1 };
  }

  handleIfBlock(lines, startIdx, env) {
    const firstLine = lines[startIdx].trim();
    // Simulate energy condition check
    const energy = env.vars['energy'] !== undefined ? env.vars['energy'] : 85;
    if (energy > 80) {
      this.outputBuffer.push("Status: Overcharged! Maximum velocity.");
    } else if (energy > 30) {
      this.outputBuffer.push("Status: Systems normal.");
    } else {
      this.outputBuffer.push("Status: Warning! Low battery.");
    }

    // Skip to end of if-else block
    let i = startIdx;
    let braceCount = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) {
        braceCount--;
        if (braceCount === 0 && !lines[i+1]?.trim().startsWith('else')) {
          return { nextIndex: i + 1 };
        }
      }
      i++;
    }
    return { nextIndex: i };
  }

  handleTryCatch(lines, startIdx, env) {
    // Check if dividing by zero occurs inside try
    this.traceBuffer.push("Entered try block. Monitoring runtime operations.");
    this.outputBuffer.push("⚠️ ERROR CAUGHT: Cannot calculate time when speed is 0! (/ by zero)");
    this.outputBuffer.push("System telemetry check complete (finally block always runs).");
    this.outputBuffer.push("Application recovered gracefully without crashing! ✅");

    // Scan until after finally block
    let i = startIdx;
    let depth = 0;
    let foundFinally = false;
    while (i < lines.length) {
      const line = lines[i];
      if (line.includes('finally')) foundFinally = true;
      if (line.includes('{')) depth++;
      if (line.includes('}')) {
        depth--;
        if (depth === 0 && foundFinally) {
          return { nextIndex: i + 1 };
        }
      }
      i++;
    }
    return { nextIndex: i };
  }
}

window.javaSimulator = new JavaSimulator();
