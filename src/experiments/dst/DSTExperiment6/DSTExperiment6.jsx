import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment6.css";

const DEFAULT_EXPRESSION = "23*54*+9-";

/* =========================================================
   POSTFIX STEP BUILDER
   ========================================================= */

const buildPostfixSteps = (expression) => {
  const exp = expression.replace(/\s/g, "");

  if (!exp) {
    return [{
      message: "Please enter a postfix expression.",
      token: "—",
      stack: [],
      current: -1,
      type: "error"
    }];
  }

  if (!/^[0-9+\-*/%^]+$/.test(exp)) {
    return [{
      message: "Invalid expression. Use digits and + - * / % ^ only.",
      token: "—",
      stack: [],
      current: -1,
      type: "error"
    }];
  }

  const stack = [];
  const steps = [];

  for (let i = 0; i < exp.length; i++) {
    const token = exp[i];

    if (!isNaN(token)) {
      stack.push(Number(token));

      steps.push({
        message: `Operand ${token} is pushed onto the stack.`,
        token,
        stack: [...stack],
        current: i,
        type: "push"
      });
    } else {
      if (stack.length < 2) {
        steps.push({
          message: `Operator ${token} requires two operands.`,
          token,
          stack: [...stack],
          current: i,
          type: "error"
        });

        return steps;
      }

      const b = stack.pop();
      const a = stack.pop();

      let result;

      switch (token) {
        case "+":
          result = a + b;
          break;

        case "-":
          result = a - b;
          break;

        case "*":
          result = a * b;
          break;

        case "/":
          result = a / b;
          break;

        case "%":
          result = a % b;
          break;

        case "^":
          result = a ** b;
          break;

        default:
          result = 0;
      }

      stack.push(result);

      steps.push({
        message:
          `Pop ${a} and ${b}. Calculate ${a} ${token} ${b} = ${result}, then push the result.`,
        token,
        stack: [...stack],
        current: i,
        type: "operate"
      });
    }
  }

  if (stack.length !== 1) {
    steps.push({
      message: "Invalid postfix expression.",
      token: "—",
      stack: [...stack],
      current: -1,
      type: "error"
    });

    return steps;
  }

  steps.push({
    message: `Evaluation completed. Final result = ${stack[0]}.`,
    token: "✓",
    stack: [...stack],
    current: -1,
    type: "success"
  });

  return steps;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment6 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");

  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
   const [showHelp, setShowHelp] = useState(false);

  /* SIMULATION */

  const [expression, setExpression] =
    useState(DEFAULT_EXPRESSION);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [observations, setObservations] =
    useState([]);

  /* PROGRAM */

  const [programExpression, setProgramExpression] =
    useState(DEFAULT_EXPRESSION);

  const [programSteps, setProgramSteps] =
    useState([]);

  const [programCurrentStep, setProgramCurrentStep] =
    useState(-1);

  const [programRunning, setProgramRunning] =
    useState(false);

  const [programCompleted, setProgramCompleted] =
    useState(false);

  const [autoPlay, setAutoPlay] =
    useState(false);

  /* QUESTIONS */

  const questions = [
    {
      q: "Postfix expression evaluation uses which data structure?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      answer: 1
    },
    {
      q: "An operand in postfix evaluation is:",
      options: [
        "Pushed onto stack",
        "Deleted",
        "Ignored",
        "Printed only"
      ],
      answer: 0
    },
    {
      q: "An operator normally requires how many operands?",
      options: ["One", "Two", "Three", "None"],
      answer: 1
    },
    {
      q: "Postfix form of 2 + 3 is:",
      options: ["+23", "23+", "2+3", "32+"],
      answer: 1
    },
    {
      q: "Stack follows which principle?",
      options: ["FIFO", "LIFO", "FCFS", "Random"],
      answer: 1
    },
    {
      q: "Which operation inserts an element into stack?",
      options: ["Pop", "Push", "Peek", "Delete"],
      answer: 1
    },
    {
      q: "Which operation removes an element from stack?",
      options: ["Push", "Pop", "Display", "Insert"],
      answer: 1
    },
    {
      q: "Result of postfix expression 23+ is:",
      options: ["1", "5", "6", "23"],
      answer: 1
    },
    {
      q: "After valid postfix evaluation, stack contains:",
      options: [
        "No value",
        "One final value",
        "All operands",
        "All operators"
      ],
      answer: 1
    },
    {
      q: "For 8 3 -, the calculation is:",
      options: ["3 - 8", "8 - 3", "8 + 3", "3 + 8"],
      answer: 1
    },
    {
      q: "For postfix expression 8 2 -, what is the result?",
      options: ["-6", "6", "10", "16"],
      answer: 1
    },
    {
      q: "For postfix expression 8 2 /, what is the result?",
      options: ["4", "6", "16", "0.25"],
      answer: 0
    },
    {
      q: "When evaluating postfix expression 2 3 *, what is the stack after reading 2 and 3?",
      options: ["[2, 3]", "[5]", "[6]", "[]"],
      answer: 0
    },
    {
      q: "What is the result of postfix expression 2 3 * 4 +?",
      options: ["14", "20", "10", "24"],
      answer: 0
    },
    {
      q: "In postfix evaluation, for operands 8 and 3 followed by -, which value is the left operand?",
      options: ["3", "8", "-", "Neither operand"],
      answer: 1
    },
    {
      q: "What should the evaluator do when an operator is read but the stack has fewer than two operands?",
      options: ["Report an invalid expression", "Push the operator as a number", "Restart the expression", "Ignore the operator"],
      answer: 0
    },
    {
      q: "How many values should remain on the stack after a valid complete postfix expression is evaluated?",
      options: ["Zero", "One", "Two", "One for each operator"],
      answer: 1
    },
    {
      q: "What is the result of postfix expression 6 2 / 3 +?",
      options: ["2", "5", "6", "9"],
      answer: 2
    },
    {
      q: "Which postfix expression represents (2 + 3) * 4?",
      options: ["2 3 4 + *", "2 3 + 4 *", "2 3 * 4 +", "4 2 + 3 *"],
      answer: 1
    },
    {
      q: "What does the stack do immediately after an operator is applied to two operands?",
      options: ["Pushes the computed result", "Pushes both operands again", "Clears every value", "Removes the operator only"],
      answer: 0
    }
  ];

  const [answers, setAnswers] = useState({});
  const [questionResult, setQuestionResult] =
    useState(null);

  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     SIMULATION
     ========================================================= */

  const startSimulation = () => {
    const generated =
      buildPostfixSteps(expression);

    setSteps(generated);
    setCurrentStep(0);

    // Observation is NOT added here.
    // It will be added only when the final result step is reached.
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;

      setCurrentStep(next);

      /* =====================================================
         ADD OBSERVATION ONLY AT FINAL RESULT
         ===================================================== */

      const finalStep = steps[next];

      if (finalStep?.type === "success") {
        setObservations((old) => {

          // Prevent duplicate observation for same completed run
          const alreadyExists =
            old.some(
              (item) =>
                item.expression ===
                  expression.replace(/\s/g, "") &&
                item.result === finalStep.stack[0]
            );

          if (alreadyExists) {
            return old;
          }

          return [
            ...old,
            {
              attempt: old.length + 1,
              expression:
                expression.replace(/\s/g, ""),
              result: finalStep.stack[0],
              status: "Successful"
            }
          ];
        });
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((old) => old - 1);
    }
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  /* =========================================================
     PROGRAM
     ========================================================= */

  const runProgram = () => {
    const generated =
      buildPostfixSteps(programExpression);

    setProgramSteps(generated);
    setProgramCurrentStep(0);
    setProgramRunning(true);
    setProgramCompleted(false);
    setAutoPlay(false);
  };

  const programNext = () => {
    if (
      programCurrentStep <
      programSteps.length - 1
    ) {
      const next =
        programCurrentStep + 1;

      setProgramCurrentStep(next);

      if (
        next ===
        programSteps.length - 1
      ) {
        setProgramCompleted(true);
        setAutoPlay(false);
      }
    }
  };

  const programPrevious = () => {
    if (programCurrentStep > 0) {
      setProgramCurrentStep(
        (old) => old - 1
      );

      setProgramCompleted(false);
    }
  };

  useEffect(() => {
    if (!autoPlay || !programRunning)
      return;

    if (
      programCurrentStep >=
      programSteps.length - 1
    ) {
      setAutoPlay(false);
      setProgramCompleted(true);
      return;
    }

    const timer = setTimeout(
      programNext,
      1000
    );

    return () =>
      clearTimeout(timer);
  }, [
    autoPlay,
    programCurrentStep,
    programSteps,
    programRunning
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

    if (Object.keys(nextAnswers).length === questions.length) {
      const score = questions.reduce(
        (total, question, index) =>
          total + (nextAnswers[index] === question.answer ? 1 : 0),
        0
      );
      setQuestionResult({ score, total: questions.length });
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

    const resultData = buildDstResult({
      experimentNo: 6,
      experimentName: "Evaluate Postfix Expressions",
      questionList: questions,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment6Result",
      JSON.stringify({
        observations,
        questionResult,
        completed: true
      })
    );
    localStorage.setItem("assignmentResult", JSON.stringify(resultData));

    navigate("/result", { state: resultData });
  };

  const currentSimulationStep =
    currentStep >= 0
      ? steps[currentStep]
      : null;

  const currentProgramStep =
    programCurrentStep >= 0
      ? programSteps[programCurrentStep]
      : null;

  /* =========================================================
     STACK VISUALIZER
     ========================================================= */

  const renderStack = (
    stack,
    current = -1
  ) => {
    return (
      <div className="dst6-stack-wrapper">

        <div className="dst6-stack-title">
          <span>STACK MEMORY</span>
          <small>LIFO • TOP</small>
        </div>

        <div className="dst6-stack">

          {stack.length === 0 ? (
            <div className="dst6-empty">
              STACK EMPTY
            </div>
          ) : (
            [...stack]
              .reverse()
              .map((value, reverseIndex) => {

                const index =
                  stack.length -
                  1 -
                  reverseIndex;

                return (
                  <div
                    key={index}
                    className={`
                      dst6-stack-cell
                      ${
                        index ===
                        stack.length - 1
                          ? "top"
                          : ""
                      }
                      ${
                        index === current
                          ? "current"
                          : ""
                      }
                    `}
                  >

                    <span>
                      stack[{index}]
                    </span>

                    <b>{value}</b>

                    {index ===
                      stack.length - 1 && (
                      <em>TOP</em>
                    )}

                  </div>
                );
              })
          )}

        </div>

        <div className="dst6-stack-footer">
          <span>BOTTOM</span>
          <span>↑ PUSH / POP ↑</span>
        </div>

      </div>
    );
  };

  return (
    <div className="dst6-root">

      <div className="dst6-container">

        {/* HEADER */}

        <header className="dst6-header">

          <button
            className="dst6-back"
            onClick={() => navigate("/dst-experiments")}
          >
            ← Back
          </button>

          <div className="dst6-header-title">

            <div className="dst6-exp-no">
              Experiment No. 6
            </div>

            <h1>
              Evaluate Postfix Expressions Using Stack
            </h1>

          </div>

          <button
            className="dst6-help"
             onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

         {showHelp && (
           <div
             className="dst6-help-overlay"
             onClick={() => setShowHelp(false)}
           >
             <section
               aria-labelledby="dst6-help-title"
               aria-modal="true"
               className="dst6-help-dialog"
               onClick={(event) => event.stopPropagation()}
               role="dialog"
             >
               <div className="dst6-help-dialog-header">
                 <h2 id="dst6-help-title">Experiment Help</h2>
                 <button
                   aria-label="Close help"
                   className="dst6-help-close"
                   onClick={() => setShowHelp(false)}
                   type="button"
                 >
                   ×
                 </button>
               </div>
               <ul>
                 <li>Enter a postfix expression using digits and the supported operators.</li>
                 <li>Start the simulation and step through each token to watch the stack change.</li>
                 <li>Use the Program tab to follow the corresponding C program execution.</li>
                 <li>Answer all 20 questions and submit them before submitting the experiment.</li>
               </ul>
               <button
                 className="dst6-help-done"
                 onClick={() => setShowHelp(false)}
                 type="button"
               >
                 Got it
               </button>
             </section>
           </div>
         )}

        {/* AIM */}

        <div className="dst6-card dst6-aim">

          <div className="dst6-title">
            Aim
          </div>

          <p>
            To write a C program to evaluate
            a postfix expression using stack.
          </p>

        </div>

        {/* THEORY */}

        <div className="dst6-card dst6-collapse">

          <button
            className="dst6-collapse-header"
            onClick={() =>
              setShowTheory(!showTheory)
            }
          >
            <span>Theory</span>

            <span>
              {showTheory ? "▲" : "▼"}
            </span>
          </button>

          {showTheory && (
            <div className="dst6-collapse-content">

              <p>
                A postfix expression places
                operators after their operands.
                It can be evaluated using a stack.
              </p>

              <p>
                Scan the expression from left to
                right. Push operands onto the stack.
                When an operator is found, pop two
                operands, perform the operation and
                push the result back.
              </p>

              <div className="dst6-theory-grid">

                <div>
                  <b>Operand</b>
                  <span>Push onto stack</span>
                </div>

                <div>
                  <b>Operator</b>
                  <span>Pop two values</span>
                </div>

                <div>
                  <b>Calculate</b>
                  <span>Apply operator</span>
                </div>

                <div>
                  <b>Result</b>
                  <span>Push result</span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* PROCEDURE */}

        <div className="dst6-card dst6-collapse">

          <button
            className="dst6-collapse-header"
            onClick={() =>
              setShowProcedure(!showProcedure)
            }
          >
            <span>Procedure</span>

            <span>
              {showProcedure ? "▲" : "▼"}
            </span>
          </button>

          {showProcedure && (
            <div className="dst6-collapse-content">

              <div className="dst6-procedure">

                <ol>

                  <li>
                    Enter a valid postfix
                    expression.
                  </li>

                  <li>
                    Scan the expression from
                    left to right.
                  </li>

                  <li>
                    Push every operand onto
                    the stack.
                  </li>

                  <li>
                    When an operator is found,
                    pop two operands.
                  </li>

                </ol>

                <ol start="5">

                  <li>
                    Apply the operator and
                    calculate the result.
                  </li>

                  <li>
                    Push the calculated result
                    onto the stack.
                  </li>

                  <li>
                    Continue until all symbols
                    are processed.
                  </li>

                  <li>
                    The remaining stack value
                    is the final result.
                  </li>

                </ol>

              </div>

            </div>
          )}

        </div>

        {/* TABS */}

        <div className="dst6-tabs">

          <button
            className={
              activeTab === "simulation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("simulation")
            }
          >
            Simulation
          </button>

          <button
            className={
              activeTab === "program"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("program")
            }
          >
            Program
          </button>

          <button
            className={
              activeTab === "questions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("questions")
            }
          >
            Questions
          </button>

        </div>

        {/* =================================================
            SIMULATION
            ================================================= */}

        {activeTab === "simulation" && (

          <>

            <div className="dst6-sim-row">

              {/* INPUT */}

              <div className="dst6-card dst6-input">

                <div className="dst6-section">
                  Input
                </div>

                <label>
                  Postfix Expression
                </label>

                <input
                  value={expression}
                  onChange={(e) => {
                    setExpression(
                      e.target.value
                    );
                    resetSimulation();
                  }}
                  placeholder="23*54*+9-"
                />

                <div className="dst6-example">

                  <b>Example</b>

                  <span>
                    23*54*+9-
                  </span>

                </div>

                <button
                  className="dst6-primary"
                  onClick={startSimulation}
                >
                  ▶ Start Evaluation
                </button>

                <button
                  className="dst6-secondary"
                  onClick={resetSimulation}
                >
                  Reset
                </button>

                <div className="dst6-info">

                  <b>Allowed</b>

                  <span>
                    0–9, +, -, *, /, %, ^
                  </span>

                </div>

              </div>

              {/* CANVAS */}

              <div className="dst6-card dst6-canvas">

                <div className="dst6-panel-heading">

                  <span>
                    Postfix Evaluation
                  </span>

                  <small>
                    {currentSimulationStep
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst6-expression">

                  {expression
                    .replace(/\s/g, "")
                    .split("")
                    .map((token, index) => (

                      <span
                        key={index}
                        className={
                          currentSimulationStep
                            ?.current === index
                            ? "active"
                            : ""
                        }
                      >
                        {token}
                      </span>

                    ))}

                </div>

                <div className="dst6-stack-stage">

                  {renderStack(
                    currentSimulationStep
                      ?.stack || []
                  )}

                </div>

                <div
                  className={`
                    dst6-message
                    ${
                      currentSimulationStep
                        ?.type === "error"
                        ? "error"
                        : ""
                    }
                    ${
                      currentSimulationStep
                        ?.type === "success"
                        ? "success"
                        : ""
                    }
                  `}
                >

                  {currentSimulationStep
                    ?.message ||
                    "Start the simulation to see stack operations."}

                </div>

                <div className="dst6-controls">

                  <button
                    className="dst6-secondary"
                    onClick={previousStep}
                    disabled={
                      currentStep <= 0
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    Step{" "}
                    {steps.length
                      ? currentStep + 1
                      : 0}
                    {" / "}
                    {steps.length}
                  </span>

                  <button
                    className="dst6-primary"
                    onClick={nextStep}
                    disabled={
                      !steps.length ||
                      currentStep >=
                        steps.length - 1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="dst6-card dst6-analysis">

                <div className="dst6-section">
                  Analysis
                </div>

                <div className="dst6-analysis-box">

                  <span>Current Token</span>

                  <b>
                    {currentSimulationStep
                      ?.token || "—"}
                  </b>

                </div>

                <div className="dst6-analysis-box">

                  <span>Stack Top</span>

                  <b>
                    {currentSimulationStep
                      ?.stack?.length
                      ? currentSimulationStep
                          .stack[
                          currentSimulationStep
                            .stack.length - 1
                        ]
                      : "—"}
                  </b>

                </div>

                <div className="dst6-analysis-box">

                  <span>Final Result</span>

                  <b>
                    {currentSimulationStep
                      ?.type === "success"
                      ? currentSimulationStep
                          .stack[0]
                      : "—"}
                  </b>

                </div>

                <div className="dst6-analysis-box">

                  <span>Attempts</span>

                  <b>
                    {observations.length}
                  </b>

                </div>

                <div className="dst6-observations">

                  {observations
                    .slice(-4)
                    .map((item) => (

                      <div
                        key={item.attempt}
                      >

                        <b>
                          #{item.attempt}{" "}
                          {item.expression}
                        </b>

                        <span>
                          Result: {item.result}
                        </span>

                      </div>

                    ))}

                </div>

              </div>

            </div>

            {/* OBSERVATION TABLE */}

            {observations.length > 0 && (

              <div className="dst6-card dst6-observation-table-card">

                <div className="dst6-section">
                  Observation Table
                </div>

                <div className="dst6-observation-table-wrapper">

                  <table className="dst6-observation-table">

                    <thead>

                      <tr>
                        <th>Attempt</th>
                        <th>Postfix Expression</th>
                        <th>Result</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {observations.map((item) => (

                        <tr key={item.attempt}>

                          <td>
                            {item.attempt}
                          </td>

                          <td className="dst6-expression-cell">
                            {item.expression}
                          </td>

                          <td>
                            {item.result}
                          </td>

                          <td>

                            <span className="dst6-status-success">
                              ✓ {item.status}
                            </span>

                          </td>

                        </tr>

                      ))}

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

        {activeTab === "program" && (

          <div className="dst6-program-area">

            <div className="dst6-card dst6-program-dropdown-row">
            </div>

            <div className="dst6-program-grid">

              {/* LEFT */}

              <div className="dst6-program-left">

                {/* CODE */}

                <div className="dst6-card dst6-code-card">

                  <div className="dst6-section">
                    C Program
                  </div>

                  <div className="dst6-code-header">

                    <span>
                      postfix_stack.c
                    </span>

                    <span>
                      READ ONLY
                    </span>

                  </div>

                  <pre className="dst6-code">
{`#include <stdio.h>
#include <ctype.h>

#define MAX 50

int stack[MAX];
int top = -1;

void push(int value)
{
    stack[++top] = value;
}

int pop()
{
    return stack[top--];
}

int evaluatePostfix(char exp[])
{
    int i, a, b, result;

    for(i = 0; exp[i] != '\\0'; i++)
    {
        if(isdigit(exp[i]))
        {
            push(exp[i] - '0');
        }
        else
        {
            b = pop();
            a = pop();

            switch(exp[i])
            {
                case '+':
                    result = a + b;
                    break;

                case '-':
                    result = a - b;
                    break;

                case '*':
                    result = a * b;
                    break;

                case '/':
                    result = a / b;
                    break;
            }

            push(result);
        }
    }

    return pop();
}

int main()
{
    char exp[MAX];

    printf("Enter postfix expression: ");
    scanf("%s", exp);

    printf("Result = %d",
           evaluatePostfix(exp));

    return 0;
}`}
                  </pre>

                </div>

                {/* PROGRAM INPUT */}

                <div className="dst6-card dst6-program-input">

                  <div className="dst6-section">
                    Program Input
                  </div>

                  <label>
                    Enter postfix expression
                  </label>

                  <input
                    value={programExpression}
                    onChange={(e) => {
                      setProgramExpression(
                        e.target.value
                      );
                      setProgramCompleted(false);
                      setProgramRunning(false);
                    }}
                    placeholder="23*54*+9-"
                  />

                  <div className="dst6-program-buttons">

                    <button
                      className="dst6-primary"
                      onClick={runProgram}
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst6-secondary"
                      onClick={() => {
                        setProgramExpression(
                          DEFAULT_EXPRESSION
                        );
                        setProgramSteps([]);
                        setProgramCurrentStep(-1);
                        setProgramRunning(false);
                        setProgramCompleted(false);
                        setAutoPlay(false);
                      }}
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              </div>

              {/* EXECUTION */}

              <div className="dst6-card dst6-program-sim">

                <div className="dst6-panel-heading">

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

                <div className="dst6-live-strip">

                  <div>
                    <span>Expression</span>
                    <b>
                      {programExpression || "—"}
                    </b>
                  </div>

                  <div>
                    <span>Current Token</span>
                    <b>
                      {currentProgramStep?.token || "—"}
                    </b>
                  </div>

                  <div>
                    <span>Step</span>
                    <b>
                      {programSteps.length
                        ? `${programCurrentStep + 1} / ${programSteps.length}`
                        : "0 / 0"}
                    </b>
                  </div>

                </div>

                <div className="dst6-program-stack">

                  {renderStack(
                    currentProgramStep?.stack || []
                  )}

                </div>

                <div
                  className={`dst6-message ${
                    currentProgramStep?.type === "error"
                      ? "error"
                      : ""
                  } ${
                    currentProgramStep?.type === "success"
                      ? "success"
                      : ""
                  }`}
                >

                  {currentProgramStep?.message ||
                    "Enter an expression and click Run Program to begin execution."}

                </div>

                <div className="dst6-controls">

                  <button
                    className="dst6-secondary"
                    onClick={programPrevious}
                    disabled={
                      programCurrentStep <= 0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst6-secondary"
                    onClick={() =>
                      setAutoPlay(
                        (value) => !value
                      )
                    }
                    disabled={
                      !programRunning ||
                      programCompleted
                    }
                  >
                    {autoPlay
                      ? "⏸ Pause"
                      : "▶ Auto Play"}
                  </button>

                  <button
                    className="dst6-primary"
                    onClick={programNext}
                    disabled={
                      !programSteps.length ||
                      programCurrentStep >=
                        programSteps.length - 1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

            </div>

            {/* TRACE */}

            {programSteps.length > 0 && (

              <div className="dst6-card dst6-trace-card">

                <div className="dst6-trace-header">

                  <div>

                    <div className="dst6-section">
                      Execution Trace
                    </div>

                    <p>
                      Each step of postfix stack execution
                    </p>

                  </div>

                  <span>
                    {programSteps.length} Steps
                  </span>

                </div>

                <div className="dst6-trace-list">

                  {programSteps.map(
                    (step, index) => (

                      <button
                        key={index}
                        className={`dst6-trace-item ${
                          programCurrentStep === index
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
                              programSteps.length - 1
                            );

                          }

                        }}
                      >

                        <span className="dst6-trace-number">
                          {index + 1}
                        </span>

                        <span className="dst6-trace-content">

                          <b>
                            {step.message}
                          </b>

                          <small>
                            Token: {step.token} • Stack:{" "}
                            {step.stack.length
                              ? step.stack.join(" ")
                              : "Empty"}
                          </small>

                        </span>

                        <span className="dst6-trace-status">
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

                <div className="dst6-card dst6-output-card">

                  <div className="dst6-section">
                    Program Output
                  </div>

                  <pre className="dst6-output">
{`Postfix Expression : ${programExpression.replace(/\s/g, "")}

Final Stack : ${
  currentProgramStep.stack.length
    ? currentProgramStep.stack.join(" ")
    : "Empty"
}

Result : ${
  currentProgramStep.type === "success" &&
  currentProgramStep.stack.length
    ? currentProgramStep.stack[0]
    : "Invalid Expression"
}

Execution Status : ${
  currentProgramStep.type === "success"
    ? "SUCCESS"
    : "ERROR"
}

All program steps completed.`}
                  </pre>

                </div>

              )}

          </div>

        )}

        {/* =================================================
            QUESTIONS
            ================================================= */}

        {activeTab === "questions" && (

          <div className="dst6-card dst6-questions">

            <div className="dst6-section">
              Questions
            </div>

            {questions.map(
              (question, index) => (

                <div
                  className="dst6-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {question.q}
                  </b>

                  <div className="dst6-options">

                    {question.options.map(
                      (option, optionIndex) => (

                        <label
                          key={optionIndex}
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

              <div className="dst6-question-result">

                <b>
                  Quiz Completed
                  <br />
                  Score:{" "}
                  {questionResult.score}/
                  {questionResult.total}
                </b>

                <span>
                  Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* FINAL SUBMIT */}

        <div className="dst6-submit-section">

          <button
            className="dst6-submit"
            onClick={submitExperiment}
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

export default DSTExperiment6;