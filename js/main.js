"use strict";

function addition(n1, n2) {
  return n1 + n2;
}

function subtraction(n1, n2) {
  return n1 - n2;
}

function multiplication(n1, n2) {
  return n1 * n2;
}

function division(n1, n2) {
  return n1 / n2;
}

function operate(n1, n2, operator) {
  return operator(n1, n2);
}

function getOperationResult(n1, n2, operator) {
  switch (operator) {
    case "+":
      return operate(n1, n2, addition);
    case "-":
      return operate(n1, n2, subtraction);
    case "*":
      return operate(n1, n2, multiplication);
    case "/":
      return operate(n1, n2, division);
  }
}

function main() {
  const screen = document.querySelector("div#screen");
  const displayables = Array.from(document.querySelectorAll("button.displayable:not(.punct)"));
  const decimal = document.querySelector("button.punct");
  const del = document.querySelector("button#delete");
  const clear = document.querySelector("button#clear");
  const operators = Array.from(document.querySelectorAll("button.operator"));
  const equals = document.querySelector("button#equals");
  const RIGHT = "right";
  const LEFT = "left";
  const OPERATOR = "operator";
  let operation;
  let refreshNext;
  let recentEquals;

  initContext();

  function initContext() {
    operation = {};
    refreshNext = true;
    recentEquals = false;
    screen.textContent = "0";
  }

  function deleteLastDigit(operand) {
    if (operand !== undefined) {
      operand = operand.slice(0, -1);
      screen.textContent = screen.textContent.slice(0, -1);
      if (operand.length === 0) {
        screen.textContent = "0";
        refreshNext = true;
      }
    }
    return operand;
  }

  function hasDecimal() {
    return screen.textContent.includes(".");
  }

  function hasProperty(operand, operation) {
    return operand in operation;
  }

  function hasLeftOperand() {
    return hasProperty(LEFT, operation);
  }

  function hasRightOperand() {
    return hasProperty(RIGHT, operation);
  }

  function hasOperator() {
    return hasProperty(OPERATOR, operation);
  }

  function isFullyDefinedOperation() {
    return hasLeftOperand()
      && hasRightOperand()
      && hasOperator();
  }

  function isDivideByZero() {
    return operation[OPERATOR] === "/" && operation[RIGHT] === "0";
  }

  function currify() {
    if (isDivideByZero()) {
      screen.textContent = "Divide by zero";
      operation = {};
      refreshNext = true;
      recentEquals = false;
    } else {
      let result = "" + getOperationResult(+operation.left, +operation.right, operation.operator);
      screen.textContent = result;
      operation = {};
      operation[LEFT] = result;
      recentEquals = true;
    }
  }

  function concatDecimal(verifyOperand, operation, e) {
    if (!hasDecimal() && verifyOperand() && operation !== "") {
      operation = operation.concat(e.currentTarget.textContent);
      screen.textContent = screen.textContent.concat(e.currentTarget.textContent);
    }
    return operation;
  }

  function displayOnScreen(e) {
    if (refreshNext) {
      screen.textContent = "";
      refreshNext = false;
    }
    screen.textContent = screen.textContent.concat(e.currentTarget.textContent);
    if (!hasOperator()) {
      if (!hasLeftOperand()) {
        operation[LEFT] = e.currentTarget.textContent;
      } else {
        if (recentEquals) {
          operation[LEFT] = e.currentTarget.textContent;
          screen.textContent = e.currentTarget.textContent;
          recentEquals = false;
        } else {
          operation[LEFT] = operation[LEFT].concat(e.currentTarget.textContent);
        }
      }
    } else {
      if (!hasRightOperand()) {
        operation[RIGHT] = e.currentTarget.textContent;
      } else {
        operation[RIGHT] = operation[RIGHT].concat(e.currentTarget.textContent);
      }
    }
  }

  function setOperator(e) {
    if (hasLeftOperand() && !hasRightOperand()) {
      operation[OPERATOR] = e.currentTarget.textContent;
    } else if (isFullyDefinedOperation()) {
      currify();
      operation[OPERATOR] = e.currentTarget.textContent;
    }
    refreshNext = true;
  }

  function putDecimal(e) {
    if (!hasOperator() && !recentEquals) {
      if (hasLeftOperand()) {
        operation[LEFT] = concatDecimal(hasLeftOperand, operation[LEFT], e);
      }
    } else {
      if (hasRightOperand()) {
        operation[RIGHT] = concatDecimal(hasLeftOperand, operation[RIGHT], e);
      }
    }
  }

  displayables.forEach(btn => btn.addEventListener("click", displayOnScreen));

  del.addEventListener("click", () => {
    if (recentEquals) {
      initContext();
    }
    if (hasLeftOperand()) { 
      if (!hasOperator()) {
        operation[LEFT] = deleteLastDigit(operation[LEFT]);
      } else {
        if (hasRightOperand()) {
          operation[RIGHT] = deleteLastDigit(operation[RIGHT]);
        }
      }
    }
  });

  clear.addEventListener("click", () => { initContext(); });

  operators.forEach(btn => btn.addEventListener("click", setOperator));

  equals.addEventListener("click", () => {
    if (isFullyDefinedOperation()) {
      currify();
    }
  });

  decimal.addEventListener("click", putDecimal);

  document.addEventListener("keydown", function (e) {
    const key = e.key;
    if (key >= "0" && key <= "9") {
      const displayable = findButton(displayables, `${key}`);
      displayable.textContent = `${key}`;
      displayable.click();
    } else if (key === ".") {
      decimal.textContent = `${key}`;
      decimal.click();
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      const op = findButton(operators, `\\${key}`);
      op.click();
    } else if (key === "Enter") {
      equals.click();
    } else if (key === "Backspace") {
      del.click();
    } else if (key === "Escape") {
      clear.click();
    }
  });

  function findButton(buttons, matchable) {
    return buttons.filter(btn => btn.textContent.match(matchable))[0];
  }
}

main();
