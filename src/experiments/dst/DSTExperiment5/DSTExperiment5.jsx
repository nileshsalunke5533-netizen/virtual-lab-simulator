import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment5.css";

/* =========================================================
   DEFAULT VALUES
   ========================================================= */

const DEFAULT_VALUE = 5;

/* =========================================================
   QUESTIONS
   ========================================================= */

const QUESTIONS = [
  {
    q: "Which technique is used to solve factorial and Fibonacci in this practical?",
    options: [
      "Iteration",
      "Recursion",
      "Sorting",
      "Searching"
    ],
    answer: 1
  },
  {
    q: "What is the factorial of 0?",
    options: ["0", "1", "2", "Undefined"],
    answer: 1
  },
  {
    q: "Which condition stops a recursive function?",
    options: [
      "Loop condition",
      "Base condition",
      "Pointer condition",
      "Array condition"
    ],
    answer: 1
  },
  {
    q: "What is 5!?",
    options: ["25", "60", "120", "150"],
    answer: 2
  },
  {
    q: "Which is the first Fibonacci number in this practical?",
    options: ["0", "1", "2", "10"],
    answer: 0
  },
  {
    q: "The Fibonacci series starts with:",
    options: [
      "0, 1",
      "1, 2",
      "2, 3",
      "1, 3"
    ],
    answer: 0
  },
  {
    q: "Which function calls itself?",
    options: [
      "Recursive function",
      "Library function",
      "Main function",
      "Header function"
    ],
    answer: 0
  },
  {
    q: "Fibonacci recurrence relation is:",
    options: [
      "F(n) = n + 1",
      "F(n) = F(n-1) + F(n-2)",
      "F(n) = n * n",
      "F(n) = F(n-1) - F(n-2)"
    ],
    answer: 1
  },
  {
    q: "Factorial recurrence relation is:",
    options: [
      "fact(n) = n + fact(n-1)",
      "fact(n) = n * fact(n-1)",
      "fact(n) = n - fact(n-1)",
      "fact(n) = n / fact(n-1)"
    ],
    answer: 1
  },
  {
    q: "Recursion uses which memory structure internally?",
    options: [
      "Queue",
      "Stack",
      "Array",
      "Graph"
    ],
    answer: 1
  },
  {
    q: "What is the value of factorial(1)?",
    options: ["0", "1", "2", "Undefined"],
    answer: 1
  },
  {
    q: "What is the value of 4! in the factorial practical?",
    options: ["12", "16", "24", "120"],
    answer: 2
  },
  {
    q: "For n greater than 1, which expression defines factorial recursively?",
    options: ["n + factorial(n - 1)", "n * factorial(n - 1)", "factorial(n) - 1", "n * n"],
    answer: 1
  },
  {
    q: "Why does factorial recursion stop at n = 0 or n = 1?",
    options: ["Those are base cases with a known result", "The function has run out of memory", "The values are invalid", "The array is full"],
    answer: 0
  },
  {
    q: "If the base case is missing from a recursive function, what can happen?",
    options: ["The function may keep calling itself until resources are exhausted", "The result is always 1", "The function becomes iterative", "The input is automatically sorted"],
    answer: 0
  },
  {
    q: "Using F(0) = 0 and F(1) = 1, what is F(2)?",
    options: ["0", "1", "2", "3"],
    answer: 1
  },
  {
    q: "What are the first six values in the Fibonacci series used in this practical?",
    options: ["0, 1, 1, 2, 3, 5", "1, 2, 3, 4, 5, 6", "0, 1, 2, 4, 8, 16", "1, 1, 2, 4, 7, 11"],
    answer: 0
  },
  {
    q: "For n greater than 1, how is Fibonacci(n) calculated?",
    options: ["Fibonacci(n - 1) + Fibonacci(n - 2)", "n * Fibonacci(n - 1)", "Fibonacci(n - 1) - 1", "n + Fibonacci(n - 2)"],
    answer: 0
  },
  {
    q: "What happens to a function call's stack frame when its recursive call returns?",
    options: ["It returns its result and is removed from the call stack", "It stays at the top forever", "It becomes a global variable", "It restarts the program"],
    answer: 0
  },
  {
    q: "Which statement best describes the recursive case?",
    options: ["It reduces the problem and calls the function again", "It always stops the function immediately", "It clears the call stack", "It declares an array"],
    answer: 0
  }
];

/* =========================================================
   FACTORIAL STEP BUILDER
   ========================================================= */

const buildFactorialSteps = (n) => {
  const steps = [];

  if (
    !Number.isInteger(n) ||
    n < 0 ||
    n > 10
  ) {
    return [
      {
        title: "INVALID INPUT",
        message:
          "Enter an integer from 0 to 10.",
        stack: [],
        result: null,
        type: "error"
      }
    ];
  }

  const stack = [];

  const recurse = (value) => {
    stack.push({
      function: `factorial(${value})`,
      value,
      status: "CALL"
    });

    steps.push({
      title: "FUNCTION CALL",
      message:
        `factorial(${value}) is called.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result: null,
      type: "call"
    });

    if (value === 0 || value === 1) {
      steps.push({
        title: "BASE CASE",
        message:
          `factorial(${value}) reaches the base case. Return 1.`,
        stack: stack.map((item) => ({
          ...item
        })),
        result: 1,
        type: "base"
      });

      stack[stack.length - 1].status =
        "RETURN 1";

      steps.push({
        title: "RETURN",
        message:
          `factorial(${value}) returns 1.`,
        stack: stack.map((item) => ({
          ...item
        })),
        result: 1,
        type: "return"
      });

      stack.pop();

      return 1;
    }

    steps.push({
      title: "RECURSIVE CALL",
      message:
        `Calculate ${value} × factorial(${value - 1}).`,
      stack: stack.map((item) => ({
        ...item
      })),
      result: null,
      type: "recursive"
    });

    const previous = recurse(
      value - 1
    );

    const result = value * previous;

    stack[stack.length - 1].status =
      `RETURN ${result}`;

    steps.push({
      title: "CALCULATE",
      message:
        `${value} × ${previous} = ${result}.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result,
      type: "calculate"
    });

    steps.push({
      title: "RETURN",
      message:
        `factorial(${value}) returns ${result}.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result,
      type: "return"
    });

    stack.pop();

    return result;
  };

  const finalResult = recurse(n);

  steps.push({
    title: "COMPLETED",
    message:
      `Factorial of ${n} = ${finalResult}.`,
    stack: [],
    result: finalResult,
    type: "success"
  });

  return steps;
};

/* =========================================================
   FIBONACCI STEP BUILDER
   ========================================================= */

const buildFibonacciSteps = (n) => {
  const steps = [];

  if (
    !Number.isInteger(n) ||
    n < 0 ||
    n > 8
  ) {
    return [
      {
        title: "INVALID INPUT",
        message:
          "Enter an integer from 0 to 8 for Fibonacci recursion.",
        stack: [],
        result: null,
        type: "error"
      }
    ];
  }

  const stack = [];

  const recurse = (value) => {
    stack.push({
      function: `fib(${value})`,
      value,
      status: "CALL"
    });

    steps.push({
      title: "FUNCTION CALL",
      message:
        `fib(${value}) is called.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result: null,
      type: "call"
    });

    if (value === 0) {
      stack[stack.length - 1].status =
        "RETURN 0";

      steps.push({
        title: "BASE CASE",
        message:
          "fib(0) reaches the base case and returns 0.",
        stack: stack.map((item) => ({
          ...item
        })),
        result: 0,
        type: "base"
      });

      stack.pop();

      return 0;
    }

    if (value === 1) {
      stack[stack.length - 1].status =
        "RETURN 1";

      steps.push({
        title: "BASE CASE",
        message:
          "fib(1) reaches the base case and returns 1.",
        stack: stack.map((item) => ({
          ...item
        })),
        result: 1,
        type: "base"
      });

      stack.pop();

      return 1;
    }

    steps.push({
      title: "RECURSIVE CALL",
      message:
        `Calculate fib(${value - 1}) + fib(${value - 2}).`,
      stack: stack.map((item) => ({
        ...item
      })),
      result: null,
      type: "recursive"
    });

    const first = recurse(
      value - 1
    );

    const second = recurse(
      value - 2
    );

    const result = first + second;

    stack[stack.length - 1].status =
      `RETURN ${result}`;

    steps.push({
      title: "CALCULATE",
      message:
        `fib(${value - 1}) + fib(${value - 2}) = ${first} + ${second} = ${result}.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result,
      type: "calculate"
    });

    steps.push({
      title: "RETURN",
      message:
        `fib(${value}) returns ${result}.`,
      stack: stack.map((item) => ({
        ...item
      })),
      result,
      type: "return"
    });

    stack.pop();

    return result;
  };

  const finalResult = recurse(n);

  const series = [];

  for (
    let i = 0;
    i <= n;
    i++
  ) {
    const a =
      i === 0
        ? 0
        : i === 1
        ? 1
        : series[i - 1] +
          series[i - 2];

    series.push(a);
  }

  steps.push({
    title: "COMPLETED",
    message:
      `Fibonacci series up to term ${n}: ${series.join(", ")}`,
    stack: [],
    result: finalResult,
    series,
    type: "success"
  });

  return steps;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment5 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("simulation");

  const [showTheory, setShowTheory] =
    useState(false);

  const [showProcedure, setShowProcedure] =
    useState(false);

  const [showHelp, setShowHelp] =
    useState(false);

  /* =========================================================
     SIMULATION
     ========================================================= */

  const [operation, setOperation] =
    useState("Factorial");

  const [inputValue, setInputValue] =
    useState(DEFAULT_VALUE);

  const [steps, setSteps] =
    useState([]);

  const [currentStep, setCurrentStep] =
    useState(-1);

  const [observations, setObservations] =
    useState([]);

  /* =========================================================
     PROGRAM
     ========================================================= */

  const [programOperation, setProgramOperation] =
    useState("Factorial");

  const [programValue, setProgramValue] =
    useState(DEFAULT_VALUE);

  const [programSteps, setProgramSteps] =
    useState([]);

  const [programCurrentStep, setProgramCurrentStep] =
    useState(-1);

  const [programRunning, setProgramRunning] =
    useState(false);

  const [programAutoPlay, setProgramAutoPlay] =
    useState(false);

  const [programCompleted, setProgramCompleted] =
    useState(false);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const [answers, setAnswers] =
    useState({});

  const [questionResult, setQuestionResult] =
    useState(null);

  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     CURRENT STEPS
     ========================================================= */

  const currentSimulationStep =
    currentStep >= 0
      ? steps[currentStep]
      : null;

  const currentProgramStep =
    programCurrentStep >= 0
      ? programSteps[
          programCurrentStep
        ]
      : null;

  /* =========================================================
     SIMULATION
     ========================================================= */

  const startSimulation = () => {
    const value =
      Number(inputValue);

    const generated =
      operation === "Factorial"
        ? buildFactorialSteps(value)
        : buildFibonacciSteps(value);

    setSteps(generated);
    setCurrentStep(0);
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  const nextSimulation = () => {
    if (!steps.length) return;

    setCurrentStep(
      (previous) => {
        if (
          previous >=
          steps.length - 1
        ) {
          return previous;
        }

        const next =
          previous + 1;

        const step =
          steps[next];

        if (
          next ===
            steps.length - 1 &&
          step.type ===
            "success"
        ) {
          setObservations(
            (old) => [
              ...old,
              {
                attempt:
                  old.length + 1,
                operation,
                input:
                  Number(inputValue),
                result:
                  operation ===
                  "Factorial"
                    ? step.result
                    : step.series?.join(
                        ", "
                      ),
                status:
                  "Successful"
              }
            ]
          );
        }

        return next;
      }
    );
  };

  const previousSimulation = () => {
    setCurrentStep(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );
  };

  /* =========================================================
     PROGRAM
     ========================================================= */

  const runProgram = () => {
    const value =
      Number(programValue);

    const generated =
      programOperation ===
      "Factorial"
        ? buildFactorialSteps(value)
        : buildFibonacciSteps(value);

    setProgramSteps(
      generated
    );

    setProgramCurrentStep(
      0
    );

    setProgramRunning(
      true
    );

    setProgramAutoPlay(
      false
    );

    setProgramCompleted(
      false
    );
  };

  const nextProgram = () => {
    if (!programSteps.length)
      return;

    setProgramCurrentStep(
      (previous) => {
        if (
          previous >=
          programSteps.length -
            1
        ) {
          return previous;
        }

        const next =
          previous + 1;

        if (
          next ===
          programSteps.length -
            1
        ) {
          setProgramRunning(
            false
          );

          setProgramAutoPlay(
            false
          );

          if (
            programSteps[next]
              .type ===
            "success"
          ) {
            setProgramCompleted(
              true
            );
          }
        }

        return next;
      }
    );
  };

  const previousProgram = () => {
    setProgramCurrentStep(
      (previous) =>
        Math.max(
          0,
          previous - 1
        )
    );

    setProgramCompleted(
      false
    );
  };

  useEffect(() => {
    if (
      !programAutoPlay ||
      !programRunning
    ) {
      return;
    }

    const timer =
      setTimeout(
        nextProgram,
        900
      );

    return () =>
      clearTimeout(timer);
  }, [
    programAutoPlay,
    programRunning,
    programCurrentStep,
    programSteps
  ]);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const selectAnswer = (
    questionIndex,
    optionIndex
  ) => {
    if (experimentCompleted) return;

    const nextAnswers = {
      ...answers,
      [questionIndex]: optionIndex,
    };
    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === QUESTIONS.length) {
      const score = QUESTIONS.reduce(
        (total, question, index) =>
          total + (nextAnswers[index] === question.answer ? 1 : 0),
        0
      );
      setQuestionResult({ score, total: QUESTIONS.length });
    }
  };

  /* =========================================================
     FINAL SUBMIT
     ========================================================= */

  const submitExperiment = () => {
    if (!observations.length) {
      alert(
        "Please complete the Simulation first."
      );
      return;
    }

    if (!programCompleted) {
      alert(
        "Please complete Program Execution first."
      );
      return;
    }

    if (!questionResult) {
      alert(
        "Please answer all questions before submitting the experiment."
      );
      return;
    }

    const result = buildDstResult({
      experimentNo: 5,
      experimentName:
        "Factorial and Fibonacci Series Using Recursion",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment5Result",
      JSON.stringify(result)
    );
    localStorage.setItem("assignmentResult", JSON.stringify(result));

    navigate(
      "/result",
      {
        state: result
      }
    );
  };

  /* =========================================================
     RECURSION STACK
     ========================================================= */

  const renderStack = (
    stack
  ) => {
    return (
      <div className="dst5-stack-wrapper">

        <div className="dst5-stack-title">
          <span>
            RECURSION CALL STACK
          </span>

          <small>
            LIFO • TOP
          </small>
        </div>

        <div className="dst5-stack">

          {stack.length === 0 ? (
            <div className="dst5-empty">
              STACK EMPTY
            </div>
          ) : (
            [...stack]
              .reverse()
              .map(
                (
                  frame,
                  reverseIndex
                ) => {

                  const index =
                    stack.length -
                    1 -
                    reverseIndex;

                  return (
                    <div
                      key={`${frame.function}-${index}`}
                      className={`dst5-stack-cell ${
                        index ===
                        stack.length -
                          1
                          ? "top"
                          : ""
                      }`}
                    >

                      <div>
                        <span>
                          CALL{" "}
                          {index + 1}
                        </span>

                        <b>
                          {
                            frame.function
                          }
                        </b>
                      </div>

                      <em>
                        {
                          frame.status
                        }
                      </em>

                    </div>
                  );
                }
              )
          )}

        </div>

        <div className="dst5-stack-footer">
          <span>
            BOTTOM
          </span>

          <span>
            ↑ CALL / RETURN ↑
          </span>
        </div>

      </div>
    );
  };

  return (
    <div className="dst5-root">

      <div className="dst5-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="dst5-header">

          <button
            className="dst5-back"
            onClick={() =>
              navigate("/dst-experiments")
            }
          >
            ← Back
          </button>

          <div className="dst5-header-title">

            <div className="dst5-exp-no">
              Experiment No. 5
            </div>

            <h1>
              Factorial and Fibonacci Series Using Recursion
            </h1>

          </div>

          <button
            className="dst5-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div
            className="dst5-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst5-help-title"
              aria-modal="true"
              className="dst5-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst5-help-dialog-header">
                <h2 id="dst5-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst5-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Choose Factorial or Fibonacci in the Simulation tab and enter a valid value.</li>
                <li>Use the step controls to follow recursive calls, base cases, and returns.</li>
                <li>In the Program tab, run the matching C program and review its execution.</li>
                <li>Answer all 20 questions, submit them, then use Submit Experiment to finish.</li>
              </ul>
              <button
                className="dst5-help-done"
                onClick={() => setShowHelp(false)}
                type="button"
              >
                Got it
              </button>
            </section>
          </div>
        )}

        {/* =================================================
            AIM
            ================================================= */}

        <div className="dst5-card dst5-aim">

          <div className="dst5-title">
            Aim
          </div>

          <p>
            To write a C program for finding
            factorial and Fibonacci series
            by using recursion.
          </p>

        </div>

        {/* =================================================
            THEORY
            ================================================= */}

        <div className="dst5-card dst5-collapse">

          <button
            className="dst5-collapse-header"
            onClick={() =>
              setShowTheory(
                !showTheory
              )
            }
          >
            <span>
              Theory
            </span>

            <span>
              {showTheory
                ? "▲"
                : "▼"}
            </span>
          </button>

          {showTheory && (

            <div className="dst5-collapse-content">

              <p>
                Recursion is a technique in
                which a function calls itself
                to solve a smaller version of
                the same problem.
              </p>

              <p>
                A recursive function must have
                a base condition. The base
                condition stops further recursive
                calls and allows the function
                to return its result.
              </p>

              <div className="dst5-theory-grid">

                <div>
                  <b>
                    Function Call
                  </b>

                  <span>
                    Function calls itself
                  </span>
                </div>

                <div>
                  <b>
                    Base Case
                  </b>

                  <span>
                    Stops recursion
                  </span>
                </div>

                <div>
                  <b>
                    Return
                  </b>

                  <span>
                    Sends result back
                  </span>
                </div>

                <div>
                  <b>
                    Stack
                  </b>

                  <span>
                    Stores function calls
                  </span>
                </div>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            PROCEDURE
            ================================================= */}

        <div className="dst5-card dst5-collapse">

          <button
            className="dst5-collapse-header"
            onClick={() =>
              setShowProcedure(
                !showProcedure
              )
            }
          >
            <span>
              Procedure
            </span>

            <span>
              {showProcedure
                ? "▲"
                : "▼"}
            </span>
          </button>

          {showProcedure && (

            <div className="dst5-collapse-content">

              <div className="dst5-procedure">

                <ol>

                  <li>
                    Select Factorial or
                    Fibonacci operation.
                  </li>

                  <li>
                    Enter the required
                    integer value.
                  </li>

                  <li>
                    Start the simulation.
                  </li>

                  <li>
                    Observe recursive
                    function calls and
                    base conditions.
                  </li>

                </ol>

                <ol start="5">

                  <li>
                    Follow the return of
                    values from each call.
                  </li>

                  <li>
                    Observe the recursion
                    call stack.
                  </li>

                  <li>
                    Continue until the
                    final result is obtained.
                  </li>

                  <li>
                    Record the result in
                    the observation table.
                  </li>

                </ol>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            TABS
            ================================================= */}

        <div className="dst5-tabs">

          <button
            className={
              activeTab ===
              "simulation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "simulation"
              )
            }
          >
            Simulation
          </button>

          <button
            className={
              activeTab ===
              "program"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "program"
              )
            }
          >
            Program
          </button>

          <button
            className={
              activeTab ===
              "questions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "questions"
              )
            }
          >
            Questions
          </button>

        </div>

        {/* =================================================
            SIMULATION
            ================================================= */}

        {activeTab ===
          "simulation" && (

          <>

            <div className="dst5-sim-row">

              {/* INPUT */}

              <div className="dst5-card dst5-input">

                <div className="dst5-section">
                  Input
                </div>

                <label>
                  Operation
                </label>

                <select
                  value={operation}
                  onChange={(e) => {
                    setOperation(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                >
                  <option>
                    Factorial
                  </option>

                  <option>
                    Fibonacci
                  </option>
                </select>

                <label>
                  Enter Number
                </label>

                <input
                  type="number"
                  min="0"
                  max={
                    operation ===
                    "Factorial"
                      ? "10"
                      : "8"
                  }
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                />

                <div className="dst5-example">

                  <b>
                    Example
                  </b>

                  <span>
                    {operation ===
                    "Factorial"
                      ? "5 → 120"
                      : "5 → 0, 1, 1, 2, 3, 5"}
                  </span>

                </div>

                <button
                  className="dst5-primary"
                  onClick={
                    startSimulation
                  }
                >
                  ▶ Start Simulation
                </button>

                <button
                  className="dst5-secondary"
                  onClick={
                    resetSimulation
                  }
                >
                  Reset
                </button>

                <div className="dst5-info">

                  <b>
                    Input Range
                  </b>

                  <span>
                    {operation ===
                    "Factorial"
                      ? "0 to 10"
                      : "0 to 8"}
                  </span>

                </div>

              </div>

              {/* CANVAS */}

              <div className="dst5-card dst5-canvas">

                <div className="dst5-panel-heading">

                  <span>
                    Recursive Execution
                  </span>

                  <small>
                    {currentSimulationStep
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst5-recursion-info">

                  <div>
                    <span>
                      Operation
                    </span>

                    <b>
                      {operation}
                    </b>
                  </div>

                  <div>
                    <span>
                      Input
                    </span>

                    <b>
                      {inputValue ||
                        "—"}
                    </b>
                  </div>

                  <div>
                    <span>
                      Current Step
                    </span>

                    <b>
                      {steps.length
                        ? `${
                            currentStep +
                            1
                          } / ${
                            steps.length
                          }`
                        : "0 / 0"}
                    </b>
                  </div>

                </div>

                <div className="dst5-stack-stage">

                  {renderStack(
                    currentSimulationStep
                      ?.stack ||
                      []
                  )}

                </div>

                <div
                  className={`dst5-message ${
                    currentSimulationStep
                      ?.type ===
                    "error"
                      ? "error"
                      : ""
                  } ${
                    currentSimulationStep
                      ?.type ===
                    "success"
                      ? "success"
                      : ""
                  }`}
                >

                  <b>
                    {currentSimulationStep
                      ?.title ||
                      "READY"}
                  </b>

                  <span>
                    {currentSimulationStep
                      ?.message ||
                      "Start the simulation to see recursive function calls."}
                  </span>

                </div>

                <div className="dst5-result-box">

                  <span>
                    Current Result
                  </span>

                  <b>
                    {currentSimulationStep
                      ?.result !==
                    null &&
                    currentSimulationStep
                      ?.result !==
                      undefined
                      ? currentSimulationStep
                          .result
                      : "—"}
                  </b>

                </div>

                {operation ===
                  "Fibonacci" &&
                  currentSimulationStep
                    ?.series && (

                    <div className="dst5-series-box">

                      <span>
                        Fibonacci Series
                      </span>

                      <b>
                        {
                          currentSimulationStep
                            .series
                            .join(
                              "  "
                            )
                        }
                      </b>

                    </div>

                  )}

                <div className="dst5-controls">

                  <button
                    className="dst5-secondary"
                    onClick={
                      previousSimulation
                    }
                    disabled={
                      currentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Step{" "}
                    {steps.length
                      ? currentStep +
                        1
                      : 0}
                    {" / "}
                    {steps.length}
                  </span>

                  <button
                    className="dst5-primary"
                    onClick={
                      nextSimulation
                    }
                    disabled={
                      !steps.length ||
                      currentStep >=
                        steps.length -
                          1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="dst5-card dst5-analysis">

                <div className="dst5-section">
                  Analysis
                </div>

                <div className="dst5-analysis-box">

                  <span>
                    Operation
                  </span>

                  <b>
                    {operation}
                  </b>

                </div>

                <div className="dst5-analysis-box">

                  <span>
                    Input
                  </span>

                  <b>
                    {inputValue ||
                      "—"}
                  </b>

                </div>

                <div className="dst5-analysis-box">

                  <span>
                    Active Calls
                  </span>

                  <b>
                    {
                      currentSimulationStep
                        ?.stack
                        ?.length ||
                      0
                    }
                  </b>

                </div>

                <div className="dst5-analysis-box">

                  <span>
                    Result
                  </span>

                  <b>
                    {currentSimulationStep
                      ?.type ===
                    "success"
                      ? operation ===
                        "Factorial"
                        ? currentSimulationStep
                            .result
                        : currentSimulationStep
                            .series
                            ?.join(
                              ", "
                            )
                      : "—"}
                  </b>

                </div>

                <div className="dst5-analysis-box">

                  <span>
                    Attempts
                  </span>

                  <b>
                    {
                      observations.length
                    }
                  </b>

                </div>

                <div className="dst5-observations">

                  {observations
                    .slice(-4)
                    .map(
                      (item) => (

                        <div
                          key={
                            item.attempt
                          }
                        >

                          <b>
                            #
                            {
                              item.attempt
                            }{" "}
                            {
                              item.operation
                            }
                          </b>

                          <span>
                            Result:{" "}
                            {
                              item.result
                            }
                          </span>

                        </div>

                      )
                    )}

                </div>

              </div>

            </div>

            {/* OBSERVATION TABLE */}

            {observations.length >
              0 && (

              <div className="dst5-card dst5-observation-table-card">

                <div className="dst5-section">
                  Observation Table
                </div>

                <div className="dst5-observation-table-wrapper">

                  <table className="dst5-observation-table">

                    <thead>

                      <tr>
                        <th>
                          Attempt
                        </th>

                        <th>
                          Operation
                        </th>

                        <th>
                          Input
                        </th>

                        <th>
                          Result
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {observations.map(
                        (item) => (

                          <tr
                            key={
                              item.attempt
                            }
                          >

                            <td>
                              {
                                item.attempt
                              }
                            </td>

                            <td>
                              {
                                item.operation
                              }
                            </td>

                            <td>
                              {
                                item.input
                              }
                            </td>

                            <td className="dst5-value-cell">
                              {
                                item.result
                              }
                            </td>

                            <td>

                              <span className="dst5-status-success">
                                ✓{" "}
                                {
                                  item.status
                                }
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </>

        )}

        {/* =================================================
            PROGRAM
            ================================================= */}

        {activeTab ===
          "program" && (

          <div className="dst5-program-area">

            <div className="dst5-program-grid">

              {/* LEFT */}

              <div className="dst5-program-left">

                <div className="dst5-card dst5-code-card">

                  <div className="dst5-section">
                    C Program
                  </div>

                  <div className="dst5-code-header">

                    <span>
                      recursion.c
                    </span>

                    <span>
                      READ ONLY
                    </span>

                  </div>

                  <pre className="dst5-code">
{`#include <stdio.h>

long long factorial(int n)
{
    if(n == 0 || n == 1)
        return 1;

    return n * factorial(n - 1);
}

int fibonacci(int n)
{
    if(n == 0)
        return 0;

    if(n == 1)
        return 1;

    return fibonacci(n - 1)
         + fibonacci(n - 2);
}

int main()
{
    int n, i;

    printf("Enter number: ");
    scanf("%d", &n);

    printf("\\nFactorial = %lld",
           factorial(n));

    printf("\\nFibonacci Series: ");

    for(i = 0; i <= n; i++)
    {
        printf("%d ",
               fibonacci(i));
    }

    return 0;
}`}
                  </pre>

                </div>

                <div className="dst5-card dst5-program-input">

                  <div className="dst5-section">
                    Program Input
                  </div>

                  <label>
                    Operation
                  </label>

                  <select
                    value={
                      programOperation
                    }
                    onChange={(e) => {
                      setProgramOperation(
                        e.target.value
                      );

                      setProgramSteps(
                        []
                      );

                      setProgramCurrentStep(
                        -1
                      );

                      setProgramRunning(
                        false
                      );

                      setProgramCompleted(
                        false
                      );
                    }}
                  >
                    <option>
                      Factorial
                    </option>

                    <option>
                      Fibonacci
                    </option>
                  </select>

                  <label>
                    Enter Number
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={
                      programOperation ===
                      "Factorial"
                        ? "10"
                        : "8"
                    }
                    value={
                      programValue
                    }
                    onChange={(e) => {
                      setProgramValue(
                        e.target.value
                      );

                      setProgramCompleted(
                        false
                      );

                      setProgramRunning(
                        false
                      );
                    }}
                  />

                  <div className="dst5-program-buttons">

                    <button
                      className="dst5-primary"
                      onClick={
                        runProgram
                      }
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst5-secondary"
                      onClick={() => {

                        setProgramValue(
                          DEFAULT_VALUE
                        );

                        setProgramSteps(
                          []
                        );

                        setProgramCurrentStep(
                          -1
                        );

                        setProgramRunning(
                          false
                        );

                        setProgramCompleted(
                          false
                        );

                        setProgramAutoPlay(
                          false
                        );

                      }}
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              </div>

              {/* RIGHT */}

              <div className="dst5-card dst5-program-sim">

                <div className="dst5-panel-heading">

                  <span>
                    Program Execution
                  </span>

                  <small>
                    {programCompleted
                      ? "COMPLETED"
                      : programRunning
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst5-live-strip">

                  <div>
                    <span>
                      Operation
                    </span>

                    <b>
                      {
                        programOperation
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Current Call
                    </span>

                    <b>
                      {
                        currentProgramStep
                          ?.stack?.[
                          currentProgramStep
                            ?.stack
                            ?.length -
                            1
                        ]?.function ||
                        "—"
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Step
                    </span>

                    <b>
                      {programSteps.length
                        ? `${
                            programCurrentStep +
                            1
                          } / ${
                            programSteps.length
                          }`
                        : "0 / 0"}
                    </b>
                  </div>

                </div>

                <div className="dst5-program-stack">

                  {renderStack(
                    currentProgramStep
                      ?.stack ||
                      []
                  )}

                </div>

                <div
                  className={`dst5-message ${
                    currentProgramStep
                      ?.type ===
                    "error"
                      ? "error"
                      : ""
                  } ${
                    currentProgramStep
                      ?.type ===
                    "success"
                      ? "success"
                      : ""
                  }`}
                >

                  <b>
                    {currentProgramStep
                      ?.title ||
                      "PROGRAM READY"}
                  </b>

                  <span>
                    {currentProgramStep
                      ?.message ||
                      "Enter a value and click Run Program to begin execution."}
                  </span>

                </div>

                <div className="dst5-controls">

                  <button
                    className="dst5-secondary"
                    onClick={
                      previousProgram
                    }
                    disabled={
                      programCurrentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst5-secondary"
                    onClick={() =>
                      setProgramAutoPlay(
                        (value) =>
                          !value
                      )
                    }
                    disabled={
                      !programRunning ||
                      programCompleted
                    }
                  >
                    {programAutoPlay
                      ? "⏸ Pause"
                      : "▶ Auto Play"}
                  </button>

                  <button
                    className="dst5-primary"
                    onClick={
                      nextProgram
                    }
                    disabled={
                      !programSteps.length ||
                      programCurrentStep >=
                        programSteps.length -
                          1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

            </div>

            {/* TRACE */}

            {programSteps.length >
              0 && (

              <div className="dst5-card dst5-trace-card">

                <div className="dst5-trace-header">

                  <div>

                    <div className="dst5-section">
                      Execution Trace
                    </div>

                    <p>
                      Each recursive
                      function call and
                      return operation.
                    </p>

                  </div>

                  <span>
                    {
                      programSteps.length
                    } Steps
                  </span>

                </div>

                <div className="dst5-trace-list">

                  {programSteps.map(
                    (
                      step,
                      index
                    ) => (

                      <button
                        key={index}
                        className={`dst5-trace-item ${
                          programCurrentStep ===
                          index
                            ? "active"
                            : ""
                        } ${
                          index <=
                          programCurrentStep
                            ? "visited"
                            : ""
                        }`}
                        onClick={() => {

                          if (
                            index <=
                            programCurrentStep
                          ) {

                            setProgramCurrentStep(
                              index
                            );

                            setProgramCompleted(
                              index ===
                                programSteps.length -
                                  1 &&
                              step.type ===
                                "success"
                            );

                          }

                        }}
                      >

                        <span className="dst5-trace-number">
                          {index + 1}
                        </span>

                        <span className="dst5-trace-content">

                          <b>
                            {
                              step.title
                            }
                          </b>

                          <small>
                            {
                              step.message
                            }
                          </small>

                          <small>
                            Stack:{" "}
                            {step.stack
                              .length
                              ? step.stack
                                  .map(
                                    (
                                      frame
                                    ) =>
                                      frame.function
                                  )
                                  .join(
                                    " → "
                                  )
                              : "Empty"}
                          </small>

                        </span>

                        <span className="dst5-trace-status">
                          {index <=
                          programCurrentStep
                            ? "✓"
                            : "○"}
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

            )}

            {/* OUTPUT */}

            {programCompleted &&
              currentProgramStep && (

              <div className="dst5-card dst5-output-card">

                <div className="dst5-section">
                  Program Output
                </div>

                <pre className="dst5-output">
{`Operation : ${programOperation}

Input : ${programValue}

Result : ${
  programOperation ===
  "Factorial"
    ? currentProgramStep.result
    : "Fibonacci series generated"
}

${
  programOperation ===
  "Fibonacci"
    ? `Fibonacci Series : ${
        currentProgramStep.series
          ?.join(", ") ||
        "Completed"
      }`
    : ""
}

Execution Status : SUCCESS

All recursive program steps completed.`}
                </pre>

              </div>

            )}

          </div>

        )}

        {/* =================================================
            QUESTIONS
            ================================================= */}

        {activeTab ===
          "questions" && (

          <div className="dst5-card dst5-questions">

            <div className="dst5-section">
              Questions
            </div>

            {QUESTIONS.map(
              (
                question,
                index
              ) => (

                <div
                  className="dst5-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {question.q}
                  </b>

                  <div className="dst5-options">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (

                        <label
                          key={
                            optionIndex
                          }
                          className={
                            answers[index] ===
                            optionIndex
                              ? "selected"
                              : ""
                          }
                        >

                          <input
                            type="radio"
                            name={`q-${index}`}
                            checked={
                              answers[index] ===
                              optionIndex
                            }
                            onChange={() =>
                              selectAnswer(
                                index,
                                optionIndex
                              )
                            }
                            disabled={experimentCompleted}
                          />

                          {option}

                        </label>

                      )
                    )}

                  </div>

                </div>

              )
            )}

            {experimentCompleted && questionResult && (

              <div className="dst5-question-result">

                <b>
                  Quiz Completed
                  <br />
                  Score:{" "}
                  {
                    questionResult.score
                  }
                  /
                  {
                    questionResult.total
                  }
                </b>

                <span>
                  ✓ Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* =================================================
            FINAL SUBMIT
            ================================================= */}

        <div className="dst5-submit-section">

          <button
            className="dst5-submit"
            onClick={
              submitExperiment
            }
            disabled={
              experimentCompleted
            }
          >
            {experimentCompleted
              ? "✓ Submitted"
              : "Submit Experiment"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default DSTExperiment5;