import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
const computeExpression = (expression) => {
    try {
        const operators = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => {
                if (b === 0) {
                    throw new Error('Division by zero');
                }
                return a / b;
            },
        };
        const getPrecedence = (operator) => {
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
        const tokenizeExpression = (expression) => {
            const regex = /(\d+(\.\d+)?)|[\+\-\*\/\(\)]|-/g;
            return expression.match(regex) || [];
        };
        const evaluateOperation = (operands, operators, operatorStack) => {
            const operator = operatorStack.pop(); // Corrected the variable name to 'operatorStack'
            const b = operands.pop();
            const a = operands.pop();
            if (a !== undefined && b !== undefined && operator) {
                const result = operators[operator](a, b);
                operands.push(result);
            }
        };
        const tokens = tokenizeExpression(expression);
        const operatorStack = [];
        const operandStack = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];
            if (!isNaN(parseFloat(token))) {
                if (!isNaN(parseFloat(nextToken))) {
                    // Handling consecutive digits
                    operandStack.push(parseFloat(token + nextToken));
                    i++; // Skip the next token as we already processed it
                }
                else {
                    operandStack.push(parseFloat(token));
                }
            }
            else if (token in operators) {
                const currentOperator = token;
                // Handling consecutive operators
                if (nextToken in operators) {
                    throw new Error('Invalid expression');
                }
                // Special handling for left-to-right evaluation of + and -
                if (token === '+' || token === '-') {
                    while (operatorStack.length > 0 &&
                        (operatorStack[operatorStack.length - 1] === '+' ||
                            operatorStack[operatorStack.length - 1] === '-')) {
                        evaluateOperation(operandStack, operators, operatorStack); // Corrected the arguments
                    }
                }
                else {
                    while (operatorStack.length > 0 &&
                        getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token)) {
                        evaluateOperation(operandStack, operators, operatorStack); // Corrected the arguments
                    }
                }
                operatorStack.push(currentOperator);
            }
            else if (token === '(') {
                operatorStack.push(token);
            }
            else if (token === ')') {
                while (operatorStack[operatorStack.length - 1] !== '(') {
                    evaluateOperation(operandStack, operators, operatorStack); // Corrected the arguments
                }
                operatorStack.pop(); // Discard the '(' from the stack
            }
            else {
                throw new Error('Invalid expression');
            }
        }
        while (operatorStack.length > 0) {
            evaluateOperation(operandStack, operators, operatorStack); // Corrected the arguments
        }
        if (operandStack.length !== 1 || operatorStack.length !== 0) {
            throw new Error('Invalid expression');
        }
        return operandStack[0];
    }
    catch (error) {
        throw error;
    }
};
app.post('/server', (req, res) => {
    try {
        const { expression } = req.body;
        console.log(expression); // Add this line to check the incoming request data
        if (typeof expression !== 'string') {
            throw new Error('Invalid expression format');
        }
        const result = computeExpression(expression);
        res.json({ result });
    }
    catch (error) { // Explicitly annotate the error variable as 'any'
        res.status(400).json({ error: error.message });
    }
});
const PORT = 5000; // You can change this to any port number you like
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map