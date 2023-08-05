import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware for enabling Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware for parsing incoming JSON data
app.use(express.json());

// Function to compute the result of a given mathematical expression
const computeExpression = (expression: string): number => {
  try {
    // Define an object to store the different operators and their corresponding functions.
    const operators: { [key: string]: (a: number, b: number) => number } = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => {
        // Special handling for division to check for division by zero.
        if (b === 0) {
          throw new Error('Division by zero');
        }
        return a / b;
      },
    };

    // Function to get the precedence of an operator for handling operator precedence in the expression.
    const getPrecedence = (operator: string): number => {
      switch (operator) {
        case '+':
        case '-':
          return 1;
        case '*':
        case '/':
          return 2;
        default:
          return 0;
      }
    };

    // Function to tokenize the expression into individual elements (operands and operators).
    const tokenizeExpression = (expression: string): string[] => {
      const regex = /(\d+(\.\d+)?)|[\+\-\*\/\(\)]|-/g;
      return expression.match(regex) || [];
    };

    // Function to evaluate an operation using the operator and operands from the stacks.
    const evaluateOperation = (operands: number[], operators: { [key: string]: (a: number, b: number) => number }, operatorStack: string[]): void => {
      const operator = operatorStack.pop(); // Get the operator from the stack.
      const b = operands.pop(); // Get the second operand from the stack.
      const a = operands.pop(); // Get the first operand from the stack.
      if (a !== undefined && b !== undefined && operator) {
        // If all values are available, perform the operation and push the result back to the operand stack.
        const result = operators[operator](a, b);
        operands.push(result);
      }
    };

    const tokens = tokenizeExpression(expression); // Tokenize the input expression.

    const operatorStack: string[] = []; // Stack to store operators.
    const operandStack: number[] = []; // Stack to store operands.

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]; // Get the current token.
      const nextToken = tokens[i + 1]; // Get the next token.

      if (!isNaN(parseFloat(token))) {
        // If the token is a number (operand).
        if (!isNaN(parseFloat(nextToken))) {
          // Handling consecutive digits as one number.
          operandStack.push(parseFloat(token + nextToken));
          i++; // Skip the next token since it's already processed as part of the current operand.
        } else {
          operandStack.push(parseFloat(token));
        }
      } else if (token in operators) {
        // If the token is an operator.
        const currentOperator = token;

        // Handling consecutive operators (e.g., "++", "--", etc.) is not allowed.
        if (nextToken in operators) {
          throw new Error('Invalid expression');
        }

        // Special handling for left-to-right evaluation of + and - operators.
        if (token === '+' || token === '-') {
          while (
            operatorStack.length > 0 &&
            (operatorStack[operatorStack.length - 1] === '+' ||
              operatorStack[operatorStack.length - 1] === '-')
          ) {
            evaluateOperation(operandStack, operators, operatorStack); // Evaluate previous + or - operators.
          }
        } else {
          // For other operators (* and /), respect operator precedence.
          while (
            operatorStack.length > 0 &&
            getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token)
          ) {
            evaluateOperation(operandStack, operators, operatorStack); // Evaluate previous operators with higher precedence.
          }
        }

        operatorStack.push(currentOperator); // Push the current operator to the operator stack.
      } else if (token === '(') {
        // If the token is an opening parenthesis, push it to the operator stack.
        operatorStack.push(token);
      } else if (token === ')') {
        // If the token is a closing parenthesis, evaluate all operations until the corresponding opening parenthesis is found.
        while (operatorStack[operatorStack.length - 1] !== '(') {
          evaluateOperation(operandStack, operators, operatorStack); // Evaluate the operations inside the parenthesis.
        }
        operatorStack.pop(); // Discard the '(' from the stack since the parenthesis is now fully evaluated.
      } else {
        // If the token is not a number, operator, or parenthesis, the expression is invalid.
        throw new Error('Invalid expression');
      }
    }

    // After processing all tokens, evaluate any remaining operations in the stacks.
    while (operatorStack.length > 0) {
      evaluateOperation(operandStack, operators, operatorStack); // Evaluate the remaining operations.
    }

    // The final result should be the only remaining element in the operand stack.
    if (operandStack.length !== 1 || operatorStack.length !== 0) {
      throw new Error('Invalid expression');
    }

    return operandStack[0]; // Return the final result.
  } catch (error) {
    throw error; // If any error occurred during the evaluation, rethrow it.
  }
};

// POST endpoint to receive expressions and send back the result
app.post('/server', (req: Request, res: Response) => {
  try {
    const { expression } = req.body;
    console.log(expression); 

    // Check if the expression sent by the client is a string
    if (typeof expression !== 'string') {
      throw new Error('Invalid expression format');
    }

    // Call the computeExpression function to evaluate the expression
    const result = computeExpression(expression);

    // Send the result back as a JSON response
    res.json({ result });
  } catch (error: any) { 
    // If an error occurs during expression evaluation, send an error response
    res.status(400).json({ error: error.message });
  }
});

const PORT: number = 5000; 

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
