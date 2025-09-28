// Simple JavaScript code executor with basic safety measures
export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

class CodeExecutor {
  private timeout = 5000; // 5 seconds timeout
  
  async execute(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Basic safety: remove dangerous APIs
      const safeCode = this.sanitizeCode(code);
      
      // Capture console.log output
      let output = '';
      const originalConsoleLog = console.log;
      
      console.log = (...args) => {
        output += args.map(arg => this.formatValue(arg)).join(' ') + '\n';
      };
      
      // Execute code with timeout
      const result = await this.executeWithTimeout(safeCode, this.timeout);
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      // If code returns a value, add it to output
      if (result !== undefined && output === '') {
        output = this.formatValue(result);
      }
      
      return {
        output: output.trim(),
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.log = console.log; // Restore console.log
      
      return {
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  private sanitizeCode(code: string): string {
    // Remove potentially dangerous APIs
    const dangerousPatterns = [
      /fetch\s*\(/g,
      /XMLHttpRequest/g,
      /eval\s*\(/g,
      /Function\s*\(/g,
      /setTimeout\s*\(/g,
      /setInterval\s*\(/g,
      /document\./g,
      /window\./g,
      /global\./g,
      /process\./g,
      /require\s*\(/g,
      /import\s+/g,
      /export\s+/g,
    ];

    let safeCode = code;
    dangerousPatterns.forEach(pattern => {
      safeCode = safeCode.replace(pattern, '/* blocked */');
    });

    return safeCode;
  }

  private async executeWithTimeout(code: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Code execution timed out'));
      }, timeout);

      try {
        // Create a function that returns the result of the code
        // This allows both expressions and statements to work
        const wrappedCode = `
          try {
            ${code}
          } catch (error) {
            throw new Error(error.message);
          }
        `;
        
        const func = new Function(wrappedCode);
        const result = func();
        
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }
}

export const codeExecutor = new CodeExecutor();

// TODO: Implement more robust sandboxing
// Consider using Web Workers or iframe sandboxing for better security
// Add support for async/await code execution
// Implement memory usage monitoring
// Add syntax highlighting and error line highlighting
// Support for importing common libraries (lodash, moment, etc.)