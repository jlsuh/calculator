"use strict";

let MathOperator = function(left, right, operator) {
  this.left = left;
  this.right = right;
  this.operator = operator;
};
MathOperator.prototype.addition = function() {return this.left + this.right;}
MathOperator.prototype.subtraction = function() {return this.left - this.right;}
MathOperator.prototype.multiplication = function() {return this.left * this.right;}
MathOperator.prototype.division = function() {return this.left / this.right;}
MathOperator.prototype.getOperationResult = function() {
  switch (this.operator) {
    case "+":
      return this.addition();
    case "-":
      return this.subtraction();
    case "*":
      return this.multiplication();
    case "/":
      return this.division();
  }
}

function Operation() {}
Operation.prototype.isDivideByZero = function() {return this.operator === "/" && this.right === "0";}
Operation.prototype.isFullyDefinedOperation = function() {return this.hasLeftOperand() && this.hasRightOperand() && this.hasOperator();}
Operation.prototype.hasLeftOperand = function() {return "left" in this;}
Operation.prototype.hasRightOperand = function() {return "right" in this;}
Operation.prototype.hasOperator = function() {return "operator" in this;}

let calculator = (function () {
  const displayables = Array.from(document.querySelectorAll("button.displayable:not(.punct)"));
  const operators = Array.from(document.querySelectorAll("button.operator"));
  const clear = document.querySelector("button#clear");
  const decimal = document.querySelector("button.punct");
  const del = document.querySelector("button#delete");
  const equals = document.querySelector("button#equals");
  const screen = document.querySelector("div#screen");
  let operation;
  let recentEquals;
  let refreshNext;

  function initContext() {
    operation = new Operation();
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

  function hasDecimal() { return screen.textContent.includes("."); }

  function currify() {
    if (operation.isDivideByZero()) {
      screen.textContent = "Divide by zero";
      operation = new Operation();
      refreshNext = true;
      recentEquals = false;
    } else {
      let result = "" + new MathOperator(+operation.left, +operation.right, operation.operator).getOperationResult();
      screen.textContent = result;
      operation = new Operation();
      operation.left = result;
      recentEquals = true;
    }
  }

  function concatDecimal(operation, e) {
    if (!hasDecimal() && operation !== "") {
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
    if (!operation.hasOperator()) {
      if (!operation.hasLeftOperand()) {
        operation.left = e.currentTarget.textContent;
      } else {
        if (recentEquals) {
          operation.left = e.currentTarget.textContent;
          screen.textContent = e.currentTarget.textContent;
          recentEquals = false;
        } else {
          operation.left = operation.left.concat(e.currentTarget.textContent);
        }
      }
    } else {
      if (!operation.hasRightOperand()) {
        operation.right = e.currentTarget.textContent;
      } else {
        operation.right = operation.right.concat(e.currentTarget.textContent);
      }
    }
  }

  function setOperator(e) {
    if (operation.hasLeftOperand() && !operation.hasRightOperand()) {
      operation.operator = e.currentTarget.textContent;
    } else if (operation.isFullyDefinedOperation()) {
      currify();
      operation.operator = e.currentTarget.textContent;
    }
    refreshNext = true;
  }

  function putDecimal(e) {
    if (!operation.hasOperator() && !recentEquals) {
      if (operation.hasLeftOperand()) {
        operation.left = concatDecimal(operation.left, e);
      }
    } else {
      if (operation.hasRightOperand()) {
        operation.right = concatDecimal(operation.right, e);
      }
    }
  }

  function findButton(buttons, matchable) {
    return buttons.filter(btn => btn.textContent.match(matchable))[0];
  }

  return {
    main: function() {
      initContext();

      displayables.forEach(btn => btn.addEventListener("click", displayOnScreen));

      del.addEventListener("click", () => {
        if (operation.hasLeftOperand()) { 
          if (!operation.hasOperator()) {
            if(!recentEquals) {
              operation.left = deleteLastDigit(operation.left);
            } else {
              initContext();
            }
          } else {
            if (operation.hasRightOperand()) {
              operation.right = deleteLastDigit(operation.right);
            }
          }
        }
      });

      clear.addEventListener("click", () => { initContext(); });

      operators.forEach(btn => btn.addEventListener("click", setOperator));

      equals.addEventListener("click", () => {
        if (operation.isFullyDefinedOperation()) {
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
    }
  }
})();

calculator.main();