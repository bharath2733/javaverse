/**
 * JavaVerse 3D - Comprehensive Beginner Java Curriculum
 * Each chapter is crafted specifically for beginner understanding with visual analogies,
 * runnable code, line-by-line breakdown, and 5 interactive quiz challenges.
 */

window.JAVA_CURRICULUM = [
  {
    id: "ch1-jvm",
    num: "01",
    title: "Java Fundamentals & The JVM",
    tag: "Origins & Architecture",
    icon: "☕",
    accent: "#00f0ff",
    summary: "Understand how Java achieves 'Write Once, Run Anywhere' (WORA) through Bytecode and the Java Virtual Machine (JVM).",
    codeSample: `// Welcome to Java!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, JavaVerse! 🚀");
        System.out.println("Java runs on over 60 billion devices.");
    }
}`,
    explanation: [
      { line: "public class Main", meaning: "Declares a blueprint named 'Main'. In Java, every line of code lives inside a class." },
      { line: "public static void main(String[] args)", meaning: "The universal entry point of any Java program where the JVM starts execution." },
      { line: "public", meaning: "Access modifier - anyone (including the JVM) can call this method." },
      { line: "static", meaning: "Can be executed without creating an instance/object of the class first." },
      { line: "void", meaning: "The method returns no value when it finishes." },
      { line: "System.out.println(...)", meaning: "Outputs the text to the terminal and starts a new line." }
    ],
    htmlContent: `
      <h2>The Core Philosophy: "Write Once, Run Anywhere"</h2>
      <p>Created by James Gosling at Sun Microsystems in 1995 (now maintained by Oracle), Java revolutionized computing by introducing a virtual layer between human code and computer hardware.</p>
      
      <div class="concept-callout tip">
        <div class="callout-title">💡 The 3 Pillars of Java Execution</div>
        <ul>
          <li><strong>JDK (Java Development Kit):</strong> The complete toolbox for programmers. Contains the compiler (<code>javac</code>), debugger, and documentation.</li>
          <li><strong>JRE (Java Runtime Environment):</strong> The minimum runtime needed to run existing compiled Java applications. Contains standard libraries and the JVM.</li>
          <li><strong>JVM (Java Virtual Machine):</strong> The engine that actually executes your compiled bytecode on your specific operating system (Windows, Mac, Linux).</li>
        </ul>
      </div>

      <h2>How Your Code Runs: From .java to Execution</h2>
      <ol>
        <li><strong>Step 1: Writing Code:</strong> You write human-readable code in a file ending in <code>.java</code> (e.g., <code>Main.java</code>).</li>
        <li><strong>Step 2: Compilation:</strong> The Java compiler (<code>javac Main.java</code>) translates your code into platform-independent intermediate instructions called <strong>Bytecode</strong> (<code>Main.class</code>).</li>
        <li><strong>Step 3: JVM Execution:</strong> The JVM on your machine loads the bytecode, verifies security, and uses the <strong>JIT (Just-In-Time) Compiler</strong> to translate bytecode into lightning-fast native CPU machine code!</li>
      </ol>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title"><div class="code-title-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></div> Main.java</div>
          <div class="code-actions">
            <button class="code-btn" onclick="window.App.loadChapterIntoPlayground('ch1-jvm')">▶ Open in Playground</button>
          </div>
        </div>
        <pre class="code-content"><span class="kw">public class</span> Main {
    <span class="kw">public static void</span> <span class="fn">main</span>(<span class="typ">String</span>[] args) {
        <span class="typ">System</span>.out.<span class="fn">println</span>(<span class="str">"Hello, JavaVerse! 🚀"</span>);
        <span class="typ">System</span>.out.<span class="fn">println</span>(<span class="str">"Java runs on over 60 billion devices."</span>);
    }
}</pre>
      </div>

      <h2>Dissecting <code>public static void main(String[] args)</code></h2>
      <p>This legendary signature looks intimidating to beginners, but every word has a vital purpose:</p>
      <ul>
        <li><strong>public:</strong> Allows the JVM to invoke this method from outside the class.</li>
        <li><strong>static:</strong> The JVM does not need to instantiate an object of your class to start your program.</li>
        <li><strong>void:</strong> The main method does not return any data back to the operating system.</li>
        <li><strong>main:</strong> The reserved identifier recognized by the JVM as the launching point.</li>
        <li><strong>String[] args:</strong> An array of text arguments passed from the command line when starting the application.</li>
      </ul>
    `,
    quizzes: [
      {
        question: "1. Which component of the Java ecosystem is responsible for converting Java source code (.java) into platform-independent bytecode (.class)?",
        options: [
          "The JVM (Java Virtual Machine)",
          "The Java Compiler (javac)",
          "The Garbage Collector (GC)",
          "The ClassLoader"
        ],
        correctIndex: 1,
        explanation: "The Java Compiler (javac) compiles human-readable .java source code into bytecode (.class files), which the JVM then executes."
      },
      {
        question: "2. What does Java's famous architectural slogan 'WORA' stand for?",
        options: [
          "Write Once, Run Anywhere",
          "Web Oriented Responsive Application",
          "Windows Only Rapid Architecture",
          "Workflow Operations Runtime Array"
        ],
        correctIndex: 0,
        explanation: "'Write Once, Run Anywhere' means bytecode compiled on one OS can run on any other operating system that has a JVM installed."
      },
      {
        question: "3. Which critical tool is present inside the JDK (Java Development Kit), but omitted from a plain JRE?",
        options: [
          "The Java Runtime Libraries",
          "The Java Virtual Machine (JVM)",
          "The Java Compiler (javac)",
          "The System.out print stream"
        ],
        correctIndex: 2,
        explanation: "The JRE is only for running compiled programs; developers need the JDK because it contains the compiler ('javac') and debugging tools."
      },
      {
        question: "4. Why is the 'main' entry method in Java declared with the 'static' keyword?",
        options: [
          "To prevent the method from being modified at runtime",
          "So the JVM can call the method without creating an instance/object of the class first",
          "Because static methods run faster than normal methods",
          "To allow the method to accept multiple return types"
        ],
        correctIndex: 1,
        explanation: "The 'static' keyword allows the JVM to invoke Main.main() directly upon startup without needing to instantiate an object."
      },
      {
        question: "5. What is the role of the JIT (Just-In-Time) compiler inside the JVM?",
        options: [
          "It formats source code indentations before compilation",
          "It deletes unreferenced objects from RAM memory",
          "It compiles frequently executed bytecode into native CPU machine code at runtime",
          "It sends error logs to Oracle telemetry"
        ],
        correctIndex: 2,
        explanation: "The JIT compiler analyzes running bytecode, identifies hotspots, and translates them into native CPU instructions for maximum performance."
      }
    ]
  },
  {
    id: "ch2-variables",
    num: "02",
    title: "Variables & Data Types",
    tag: "Memory & Storage",
    icon: "📦",
    accent: "#ff9d00",
    summary: "Discover Java's 8 primitive data types, reference types, type casting, and how values are safely held in memory.",
    codeSample: `public class Main {
    public static void main(String[] args) {
        // Primitive Data Types
        int playerLevel = 42;
        double healthPercent = 98.5;
        char rankTier = 'S';
        boolean isShieldActive = true;

        // Reference Data Type
        String playerName = "Kaelen";

        System.out.println("Player: " + playerName + " (Rank " + rankTier + ")");
        System.out.println("Level: " + playerLevel + " | HP: " + healthPercent + "%");
        System.out.println("Shield Online: " + isShieldActive);
    }
}`,
    explanation: [
      { line: "int playerLevel = 42;", meaning: "Stores an integer (whole number, 32-bit: -2B to +2B) directly in stack memory." },
      { line: "double healthPercent = 98.5;", meaning: "Stores a 64-bit double precision floating-point decimal." },
      { line: "char rankTier = 'S';", meaning: "Stores a single 16-bit Unicode character enclosed in single quotes." },
      { line: "boolean isShieldActive = true;", meaning: "Stores true or false." },
      { line: "String playerName = 'Kaelen';", meaning: "A Reference Type: points to a String object stored in the Heap String Pool." }
    ],
    htmlContent: `
      <h2>Statically Typed Powerhouse</h2>
      <p>Java is a <strong>statically typed</strong> language. This means every variable must declare its type at compile time. This prevents sneaky bugs before your code ever runs!</p>
      
      <h2>The 8 Primitive Data Types in Java</h2>
      <p>Primitives store their raw values directly on the <strong>Stack</strong> memory, making them blazing fast:</p>

      <div style="overflow-x:auto; margin: 1.5rem 0;">
        <table style="width:100%; border-collapse:collapse; background:rgba(0,0,0,0.3); border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:rgba(255,255,255,0.08); text-align:left;">
              <th style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.1);">Type</th>
              <th style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.1);">Size</th>
              <th style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.1);">Value Range</th>
              <th style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.1);">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding:8px 14px; color:#38bdf8;">byte</td><td style="padding:8px 14px;">1 byte (8 bits)</td><td style="padding:8px 14px;">-128 to 127</td><td style="padding:8px 14px;"><code>byte b = 100;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">short</td><td style="padding:8px 14px;">2 bytes</td><td style="padding:8px 14px;">-32,768 to 32,767</td><td style="padding:8px 14px;"><code>short s = 5000;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">int</td><td style="padding:8px 14px;">4 bytes</td><td style="padding:8px 14px;">-2.14B to 2.14B</td><td style="padding:8px 14px;"><code>int score = 42000;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">long</td><td style="padding:8px 14px;">8 bytes</td><td style="padding:8px 14px;">-9 quintillion to +9 quintillion</td><td style="padding:8px 14px;"><code>long stars = 9999999999L;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">float</td><td style="padding:8px 14px;">4 bytes</td><td style="padding:8px 14px;">6-7 decimal digits</td><td style="padding:8px 14px;"><code>float temp = 36.6f;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">double</td><td style="padding:8px 14px;">8 bytes</td><td style="padding:8px 14px;">15 decimal digits (standard)</td><td style="padding:8px 14px;"><code>double pi = 3.14159265;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">boolean</td><td style="padding:8px 14px;">1 bit</td><td style="padding:8px 14px;">true or false</td><td style="padding:8px 14px;"><code>boolean alive = true;</code></td></tr>
            <tr><td style="padding:8px 14px; color:#38bdf8;">char</td><td style="padding:8px 14px;">2 bytes</td><td style="padding:8px 14px;">Single Unicode character</td><td style="padding:8px 14px;"><code>char grade = 'A';</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2>Primitives vs. Reference Types</h2>
      <p>Notice that <code>String</code> is capitalized! That's because <strong>String is NOT a primitive</strong>; it is a Reference class. Primitives hold the literal value directly in the Stack. Reference variables hold the <em>memory address pointer</em> pointing to the object on the Heap!</p>
      
      <div class="concept-callout warning">
        <div class="callout-title">⚠️ Common Beginner Gotcha: String Comparison</div>
        <p>Never compare Strings using <code>==</code>! In Java, <code>==</code> compares memory addresses. Always use <code>str1.equals(str2)</code> to compare the actual text content.</p>
      </div>
    `,
    quizzes: [
      {
        question: "1. Which of the following data types in Java is a Reference type rather than a primitive?",
        options: [
          "boolean",
          "int",
          "String",
          "double"
        ],
        correctIndex: 2,
        explanation: "String is a Class (Reference type) in java.lang, whereas boolean, int, and double are built-in primitive data types."
      },
      {
        question: "2. How many bytes of memory does an 'int' primitive occupy in Java?",
        options: [
          "2 bytes (16 bits)",
          "4 bytes (32 bits)",
          "8 bytes (64 bits)",
          "1 byte (8 bits)"
        ],
        correctIndex: 1,
        explanation: "An int is a 32-bit signed two's complement integer, which takes up exactly 4 bytes of memory."
      },
      {
        question: "3. Why does the statement 'float f = 3.14;' fail to compile in Java?",
        options: [
          "Float variables can only store whole numbers",
          "Floating-point literals are treated as double by default and need an 'f' suffix (3.14f)",
          "The variable name 'f' is a reserved Java keyword",
          "Float requires using single quotes like '3.14'"
        ],
        correctIndex: 1,
        explanation: "In Java, any decimal literal like 3.14 is automatically a 64-bit double. To assign it to a 32-bit float, you must add 'f' or 'F' (3.14f)."
      },
      {
        question: "4. What is the correct way to compare the text content of two String variables in Java?",
        options: [
          "str1 == str2",
          "str1.equals(str2)",
          "str1 === str2",
          "str1 = str2"
        ],
        correctIndex: 1,
        explanation: "In Java, '==' compares object memory addresses. To check if the text contents match, always use the .equals() method."
      },
      {
        question: "5. In Java's memory architecture, where are primitive local variables stored?",
        options: [
          "Directly in Stack memory",
          "In the Garbage Collection Heap",
          "In the Metaspace",
          "On the physical hard drive"
        ],
        correctIndex: 0,
        explanation: "Local primitive variables live directly inside the active Stack frame of the executing method for ultra-fast access."
      }
    ]
  },
  {
    id: "ch3-control-flow",
    num: "03",
    title: "Control Flow & Logic",
    tag: "Decisions & Loops",
    icon: "🔀",
    accent: "#9d4edd",
    summary: "Master decision trees with if-else, switch expressions, while loops, for loops, and iteration patterns.",
    codeSample: `public class Main {
    public static void main(String[] args) {
        int energy = 85;

        // If-Else Decision
        if (energy > 80) {
            System.out.println("Status: Overcharged! Maximum velocity.");
        } else if (energy > 30) {
            System.out.println("Status: Systems normal.");
        } else {
            System.out.println("Status: Warning! Low battery.");
        }

        // For Loop: Count down
        System.out.println("--- Thruster Ignition Sequence ---");
        for (int i = 3; i >= 1; i--) {
            System.out.println("T-minus " + i + " seconds...");
        }
        System.out.println("Liftoff! 🚀");
    }
}`,
    explanation: [
      { line: "if (energy > 80)", meaning: "Evaluates boolean expression. If true, enters block and skips remaining else blocks." },
      { line: "for (int i = 3; i >= 1; i--)", meaning: "Loop counter initialization, termination condition, and decrement step." }
    ],
    htmlContent: `
      <h2>Directing the Flow of Execution</h2>
      <p>By default, Java reads code sequentially from top to bottom. Control flow structures let you branch into different paths or repeat actions until conditions are met.</p>

      <h3>1. Conditional Statements (if, else if, else)</h3>
      <p>Use boolean operators (<code>&&</code> AND, <code>||</code> OR, <code>!</code> NOT) to build complex logical decisions.</p>

      <h3>2. The Modern Switch Statement</h3>
      <p>Modern Java introduces concise arrow switch syntax that doesn't need cumbersome <code>break;</code> statements:</p>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title"><div class="code-title-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></div> SwitchExample.java</div>
        </div>
        <pre class="code-content"><span class="typ">String</span> command = <span class="str">"WARP"</span>;
<span class="typ">String</span> action = <span class="kw">switch</span> (command) {
    <span class="kw">case</span> <span class="str">"WARP"</span> -> <span class="str">"Engaging hyperdrive!"</span>;
    <span class="kw">case</span> <span class="str">"SHIELD"</span> -> <span class="str">"Deflectors raised to 100%."</span>;
    <span class="kw">default</span> -> <span class="str">"Command unrecognized."</span>;
};
<span class="typ">System</span>.out.<span class="fn">println</span>(action);</pre>
      </div>

      <h3>3. Loops (for, while, do-while, for-each)</h3>
      <ul>
        <li><strong>for loop:</strong> Best when you know in advance how many times to repeat.</li>
        <li><strong>while loop:</strong> Repeats as long as a condition holds true (evaluated before entry).</li>
        <li><strong>do-while loop:</strong> Guaranteed to execute at least once before checking condition.</li>
        <li><strong>enhanced for-each:</strong> Clean syntax to traverse arrays and collections without index counters.</li>
      </ul>
    `,
    quizzes: [
      {
        question: "1. How many times will a 'do-while' loop execute if its condition is false right from the start?",
        options: [
          "0 times",
          "Exactly 1 time",
          "Infinite times",
          "Causes a compilation error"
        ],
        correctIndex: 1,
        explanation: "A do-while loop always executes its body block first before checking the condition at the bottom, guaranteeing at least one execution."
      },
      {
        question: "2. What happens in a traditional switch statement if you omit the 'break;' statement at the end of a case block?",
        options: [
          "The program throws a MissingBreakException",
          "Execution immediately stops and exits the program",
          "Execution falls through and continues into subsequent case blocks",
          "The compiler refuses to compile the code"
        ],
        correctIndex: 2,
        explanation: "Without a break statement, Java 'falls through' to the next case and executes its code regardless of whether that case condition matched."
      },
      {
        question: "3. What is the evaluated result of the boolean expression: (true && false) || (!false)?",
        options: [
          "false",
          "true",
          "null",
          "Causes a runtime error"
        ],
        correctIndex: 1,
        explanation: "(true && false) evaluates to false. !false evaluates to true. Then false || true results in true."
      },
      {
        question: "4. What does the 'continue' keyword do inside a loop body?",
        options: [
          "Exits the loop entirely",
          "Skips the rest of the current iteration and jumps immediately to the next cycle",
          "Restarts the entire loop from index 0",
          "Pauses execution for 1 second"
        ],
        correctIndex: 1,
        explanation: "The 'continue' statement stops the current iteration and advances the loop counter to the next iteration."
      },
      {
        question: "5. Which loop syntax is best suited when iterating over every element in an array without needing an index counter?",
        options: [
          "while (arr.hasNext())",
          "for (String item : items)",
          "loop (items.length)",
          "repeat-until (items)"
        ],
        correctIndex: 1,
        explanation: "The enhanced for-each loop (for (Type var : array)) cleanly traverses elements sequentially without manual index variables."
      }
    ]
  },
  {
    id: "ch4-methods",
    num: "04",
    title: "Methods & Modular Code",
    tag: "Functions & Parameters",
    icon: "⚡",
    accent: "#00ffa3",
    summary: "Write reusable functions, pass parameters, return calculated results, and explore method overloading.",
    codeSample: `public class Main {
    // A reusable method to calculate damage
    public static int calculateDamage(int baseAttack, double multiplier, boolean isCritical) {
        double total = baseAttack * multiplier;
        if (isCritical) {
            total = total * 2.0; // 200% critical hit!
        }
        return (int) total;
    }

    public static void main(String[] args) {
        int normalHit = calculateDamage(50, 1.2, false);
        int critHit = calculateDamage(50, 1.2, true);

        System.out.println("Normal strike: " + normalHit + " DMG");
        System.out.println("Critical strike: " + critHit + " DMG!");
    }
}`,
    explanation: [
      { line: "public static int calculateDamage(...)", meaning: "Defines a method that takes 3 arguments and returns an int." },
      { line: "return (int) total;", meaning: "Converts double to int and sends the calculated result back to caller." }
    ],
    htmlContent: `
      <h2>DRY Principle: Don't Repeat Yourself</h2>
      <p>Methods are isolated blocks of code that perform a specific task. They take inputs (arguments), process them, and optionally return an output.</p>
      
      <div class="concept-callout tip">
        <div class="callout-title">💎 Anatomy of a Method Signature</div>
        <p><code>[Access Modifier] [static] [Return Type] [MethodName]([Parameters]) { ... }</code></p>
      </div>

      <h2>Method Overloading</h2>
      <p>Java allows multiple methods in the same class to have the <strong>exact same name</strong>, as long as their parameter lists differ in type, count, or order! The compiler determines which method to call automatically based on the arguments passed.</p>

      <div class="code-container">
        <div class="code-header"><div class="code-title"><div class="code-title-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></div> OverloadDemo.java</div></div>
        <pre class="code-content"><span class="kw">public static int</span> <span class="fn">add</span>(<span class="typ">int</span> a, <span class="typ">int</span> b) {
    <span class="kw">return</span> a + b;
}

<span class="kw">public static double</span> <span class="fn">add</span>(<span class="typ">double</span> a, <span class="typ">double</span> b) {
    <span class="kw">return</span> a + b;
}

<span class="kw">public static int</span> <span class="fn">add</span>(<span class="typ">int</span> a, <span class="typ">int</span> b, <span class="typ">int</span> c) {
    <span class="kw">return</span> a + b + c;
}</pre>
      </div>
    `,
    quizzes: [
      {
        question: "1. Which criteria is REQUIRED for valid method overloading in Java?",
        options: [
          "The methods must have different return types only",
          "The parameter lists (count, types, or order) must be different",
          "The method names must have different capitalizations",
          "The methods must use different access modifiers (public vs private)"
        ],
        correctIndex: 1,
        explanation: "Java determines which overloaded method to invoke based solely on the argument parameter list (number, types, order). Changing return type alone is not valid overloading."
      },
      {
        question: "2. What does the 'void' keyword in a method signature indicate?",
        options: [
          "The method accepts no parameters",
          "The method does not return any value",
          "The method cannot be accessed outside its package",
          "The method is stored in empty memory"
        ],
        correctIndex: 1,
        explanation: "Void indicates that when the method completes execution, it produces no return value to the caller."
      },
      {
        question: "3. How does Java pass arguments into methods?",
        options: [
          "Always strictly Pass-By-Value",
          "Always strictly Pass-By-Reference",
          "Pass-by-value for primitives, and pass-by-reference for objects",
          "It depends on whether the method is static"
        ],
        correctIndex: 0,
        explanation: "Java is strictly pass-by-value. For primitives, the value itself is copied. For objects, the memory reference address is copied by value."
      },
      {
        question: "4. What critical component must EVERY recursive method contain to avoid a StackOverflowError?",
        options: [
          "A static counter variable",
          "A Base Case (termination condition)",
          "A while loop inside the body",
          "A try-catch exception block"
        ],
        correctIndex: 1,
        explanation: "A base case specifies the condition under which the method stops calling itself, preventing an infinite recursion loop."
      },
      {
        question: "5. Can a 'static' method directly access a non-static instance field of the class?",
        options: [
          "Yes, static methods can access any field freely",
          "No, because static methods exist without an instance and lack an implicit 'this' reference",
          "Only if the field is marked public",
          "Only inside the main method"
        ],
        correctIndex: 1,
        explanation: "Non-static fields belong to specific object instances. A static method belongs to the class itself and has no 'this' object unless explicitly passed."
      }
    ]
  },
  {
    id: "ch5-oop",
    num: "05",
    title: "Object-Oriented Programming (OOP)",
    tag: "The 4 Pillars",
    icon: "🏛️",
    accent: "#ff3366",
    summary: "Master Classes, Objects, Encapsulation, Inheritance, Polymorphism, and Abstraction — the true superpowers of Java.",
    codeSample: `// Class Blueprint
class Spaceship {
    // Encapsulated Fields (Private for security)
    private String name;
    private int shield;

    // Constructor
    public Spaceship(String name, int shield) {
        this.name = name;
        this.shield = shield;
    }

    // Method
    public void fireLasers() {
        System.out.println(name + " fires dual plasma blasters! Pew pew! 💥");
    }

    // Getter
    public int getShield() {
        return this.shield;
    }
}

public class Main {
    public static void main(String[] args) {
        // Instantiating Objects in Heap Memory
        Spaceship falcon = new Spaceship("Millennium Voyager", 100);
        falcon.fireLasers();
        System.out.println("Shields at: " + falcon.getShield() + "%");
    }
}`,
    explanation: [
      { line: "class Spaceship", meaning: "A blueprint or template defining the state (fields) and behavior (methods)." },
      { line: "private String name;", meaning: "Encapsulation: fields cannot be directly modified outside the class." },
      { line: "public Spaceship(...)", meaning: "Constructor: called with the 'new' keyword to initialize object memory." },
      { line: "new Spaceship(...)", meaning: "Allocates memory on the Heap and returns the reference address to the stack variable 'falcon'." }
    ],
    htmlContent: `
      <h2>Classes vs. Objects</h2>
      <p>Think of a <strong>Class</strong> as the architectural blueprint for a car. An <strong>Object</strong> is the actual physical car built from that blueprint sitting in your garage. You can build 1,000 different cars from one single blueprint!</p>

      <h2>The 4 Pillars of OOP</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin:1.5rem 0;">
        <div style="background:rgba(255,255,255,0.04); padding:1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
          <h4 style="color:#00f0ff; margin-bottom:0.4rem;">1. Encapsulation</h4>
          <p style="font-size:0.9rem; color:#cbd5e1;">Bundling data (fields) and methods into a single unit, hiding internal state with <code>private</code> and offering controlled access via Getters and Setters.</p>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
          <h4 style="color:#ff9d00; margin-bottom:0.4rem;">2. Inheritance</h4>
          <p style="font-size:0.9rem; color:#cbd5e1;">Reusing code by letting a child class inherit properties and behaviors from a parent class using the <code>extends</code> keyword.</p>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
          <h4 style="color:#00ffa3; margin-bottom:0.4rem;">3. Polymorphism</h4>
          <p style="font-size:0.9rem; color:#cbd5e1;">"Many forms". Allows child classes to provide specific implementations of parent methods using <code>@Override</code>, called dynamically at runtime.</p>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
          <h4 style="color:#ff3366; margin-bottom:0.4rem;">4. Abstraction</h4>
          <p style="font-size:0.9rem; color:#cbd5e1;">Hiding complex implementation details and showing only essential features using <code>interface</code> and <code>abstract class</code>.</p>
        </div>
      </div>
    `,
    quizzes: [
      {
        question: "1. Which keyword is used in Java to make a child class inherit from a parent class?",
        options: [
          "implements",
          "inherits",
          "extends",
          "super"
        ],
        correctIndex: 2,
        explanation: "In Java, the 'extends' keyword is used to establish class inheritance (e.g., 'class Dog extends Animal'). 'implements' is used for interfaces."
      },
      {
        question: "2. Which OOP pillar involves making instance variables 'private' and providing controlled access via getters and setters?",
        options: [
          "Encapsulation",
          "Polymorphism",
          "Compilation",
          "Recursion"
        ],
        correctIndex: 0,
        explanation: "Encapsulation protects the internal state of an object by restricting direct variable access and enforcing validation via methods."
      },
      {
        question: "3. What does the '@Override' annotation signify when placed above a method in a child class?",
        options: [
          "It marks the method as private",
          "It tells the compiler that the method replaces an inherited parent class method",
          "It prevents other classes from calling the method",
          "It allocates new memory on the heap"
        ],
        correctIndex: 1,
        explanation: "The @Override annotation provides a compile-time check ensuring that the child method correctly matches the signature of a parent method."
      },
      {
        question: "4. Can you directly instantiate an abstract class using the 'new' keyword (e.g. 'new Animal()')?",
        options: [
          "Yes, abstract classes can be instantiated like any normal class",
          "No, abstract classes cannot be instantiated directly and must be subclassed",
          "Only if the abstract class has no abstract methods",
          "Only inside the main method"
        ],
        correctIndex: 1,
        explanation: "An abstract class serves as a conceptual blueprint and cannot be instantiated directly with 'new'."
      },
      {
        question: "5. Which keyword is used by a class to declare that it agrees to fulfill the contract of an interface?",
        options: [
          "extends",
          "implements",
          "inherits",
          "interface"
        ],
        correctIndex: 1,
        explanation: "A class uses the 'implements' keyword to adopt an interface (e.g., 'class Car implements Drivable')."
      }
    ]
  },
  {
    id: "ch6-collections",
    num: "06",
    title: "Arrays & The Collections Framework",
    tag: "Data Structures",
    icon: "📚",
    accent: "#38bdf8",
    summary: "Work with fixed-size arrays, dynamic ArrayLists, key-value HashMaps, and discover how to organize data efficiently.",
    codeSample: `import java.util.ArrayList;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        // Dynamic ArrayList (auto-resizes as items are added!)
        ArrayList<String> inventory = new ArrayList<>();
        inventory.add("Quantum Battery");
        inventory.add("Plasma Rifle");
        inventory.add("Medkit");

        System.out.println("Inventory Items (" + inventory.size() + "):");
        for (String item : inventory) {
            System.out.println(" - " + item);
        }

        // Key-Value HashMap (O(1) instant lookup!)
        HashMap<String, Integer> itemWeights = new HashMap<>();
        itemWeights.put("Quantum Battery", 5);
        itemWeights.put("Plasma Rifle", 12);
        itemWeights.put("Medkit", 2);

        System.out.println("Rifle Weight: " + itemWeights.get("Plasma Rifle") + " kg");
    }
}`,
    explanation: [
      { line: "ArrayList<String> inventory = new ArrayList<>()", meaning: "Creates a dynamic list holding String objects. Unlike basic arrays, its capacity grows dynamically." },
      { line: "HashMap<String, Integer>", meaning: "Stores key-value mappings. Allows looking up any value by its unique key in O(1) average time." }
    ],
    htmlContent: `
      <h2>Beyond Fixed-Size Arrays</h2>
      <p>Basic Java arrays (like <code>int[] scores = new int[5];</code>) have a fixed length established at creation time. The <strong>Java Collections Framework (JCF)</strong> provides dynamic, flexible data structures ready for production use.</p>

      <h3>Key Collections You Will Use Daily:</h3>
      <ul>
        <li><strong>ArrayList&lt;E&gt;:</strong> Resizable array. Fast index lookup <code>get(i)</code>. Ideal for general-purpose lists.</li>
        <li><strong>LinkedList&lt;E&gt;:</strong> Doubly linked list. Fast insertions/deletions at the ends.</li>
        <li><strong>HashSet&lt;E&gt;:</strong> Stores only unique elements (no duplicates allowed). Super fast contains check.</li>
        <li><strong>HashMap&lt;K, V&gt;:</strong> Maps unique keys to values. Instant search by key name.</li>
      </ul>
    `,
    quizzes: [
      {
        question: "1. Which collection class is best suited for storing pairs of student ID numbers mapped to their corresponding student profile objects?",
        options: [
          "ArrayList",
          "HashMap",
          "HashSet",
          "LinkedList"
        ],
        correctIndex: 1,
        explanation: "HashMap stores Key-Value pairs, making it the perfect data structure for mapping unique IDs (keys) to their corresponding objects (values)."
      },
      {
        question: "2. What is the fundamental advantage of an 'ArrayList' over a standard Java array (e.g. 'int[]')?",
        options: [
          "ArrayList can store primitive types without wrapper classes",
          "ArrayList dynamically resizes its capacity as elements are added or removed",
          "ArrayList executes faster than standard CPU arrays",
          "ArrayList elements are stored in alphabetical order automatically"
        ],
        correctIndex: 1,
        explanation: "Standard arrays have a fixed size defined at allocation, while an ArrayList dynamically grows and shrinks as needed."
      },
      {
        question: "3. What happens if you try to add a duplicate element into a 'HashSet' in Java?",
        options: [
          "Throws a DuplicateElementException",
          "The duplicate is quietly ignored and the set remains unchanged",
          "The set deletes all previous occurrences",
          "The program crashes with a NullPointerException"
        ],
        correctIndex: 1,
        explanation: "A Set cannot contain duplicate elements. When you call set.add() with an existing item, it returns false and does not add it."
      },
      {
        question: "4. Which method is used to determine the number of elements inside an ArrayList?",
        options: [
          "list.length",
          "list.length()",
          "list.size()",
          "list.count()"
        ],
        correctIndex: 2,
        explanation: "In Java, standard arrays use the .length field, Strings use the .length() method, and Collections use the .size() method."
      },
      {
        question: "5. What exception is thrown if you try to access index 5 in an array of size 5 ('arr[5]')?",
        options: [
          "NullPointerException",
          "ArrayIndexOutOfBoundsException",
          "IllegalStateException",
          "ArithmeticException"
        ],
        correctIndex: 1,
        explanation: "In Java (0-indexed), an array of size 5 has valid indices 0, 1, 2, 3, and 4. Accessing index 5 triggers ArrayIndexOutOfBoundsException."
      }
    ]
  },
  {
    id: "ch7-exceptions",
    num: "07",
    title: "Exception Handling & Robust Code",
    tag: "Safety & Reliability",
    icon: "🛡️",
    accent: "#e879f9",
    summary: "Prevent crashes with try-catch-finally, custom exceptions, and understand Checked vs. Unchecked exceptions.",
    codeSample: `public class Main {
    public static void main(String[] args) {
        System.out.println("Initializing mission navigation...");

        try {
            int distance = 1000;
            int speed = 0; // Oops, stationary!

            // Dividing by zero causes ArithmeticException
            int travelTime = distance / speed;
            System.out.println("Estimated Time: " + travelTime + " hours");
        } catch (ArithmeticException e) {
            System.out.println("⚠️ ERROR CAUGHT: Cannot calculate time when speed is 0! (" + e.getMessage() + ")");
        } finally {
            System.out.println("System telemetry check complete (finally block always runs).");
        }

        System.out.println("Application recovered gracefully without crashing! ✅");
    }
}`,
    explanation: [
      { line: "try { ... }", meaning: "Guarded block where risky operations (e.g. division, file reading, network calls) take place." },
      { line: "catch (ArithmeticException e)", meaning: "Intercepts the specific error, allowing the application to handle it gracefully instead of crashing." },
      { line: "finally { ... }", meaning: "Guaranteed to execute whether an exception occurred or not (used for cleanup like closing files/streams)." }
    ],
    htmlContent: `
      <h2>Defensive Programming in Java</h2>
      <p>In real-world software, things go wrong: network drops, files don't exist, users enter letters when numbers are expected. Instead of letting your application crash, Java uses <strong>Exceptions</strong> to catch errors and recover.</p>

      <h2>The Try - Catch - Finally Triad</h2>
      <ul>
        <li><strong>try:</strong> Place code that might throw an exception inside this block.</li>
        <li><strong>catch:</strong> Catches specific exceptions. You can chain multiple catch blocks for different error types!</li>
        <li><strong>finally:</strong> Code that must run no matter what (even if an error occurred or a return statement was executed).</li>
      </ul>

      <div class="concept-callout tip">
        <div class="callout-title">Checked vs. Unchecked Exceptions</div>
        <p><strong>Checked Exceptions:</strong> Checked at compile time (e.g. <code>IOException</code>). The compiler forces you to handle them with try-catch or declare them with <code>throws</code>.</p>
        <p><strong>Unchecked Exceptions:</strong> Runtime exceptions resulting from logic flaws (e.g. <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>).</p>
      </div>
    `,
    quizzes: [
      {
        question: "1. Which block in a try-catch-finally statement is guaranteed to execute regardless of whether an exception was thrown or not?",
        options: [
          "The try block",
          "The catch block",
          "The finally block",
          "The throw statement"
        ],
        correctIndex: 2,
        explanation: "The 'finally' block is guaranteed to run after try/catch, making it the ideal place for closing resources, cleaning up memory, or resetting state."
      },
      {
        question: "2. Which of the following is an example of an Unchecked (Runtime) Exception in Java?",
        options: [
          "IOException",
          "SQLException",
          "NullPointerException",
          "ClassNotFoundException"
        ],
        correctIndex: 2,
        explanation: "NullPointerException extends RuntimeException, making it an unchecked exception that does not require mandatory try-catch declaration."
      },
      {
        question: "3. What is the fundamental difference between the 'throw' and 'throws' keywords?",
        options: [
          "'throw' explicitly fires an exception in code, while 'throws' declares potential exceptions in the method header",
          "'throws' is for primitives and 'throw' is for objects",
          "'throw' is only used in child classes",
          "There is no difference; they are interchangeable"
        ],
        correctIndex: 0,
        explanation: "You write 'throw new Exception()' inside a method body to raise an error, whereas you declare 'public void read() throws IOException' in the signature."
      },
      {
        question: "4. What happens when an exception is thrown in a try block that has NO matching catch block?",
        options: [
          "The JVM ignores the exception and continues execution",
          "The finally block runs (if present), and the exception propagates up to the calling method",
          "The compiler fixes the issue automatically",
          "The program enters an infinite sleep loop"
        ],
        correctIndex: 1,
        explanation: "If no catch block handles the exception, the finally block still executes, and the exception bubbles up the call stack until handled or crashes the thread."
      },
      {
        question: "5. What modern Java feature automatically closes files, database connections, and streams at the end of a try block?",
        options: [
          "AutoGarbageCollector",
          "Try-With-Resources (try (Resource r = ...))",
          "Finalize block",
          "AutoCloseable interface annotation"
        ],
        correctIndex: 1,
        explanation: "Try-with-resources automatically closes any resource implementing java.lang.AutoCloseable at the end of the statement."
      }
    ]
  }
];

window.JAVA_CHEATSHEET = [
  { topic: "Keywords", items: ["public", "private", "protected", "static", "final", "abstract", "extends", "implements", "new", "this", "super", "try", "catch", "finally", "throw", "throws"] },
  { topic: "Primitives", items: ["byte (8b)", "short (16b)", "int (32b)", "long (64b)", "float (32b)", "double (64b)", "boolean (true/false)", "char (16b unicode)"] },
  { topic: "Common Methods", items: ["System.out.println()", "String.length()", "String.equals()", "Math.max(a,b)", "Math.random()", "Integer.parseInt()", "ArrayList.add()", "HashMap.put()"] }
];

window.JAVA_CERTIFICATION_EXAM = [
  {
    id: "exam-q1",
    module: "Chapter 1: JVM & Architecture",
    question: "1. How does Java achieve platform independence ('Write Once, Run Anywhere') across different operating systems?",
    options: [
      "By compiling directly into Windows x86 machine instructions",
      "By compiling source code (.java) into platform-independent Bytecode (.class) that any OS-specific JVM can execute",
      "By executing JavaScript in an embedded web browser engine",
      "By interpreting source code line-by-line without compiling"
    ],
    correctIndex: 1,
    explanation: "javac translates .java into portable bytecode. The platform-specific JVM on Windows, Mac, or Linux translates that bytecode into native instructions."
  },
  {
    id: "exam-q2",
    module: "Chapter 2: Memory Model",
    question: "2. In Java's runtime memory architecture, where are object instances stored versus local primitive variables?",
    options: [
      "Objects live on the Heap; local primitive variables live on the Stack",
      "Objects live on the Stack; local primitives live on the Heap",
      "Both primitives and objects are stored exclusively on the Stack",
      "All memory is stored in CPU registers only"
    ],
    correctIndex: 0,
    explanation: "Local variables and method call frames exist on the LIFO Stack. All dynamically instantiated objects ('new Object()') are allocated on the Heap."
  },
  {
    id: "exam-q3",
    module: "Chapter 2: Type Systems",
    question: "3. What is the output of comparing two separate String objects using '==' versus '.equals()' in Java?\nString s1 = new String(\"Java\");\nString s2 = new String(\"Java\");",
    options: [
      "Both (s1 == s2) and s1.equals(s2) return true",
      "(s1 == s2) is false (different Heap addresses); s1.equals(s2) is true (identical text characters)",
      "(s1 == s2) is true; s1.equals(s2) is false",
      "A NullPointerException is thrown"
    ],
    correctIndex: 1,
    explanation: "'==' checks reference memory addresses (which differ for two separate 'new' objects). '.equals()' compares character contents."
  },
  {
    id: "exam-q4",
    module: "Chapter 3: Control Flow",
    question: "4. What is the fundamental difference between a 'while' loop and a 'do-while' loop?",
    options: [
      "A while loop always executes at least once, whereas do-while can execute 0 times",
      "A do-while loop always executes its body at least once before testing the boolean condition",
      "A do-while loop cannot use break statements",
      "There is no difference in execution semantics"
    ],
    correctIndex: 1,
    explanation: "do-while tests its condition at the bottom (exit-controlled), guaranteeing that the code block runs at least once."
  },
  {
    id: "exam-q5",
    module: "Chapter 4: Methods & Execution",
    question: "5. How does Java pass arguments into methods (pass-by-value vs pass-by-reference)?",
    options: [
      "Java is strictly pass-by-value for both primitives and object references",
      "Java is pass-by-value for primitives and pass-by-reference for objects",
      "Java is strictly pass-by-reference for all types",
      "Methods determine parameter passing mode using pointers"
    ],
    correctIndex: 0,
    explanation: "Java is strictly pass-by-value. When an object is passed, a copy of the memory reference (address) is passed by value."
  },
  {
    id: "exam-q6",
    module: "Chapter 5: OOP Principles",
    question: "6. Which OOP principle is achieved by making class fields 'private' and providing 'public' getter and setter methods?",
    options: [
      "Inheritance",
      "Polymorphism",
      "Encapsulation",
      "Dynamic Dispatch"
    ],
    correctIndex: 2,
    explanation: "Encapsulation bundles data with methods that operate on it, restricting direct external access to prevent illegal state mutations."
  },
  {
    id: "exam-q7",
    module: "Chapter 5: Polymorphism",
    question: "7. What is method overriding (runtime polymorphism) in Java?",
    options: [
      "Having multiple methods with the same name but different parameter lists in the same class",
      "A subclass providing a specific implementation of a method already defined in its superclass using the exact same signature",
      "Deleting a parent method from memory",
      "Calling a private constructor from another class"
    ],
    correctIndex: 1,
    explanation: "Overriding allows a subclass to provide its own behavior for an inherited method with identical name, parameters, and return type."
  },
  {
    id: "exam-q8",
    module: "Chapter 5: Interfaces vs Classes",
    question: "8. Can a Java class inherit from multiple classes or implement multiple interfaces?",
    options: [
      "A class can extend multiple classes and implement only one interface",
      "A class can extend only one superclass (single inheritance), but can implement multiple interfaces",
      "A class cannot implement any interfaces",
      "Multiple inheritance of classes is allowed using the 'with' keyword"
    ],
    correctIndex: 1,
    explanation: "To prevent the 'Diamond Problem', Java supports single class inheritance ('extends Parent') but allows multiple interface implementation ('implements A, B, C')."
  },
  {
    id: "exam-q9",
    module: "Chapter 6: Collections",
    question: "9. Which Java Collections Framework interface guarantees UNIQUE elements and does NOT allow duplicates?",
    options: [
      "List (e.g., ArrayList)",
      "Set (e.g., HashSet)",
      "Queue (e.g., LinkedList)",
      "Stack"
    ],
    correctIndex: 1,
    explanation: "A Set (such as HashSet or TreeSet) models mathematical sets and strictly prohibits duplicate elements."
  },
  {
    id: "exam-q10",
    module: "Chapter 7: Exception Handling",
    question: "10. In a try-catch-finally structure, when does the 'finally' block execute?",
    options: [
      "Only when an exception is successfully caught",
      "Only when NO exception occurs",
      "Always executes, regardless of whether an exception was thrown or caught (ideal for cleanup)",
      "Only if the computer has more than 8GB of RAM"
    ],
    correctIndex: 2,
    explanation: "The finally block is guaranteed to execute whether an exception occurred, was caught, or went unhandled (unless System.exit() terminates the JVM)."
  }
];

