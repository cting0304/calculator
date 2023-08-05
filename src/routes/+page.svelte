<script>
  // Importing the 'writable' function from the 'svelte/store' library
  import { writable } from 'svelte/store';

  // Creating a writable store named 'resultStore' with an initial value of 'null'
  const resultStore = writable(null);

  // Initializing variables to store the expression and track operator clicks
  let expression = '';
  let operatorClicked = false;

  // Function to handle button clicks
  const handleButtonClick = async (value) => {
    if (value === '=') {
      // If the '=' button is clicked, calculate the result
      await calculateResult();
    } else if (['+', '-', '*', '/'].includes(value)) {
      // If an operator button is clicked (+, -, *, /)
      if (expression !== '') {
        if (operatorClicked) {
          // If an operator was clicked previously, replace the previous operator with the new one
          expression = expression.slice(0, -2) + `${value} `;
        } else {
          // If no operator was clicked previously, calculate the result and update the expression with the new operator
          const result = await calculateResult();
          expression = `${result} ${value} `;
          operatorClicked = true;
        }
      }
    } else {
      // If a digit button (0-9) is clicked
      operatorClicked = false;
      expression += value; // Append the digit to the expression
    }
  };

  // Function to clear the expression and reset the result store to null
  const clearExpression = () => {
    expression = '';
    resultStore.set(null);
  };

  // Function to remove the last character from the expression
  const removeLastCharacter = () => {
    if (expression.length > 0) {
      expression = expression.substring(0, expression.length - 1);
    }
  };

  // Function to calculate the result by sending the expression to the server for evaluation
  const calculateResult = async () => {
    try {
      // Prepare the expression by adding spaces around the operators for proper parsing
      const spacedExpression = expression.replace(/([\+\-\*\/])/g, ' $1 ');

      // Send a POST request to the server with the spaced expression
      const response = await fetch('http://localhost:5000/server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: spacedExpression }),
      });

      if (response.ok) {
        // If the response is successful, extract the result from the JSON and update the result store
        const { result } = await response.json();
        resultStore.set(result);
        return result;
      } else {
        // If there's an error, extract the error message from the JSON and update the result store
        const { error } = await response.json();
        resultStore.set(error);
        return null;
      }
    } catch (error) {
      // If an error occurs during communication with the server, update the result store with an error message
      resultStore.set('Error occurred while communicating with the server');
      return null;
    }
  };
</script>


<main>
  <div class="calculator">
    <div class="display">
      <div class="expression">{expression}</div>
      <input type="text" bind:value={$resultStore} readonly="{typeof $resultStore === 'string'}" />

    </div>
    
    <div class="buttons">
      <div class="row">
        <button on:click={() => handleButtonClick('1')}>1</button>
        <button on:click={() => handleButtonClick('2')}>2</button>
        <button on:click={() => handleButtonClick('3')}>3</button>
        <button on:click={() => handleButtonClick('+')}>+</button>
      </div>
      <div class="row">
        <button on:click={() => handleButtonClick('4')}>4</button>
        <button on:click={() => handleButtonClick('5')}>5</button>
        <button on:click={() => handleButtonClick('6')}>6</button>
        <button on:click={() => handleButtonClick('-')}>-</button>
      </div>
      <div class="row">
        <button on:click={() => handleButtonClick('7')}>7</button>
        <button on:click={() => handleButtonClick('8')}>8</button>
        <button on:click={() => handleButtonClick('9')}>9</button>
        <button on:click={() => handleButtonClick('*')}>*</button>
      </div>
      <div class="row">
        <button on:click={() => handleButtonClick('0')}>0</button>
        <button on:click={clearExpression}>C</button>
        <button on:click={() => handleButtonClick('=')}>=</button>
        <button on:click={() => handleButtonClick('/')}>/</button>
      </div><div class="row">
        <button on:click={removeLastCharacter}>DEL</button>
      </div>
    </div>
  </div>
</main>
  

<style>
  * {
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
  }
  
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .calculator {
    border: 2px solid #333;
    border-radius: 10px;
    width: 300px;
    padding: 20px;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  
  .calculator .display {
    margin-bottom: 15px;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
  }
  
  
  .calculator .display .expression {
    font-size: 14px;
    margin-bottom: 5px;
    color: #888;
    position: absolute;
    margin-left: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .calculator .display input[type="text"] {
    width: 92%;
    padding: 10px;
    font-size: 24px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: right;
    outline: none;
  }
  
  .calculator .buttons .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .calculator .buttons button {
    flex: 1;
    padding: 10px;
    font-size: 18px;
    border: 1px solid #333;
    border-radius: 5px;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .calculator .buttons button:not(:last-child) {
    margin-right: 5px; 
  }
  
 
  .calculator .buttons button.del-button {
    flex: 0.5; 
    font-size: 16px;
  }
  
  .calculator .buttons button:hover {
    background-color: #f0f0f0;
  }
  </style>


