import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment12.css";

/* =========================================================
   QUESTIONS
   ========================================================= */

const QUESTIONS = [
  {
    q: "Time complexity of accessing an array element by index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    answer: 0
  },
  {
    q: "What does Big O notation describe?",
    options: [
      "Worst-case growth rate of an algorithm",
      "Exact runtime of a program in seconds",
      "Amount of RAM installed on the system",
      "Speed of the programming language"
    ],
    answer: 0
  },
  {
    q: "Time complexity of adding two numbers?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
    answer: 1
  },
  {
    q: "Time complexity of factorial of N using a simple for loop?",
    options: ["O(1)", "O(N)", "O(N^2)", "O(log N)"],
    answer: 1
  },
  {
    q: "Time complexity of printing numbers 1 to N using a for loop?",
    options: ["O(N)", "O(1)", "O(N^2)", "O(2^N)"],
    answer: 0
  },
  {
    q: "Space complexity of the iterative factorial program (uses only a few variables)?",
    options: ["O(N)", "O(1)", "O(N^2)", "O(log N)"],
    answer: 1
  },
  {
    q: "Which structure generally leads to O(N^2) time complexity?",
    options: [
      "A single for loop",
      "A nested for loop (loop inside a loop)",
      "An if-else statement",
      "A single print statement"
    ],
    answer: 1
  },
  {
    q: "Which of these grows the fastest as N increases?",
    options: ["O(log N)", "O(N)", "O(N^2)", "O(1)"],
    answer: 2
  },
  {
    q: "Space complexity mainly measures:",
    options: [
      "Time taken by the CPU",
      "Extra memory used by an algorithm",
      "Number of lines of code",
      "Speed of the compiler"
    ],
    answer: 1
  },
  {
    q: "In Big O analysis, constants and lower-order terms are:",
    options: [
      "Always kept in the final answer",
      "Dropped / ignored",
      "Multiplied together",
      "Converted to O(1) automatically"
    ],
    answer: 1
  },
  {
    q: "If a loop processes each of N items once, what is its time complexity?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
    answer: 2
  },
  {
    q: "Two nested loops each running N times generally perform work proportional to:",
    options: ["N", "2N", "N^2", "log N"],
    answer: 2
  },
  {
    q: "An algorithm that halves the remaining search range each step has which growth rate?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
    answer: 1
  },
  {
    q: "If input size doubles, how does an O(N) algorithm's work generally change?",
    options: ["It stays constant", "It roughly doubles", "It roughly quadruples", "It becomes logarithmic"],
    answer: 1
  },
  {
    q: "If input size doubles, how does an O(N^2) algorithm's work generally change?",
    options: ["It roughly doubles", "It roughly quadruples", "It stays constant", "It is halved"],
    answer: 1
  },
  {
    q: "An iterative algorithm uses only a fixed number of extra variables as N grows. Its auxiliary space is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
    answer: 0
  },
  {
    q: "Which complexity grows more slowly for large N?",
    options: ["O(N^2)", "O(N log N)", "O(N)", "O(2^N)"],
    answer: 2
  },
  {
    q: "What does auxiliary space complexity measure?",
    options: ["Extra memory used by the algorithm", "CPU clock speed", "Number of source-code files", "Exact runtime in seconds"],
    answer: 0
  },
  {
    q: "A program performs one operation independent of N. Its time complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
    answer: 0
  },
  {
    q: "Which is the correct order from slower-growing to faster-growing for large N?",
    options: ["O(1), O(log N), O(N), O(N^2)", "O(N^2), O(N), O(log N), O(1)", "O(log N), O(1), O(N^2), O(N)", "O(N), O(1), O(log N), O(N^2)"],
    answer: 0
  }
];

/* =========================================================
   ALGORITHM DEFINITIONS
   ========================================================= */

const ALGORITHMS = {
  "Addition of 2 Numbers": {
    key: "addition",
    inputLabel: "Two Numbers (a, b)",
    placeholder: "12, 25",
    example: "12, 25",
    time: "O(1)",
    space: "O(1)",
    reason:
      "A single addition operation is performed no matter how large the numbers are, so both time and space stay constant."
  },
  "Factorial of a Number": {
    key: "factorial",
    inputLabel: "Value of N",
    placeholder: "5",
    example: "5",
    time: "O(N)",
    space: "O(1)",
    reason:
      "The loop runs N times performing one multiplication each time (time grows with N), while only a fixed number of variables (fact, i) are used (space stays constant)."
  },
  "Print 1 to N (for loop)": {
    key: "forloop",
    inputLabel: "Value of N",
    placeholder: "10",
    example: "10",
    time: "O(N)",
    space: "O(1)",
    reason:
      "The loop executes N print operations (time grows with N), while only the loop counter variable is used (space stays constant)."
  }
};

const ALGO_NAMES = Object.keys(ALGORITHMS);

const MAX_N = 200;
const FULL_DISPLAY_LIMIT = 15;

/* =========================================================
   PARSE HELPERS
   ========================================================= */

const parseAdditionInput = (text) => {
  const parts = text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

  if (
    parts.length !== 2 ||
    parts.some((value) => Number.isNaN(value))
  ) {
    return null;
  }

  return parts;
};

const parseSingleInt = (text) => {
  const value = Number(text.trim());

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_N
  ) {
    return null;
  }

  return value;
};

/* =========================================================
   STEP BUILDER
   ========================================================= */

const makeSteps = (algoName, input) => {
  const algo = ALGORITHMS[algoName];
  const steps = [];

  const add = (title, message, count, activeIndex, type = "normal") => {
    steps.push({ title, message, count, activeIndex, n: null, type });
  };

  /* ---------------- ADDITION ---------------- */

  if (algo.key === "addition") {
    const values = parseAdditionInput(input);

    if (!values) {
      return {
        steps: [
          {
            title: "INVALID INPUT",
            message: "Enter two numbers separated by a comma, e.g. 12, 25.",
            count: 0,
            activeIndex: null,
            n: null,
            type: "error"
          }
        ],
        opCount: 0
      };
    }

    const [a, b] = values;

    add("START", `Read two numbers a = ${a} and b = ${b}.`, 0, null);
    add("ADD", `Compute a + b directly in one step.`, 1, 0);
    add(
      "RESULT",
      `Sum = ${a + b}. Total operations performed = 1, regardless of how large a and b are.`,
      1,
      0,
      "success"
    );

    return { steps, opCount: 1, n: 1 };
  }

  /* ---------------- FACTORIAL ---------------- */

  if (algo.key === "factorial") {
    const N = parseSingleInt(input);

    if (!N) {
      return {
        steps: [
          {
            title: "INVALID INPUT",
            message: `Enter a whole number between 1 and ${MAX_N}.`,
            count: 0,
            activeIndex: null,
            n: null,
            type: "error"
          }
        ],
        opCount: 0
      };
    }

    add("START", "Initialize fact = 1.", 0, null);

    let fact = 1;
    const showAll = N <= FULL_DISPLAY_LIMIT;
    const showIndices = showAll
      ? Array.from({ length: N }, (_, i) => i + 1)
      : [
          ...[1, 2, 3].filter((i) => i <= N),
          "...",
          ...[N - 2, N - 1, N].filter((i) => i > 3)
        ];

    let opCount = 0;

    showIndices.forEach((i) => {
      if (i === "...") {
        steps.push({
          title: "…",
          message: `(iterations continue up to i = ${N})`,
          count: opCount,
          activeIndex: null,
          n: N,
          type: "skip"
        });

        return;
      }

      fact = fact * i;
      opCount = i;

      add(
        "MULTIPLY",
        `i = ${i}: fact = fact * ${i} → fact = ${fact}.`,
        opCount,
        i - 1
      );
    });

    add(
      "RESULT",
      `Factorial of ${N} = ${fact}. Total multiplications performed = ${N}, growing directly with N.`,
      N,
      N - 1,
      "success"
    );

    return { steps, opCount: N, n: N };
  }

  /* ---------------- FOR LOOP PRINT ---------------- */

  if (algo.key === "forloop") {
    const N = parseSingleInt(input);

    if (!N) {
      return {
        steps: [
          {
            title: "INVALID INPUT",
            message: `Enter a whole number between 1 and ${MAX_N}.`,
            count: 0,
            activeIndex: null,
            n: null,
            type: "error"
          }
        ],
        opCount: 0
      };
    }

    add("START", "Initialize loop counter i = 1.", 0, null);

    const showAll = N <= FULL_DISPLAY_LIMIT;
    const showIndices = showAll
      ? Array.from({ length: N }, (_, i) => i + 1)
      : [
          ...[1, 2, 3].filter((i) => i <= N),
          "...",
          ...[N - 2, N - 1, N].filter((i) => i > 3)
        ];

    showIndices.forEach((i) => {
      if (i === "...") {
        steps.push({
          title: "…",
          message: `(iterations continue up to i = ${N})`,
          count: 0,
          activeIndex: null,
          n: N,
          type: "skip"
        });

        return;
      }

      add("PRINT", `i = ${i}: print(${i}).`, i, i - 1);
    });

    add(
      "RESULT",
      `All numbers from 1 to ${N} printed. Total print operations = ${N}, growing directly with N.`,
      N,
      N - 1,
      "success"
    );

    return { steps, opCount: N, n: N };
  }

  return { steps: [], opCount: 0 };
};

/* =========================================================
   GROWTH TABLE
   ========================================================= */

const buildGrowthTable = (algoName) => {
  const algo = ALGORITHMS[algoName];
  const sizes = [1, 10, 100, 1000, 10000];

  return sizes.map((n) => ({
    n,
    ops: algo.time === "O(1)" ? 1 : n
  }));
};

/* =========================================================
   OPERATION VISUALIZER
   ========================================================= */

const OperationVisualizer = ({
  algoKey,
  n,
  activeIndex,
  opCount,
  step,
  input,
}) => {
  const safeN = n || 0;
  const current =
    activeIndex !== null && activeIndex !== undefined
      ? activeIndex + 1
      : null;

  const values = input
    ? input.split(/[,\s]+/).filter(Boolean).map(Number)
    : [];
  const [a, b] = values;

  const getFactorialValue = () => {
    if (!step?.message) return "1";
    const match = step.message.match(/fact = ([\d]+)/);
    return match ? match[1] : "1";
  };

  const percent =
    safeN > 0
      ? Math.min(100, Math.round(((opCount || 0) / safeN) * 100))
      : 0;

  if (!step) {
    return (
      <div className="dst12-visual-empty">
        <div className="dst12-visual-icon">BIG O</div>
        <div className="dst12-visual-empty-title">
          Simulation Canvas Ready
        </div>
        <div className="dst12-visual-empty-text">
          Select a program, enter the input and start the simulation.
        </div>
        <div className="dst12-visual-hint">
          <span>STEP-BY-STEP</span>
          <span>LIVE OPERATIONS</span>
          <span>COMPLEXITY</span>
        </div>
      </div>
    );
  }

  if (step.type === "error") {
    return (
      <div className="dst12-visual-error">
        <div className="dst12-error-icon">!</div>
        <b>Input Error</b>
        <span>{step.message}</span>
      </div>
    );
  }

  if (algoKey === "addition") {
    const completed = opCount >= 1;
    const result =
      completed && Number.isFinite(a) && Number.isFinite(b) ? a + b : "—";

    return (
      <div className="dst12-visual-workspace">
        <div className="dst12-visual-topline">
          <span>CONSTANT-TIME OPERATION</span>
          <b>O(1)</b>
        </div>

        <div className="dst12-addition-board">
          <div className="dst12-number-card">
            <small>INPUT A</small>
            <strong>{Number.isFinite(a) ? a : "—"}</strong>
          </div>

          <div className="dst12-operator">+</div>

          <div className="dst12-number-card">
            <small>INPUT B</small>
            <strong>{Number.isFinite(b) ? b : "—"}</strong>
          </div>

          <div className="dst12-equals">=</div>

          <div className={`dst12-number-card result ${completed ? "show" : ""}`}>
            <small>RESULT</small>
            <strong>{result}</strong>
          </div>
        </div>

        <div className="dst12-operation-status">
          <div className={`dst12-status-dot ${completed ? "done" : ""}`} />
          <span>
            {completed
              ? "One addition operation completed"
              : "Waiting for the ADD operation"}
          </span>
          <b>{completed ? "1 operation" : "0 operations"}</b>
        </div>
      </div>
    );
  }

  if (algoKey === "factorial") {
    const factorialValue = getFactorialValue();
    const currentIteration = current || 0;

    return (
      <div className="dst12-visual-workspace">
        <div className="dst12-visual-topline">
          <span>ITERATIVE MULTIPLICATION</span>
          <b>O(N)</b>
        </div>

        <div className="dst12-factorial-summary">
          <div className="dst12-accumulator">
            <small>ACCUMULATOR · fact</small>
            <strong>{factorialValue}</strong>
          </div>

          <div className="dst12-factorial-equation">
            <span>Current operation</span>
            <b>
              {currentIteration > 0
                ? `fact × ${currentIteration}`
                : "fact = 1"}
            </b>
          </div>
        </div>

        <div className="dst12-iteration-header">
          <span>LOOP PROGRESS</span>
          <b>{opCount || 0} / {safeN} iterations</b>
        </div>

        <div className="dst12-big-progress">
          <div
            className="dst12-big-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="dst12-iteration-track">
          {safeN <= 20 ? (
            Array.from({ length: safeN }, (_, i) => {
              const index = i + 1;
              const active = currentIteration === index;
              const done = opCount >= index;

              return (
                <div
                  key={index}
                  className={`dst12-iteration-node ${
                    active ? "active" : ""
                  } ${done ? "done" : ""}`}
                >
                  <span>{index}</span>
                  <small>{done ? "✓" : "i"}</small>
                </div>
              );
            })
          ) : (
            <>
              <div className="dst12-range-node done">1</div>
              <div className="dst12-range-line" />
              <div className="dst12-range-node active">
                {currentIteration || "—"}
              </div>
              <div className="dst12-range-line" />
              <div className="dst12-range-node">{safeN}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (algoKey === "forloop") {
    const currentNumber = current || 0;

    return (
      <div className="dst12-visual-workspace">
        <div className="dst12-visual-topline">
          <span>SEQUENTIAL LOOP EXECUTION</span>
          <b>O(N)</b>
        </div>

        <div className="dst12-loop-display">
          <div className="dst12-loop-counter">
            <small>CURRENT i</small>
            <strong>{currentNumber || "—"}</strong>
          </div>

          <div className="dst12-loop-condition">
            <small>LOOP CONDITION</small>
            <b>
              i ≤ {safeN || "N"}{" "}
              <span>
                {currentNumber && currentNumber <= safeN ? "✓ TRUE" : "—"}
              </span>
            </b>
          </div>

          <div className="dst12-loop-output">
            <small>PRINT OUTPUT</small>
            <b>{currentNumber ? currentNumber : "—"}</b>
          </div>
        </div>

        <div className="dst12-iteration-header">
          <span>EXECUTION PROGRESS</span>
          <b>{opCount || 0} / {safeN} prints</b>
        </div>

        <div className="dst12-big-progress">
          <div
            className="dst12-big-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="dst12-output-sequence">
          <div className="dst12-sequence-label">OUTPUT STREAM</div>
          <div className="dst12-sequence-values">
            {safeN <= 25 ? (
              Array.from({ length: safeN }, (_, i) => {
                const value = i + 1;
                return (
                  <span
                    key={value}
                    className={
                      value === currentNumber
                        ? "current"
                        : value <= (opCount || 0)
                        ? "printed"
                        : ""
                    }
                  >
                    {value}
                  </span>
                );
              })
            ) : (
              <>
                {[1, 2, 3].map((value) => (
                  <span
                    key={value}
                    className={value <= (opCount || 0) ? "printed" : ""}
                  >
                    {value}
                  </span>
                ))}
                <i>…</i>
                <span className="current">{currentNumber || safeN}</span>
                <i>…</i>
                <span className={opCount >= safeN ? "printed" : ""}>
                  {safeN}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dst12-visual-empty">
      <div className="dst12-visual-icon">OPS</div>
      <b>Operation Ready</b>
      <span>Step through the execution to view operations.</span>
    </div>
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment12 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /* SIMULATION STATE */

  const [algoName, setAlgoName] = useState(ALGO_NAMES[0]);
  const [inputValue, setInputValue] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [observations, setObservations] = useState([]);

  /* PROGRAM STATE */

  const [programAlgoName, setProgramAlgoName] = useState(ALGO_NAMES[0]);
  const [programInputValue, setProgramInputValue] = useState("");
  const [programSteps, setProgramSteps] = useState([]);
  const [programCurrentStep, setProgramCurrentStep] = useState(-1);
  const [programRunning, setProgramRunning] = useState(false);
  const [programAutoPlay, setProgramAutoPlay] = useState(false);
  const [programCompleted, setProgramCompleted] = useState(false);

  /* QUESTIONS */

  const [answers, setAnswers] = useState({});
  const [questionResult, setQuestionResult] = useState(null);
  const [experimentCompleted, setExperimentCompleted] = useState(false);

  const currentSimStep = currentStep >= 0 ? steps[currentStep] : null;
  const currentProgStep =
    programCurrentStep >= 0 ? programSteps[programCurrentStep] : null;

  const algo = ALGORITHMS[algoName];
  const growthTable = useMemo(() => buildGrowthTable(algoName), [algoName]);

  /* =========================================================
     SIMULATION HANDLERS
     ========================================================= */

  const startSimulation = () => {
    if (!inputValue.trim()) {
      alert(`Enter ${algo.inputLabel.toLowerCase()}, e.g. ${algo.example}.`);
      return;
    }

    const generated = makeSteps(algoName, inputValue);
    setSteps(generated.steps);
    setCurrentStep(0);
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  const nextSimulation = () => {
    if (!steps.length) return;

    setCurrentStep((previous) => {
      if (previous >= steps.length - 1) return previous;

      const next = previous + 1;
      const step = steps[next];

      if (next === steps.length - 1 && step.type === "success") {
        setObservations((old) => [
          ...old,
          {
            attempt: old.length + 1,
            algo: algoName,
            input: inputValue,
            ops: step.count,
            time: algo.time,
            space: algo.space,
            status: "Successful"
          }
        ]);
      }

      return next;
    });
  };

  const previousSimulation = () => {
    setCurrentStep((previous) => Math.max(0, previous - 1));
  };

  /* =========================================================
     PROGRAM HANDLERS
     ========================================================= */

  const runProgram = () => {
    if (!programInputValue.trim()) {
      const programAlgo = ALGORITHMS[programAlgoName];
      alert(
        `Enter ${programAlgo.inputLabel.toLowerCase()}, e.g. ${programAlgo.example}.`
      );
      return;
    }

    const generated = makeSteps(programAlgoName, programInputValue);

    setProgramSteps(generated.steps);
    setProgramCurrentStep(0);
    setProgramRunning(true);
    setProgramAutoPlay(false);
    setProgramCompleted(false);
  };

  const nextProgram = () => {
    if (!programSteps.length) return;

    setProgramCurrentStep((previous) => {
      if (previous >= programSteps.length - 1) return previous;

      const next = previous + 1;
      const step = programSteps[next];

      if (next === programSteps.length - 1) {
        setProgramRunning(false);
        setProgramAutoPlay(false);

        if (step.type === "success") {
          setProgramCompleted(true);
        }
      }

      return next;
    });
  };

  const previousProgram = () => {
    setProgramCurrentStep((previous) => Math.max(0, previous - 1));
    setProgramCompleted(false);
  };

  useEffect(() => {
    if (!programAutoPlay || !programRunning) return;

    const timer = setTimeout(nextProgram, 700);
    return () => clearTimeout(timer);
  }, [programAutoPlay, programRunning, programCurrentStep, programSteps]);

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const selectAnswer = (questionIndex, optionIndex) => {
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
      alert("Please complete the Simulation first.");
      return;
    }

    if (!programCompleted) {
      alert("Please complete Program Execution first.");
      return;
    }

    if (!questionResult) {
      alert("Please answer all questions before submitting the experiment.");
      return;
    }

    const result = buildDstResult({
      experimentNo: 12,
      experimentName:
        "Time and Space Complexity (Big O): Addition, Factorial and For Loop",
      questionList: QUESTIONS,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment12Result",
      JSON.stringify(result)
    );
    localStorage.setItem("assignmentResult", JSON.stringify(result));

    navigate("/result", { state: result });
  };

  /* =========================================================
     C PROGRAM
     ========================================================= */

  const cProgram = `#include <stdio.h>

/* ---- Addition of 2 numbers : O(1) time, O(1) space ---- */
int addNumbers(int a, int b)
{
    return a + b;
}

/* ---- Factorial of N (iterative) : O(N) time, O(1) space ---- */
long long factorial(int n)
{
    long long fact = 1;
    int i;

    for (i = 1; i <= n; i++)
    {
        fact = fact * i;
    }

    return fact;
}

/* ---- Print 1 to N : O(N) time, O(1) space ---- */
void printNumbers(int n)
{
    int i;

    for (i = 1; i <= n; i++)
    {
        printf("%d ", i);
    }

    printf("\\n");
}

int main()
{
    int choice, a, b, n;

    do
    {
        printf("\\n1. Addition of 2 Numbers");
        printf("\\n2. Factorial of a Number");
        printf("\\n3. Print 1 to N");
        printf("\\n4. Exit");

        printf("\\nEnter choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
            case 1:
                printf("Enter two numbers: ");
                scanf("%d %d", &a, &b);

                printf("Sum = %d\\n", addNumbers(a, b));
                printf("Time Complexity: O(1), Space Complexity: O(1)\\n");
                break;

            case 2:
                printf("Enter N: ");
                scanf("%d", &n);

                printf("Factorial = %lld\\n", factorial(n));
                printf("Time Complexity: O(N), Space Complexity: O(1)\\n");
                break;

            case 3:
                printf("Enter N: ");
                scanf("%d", &n);

                printNumbers(n);
                printf("Time Complexity: O(N), Space Complexity: O(1)\\n");
                break;
        }

    } while (choice != 4);

    return 0;
}`;

  return (
    <div className="dst12-root">
      <div className="dst12-container">
        {/* HEADER */}

        <header className="dst12-header">
          <button className="dst12-back" onClick={() => navigate("/dst-experiments")}>
            ← Back
          </button>

          <div className="dst12-header-title">
            <div className="dst12-exp-no">Experiment No. 12</div>
            <h1>
              Time and Space Complexity (Big O) - Addition, Factorial &amp;
              For Loop
            </h1>
          </div>

          <button
            className="dst12-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>
        </header>

        {showHelp && (
          <div className="dst12-help-overlay" onClick={() => setShowHelp(false)}>
            <section
              aria-labelledby="dst12-help-title"
              aria-modal="true"
              className="dst12-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst12-help-dialog-header">
                <h2 id="dst12-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst12-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Select an algorithm and enter the input shown in the simulation.</li>
                <li>Step through the operations and compare displayed time and space complexity.</li>
                <li>Use the Program tab to follow the corresponding C program.</li>
                <li>Answer all 20 questions and submit them before submitting the experiment.</li>
              </ul>
              <button className="dst12-help-done" onClick={() => setShowHelp(false)} type="button">
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}

        <div className="dst12-card dst12-aim">
          <div>
            <div className="dst12-title">Aim</div>
            <p>
              To compute and analyze the time and space complexity (Big O) of
              three programs: addition of two numbers, factorial of a number,
              and printing numbers from 1 to N using a for loop.
            </p>
          </div>
        </div>

        {/* THEORY */}

        <div className="dst12-card dst12-collapse">
          <button
            className="dst12-collapse-header"
            onClick={() => setShowTheory(!showTheory)}
          >
            <span>Theory</span>
            <span>{showTheory ? "▲" : "▼"}</span>
          </button>

          {showTheory && (
            <div className="dst12-collapse-content">
              <p>
                Time complexity measures how the number of basic operations an
                algorithm performs grows as the input size N increases. Space
                complexity measures how the extra memory it uses grows with N.
                Big O notation expresses this growth using the worst case,
                ignoring constants and lower-order terms.
              </p>

              <div className="dst12-theory-grid">
                <div>
                  <b>O(1)</b>
                  <span>Constant - same number of steps for any N</span>
                </div>

                <div>
                  <b>O(N)</b>
                  <span>Linear - steps grow directly with N</span>
                </div>

                <div>
                  <b>O(N^2)</b>
                  <span>Quadratic - typical of nested loops</span>
                </div>

                <div>
                  <b>O(log N)</b>
                  <span>Logarithmic - input is halved each step</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PROCEDURE */}

        <div className="dst12-card dst12-collapse">
          <button
            className="dst12-collapse-header"
            onClick={() => setShowProcedure(!showProcedure)}
          >
            <span>Procedure</span>
            <span>{showProcedure ? "▲" : "▼"}</span>
          </button>

          {showProcedure && (
            <div className="dst12-collapse-content">
              <div className="dst12-procedure">
                <ol>
                  <li>Select the program to analyze.</li>
                  <li>Identify the basic operation it repeats.</li>
                  <li>Count how many times that operation runs for input N.</li>
                  <li>
                    Express the growth of that count using Big O notation.
                  </li>
                </ol>

                <ol start="5">
                  <li>Identify the extra variables the program uses.</li>
                  <li>
                    Check whether the number of variables grows with N or
                    stays fixed.
                  </li>
                  <li>Express that growth as the space complexity.</li>
                  <li>Compare results across the three programs.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}

        <div className="dst12-tabs">
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

        {/* SIMULATION TAB */}

        {activeTab === "simulation" && (
          <>
            <div className="dst12-sim-row">
              {/* INPUT */}

              <div className="dst12-card dst12-input">
                <div className="dst12-section">Input</div>

                <label>Program</label>

                <select
                  value={algoName}
                  onChange={(e) => {
                    setAlgoName(e.target.value);
                    setInputValue("");
                    resetSimulation();
                  }}
                >
                  {ALGO_NAMES.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>

                <label>{algo.inputLabel}</label>

                <input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    resetSimulation();
                  }}
                  placeholder={algo.placeholder}
                />

                <div className="dst12-example">
                  <b>Example</b>
                  <span>{algo.example}</span>
                </div>

                <button className="dst12-primary" onClick={startSimulation}>
                  ▶ Start Simulation
                </button>

                <button className="dst12-secondary" onClick={resetSimulation}>
                  Reset
                </button>

                <div className="dst12-info">
                  <b>Complexity</b>
                  <span>
                    Time: {algo.time} &nbsp;|&nbsp; Space: {algo.space}
                  </span>
                </div>
              </div>

              {/* CANVAS */}

              <div className="dst12-card dst12-canvas">
                <div className="dst12-panel-heading">
                  <span>Operation Simulation</span>
                  <small>{currentSimStep ? "RUNNING" : "READY"}</small>
                </div>

                <div className="dst12-stage">
                  <OperationVisualizer
                    algoKey={algo.key}
                    input={inputValue}
                    step={currentSimStep}
                    n={
                      currentSimStep && currentSimStep.n !== null
                        ? currentSimStep.n
                        : currentSimStep && currentSimStep.count
                        ? currentSimStep.count
                        : null
                    }
                    activeIndex={currentSimStep?.activeIndex ?? null}
                    opCount={currentSimStep?.count}
                  />
                </div>

                <div
                  className={`dst12-message ${
                    currentSimStep?.type === "error" ? "error" : ""
                  } ${currentSimStep?.type === "success" ? "success" : ""}`}
                >
                  <b>{currentSimStep?.title || "READY"}</b>
                  <span>
                    {currentSimStep?.message ||
                      "Start the simulation to see the operations counted step-by-step."}
                  </span>
                </div>

                <div className="dst12-controls">
                  <button
                    className="dst12-secondary"
                    onClick={previousSimulation}
                    disabled={currentStep <= 0}
                  >
                    ← Previous
                  </button>

                  <span>
                    Step {steps.length ? currentStep + 1 : 0}
                    {" / "}
                    {steps.length}
                  </span>

                  <button
                    className="dst12-primary"
                    onClick={nextSimulation}
                    disabled={!steps.length || currentStep >= steps.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* ANALYSIS */}

              <div className="dst12-card dst12-analysis">
                <div className="dst12-section">Analysis</div>

                <div className="dst12-analysis-box">
                  <span>Operations So Far</span>
                  <b>{currentSimStep?.count ?? 0}</b>
                </div>

                <div className="dst12-analysis-box">
                  <span>Time Complexity</span>
                  <b>{algo.time}</b>
                </div>

                <div className="dst12-analysis-box">
                  <span>Space Complexity</span>
                  <b>{algo.space}</b>
                </div>

                <div className="dst12-analysis-box">
                  <span>Attempts</span>
                  <b>{observations.length}</b>
                </div>

                <div className="dst12-growth">
                  <b>Growth of Operations</b>

                  <table>
                    <thead>
                      <tr>
                        <th>N</th>
                        <th>Ops</th>
                      </tr>
                    </thead>

                    <tbody>
                      {growthTable.map((row) => (
                        <tr key={row.n}>
                          <td>{row.n}</td>
                          <td>{row.ops}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dst12-observations">
                  {observations.slice(-4).map((item) => (
                    <div key={item.attempt}>
                      <b>
                        #{item.attempt} {item.algo}
                      </b>
                      <span>
                        Ops: {item.ops} | {item.time} / {item.space}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OBSERVATION TABLE */}

            {observations.length > 0 && (
              <div className="dst12-card dst12-observation-table-card">
                <div className="dst12-section">Observation Table</div>

                <div className="dst12-observation-table-wrapper">
                  <table className="dst12-observation-table">
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Program</th>
                        <th>Input</th>
                        <th>Operations</th>
                        <th>Time</th>
                        <th>Space</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {observations.map((item) => (
                        <tr key={item.attempt}>
                          <td>{item.attempt}</td>
                          <td>{item.algo}</td>
                          <td className="dst12-value-cell">{item.input}</td>
                          <td className="dst12-value-cell">{item.ops}</td>
                          <td className="dst12-value-cell">{item.time}</td>
                          <td className="dst12-value-cell">{item.space}</td>
                          <td>
                            <span className="dst12-status-success">
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

        {/* PROGRAM TAB */}

        {activeTab === "program" && (
          <div className="dst12-program-area">
            <div className="dst12-program-grid">
              {/* LEFT SIDE */}

              <div className="dst12-program-left">
                <div className="dst12-card dst12-code-card">
                  <div className="dst12-section">C Program</div>

                  <div className="dst12-code-header">
                    <span>complexity.c</span>
                    <span>READ ONLY</span>
                  </div>

                  <pre className="dst12-code">{cProgram}</pre>
                </div>

                <div className="dst12-card dst12-program-input">
                  <div className="dst12-section">Program Input</div>

                  <label>Program</label>

                  <select
                    value={programAlgoName}
                    onChange={(e) => {
                      setProgramAlgoName(e.target.value);
                      setProgramInputValue("");
                      setProgramSteps([]);
                      setProgramCurrentStep(-1);
                      setProgramRunning(false);
                      setProgramCompleted(false);
                    }}
                  >
                    {ALGO_NAMES.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>

                  <label>{ALGORITHMS[programAlgoName].inputLabel}</label>

                  <input
                    value={programInputValue}
                    onChange={(e) => {
                      setProgramInputValue(e.target.value);
                      setProgramCompleted(false);
                      setProgramRunning(false);
                    }}
                    placeholder={ALGORITHMS[programAlgoName].placeholder}
                  />

                  <div className="dst12-program-buttons">
                    <button className="dst12-primary" onClick={runProgram}>
                      ▶ Run Program
                    </button>

                    <button
                      className="dst12-secondary"
                      onClick={() => {
                        setProgramInputValue("");
                        setProgramSteps([]);
                        setProgramCurrentStep(-1);
                        setProgramRunning(false);
                        setProgramCompleted(false);
                        setProgramAutoPlay(false);
                      }}
                    >
                      New Execution
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div className="dst12-card dst12-program-sim">
                <div className="dst12-panel-heading">
                  <span>Program Execution</span>
                  <small>
                    {programCompleted
                      ? "COMPLETED"
                      : programRunning
                      ? "RUNNING"
                      : "READY"}
                  </small>
                </div>

                <div className="dst12-live-strip">
                  <div>
                    <span>Program</span>
                    <b>{programAlgoName}</b>
                  </div>

                  <div>
                    <span>Current Step</span>
                    <b>{currentProgStep?.title || "—"}</b>
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

                <div className="dst12-program-stage">
                  <OperationVisualizer
                    algoKey={ALGORITHMS[programAlgoName].key}
                    input={programInputValue}
                    step={currentProgStep}
                    n={
                      currentProgStep && currentProgStep.n !== null
                        ? currentProgStep.n
                        : currentProgStep && currentProgStep.count
                        ? currentProgStep.count
                        : null
                    }
                    activeIndex={currentProgStep?.activeIndex ?? null}
                    opCount={currentProgStep?.count}
                  />
                </div>

                <div
                  className={`dst12-message ${
                    currentProgStep?.type === "error" ? "error" : ""
                  } ${currentProgStep?.type === "success" ? "success" : ""}`}
                >
                  <b>{currentProgStep?.title || "PROGRAM READY"}</b>
                  <span>
                    {currentProgStep?.message ||
                      "Enter input and click Run Program to begin execution."}
                  </span>
                </div>

                <div className="dst12-controls">
                  <button
                    className="dst12-secondary"
                    onClick={previousProgram}
                    disabled={programCurrentStep <= 0}
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst12-secondary"
                    onClick={() => setProgramAutoPlay((value) => !value)}
                    disabled={!programRunning || programCompleted}
                  >
                    {programAutoPlay ? "⏸ Pause" : "▶ Auto Play"}
                  </button>

                  <button
                    className="dst12-primary"
                    onClick={nextProgram}
                    disabled={
                      !programSteps.length ||
                      programCurrentStep >= programSteps.length - 1
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* EXECUTION TRACE */}

            {programSteps.length > 0 && (
              <div className="dst12-card dst12-trace-card">
                <div className="dst12-trace-header">
                  <div>
                    <div className="dst12-section">Execution Trace</div>
                    <p>Each step of the program execution.</p>
                  </div>

                  <span>{programSteps.length} Steps</span>
                </div>

                <div className="dst12-trace-list">
                  {programSteps.map((step, index) => (
                    <button
                      key={index}
                      className={`dst12-trace-item ${
                        programCurrentStep === index ? "active" : ""
                      } ${index <= programCurrentStep ? "visited" : ""}`}
                      onClick={() => {
                        if (index <= programCurrentStep) {
                          setProgramCurrentStep(index);

                          setProgramCompleted(
                            index === programSteps.length - 1 &&
                              step.type === "success"
                          );

                          if (index < programSteps.length - 1) {
                            setProgramRunning(true);
                          }
                        }
                      }}
                    >
                      <span className="dst12-trace-number">{index + 1}</span>

                      <span className="dst12-trace-content">
                        <b>{step.title}</b>
                        <small>{step.message}</small>
                      </span>

                      <span className="dst12-trace-status">
                        {index <= programCurrentStep ? "✓" : "○"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OUTPUT */}

            {programCompleted && currentProgStep && (
              <div className="dst12-card dst12-output-card">
                <div className="dst12-section">Program Output</div>

                <pre className="dst12-output">
{`Program : ${programAlgoName}

Input : ${programInputValue}

Total Operations : ${currentProgStep.count}

Time Complexity : ${ALGORITHMS[programAlgoName].time}

Space Complexity : ${ALGORITHMS[programAlgoName].space}

Execution Status : ${
                    currentProgStep.type === "success" ? "SUCCESS" : "ERROR"
                  }

All program steps completed.`}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS TAB */}

        {activeTab === "questions" && (
          <div className="dst12-card dst12-questions">
            <div className="dst12-section">Questions</div>

            {QUESTIONS.map((question, index) => (
              <div className="dst12-question" key={index}>
                <b>
                  {index + 1}. {question.q}
                </b>

                <div className="dst12-options">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={
                        answers[index] === optionIndex ? "selected" : ""
                      }
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        checked={answers[index] === optionIndex}
                        onChange={() => selectAnswer(index, optionIndex)}
                        disabled={experimentCompleted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {experimentCompleted && questionResult && (
              <div className="dst12-question-result">
                <b>
                  Quiz Completed
                  <br />
                  Score: {questionResult.score}/{questionResult.total}
                </b>

                <span>✓ Completed</span>
              </div>
            )}
          </div>
        )}

        {/* FINAL SUBMIT */}

        <div className="dst12-submit-section">
          <button
            className="dst12-submit"
            onClick={submitExperiment}
            disabled={experimentCompleted}
          >
            {experimentCompleted ? "✓ Submitted" : "Submit Experiment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSTExperiment12;