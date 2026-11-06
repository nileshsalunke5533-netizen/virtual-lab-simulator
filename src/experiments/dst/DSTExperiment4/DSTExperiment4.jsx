import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment4.css";

const PROGRAM_CODE = [
  '#include <stdio.h>',
  '#define MAX 5',
  '',
  'int stack[MAX];',
  'int top = -1;',
  '',
  'void push(int value) {',
  '    if (top == MAX - 1) {',
  '        printf("Stack Overflow");',
  '    } else {',
  '        top++;',
  '        stack[top] = value;',
  '        printf("%d pushed into stack", value);',
  '    }',
  '}',
  '',
  'void pop() {',
  '    if (top == -1) {',
  '        printf("Stack Underflow");',
  '    } else {',
  '        printf("%d popped from stack", stack[top]);',
  '        top--;',
  '    }',
  '}',
  '',
  'int main() {',
  '    int choice, value;',
  '',
  '    printf("1. PUSH\\n2. POP\\n");',
  '    scanf("%d", &choice);',
  '',
  '    if (choice == 1) {',
  '        scanf("%d", &value);',
  '        push(value);',
  '    } else if (choice == 2) {',
  '        pop();',
  '    }',
  '',
  '    return 0;',
  '}'
];

const QUESTIONS = [
  {
    q: "A stack follows which principle?",
    options: ["FIFO", "LIFO", "Random", "Priority"],
    answer: 1
  },
  {
    q: "Which operation inserts an element into a stack?",
    options: ["POP", "DELETE", "PUSH", "DISPLAY"],
    answer: 2
  },
  {
    q: "Which operation removes an element from a stack?",
    options: ["PUSH", "POP", "INSERT", "CREATE"],
    answer: 1
  },
  {
    q: "What is the initial value of TOP in an empty stack?",
    options: ["0", "1", "-1", "MAX"],
    answer: 2
  },
  {
    q: "Stack Overflow occurs when:",
    options: [
      "Stack is empty",
      "Stack is full",
      "TOP is -1",
      "POP is performed"
    ],
    answer: 1
  },
  {
    q: "Stack Underflow occurs when:",
    options: [
      "Stack is full",
      "Stack has one element",
      "POP is performed on an empty stack",
      "PUSH is performed"
    ],
    answer: 2
  },
  {
    q: "In an array implementation, TOP points to:",
    options: [
      "First element",
      "Last inserted element",
      "Middle element",
      "Array size"
    ],
    answer: 1
  },
  {
    q: "What happens to TOP during PUSH?",
    options: [
      "TOP decreases",
      "TOP remains same",
      "TOP increases",
      "TOP becomes -1"
    ],
    answer: 2
  },
  {
    q: "What happens to TOP during POP?",
    options: [
      "TOP increases",
      "TOP decreases",
      "TOP becomes MAX",
      "No change"
    ],
    answer: 1
  },
  {
    q: "The time complexity of PUSH is:",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    answer: 2
  },
  {
    q: "The time complexity of POP is:",
    options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    answer: 0
  },
  {
    q: "If stack contains 10, 20, 30, which value will POP remove?",
    options: ["10", "20", "30", "None"],
    answer: 2
  },
  {
    q: "After pushing the first element into an empty stack, TOP becomes:",
    options: ["-1", "0", "1", "MAX"],
    answer: 1
  },
  {
    q: "If the only element of a stack is popped, TOP becomes:",
    options: ["0", "1", "-1", "MAX"],
    answer: 2
  },
  {
    q: "Which operation is normally used to see the top element without removing it?",
    options: ["Peek", "Push", "Pop", "Insert"],
    answer: 0
  },
  {
    q: "A stack can be implemented using:",
    options: [
      "Only arrays",
      "Only linked lists",
      "Arrays and linked lists",
      "Only queues"
    ],
    answer: 2
  },
  {
    q: "Which data structure is commonly used for function recursion?",
    options: ["Queue", "Stack", "Array only", "Graph"],
    answer: 1
  },
  {
    q: "LIFO stands for:",
    options: [
      "Last In First Out",
      "Last Input First Output",
      "Linear In First Out",
      "Last Index First Output"
    ],
    answer: 0
  },
  {
    q: "For MAX = 5, overflow condition is:",
    options: [
      "top == -1",
      "top == 0",
      "top == MAX - 1",
      "top == MAX"
    ],
    answer: 2
  },
  {
    q: "Which condition represents an empty stack?",
    options: [
      "top == MAX",
      "top == MAX - 1",
      "top == 1",
      "top == -1"
    ],
    answer: 3
  }
];

const createEmptyStack = (size) => Array(size).fill("");

const DSTExperiment4 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");

  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ---------------- SIMULATION ----------------

  const [stackSize, setStackSize] = useState(5);
  const [stackValues, setStackValues] = useState(createEmptyStack(5));

  const [operation, setOperation] = useState("push");
  const [pushValue, setPushValue] = useState("");

  const [simSteps, setSimSteps] = useState([]);
  const [simIndex, setSimIndex] = useState(-1);
  const [simRunning, setSimRunning] = useState(false);
  const [simMessage, setSimMessage] = useState(
    "Enter stack values and select PUSH or POP."
  );
  const [simStatus, setSimStatus] = useState("READY");

  const [observations, setObservations] = useState([]);

  // ---------------- PROGRAM ----------------

  const [programOperation, setProgramOperation] = useState("push");
  const [programValue, setProgramValue] = useState("");
  const [programSteps, setProgramSteps] = useState([]);
  const [programIndex, setProgramIndex] = useState(-1);
  const [programRunning, setProgramRunning] = useState(false);
  const [programStack, setProgramStack] = useState([]);
  const [programOutput, setProgramOutput] = useState("");

  // ---------------- QUESTIONS ----------------

  const [answers, setAnswers] = useState({});

  const currentSimStep =
    simIndex >= 0 && simSteps.length > 0 ? simSteps[simIndex] : null;

  const currentProgramStep =
    programIndex >= 0 && programSteps.length > 0
      ? programSteps[programIndex]
      : null;

  const activeProgramLine = currentProgramStep?.lineNo || 0;

  const effectiveStack = currentSimStep?.stack || stackValues;

  const effectiveTop =
    currentSimStep?.top !== undefined
      ? currentSimStep.top
      : stackValues.reduce(
          (last, value, index) => (value !== "" ? index : last),
          -1
        );

  const topValue =
    effectiveTop >= 0 ? effectiveStack[effectiveTop] || "EMPTY" : "EMPTY";

  // ---------------- STACK SIZE ----------------

  const handleStackSize = (value) => {
    let size = Number(value);

    if (!size || size < 2) size = 2;
    if (size > 8) size = 8;

    setStackSize(size);
    setStackValues((prev) => {
      const next = Array(size).fill("");
      prev.slice(0, size).forEach((v, i) => {
        next[i] = v;
      });
      return next;
    });

    setSimSteps([]);
    setSimIndex(-1);
    setSimStatus("READY");
    setSimMessage("Stack size changed. Enter values in the required boxes.");
  };

  const updateStackValue = (index, value) => {
    if (!/^-?\d*$/.test(value)) return;

    setStackValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // ---------------- SIMULATION ----------------

  const buildSimulationSteps = () => {
    const filledIndexes = stackValues
      .map((value, index) => (value !== "" ? index : -1))
      .filter((index) => index !== -1);

    let top = filledIndexes.length ? Math.max(...filledIndexes) : -1;

    const initialStack = [...stackValues];

    if (operation === "push") {
      if (top === stackSize - 1) {
        return [
          {
            title: "Overflow Check",
            lineNo: 9,
            code: "if (top == MAX - 1)",
            action: "Stack is full. PUSH cannot be performed.",
            stack: initialStack,
            top,
            status: "OVERFLOW"
          }
        ];
      }

      if (pushValue.trim() === "") {
        return [];
      }

      const value = pushValue.trim();
      const afterTop = top + 1;
      const afterStack = [...initialStack];
      afterStack[afterTop] = value;

      return [
        {
          title: "Check Stack",
          lineNo: 9,
          code: "if (top == MAX - 1)",
          action: "Stack has free space. PUSH can continue.",
          stack: initialStack,
          top,
          activeIndex: afterTop,
          status: "CHECKED"
        },
        {
          title: "Move TOP",
          lineNo: 11,
          code: "top++;",
          action: `TOP moves from ${top} to ${afterTop}.`,
          stack: initialStack,
          top: afterTop,
          activeIndex: afterTop,
          status: "TOP UPDATED"
        },
        {
          title: "Insert Value",
          lineNo: 12,
          code: "stack[top] = value;",
          action: `Value ${value} is stored at STACK[${afterTop}].`,
          stack: afterStack,
          top: afterTop,
          activeIndex: afterTop,
          status: "PUSH COMPLETE"
        }
      ];
    }

    // POP
    if (top === -1) {
      return [
        {
          title: "Underflow Check",
          lineNo: 18,
          code: "if (top == -1)",
          action: "Stack is empty. POP cannot be performed.",
          stack: initialStack,
          top: -1,
          status: "UNDERFLOW"
        }
      ];
    }

    const popped = initialStack[top];
    const afterStack = [...initialStack];
    afterStack[top] = "";

    return [
      {
        title: "Check Stack",
        lineNo: 18,
        code: "if (top == -1)",
        action: "Stack contains an element. POP can continue.",
        stack: initialStack,
        top,
        activeIndex: top,
        status: "CHECKED"
      },
      {
        title: "Read Top Value",
        lineNo: 20,
        code: 'printf("%d popped from stack", stack[top]);',
        action: `TOP value ${popped} is selected for POP.`,
        stack: initialStack,
        top,
        activeIndex: top,
        poppedValue: popped,
        status: "VALUE SELECTED"
      },
      {
        title: "Remove Element",
        lineNo: 21,
        code: "top--;",
        action: `Value ${popped} removed. TOP moves to ${top - 1}.`,
        stack: afterStack,
        top: top - 1,
        activeIndex: top,
        poppedValue: popped,
        status: "POP COMPLETE"
      }
    ];
  };

  const startSimulation = () => {
    const steps = buildSimulationSteps();

    if (steps.length === 0) {
      alert(
        operation === "push"
          ? "Please enter a value for PUSH."
          : "No element available for POP."
      );
      return;
    }

    setSimSteps(steps);
    setSimIndex(0);
    setSimRunning(true);
    setSimStatus(steps[0].status);
    setSimMessage(steps[0].action);
  };

  const nextSimulation = () => {
    if (!simRunning || simIndex >= simSteps.length - 1) return;

    const next = simIndex + 1;
    const step = simSteps[next];

    setSimIndex(next);
    setSimStatus(step.status);
    setSimMessage(step.action);

    if (next === simSteps.length - 1) {
      const finalStack = step.stack;
      const finalTop = step.top;

      setStackValues(finalStack);

      const op = operation.toUpperCase();
      const value =
        operation === "push"
          ? pushValue
          : step.poppedValue || "";

      setObservations((prev) => [
        ...prev,
        {
          id: Date.now(),
          operation: op,
          value,
          top: finalTop,
          status: step.status
        }
      ]);

      setSimRunning(false);
    }
  };

  const previousSimulation = () => {
    if (simIndex <= 0) return;

    const prev = simIndex - 1;
    const step = simSteps[prev];

    setSimIndex(prev);
    setSimStatus(step.status);
    setSimMessage(step.action);
  };

  const resetSimulation = () => {
    setSimSteps([]);
    setSimIndex(-1);
    setSimRunning(false);
    setSimStatus("READY");
    setSimMessage("Enter stack values and select PUSH or POP.");
  };

  // ---------------- PROGRAM EXECUTION ----------------

  const programInitialStack = useMemo(() => {
    return stackValues
      .filter((v) => v !== "")
      .map((v) => Number(v));
  }, [stackValues]);

  const buildProgramSteps = () => {
    const initial = [...programInitialStack];

    if (programOperation === "push") {
      const value = Number(programValue);

      if (programValue.trim() === "") return [];

      if (initial.length >= 5) {
        return [
          {
            title: "Overflow Check",
            lineNo: 8,
            code: "if (top == MAX - 1)",
            action: "Stack Overflow",
            stack: initial,
            output: "Stack Overflow"
          }
        ];
      }

      const after = [...initial, value];

      return [
        {
          title: "Check Overflow",
          lineNo: 8,
          code: "if (top == MAX - 1)",
          action: "Stack has free space.",
          stack: initial,
          output: ""
        },
        {
          title: "Update TOP",
          lineNo: 11,
          code: "top++;",
          action: `TOP becomes ${after.length - 1}.`,
          stack: initial,
          output: ""
        },
        {
          title: "Store Value",
          lineNo: 12,
          code: "stack[top] = value;",
          action: `${value} is pushed into the stack.`,
          stack: after,
          output: `${value} pushed into stack`
        }
      ];
    }

    if (initial.length === 0) {
      return [
        {
          title: "Underflow Check",
          lineNo: 17,
          code: "if (top == -1)",
          action: "Stack Underflow",
          stack: [],
          output: "Stack Underflow"
        }
      ];
    }

    const popped = initial[initial.length - 1];
    const after = initial.slice(0, -1);

    return [
      {
        title: "Check Underflow",
        lineNo: 17,
        code: "if (top == -1)",
        action: "Stack contains an element.",
        stack: initial,
        output: ""
      },
      {
        title: "POP Element",
        lineNo: 20,
        code: 'printf("%d popped from stack", stack[top]);',
        action: `${popped} is selected from TOP.`,
        stack: initial,
        output: ""
      },
      {
        title: "Decrease TOP",
        lineNo: 21,
        code: "top--;",
        action: `${popped} is removed from the stack.`,
        stack: after,
        output: `${popped} popped from stack`
      }
    ];
  };

  const runProgram = () => {
    const steps = buildProgramSteps();

    if (steps.length === 0) {
      alert(
        programOperation === "push"
          ? "Enter a value for PUSH."
          : "Stack is empty. Enter values in Simulation tab first."
      );
      return;
    }

    setProgramSteps(steps);
    setProgramIndex(0);
    setProgramRunning(true);
    setProgramStack(steps[0].stack);
    setProgramOutput(steps[0].output || "");
  };

  const nextProgram = () => {
    if (!programRunning || programIndex >= programSteps.length - 1) return;

    const next = programIndex + 1;
    const step = programSteps[next];

    setProgramIndex(next);
    setProgramStack(step.stack);
    setProgramOutput(step.output || "");

    if (next === programSteps.length - 1) {
      setProgramRunning(false);
    }
  };

  const previousProgram = () => {
    if (programIndex <= 0) return;

    const prev = programIndex - 1;
    const step = programSteps[prev];

    setProgramIndex(prev);
    setProgramStack(step.stack);
    setProgramOutput(step.output || "");
  };

  const resetProgram = () => {
    setProgramSteps([]);
    setProgramIndex(-1);
    setProgramRunning(false);
    setProgramStack([]);
    setProgramOutput("");
  };

  // ---------------- QUESTIONS ----------------

  const handleAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  const score = QUESTIONS.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);

  // ---------------- SUBMIT ----------------

  const handleSubmitExperiment = () => {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert("Please answer all questions before submitting the experiment.");
      return;
    }

    const result = buildDstResult({
      experimentNo: 4,
      experimentName:
        "Write a C program to perform PUSH and POP operations of stack using array",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
    });

    localStorage.setItem(
      "dstExperiment4Result",
      JSON.stringify(result)
    );
    localStorage.setItem("assignmentResult", JSON.stringify(result));

    navigate("/result", {
      state: result
    });
  };

  const renderStack = (
    values,
    top,
    activeIndex = -1,
    poppedIndex = -1
  ) => {
    const safeValues = Array(stackSize)
      .fill("")
      .map((_, i) => values?.[i] ?? "");

    return (
      <div className="dst4-stack-wrapper">
        <div className="dst4-stack-top-label">
          <span className="dst4-top-arrow">→</span>
          <strong>TOP</strong>
          <span className="dst4-top-number">
            {top >= 0 ? top : "-1"}
          </span>
        </div>

        <div className="dst4-stack-column">
          {[...safeValues].map((value, index) => {
            const actualIndex = stackSize - 1 - index;
            const cellValue = safeValues[actualIndex];

            const isTop = actualIndex === top;
            const isActive = actualIndex === activeIndex;
            const isPopped = actualIndex === poppedIndex;

            return (
              <div
                key={actualIndex}
                className={[
                  "dst4-stack-cell",
                  cellValue !== "" ? "filled" : "empty",
                  isTop ? "top-cell" : "",
                  isActive ? "active-cell" : "",
                  isPopped ? "popped-cell" : ""
                ].join(" ")}
              >
                <div className="dst4-cell-index">
                  [{actualIndex}]
                </div>

                <div className="dst4-cell-value">
                  {cellValue !== "" ? cellValue : "EMPTY"}
                </div>

                <div className="dst4-cell-address">
                  stack[{actualIndex}]
                </div>
              </div>
            );
          })}
        </div>

        <div className="dst4-stack-base">
          STACK MEMORY
        </div>
      </div>
    );
  };

  return (
    <div className="dst4-root">
      {/* ---------------- HEADER ---------------- */}

      <header className="dst4-header">
        <button
          className="dst4-header-btn"
          onClick={() => navigate("/dst-experiments")}
        >
          ← Back
        </button>

        <div className="dst4-header-title">
          <span>EXPERIMENT NO. 4</span>
          <h1>
            PUSH and POP Operations of Stack Using Array
          </h1>
        </div>

        <button
          className="dst4-header-btn"
          onClick={() => setShowHelp(true)}
        >
          ? Help
        </button>
      </header>

      {/* ---------------- AIM ---------------- */}

      <section className="dst4-card dst4-aim-card">
        <h2>Aim</h2>
        <p>
          To write a C program to perform PUSH and POP operations
          of stack using array.
        </p>
      </section>

      {/* ---------------- THEORY ---------------- */}

      <section
        className="dst4-collapse-card"
        onClick={() => setShowTheory(!showTheory)}
      >
        <div className="dst4-collapse-heading">
          <strong>Theory</strong>
          <span>{showTheory ? "▲" : "▼"}</span>
        </div>

        {showTheory && (
          <div className="dst4-collapse-content">
            <p>
              A stack is a linear data structure that follows the
              <b> LIFO (Last In First Out)</b> principle.
            </p>

            <ul>
              <li>
                <b>PUSH:</b> Inserts a new element at the TOP.
              </li>
              <li>
                <b>POP:</b> Removes the element from the TOP.
              </li>
              <li>
                <b>Overflow:</b> Occurs when PUSH is performed on
                a full stack.
              </li>
              <li>
                <b>Underflow:</b> Occurs when POP is performed on
                an empty stack.
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- PROCEDURE ---------------- */}

      <section
        className="dst4-collapse-card"
        onClick={() => setShowProcedure(!showProcedure)}
      >
        <div className="dst4-collapse-heading">
          <strong>Procedure</strong>
          <span>{showProcedure ? "▲" : "▼"}</span>
        </div>

        {showProcedure && (
          <div className="dst4-collapse-content">
            <ol>
              <li>Initialize TOP to -1.</li>
              <li>
                For PUSH, check whether the stack is full.
              </li>
              <li>
                If space is available, increment TOP and insert
                the value.
              </li>
              <li>
                For POP, check whether the stack is empty.
              </li>
              <li>
                If it is not empty, remove the TOP element and
                decrement TOP.
              </li>
            </ol>
          </div>
        )}
      </section>

      {/* ---------------- TABS ---------------- */}

      <div className="dst4-tabs">
        <button
          className={activeTab === "simulation" ? "active" : ""}
          onClick={() => setActiveTab("simulation")}
        >
          Simulation
        </button>

        <button
          className={activeTab === "program" ? "active" : ""}
          onClick={() => setActiveTab("program")}
        >
          Program
        </button>

        <button
          className={activeTab === "questions" ? "active" : ""}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
      </div>

      {/* ======================================================
          SIMULATION TAB
      ====================================================== */}

      {activeTab === "simulation" && (
        <>
          <div className="dst4-simulation-grid">

            {/* INPUT PANEL */}

            <section className="dst4-panel dst4-input-panel">
              <div className="dst4-panel-title">
                <h3>Input Panel</h3>
              </div>

              <label>Stack Size</label>

              <input
                type="number"
                min="2"
                max="8"
                value={stackSize}
                onChange={(e) =>
                  handleStackSize(e.target.value)
                }
              />

              <label className="dst4-label-space">
                Stack Elements
              </label>

              <div className="dst4-input-stack">
                {stackValues.map((value, index) => (
                  <div
                    className="dst4-input-stack-row"
                    key={index}
                  >
                    <span>[{index}]</span>

                    <input
                      type="text"
                      value={value}
                      placeholder="Enter value"
                      onChange={(e) =>
                        updateStackValue(
                          index,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="dst4-operation-title">
                SELECT OPERATION
              </div>

              <div className="dst4-operation-buttons">
                <button
                  className={
                    operation === "push"
                      ? "selected"
                      : ""
                  }
                  onClick={() => setOperation("push")}
                >
                  <b>↑</b>
                  <span>PUSH</span>
                  <small>Insert element</small>
                </button>

                <button
                  className={
                    operation === "pop"
                      ? "selected"
                      : ""
                  }
                  onClick={() => setOperation("pop")}
                >
                  <b>↓</b>
                  <span>POP</span>
                  <small>Remove element</small>
                </button>
              </div>

              {operation === "push" && (
                <>
                  <label className="dst4-label-space">
                    Value to PUSH
                  </label>

                  <input
                    type="number"
                    value={pushValue}
                    placeholder="Enter value"
                    onChange={(e) =>
                      setPushValue(e.target.value)
                    }
                  />
                </>
              )}

              <button
                className="dst4-run-btn"
                onClick={startSimulation}
              >
                ▶ Start Simulation
              </button>

              <button
                className="dst4-reset-btn"
                onClick={resetSimulation}
              >
                Reset
              </button>
            </section>

            {/* SIMULATION CANVAS */}

            <section className="dst4-panel dst4-canvas-panel">
              <div className="dst4-canvas-header">
                <div>
                  <h3>Stack Memory Visualizer</h3>
                  <p>Step-by-step PUSH / POP operation</p>
                </div>

                <span
                  className={`dst4-status-pill ${
                    simStatus.includes("COMPLETE")
                      ? "success"
                      : simStatus.includes("OVERFLOW") ||
                        simStatus.includes("UNDERFLOW")
                      ? "danger"
                      : ""
                  }`}
                >
                  {simStatus}
                </span>
              </div>

              <div className="dst4-sim-info">
                <div>
                  <small>OPERATION</small>
                  <strong>
                    {operation.toUpperCase()}
                  </strong>
                </div>

                <div>
                  <small>STACK SIZE</small>
                  <strong>{stackSize}</strong>
                </div>

                <div>
                  <small>TOP</small>
                  <strong>{effectiveTop}</strong>
                </div>
              </div>

              <div className="dst4-stack-canvas">
                {renderStack(
                  effectiveStack,
                  effectiveTop,
                  currentSimStep?.activeIndex ?? -1,
                  operation === "pop"
                    ? currentSimStep?.poppedValue !== undefined
                      ? effectiveTop + 1
                      : -1
                    : -1
                )}

                <div className="dst4-working-box">
                  <div className="dst4-working-title">
                    CURRENT WORKING
                  </div>

                  <div className="dst4-working-action">
                    {currentSimStep
                      ? currentSimStep.title
                      : "Ready for execution"}
                  </div>

                  <div className="dst4-working-message">
                    {simMessage}
                  </div>

                  {currentSimStep && (
                    <div className="dst4-working-code">
                      <span>
                        Line {currentSimStep.lineNo}
                      </span>
                      <code>
                        {currentSimStep.code}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div className="dst4-step-controls">
                <button
                  onClick={previousSimulation}
                  disabled={
                    simIndex <= 0
                  }
                >
                  ← Previous
                </button>

                <div>
                  Step{" "}
                  {simIndex >= 0
                    ? simIndex + 1
                    : 0}{" "}
                  / {simSteps.length}
                </div>

                <button
                  onClick={nextSimulation}
                  disabled={
                    !simRunning ||
                    simIndex >=
                      simSteps.length - 1
                  }
                >
                  Next →
                </button>
              </div>
            </section>

            {/* ANALYSIS */}

            <section className="dst4-panel dst4-analysis-panel">
              <div className="dst4-panel-title">
                <h3>Live Analysis</h3>
              </div>

              <div className="dst4-analysis-status">
                <span></span>
                <div>
                  <small>Execution Status</small>
                  <strong>{simStatus}</strong>
                </div>
              </div>

              <div className="dst4-analysis-list">
                <div>
                  <span>Operation</span>
                  <b>{operation}</b>
                </div>

                <div>
                  <span>Stack Size</span>
                  <b>{stackSize}</b>
                </div>

                <div>
                  <span>TOP</span>
                  <b>{effectiveTop}</b>
                </div>

                <div>
                  <span>TOP Value</span>
                  <b>{topValue}</b>
                </div>

                <div>
                  <span>Complexity</span>
                  <b>O(1)</b>
                </div>
              </div>

              <div className="dst4-observation-mini">
                <h4>Observation</h4>

                <p>
                  {currentSimStep
                    ? currentSimStep.action
                    : "Start the simulation to view live analysis."}
                </p>
              </div>
            </section>
          </div>

          {/* OBSERVATION TABLE */}

          <section className="dst4-card dst4-observation-card">
            <div className="dst4-section-heading">
              <h3>Observation</h3>
              <span>{observations.length} operations</span>
            </div>

            <div className="dst4-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Operation</th>
                    <th>Value</th>
                    <th>TOP</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        No completed operation yet.
                      </td>
                    </tr>
                  ) : (
                    observations.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.operation}</td>
                        <td>{item.value || "-"}</td>
                        <td>{item.top}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ======================================================
          PROGRAM TAB
      ====================================================== */}

      {activeTab === "program" && (
        <div className="dst4-program-page">

          <div className="dst4-program-layout">

            {/* CODE */}

            <section className="dst4-code-card">
              <div className="dst4-code-header">
                <span>stack.c</span>
                <small>READ ONLY</small>
              </div>

              <div className="dst4-code-body">
                {PROGRAM_CODE.map((line, index) => {
                  const lineNo = index + 1;

                  return (
                    <div
                      key={lineNo}
                      className={`dst4-code-line ${
                        activeProgramLine === lineNo
                          ? "active-code-line"
                          : ""
                      }`}
                    >
                      <span className="dst4-line-number">
                        {lineNo}
                      </span>

                      <code>{line || " "}</code>
                    </div>
                  );
                })}
              </div>

              {/* PROGRAM INPUT */}

              <div className="dst4-program-input">
                <h3>Program Input</h3>

                <label>Operation</label>

                <div className="dst4-program-operation">
                  <button
                    className={
                      programOperation === "push"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setProgramOperation("push")
                    }
                  >
                    PUSH
                  </button>

                  <button
                    className={
                      programOperation === "pop"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setProgramOperation("pop")
                    }
                  >
                    POP
                  </button>
                </div>

                {programOperation === "push" && (
                  <>
                    <label>Value</label>

                    <input
                      type="number"
                      placeholder="Enter value"
                      value={programValue}
                      onChange={(e) =>
                        setProgramValue(
                          e.target.value
                        )
                      }
                    />
                  </>
                )}

                <div className="dst4-program-buttons">
                  <button
                    className="dst4-run-program"
                    onClick={runProgram}
                  >
                    ▶ Run Program
                  </button>

                  <button
                    className="dst4-reset-program"
                    onClick={resetProgram}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* EXECUTION */}

            <section className="dst4-execution-card">
              <div className="dst4-execution-header">
                <div>
                  <h3>Program Execution</h3>
                  <p>
                    Step-by-step execution of predefined C
                    program
                  </p>
                </div>

                <span className="dst4-status-pill">
                  {programRunning
                    ? "RUNNING"
                    : programSteps.length
                    ? "COMPLETED"
                    : "READY"}
                </span>
              </div>

              <div className="dst4-program-info">
                <div>
                  <small>PROGRAM</small>
                  <strong>Stack using Array</strong>
                </div>

                <div>
                  <small>OPERATION</small>
                  <strong>
                    {programOperation.toUpperCase()}
                  </strong>
                </div>

                <div>
                  <small>STATUS</small>
                  <strong>
                    {programRunning
                      ? "Running"
                      : "Ready"}
                  </strong>
                </div>
              </div>

              <div className="dst4-execution-memory">
                <div className="dst4-memory-title">
                  <strong>EXECUTION MEMORY</strong>
                  <span>Runtime stack state</span>
                </div>

                <div className="dst4-program-stack">
                  {programStack.length === 0 ? (
                    <div className="dst4-empty-execution">
                      <span>▶</span>
                      <h3>Program Execution</h3>
                      <p>
                        Enter runtime value and click Run
                        Program.
                      </p>
                    </div>
                  ) : (
                    [...Array(5)].map((_, reverseIndex) => {
                      const index =
                        4 - reverseIndex;

                      const value =
                        programStack[index];

                      return (
                        <div
                          className={`dst4-program-stack-cell ${
                            value !== undefined
                              ? "filled"
                              : ""
                          }`}
                          key={index}
                        >
                          <span>[{index}]</span>
                          <strong>
                            {value !== undefined
                              ? value
                              : "EMPTY"}
                          </strong>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CONSOLE */}

              <div className="dst4-console">
                <div className="dst4-console-header">
                  <span>●</span>
                  Console Output
                </div>

                <div className="dst4-console-body">
                  {programOutput ||
                    "Program output will appear here..."}
                </div>
              </div>

              {/* SHORT TRACE */}

              <div className="dst4-trace-card">
                <div className="dst4-trace-heading">
                  <h3>Execution Trace</h3>
                  <span>
                    {programSteps.length
                      ? `${programIndex + 1}/${programSteps.length}`
                      : "0/0"}
                  </span>
                </div>

                {currentProgramStep ? (
                  <div className="dst4-trace-item">
                    <div className="dst4-trace-step">
                      STEP {programIndex + 1}
                    </div>

                    <div className="dst4-trace-content">
                      <strong>
                        {currentProgramStep.title}
                      </strong>

                      <code>
                        {currentProgramStep.code}
                      </code>

                      <small>
                        {currentProgramStep.action}
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="dst4-trace-empty">
                    Run the program to view important
                    execution logic.
                  </div>
                )}
              </div>

              <div className="dst4-program-controls">
                <button
                  onClick={previousProgram}
                  disabled={programIndex <= 0}
                >
                  ← Previous
                </button>

                <button
                  onClick={nextProgram}
                  disabled={
                    !programRunning ||
                    programIndex >=
                      programSteps.length - 1
                  }
                >
                  Next →
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ======================================================
          QUESTIONS TAB
      ====================================================== */}

      {activeTab === "questions" && (
        <section className="dst4-questions-page">
          <div className="dst4-question-header">
            <div>
              <h2>Multiple Choice Questions</h2>
              <p>
                Select the correct answer for each question.
              </p>
            </div>

            <div className="dst4-score-preview">
              Answered: {Object.keys(answers).length}/20
            </div>
          </div>

          <div className="dst4-question-grid">
            {QUESTIONS.map((question, qIndex) => (
              <div
                className="dst4-question-card"
                key={qIndex}
              >
                <div className="dst4-question-number">
                  Q{qIndex + 1}
                </div>

                <h3>{question.q}</h3>

                <div className="dst4-options">
                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={
                          answers[qIndex] === optionIndex
                            ? "selected-option"
                            : ""
                        }
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={
                            answers[qIndex] ===
                            optionIndex
                          }
                          onChange={() =>
                            handleAnswer(
                              qIndex,
                              optionIndex
                            )
                          }
                        />

                        <span>
                          {String.fromCharCode(
                            65 + optionIndex
                          )}
                          .
                        </span>

                        {option}
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================
          FINAL SUBMIT
      ====================================================== */}

      <div className="dst4-final-submit">
        <button onClick={handleSubmitExperiment}>
          Submit Experiment
        </button>
      </div>

      {/* ======================================================
          HELP POPUP
      ====================================================== */}

      {showHelp && (
        <div
          className="dst4-help-overlay"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="dst4-help-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dst4-help-close"
              onClick={() => setShowHelp(false)}
            >
              ×
            </button>

            <div className="dst4-help-icon">?</div>

            <h2>Experiment Help</h2>

            <p>
              This experiment demonstrates PUSH and POP
              operations using an array-based stack.
            </p>

            <ul>
              <li>
                Enter stack size and stack elements in the
                Simulation tab.
              </li>
              <li>
                Select PUSH to insert an element at TOP.
              </li>
              <li>
                Select POP to remove the TOP element.
              </li>
              <li>
                Use Previous and Next to observe the
                operation step-by-step.
              </li>
              <li>
                Program tab shows the predefined C program
                and important execution logic.
              </li>
              <li>
                Questions tab contains 20 MCQs.
              </li>
            </ul>

            <button
              className="dst4-help-ok"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSTExperiment4;