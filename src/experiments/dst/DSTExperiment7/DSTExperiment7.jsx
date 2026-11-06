import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment7.css";

/* =========================================================
   EXPERIMENT 7
   QUEUE OPERATIONS
   ========================================================= */

const CODE_TEMPLATES = {
  enqueue: `#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

void enqueue(int value) {
    if (rear == MAX - 1) {
        printf("Queue Overflow");
        return;
    }

    if (front == -1)
        front = 0;

    rear++;
    queue[rear] = value;

    printf("Inserted: %d", value);
}

int main() {
    int value;

    printf("Enter value: ");
    scanf("%d", &value);

    enqueue(value);

    return 0;
}`,

  dequeue: `#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

void dequeue() {
    if (front == -1 || front > rear) {
        printf("Queue Underflow");
        return;
    }

    printf("Deleted: %d", queue[front]);
    front++;

    if (front > rear)
        front = rear = -1;
}

int main() {
    dequeue();

    return 0;
}`,

  peek: `#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

void peek() {
    if (front == -1) {
        printf("Queue is Empty");
        return;
    }

    printf("Front element: %d", queue[front]);
}

int main() {
    peek();

    return 0;
}`,

  display: `#include <stdio.h>
#define MAX 5

int queue[MAX];
int front = -1, rear = -1;

void display() {
    int i;

    if (front == -1) {
        printf("Queue is Empty");
        return;
    }

    printf("Queue elements: ");

    for (i = front; i <= rear; i++)
        printf("%d ", queue[i]);
}

int main() {
    display();

    return 0;
}`
};

/* =========================================================
   STEP BUILDERS
   ========================================================= */

const buildEnqueueSteps = (queue, value, capacity) => {
  const steps = [];

  steps.push({
    message: "Queue is ready. Check whether the queue has space.",
    queue: [...queue],
    front: queue.length ? 0 : -1,
    rear: queue.length ? queue.length - 1 : -1,
    current: -1,
    type: "check"
  });

  if (queue.length >= capacity) {
    steps.push({
      message: "Queue Overflow: rear has reached the maximum capacity.",
      queue: [...queue],
      front: queue.length ? 0 : -1,
      rear: queue.length - 1,
      current: queue.length - 1,
      type: "error"
    });

    return steps;
  }

  const nextQueue = [...queue, value];
  const newRear = nextQueue.length - 1;

  steps.push({
    message: `REAR moves to index ${newRear}.`,
    queue: [...nextQueue],
    front: nextQueue.length === 1 ? 0 : 0,
    rear: newRear,
    current: newRear,
    type: "rear"
  });

  steps.push({
    message: `Insert ${value} at queue[${newRear}].`,
    queue: [...nextQueue],
    front: 0,
    rear: newRear,
    current: newRear,
    type: "insert"
  });

  steps.push({
    message: `Enqueue completed. ${value} is added at the REAR.`,
    queue: [...nextQueue],
    front: 0,
    rear: newRear,
    current: -1,
    type: "success"
  });

  return steps;
};

const buildDequeueSteps = (queue) => {
  const steps = [];

  if (queue.length === 0) {
    return [
      {
        message: "Queue Underflow: queue is empty. No element can be removed.",
        queue: [],
        front: -1,
        rear: -1,
        current: -1,
        type: "error"
      }
    ];
  }

  steps.push({
    message: `FRONT points to index 0 containing ${queue[0]}.`,
    queue: [...queue],
    front: 0,
    rear: queue.length - 1,
    current: 0,
    type: "front"
  });

  steps.push({
    message: `Remove element ${queue[0]} from FRONT.`,
    queue: [...queue],
    front: 0,
    rear: queue.length - 1,
    current: 0,
    type: "remove"
  });

  const nextQueue = queue.slice(1);

  if (nextQueue.length === 0) {
    steps.push({
      message: "Queue becomes empty. FRONT and REAR are reset to -1.",
      queue: [],
      front: -1,
      rear: -1,
      current: -1,
      type: "success"
    });

    return steps;
  }

  steps.push({
    message: `FRONT moves to the next element ${nextQueue[0]}.`,
    queue: [...nextQueue],
    front: 0,
    rear: nextQueue.length - 1,
    current: 0,
    type: "front"
  });

  steps.push({
    message: `Dequeue completed. ${queue[0]} has been removed.`,
    queue: [...nextQueue],
    front: 0,
    rear: nextQueue.length - 1,
    current: -1,
    type: "success"
  });

  return steps;
};

const buildPeekSteps = (queue) => {
  if (queue.length === 0) {
    return [
      {
        message: "Queue is empty. There is no FRONT element to peek.",
        queue: [],
        front: -1,
        rear: -1,
        current: -1,
        type: "error"
      }
    ];
  }

  return [
    {
      message: `FRONT points to queue[0].`,
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      current: 0,
      type: "front"
    },
    {
      message: `Peek operation reads the FRONT element: ${queue[0]}.`,
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      current: 0,
      type: "peek"
    },
    {
      message: `Peek completed. Element ${queue[0]} remains in the queue.`,
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      current: -1,
      type: "success"
    }
  ];
};

const buildDisplaySteps = (queue) => {
  if (queue.length === 0) {
    return [
      {
        message: "Queue is empty. Nothing can be displayed.",
        queue: [],
        front: -1,
        rear: -1,
        current: -1,
        type: "error"
      }
    ];
  }

  const steps = [
    {
      message: "FRONT is selected as the starting point for traversal.",
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      current: 0,
      type: "front"
    }
  ];

  queue.forEach((value, index) => {
    steps.push({
      message: `Display queue[${index}] = ${value}.`,
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      current: index,
      type: "display"
    });
  });

  steps.push({
    message: "Display completed. Traversal reached the REAR.",
    queue: [...queue],
    front: 0,
    rear: queue.length - 1,
    current: -1,
    type: "success"
  });

  return steps;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment7 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /* ---------------- SIMULATION ---------------- */

  const [operation, setOperation] = useState("enqueue");
  const [capacity, setCapacity] = useState(5);

  const [queue, setQueue] = useState([
    "10",
    "20",
    "30"
  ]);

  const [inputValue, setInputValue] = useState("");

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [simulationStarted, setSimulationStarted] = useState(false);

  const [observations, setObservations] = useState([]);

  /* ---------------- PROGRAM ---------------- */

  const [progOperation, setProgOperation] = useState("enqueue");

  const [progQueue, setProgQueue] = useState([
    "10",
    "20",
    "30"
  ]);

  const [progCapacity, setProgCapacity] = useState(5);
  const [progValue, setProgValue] = useState("");

  const [progSteps, setProgSteps] = useState([]);
  const [progCurrentStep, setProgCurrentStep] = useState(-1);
  const [progRunning, setProgRunning] = useState(false);
  const [progCompleted, setProgCompleted] = useState(false);
  const [progTrace, setProgTrace] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(-1);
  const [progError, setProgError] = useState("");
  const [autoPlay, setAutoPlay] = useState(false);

  /* ---------------- QUESTIONS ---------------- */

  const questions = [
    {
      q: "Queue follows which principle?",
      options: [
        "LIFO",
        "FIFO",
        "Random",
        "Priority only"
      ],
      answer: 1
    },
    {
      q: "Insertion in a queue is performed at:",
      options: [
        "Front",
        "Middle",
        "Rear",
        "Any position"
      ],
      answer: 2
    },
    {
      q: "Deletion in a queue is performed from:",
      options: [
        "Rear",
        "Front",
        "Middle",
        "Any position"
      ],
      answer: 1
    },
    {
      q: "Which operation adds an element to a queue?",
      options: [
        "Dequeue",
        "Peek",
        "Enqueue",
        "Display"
      ],
      answer: 2
    },
    {
      q: "Which operation removes an element?",
      options: [
        "Enqueue",
        "Dequeue",
        "Peek",
        "Traverse"
      ],
      answer: 1
    },
    {
      q: "When a queue is empty, FRONT is generally:",
      options: [
        "0",
        "1",
        "-1",
        "MAX"
      ],
      answer: 2
    },
    {
      q: "Attempting to insert into a full queue causes:",
      options: [
        "Underflow",
        "Overflow",
        "Traversal",
        "Compilation"
      ],
      answer: 1
    },
    {
      q: "Attempting to delete from an empty queue causes:",
      options: [
        "Overflow",
        "Underflow",
        "Sorting",
        "Searching"
      ],
      answer: 1
    },
    {
      q: "Which pointer identifies the element to be removed?",
      options: [
        "REAR",
        "FRONT",
        "TEMP",
        "SIZE"
      ],
      answer: 1
    },
    {
      q: "Peek operation:",
      options: [
        "Deletes the queue",
        "Adds an element",
        "Reads the front element",
        "Sorts the queue"
      ],
      answer: 2
    },
    {
      q: "In this array-based queue, what are the initial values of FRONT and REAR?",
      options: ["0 and 0", "-1 and -1", "0 and -1", "MAX and 0"],
      answer: 1
    },
    {
      q: "After the first successful enqueue in an empty queue, what is FRONT set to?",
      options: ["-1", "0", "MAX", "REAR + 1"],
      answer: 1
    },
    {
      q: "A queue contains [10, 20, 30] with FRONT at 0. After one dequeue, what is the front value?",
      options: ["10", "20", "30", "The queue is empty"],
      answer: 1
    },
    {
      q: "If capacity is 5 and REAR is 4, what happens on another enqueue in this linear queue?",
      options: ["The element is added at index 5", "Queue overflow is reported", "FRONT is reset to 0", "The first item is removed"],
      answer: 1
    },
    {
      q: "After removing the only element from a queue, what should FRONT and REAR become?",
      options: ["0 and 0", "-1 and -1", "1 and 0", "MAX and MAX"],
      answer: 1
    },
    {
      q: "For queue [4, 7, 9], which value is removed by the next dequeue?",
      options: ["9", "7", "4", "All values"],
      answer: 2
    },
    {
      q: "Which index range is used to display elements in this simple array queue?",
      options: ["REAR down to FRONT", "FRONT through REAR", "0 through MAX always", "Only REAR"],
      answer: 1
    },
    {
      q: "Does Peek remove the front element?",
      options: ["Yes, it always dequeues", "No, it only reads the front element", "Yes, and resets REAR", "No, it reads the rear element"],
      answer: 1
    },
    {
      q: "A queue has FRONT = 2 and REAR = 4. How many elements does it contain?",
      options: ["2", "3", "4", "7"],
      answer: 1
    },
    {
      q: "In a linear array queue, what does FRONT track?",
      options: ["The next insertion index", "The next element to be removed", "The array capacity", "The number of operations"],
      answer: 1
    }
  ];

  const [answers, setAnswers] = useState({});
  const [questionResult, setQuestionResult] = useState(null);
  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     SIMULATION HELPERS
     ========================================================= */

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
    setSimulationStarted(false);
  };

  const addObservation = (op, input, result, status = "Successful") => {
    setObservations((old) => [
      ...old,
      {
        attempt: old.length + 1,
        operation: op.toUpperCase(),
        input,
        result,
        status
      }
    ]);
  };

  const changeCapacity = (value) => {
    let size = Number(value);

    if (!Number.isFinite(size)) {
      size = 1;
    }

    size = Math.max(3, Math.min(8, Math.floor(size)));

    setCapacity(size);

    setQueue((old) => old.slice(0, size));

    resetSimulation();
  };

  const updateQueueValue = (index, value) => {
    setQueue((old) => {
      const next = [...old];
      next[index] = value;
      return next;
    });

    resetSimulation();
  };

  const startSimulation = () => {
    const cleanQueue = queue
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (operation === "enqueue") {
      const value = String(inputValue).trim();

      if (!value) {
        alert("Please enter a value to enqueue.");
        return;
      }

      if (cleanQueue.length >= capacity) {
        const generated = buildEnqueueSteps(
          cleanQueue,
          value,
          capacity
        );

        setSteps(generated);
        setCurrentStep(0);
        setSimulationStarted(true);

        addObservation(
          "ENQUEUE",
          `Value = ${value}`,
          "Queue Overflow",
          "Overflow"
        );

        return;
      }

      const generated = buildEnqueueSteps(
        cleanQueue,
        value,
        capacity
      );

      setQueue([...cleanQueue, value]);
      setSteps(generated);
      setCurrentStep(0);
      setSimulationStarted(true);

      addObservation(
        "ENQUEUE",
        `Queue = ${cleanQueue.join(", ")}; Value = ${value}`,
        [...cleanQueue, value].join(", ")
      );

      return;
    }

    if (operation === "dequeue") {
      const generated = buildDequeueSteps(cleanQueue);

      setSteps(generated);
      setCurrentStep(0);
      setSimulationStarted(true);

      const result =
        cleanQueue.length > 0
          ? cleanQueue.slice(1).join(", ") || "Empty"
          : "Queue Underflow";

      addObservation(
        "DEQUEUE",
        cleanQueue.join(", ") || "Empty",
        result,
        cleanQueue.length ? "Successful" : "Underflow"
      );

      return;
    }

    if (operation === "peek") {
      const generated = buildPeekSteps(cleanQueue);

      setSteps(generated);
      setCurrentStep(0);
      setSimulationStarted(true);

      addObservation(
        "PEEK",
        cleanQueue.join(", ") || "Empty",
        cleanQueue.length
          ? `Front = ${cleanQueue[0]}`
          : "Queue Empty",
        cleanQueue.length ? "Successful" : "Empty"
      );

      return;
    }

    if (operation === "display") {
      const generated = buildDisplaySteps(cleanQueue);

      setSteps(generated);
      setCurrentStep(0);
      setSimulationStarted(true);

      addObservation(
        "DISPLAY",
        cleanQueue.join(", ") || "Empty",
        cleanQueue.join(", ") || "Empty",
        cleanQueue.length ? "Successful" : "Empty"
      );
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  /* =========================================================
     PROGRAM HELPERS
     ========================================================= */

  const resetProgram = () => {
    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgCompleted(false);
    setProgTrace([]);
    setSelectedTrace(-1);
    setProgError("");
    setAutoPlay(false);
  };

  const handleProgOperationChange = (value) => {
    setProgOperation(value);
    resetProgram();
  };

  const updateProgQueue = (index, value) => {
    setProgQueue((old) => {
      const next = [...old];
      next[index] = value;
      return next;
    });

    resetProgram();
  };

  const changeProgCapacity = (value) => {
    let size = Number(value);

    if (!Number.isFinite(size)) {
      size = 3;
    }

    size = Math.max(3, Math.min(8, Math.floor(size)));

    setProgCapacity(size);
    setProgQueue((old) => old.slice(0, size));

    resetProgram();
  };

  const runProgram = () => {
    setProgError("");

    const cleanQueue = progQueue
      .map((value) => String(value).trim())
      .filter(Boolean);

    let generated = [];

    if (progOperation === "enqueue") {
      const value = String(progValue).trim();

      if (!value) {
        setProgError("Please enter the value to enqueue.");
        return;
      }

      generated = buildEnqueueSteps(
        cleanQueue,
        value,
        progCapacity
      );
    }

    if (progOperation === "dequeue") {
      generated = buildDequeueSteps(cleanQueue);
    }

    if (progOperation === "peek") {
      generated = buildPeekSteps(cleanQueue);
    }

    if (progOperation === "display") {
      generated = buildDisplaySteps(cleanQueue);
    }

    const trace = generated.map((step, index) => ({
      step: index + 1,
      message: step.message,
      state:
        step.queue.length > 0
          ? step.queue.join(", ")
          : "Empty"
    }));

    setProgSteps(generated);
    setProgTrace(trace);
    setProgCurrentStep(0);
    setSelectedTrace(0);
    setProgRunning(true);
    setProgCompleted(false);
    setAutoPlay(false);
  };

  const progNextStep = () => {
    if (!progSteps.length) return;

    if (progCurrentStep < progSteps.length - 1) {
      const next = progCurrentStep + 1;

      setProgCurrentStep(next);
      setSelectedTrace(next);

      if (next === progSteps.length - 1) {
        setProgCompleted(true);
        setAutoPlay(false);
      }
    }
  };

  const progPreviousStep = () => {
    if (progCurrentStep > 0) {
      const previous = progCurrentStep - 1;

      setProgCurrentStep(previous);
      setSelectedTrace(previous);
      setProgCompleted(false);
    }
  };

  useEffect(() => {
    if (!autoPlay || !progRunning) return;

    if (progCurrentStep >= progSteps.length - 1) {
      setAutoPlay(false);
      setProgCompleted(true);
      return;
    }

    const timer = setTimeout(() => {
      progNextStep();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    autoPlay,
    progCurrentStep,
    progSteps,
    progRunning
  ]);

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
      alert("Please perform the Simulation first.");
      return;
    }

    if (!progCompleted) {
      alert("Please complete Program Execution first.");
      return;
    }

    if (!questionResult) {
      alert("Please answer all questions before submitting the experiment.");
      return;
    }

    const resultData = buildDstResult({
      experimentNo: 7,
      experimentName: "Perform Queue Operations",
      questionList: questions,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment7Result",
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
    progCurrentStep >= 0
      ? progSteps[progCurrentStep]
      : null;

  /* =========================================================
     QUEUE VISUALIZER
     ========================================================= */

  const renderQueueVisualizer = (
    queueData,
    stepData = {},
    title = "Queue Memory",
    maxCapacity = capacity
  ) => {
    const cells = Array.from(
      { length: maxCapacity },
      (_, index) => queueData[index] ?? null
    );

    return (
      <div className="dst7-queue-container">

        <div className="dst7-memory-title">
          <span>{title}</span>
          <small>
            FIFO • Capacity {maxCapacity}
          </small>
        </div>

        <div className="dst7-pointer-row">

          {cells.map((_, index) => (
            <div
              className="dst7-pointer-slot"
              key={index}
            >
              {stepData.front === index && (
                <span className="dst7-front-pointer">
                  FRONT
                </span>
              )}

              {stepData.rear === index && (
                <span className="dst7-rear-pointer">
                  REAR
                </span>
              )}
            </div>
          ))}

        </div>

        <div className="dst7-index-row">
          {cells.map((_, index) => (
            <div
              className="dst7-index-label"
              key={index}
            >
              [{index}]
            </div>
          ))}
        </div>

        <div className="dst7-queue-row">

          {cells.map((value, index) => {

            let className =
              "dst7-queue-cell";

            if (stepData.current === index) {
              className += " current";
            }

            if (stepData.front === index) {
              className += " front-cell";
            }

            if (stepData.rear === index) {
              className += " rear-cell";
            }

            if (value === null) {
              className += " empty";
            }

            return (
              <div
                className={className}
                key={index}
              >
                <div className="dst7-cell-index">
                  queue[{index}]
                </div>

                <div className="dst7-cell-value">
                  {value === null ? "—" : value}
                </div>

                {stepData.current === index && (
                  <div className="dst7-current-arrow">
                    ▼
                  </div>
                )}
              </div>
            );
          })}

        </div>

        <div className="dst7-direction">
          <span>DEQUEUE</span>

          <div className="dst7-direction-line">
            FRONT
            <span>→ → → → →</span>
            REAR
          </div>

          <small>
            Elements leave from FRONT and enter from REAR
          </small>
        </div>

        <div className="dst7-status-row">

          <div>
            <span>Queue Status</span>
            <b>
              {queueData.length === 0
                ? "EMPTY"
                : queueData.length >= maxCapacity
                ? "FULL"
                : "ACTIVE"}
            </b>
          </div>

          <div>
            <span>Front Element</span>
            <b>
              {queueData.length
                ? queueData[0]
                : "—"}
            </b>
          </div>

          <div>
            <span>Rear Element</span>
            <b>
              {queueData.length
                ? queueData[queueData.length - 1]
                : "—"}
            </b>
          </div>

        </div>
      </div>
    );
  };

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <div className="dst7-root">

      <div className="dst7-container">

        {/* HEADER */}

        <header className="dst7-exp-header">

          <button
            className="dst7-back-btn"
            onClick={() => navigate("/dst-experiments")}
          >
            ← Back
          </button>

          <div className="dst7-header-title">
            <div className="dst7-exp-no">
              Experiment No. 7
            </div>

            <h1>
              Perform All Queue Operations
            </h1>
          </div>

          <button
            className="dst7-help-btn"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div
            className="dst7-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst7-help-title"
              aria-modal="true"
              className="dst7-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst7-help-dialog-header">
                <h2 id="dst7-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst7-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Choose Enqueue, Dequeue, Peek, or Display in the Simulation tab and follow each step.</li>
                <li>Use the Program tab to execute the matching C program and inspect its steps.</li>
                <li>Remember that a queue follows FIFO: First In, First Out.</li>
                <li>Answer all 20 questions, submit them, then submit the experiment.</li>
              </ul>
              <button
                className="dst7-help-done"
                onClick={() => setShowHelp(false)}
                type="button"
              >
                Got it
              </button>
            </section>
          </div>
        )}

        {/* AIM */}

        <div className="dst7-card dst7-aim-card">

          <div className="dst7-card-title">
            Aim
          </div>

          <p>
            To write a C program to perform all basic
            queue operations such as Enqueue, Dequeue,
            Peek and Display using the FIFO principle.
          </p>

        </div>

        {/* THEORY */}

        <div className="dst7-card dst7-collapse-card">

          <button
            className="dst7-collapse-header"
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
            <div className="dst7-collapse-content">

              <p>
                A queue is a linear data structure that
                follows the FIFO (First In, First Out)
                principle.
              </p>

              <p>
                In a queue, insertion is performed at
                the REAR and deletion is performed from
                the FRONT.
              </p>

              <div className="dst7-theory-grid">

                <div>
                  <b>Enqueue</b>
                  <span>
                    Insert element at REAR
                  </span>
                </div>

                <div>
                  <b>Dequeue</b>
                  <span>
                    Remove element from FRONT
                  </span>
                </div>

                <div>
                  <b>Peek</b>
                  <span>
                    Read FRONT element
                  </span>
                </div>

                <div>
                  <b>Display</b>
                  <span>
                    Traverse FRONT → REAR
                  </span>
                </div>

              </div>

              <div className="dst7-complexity-box">

                <span>
                  <b>Enqueue:</b> O(1)
                </span>

                <span>
                  <b>Dequeue:</b> O(1)
                </span>

                <span>
                  <b>Peek:</b> O(1)
                </span>

                <span>
                  <b>Display:</b> O(n)
                </span>

              </div>

            </div>
          )}

        </div>

        {/* PROCEDURE */}

        <div className="dst7-card dst7-collapse-card">

          <button
            className="dst7-collapse-header"
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
            <div className="dst7-collapse-content">

              <div className="dst7-procedure-grid">

                <ol>
                  <li>Select the required queue operation.</li>
                  <li>Enter queue capacity and initial elements.</li>
                  <li>For Enqueue, enter the value to insert.</li>
                  <li>Start the simulation and observe FRONT and REAR.</li>
                </ol>

                <ol start="5">
                  <li>Use Previous and Next to understand every execution step.</li>
                  <li>Open the Program tab and execute the predefined C program.</li>
                  <li>Observe the execution trace and final output.</li>
                  <li>Answer all questions and submit the experiment.</li>
                </ol>

              </div>

            </div>
          )}

        </div>

        {/* TABS */}

        <div className="dst7-tabs">

          <button
            className={`dst7-tab ${
              activeTab === "simulation"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("simulation")
            }
          >
            Simulation
          </button>

          <button
            className={`dst7-tab ${
              activeTab === "program"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("program")
            }
          >
            Program
          </button>

          <button
            className={`dst7-tab ${
              activeTab === "questions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("questions")
            }
          >
            Questions
          </button>

        </div>

        {/* =====================================================
            SIMULATION
        ===================================================== */}

        {activeTab === "simulation" && (
          <>

            <div className="dst7-sim-row">

              {/* INPUT */}

              <div className="dst7-card dst7-input-panel">

                <div className="dst7-panel-heading">
                  Queue Input
                </div>

                <div className="dst7-operation-label">
                  Select Operation
                </div>

                <div className="dst7-operation-cards">

                  {[
                    ["enqueue", "Enqueue", "Add at rear"],
                    ["dequeue", "Dequeue", "Remove from front"],
                    ["peek", "Peek", "View front"],
                    ["display", "Display", "Traverse queue"]
                  ].map(
                    ([key, title, desc]) => (

                      <button
                        key={key}
                        className={`dst7-op-card ${
                          operation === key
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          setOperation(key);
                          resetSimulation();
                        }}
                      >

                        <span>
                          {key === "enqueue"
                            ? "＋"
                            : key === "dequeue"
                            ? "−"
                            : key === "peek"
                            ? "◎"
                            : "☷"}
                        </span>

                        <b>{title}</b>

                        <small>{desc}</small>

                      </button>

                    )
                  )}

                </div>

                <label>
                  Queue Capacity
                </label>

                <input
                  type="number"
                  min="3"
                  max="8"
                  value={capacity}
                  onChange={(e) =>
                    changeCapacity(
                      e.target.value
                    )
                  }
                />

                <label>
                  Initial Queue
                </label>

                <div className="dst7-input-grid">

                  {queue.map(
                    (value, index) => (

                      <div
                        className="dst7-small-input"
                        key={index}
                      >

                        <span>
                          [{index}]
                        </span>

                        <input
                          value={value}
                          onChange={(e) =>
                            updateQueueValue(
                              index,
                              e.target.value
                            )
                          }
                        />

                      </div>

                    )
                  )}

                </div>

                {operation === "enqueue" && (
                  <div className="dst7-special-input">

                    <label>
                      Value to Enqueue
                    </label>

                    <input
                      value={inputValue}
                      onChange={(e) =>
                        setInputValue(
                          e.target.value
                        )
                      }
                      placeholder="Example: 40"
                    />

                  </div>
                )}

                <div className="dst7-button-stack">

                  <button
                    className="dst7-primary-btn"
                    onClick={startSimulation}
                  >
                    ▶ Start Simulation
                  </button>

                  <button
                    className="dst7-reset-btn"
                    onClick={resetSimulation}
                  >
                    ↻ Reset
                  </button>

                </div>

              </div>

              {/* CANVAS */}

              <div className="dst7-card dst7-canvas-panel">

                <div className="dst7-canvas-header">

                  <div>

                    <div className="dst7-panel-heading">
                      Queue Memory Visualizer
                    </div>

                    <div className="dst7-canvas-subtitle">
                      Real-time FIFO queue execution
                    </div>

                  </div>

                  <div className="dst7-step-badge">

                    {simulationStarted
                      ? `STEP ${
                          currentStep + 1
                        }/${steps.length}`
                      : "READY"}

                  </div>

                </div>

                <div className="dst7-live-strip">

                  <div>
                    <span>Operation</span>
                    <b>
                      {operation.toUpperCase()}
                    </b>
                  </div>

                  <div>
                    <span>Capacity</span>
                    <b>{capacity}</b>
                  </div>

                  <div>
                    <span>Status</span>
                    <b
                      className={
                        simulationStarted
                          ? "running"
                          : "ready"
                      }
                    >
                      {simulationStarted
                        ? "RUNNING"
                        : "READY"}
                    </b>
                  </div>

                </div>

                <div className="dst7-queue-stage">

                  {currentSimulationStep
                    ? renderQueueVisualizer(
                        currentSimulationStep.queue,
                        currentSimulationStep
                      )
                    : renderQueueVisualizer(
                        queue
                      )}

                </div>

                {currentSimulationStep && (
                  <>

                    <div className="dst7-step-message">

                      <div className="dst7-step-icon">
                        {currentStep + 1}
                      </div>

                      <div>
                        <span>
                          Current Step
                        </span>

                        <p>
                          {
                            currentSimulationStep.message
                          }
                        </p>
                      </div>

                    </div>

                    <div className="dst7-navigation">

                      <button
                        className="dst7-secondary-btn"
                        disabled={
                          currentStep <= 0
                        }
                        onClick={
                          previousStep
                        }
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst7-next-btn"
                        disabled={
                          currentStep >=
                          steps.length - 1
                        }
                        onClick={nextStep}
                      >
                        Next →
                      </button>

                    </div>

                  </>
                )}

              </div>

              {/* ANALYSIS */}

              <div className="dst7-card dst7-analysis-panel">

                <div className="dst7-panel-heading">
                  Live Analysis
                </div>

                <div className="dst7-analysis-status">

                  <div className="dst7-analysis-dot" />

                  <div>

                    <span>
                      Execution Status
                    </span>

                    <b>

                      {simulationStarted
                        ? currentStep ===
                          steps.length - 1
                          ? "Completed"
                          : "Running"
                        : "Ready"}

                    </b>

                  </div>

                </div>

                <div className="dst7-analysis-item">

                  <span>Operation</span>

                  <b>{operation}</b>

                </div>

                <div className="dst7-analysis-item">

                  <span>Queue Size</span>

                  <b>
                    {currentSimulationStep
                      ? currentSimulationStep
                          .queue.length
                      : queue.length}
                  </b>

                </div>

                <div className="dst7-analysis-item">

                  <span>Front</span>

                  <b>
                    {currentSimulationStep
                      ? currentSimulationStep.front >= 0
                        ? currentSimulationStep.front
                        : "—"
                      : queue.length
                      ? "0"
                      : "—"}
                  </b>

                </div>

                <div className="dst7-analysis-item">

                  <span>Rear</span>

                  <b>
                    {currentSimulationStep
                      ? currentSimulationStep.rear >= 0
                        ? currentSimulationStep.rear
                        : "—"
                      : queue.length
                      ? queue.length - 1
                      : "—"}
                  </b>

                </div>

                <div className="dst7-analysis-item">

                  <span>Complexity</span>

                  <b className="dst7-complexity">

                    {operation === "display"
                      ? "O(n)"
                      : "O(1)"}

                  </b>

                </div>

                <div className="dst7-analysis-box">

                  <span>
                    Operation Explanation
                  </span>

                  <p>

                    {currentSimulationStep
                      ? currentSimulationStep.message
                      : operation === "enqueue"
                      ? "New elements enter from the REAR."
                      : operation === "dequeue"
                      ? "Elements leave from the FRONT."
                      : operation === "peek"
                      ? "Peek reads the FRONT without removing it."
                      : "Display traverses the queue from FRONT to REAR."}

                  </p>

                </div>

              </div>

            </div>

            {/* OBSERVATION */}

            <div className="dst7-card dst7-table-section">

              <div className="dst7-section-heading">
                Observation
              </div>

              {!observations.length ? (

                <div className="dst7-no-observation">
                  No observation recorded yet.
                </div>

              ) : (

                <div className="dst7-table-wrapper">

                  <table>

                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Operation</th>
                        <th>Input</th>
                        <th>Final State</th>
                        <th>Status</th>
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
                              {item.attempt}
                            </td>

                            <td>
                              {item.operation}
                            </td>

                            <td>
                              {item.input}
                            </td>

                            <td>
                              {item.result}
                            </td>

                            <td>

                              <span
                                className={`dst7-status-badge ${
                                  item.status ===
                                  "Successful"
                                    ? "success"
                                    : "warning"
                                }`}
                              >
                                {item.status}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}

        {/* =====================================================
            PROGRAM
        ===================================================== */}

        {activeTab === "program" && (

          <div className="dst7-program-area">

            <div className="dst7-card dst7-program-dropdown-row">

              <label>
                Select Program Operation
              </label>

              <select
                className="dst7-program-dropdown"
                value={progOperation}
                onChange={(e) =>
                  handleProgOperationChange(
                    e.target.value
                  )
                }
              >

                <option value="enqueue">
                  Enqueue
                </option>

                <option value="dequeue">
                  Dequeue
                </option>

                <option value="peek">
                  Peek
                </option>

                <option value="display">
                  Display
                </option>

              </select>

              <span className="dst7-predefined-badge">
                PREDEFINED PROGRAM
              </span>

            </div>

            <div className="dst7-program-grid">

              {/* LEFT */}

              <div className="dst7-program-left">

                <div className="dst7-card dst7-code-card">

                  <div className="dst7-section-heading">
                    C Program
                  </div>

                  <div className="dst7-code-header">

                    <span>
                      queue_{progOperation}.c
                    </span>

                    <span>
                      READ ONLY
                    </span>

                  </div>

                  <pre className="dst7-code">
                    {
                      CODE_TEMPLATES[
                        progOperation
                      ]
                    }
                  </pre>

                </div>

                <div className="dst7-card dst7-program-input">

                  <div className="dst7-section-heading">
                    Program Input
                  </div>

                  <label>
                    Queue Capacity
                  </label>

                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={progCapacity}
                    onChange={(e) =>
                      changeProgCapacity(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Queue Elements
                  </label>

                  <div className="dst7-program-elements">

                    {progQueue.map(
                      (value, index) => (

                        <div
                          className="dst7-program-element"
                          key={index}
                        >

                          <span>
                            queue[{index}]
                          </span>

                          <input
                            value={value}
                            onChange={(e) =>
                              updateProgQueue(
                                index,
                                e.target.value
                              )
                            }
                          />

                        </div>

                      )
                    )}

                  </div>

                  {progOperation ===
                    "enqueue" && (

                    <>
                      <label>
                        Enqueue Value
                      </label>

                      <input
                        value={progValue}
                        onChange={(e) =>
                          setProgValue(
                            e.target.value
                          )
                        }
                        placeholder="Example: 40"
                      />
                    </>
                  )}

                  {progError && (
                    <div className="dst7-error">
                      {progError}
                    </div>
                  )}

                  <div className="dst7-program-buttons">

                    <button
                      className="dst7-primary-btn"
                      onClick={runProgram}
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst7-reset-btn"
                      onClick={resetProgram}
                    >
                      ↻ Reset
                    </button>

                  </div>

                </div>

              </div>

              {/* RIGHT */}

              <div className="dst7-card dst7-execution-card">

                <div className="dst7-canvas-header">

                  <div>

                    <div className="dst7-panel-heading">
                      Program Execution
                    </div>

                    <div className="dst7-canvas-subtitle">
                      Execute the queue program
                      step-by-step
                    </div>

                  </div>

                  <div className="dst7-step-badge">

                    {progRunning
                      ? `STEP ${
                          progCurrentStep + 1
                        }/${progSteps.length}`
                      : "READY"}

                  </div>

                </div>

                <div className="dst7-live-strip">

                  <div>
                    <span>Operation</span>
                    <b>
                      {progOperation.toUpperCase()}
                    </b>
                  </div>

                  <div>
                    <span>Capacity</span>
                    <b>{progCapacity}</b>
                  </div>

                  <div>
                    <span>Status</span>
                    <b
                      className={
                        progRunning
                          ? "running"
                          : "ready"
                      }
                    >
                      {progCompleted
                        ? "COMPLETED"
                        : progRunning
                        ? "RUNNING"
                        : "READY"}
                    </b>
                  </div>

                </div>

                <div className="dst7-queue-stage">

                  {currentProgramStep
                    ? renderQueueVisualizer(
                        currentProgramStep.queue,
                        currentProgramStep,
                        "Program Queue",
                        progCapacity
                      )
                    : renderQueueVisualizer(
                        progQueue,
                        {},
                        "Program Queue",
                        progCapacity
                      )}

                </div>

                {currentProgramStep && (
                  <>

                    <div className="dst7-step-message">

                      <div className="dst7-step-icon">
                        {progCurrentStep + 1}
                      </div>

                      <div>

                        <span>
                          Execution Step
                        </span>

                        <p>
                          {
                            currentProgramStep.message
                          }
                        </p>

                      </div>

                    </div>

                    <div className="dst7-before-after">

                      <div>

                        <span>
                          PREVIOUS STATE
                        </span>

                        <b>

                          {progCurrentStep > 0
                            ? progSteps[
                                progCurrentStep -
                                  1
                              ].queue.join(
                                ", "
                              ) || "Empty"
                            : "Initial"}

                        </b>

                      </div>

                      <div className="dst7-ba-arrow">
                        →
                      </div>

                      <div>

                        <span>
                          CURRENT STATE
                        </span>

                        <b>

                          {currentProgramStep.queue
                            .length
                            ? currentProgramStep.queue.join(
                                ", "
                              )
                            : "Empty"}

                        </b>

                      </div>

                    </div>

                    <div className="dst7-navigation">

                      <button
                        className="dst7-secondary-btn"
                        disabled={
                          progCurrentStep <=
                          0
                        }
                        onClick={
                          progPreviousStep
                        }
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst7-secondary-btn"
                        disabled={
                          progCompleted
                        }
                        onClick={() =>
                          setAutoPlay(
                            (value) => !value
                          )
                        }
                      >
                        {autoPlay
                          ? "⏸ Pause"
                          : "▶ Auto Play"}
                      </button>

                      <button
                        className="dst7-next-btn"
                        disabled={
                          progCompleted
                        }
                        onClick={
                          progNextStep
                        }
                      >
                        Next →
                      </button>

                    </div>

                  </>
                )}

                {!progRunning && (

                  <div className="dst7-program-empty">

                    <div>▶</div>

                    <h3>
                      Execution Ready
                    </h3>

                    <p>
                      Enter inputs and click
                      Run Program.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* TRACE */}

            {progTrace.length > 0 && (

              <div className="dst7-card dst7-trace-card">

                <div className="dst7-trace-header">

                  <div>

                    <div className="dst7-section-heading">
                      Execution Trace
                    </div>

                    <p>
                      Each step of queue
                      execution
                    </p>

                  </div>

                  <span>
                    {progTrace.length} Steps
                  </span>

                </div>

                <div className="dst7-trace-list">

                  {progTrace.map(
                    (trace, index) => (

                      <button
                        key={trace.step}
                        className={`dst7-trace-item ${
                          selectedTrace ===
                          index
                            ? "active"
                            : ""
                        } ${
                          index <=
                          progCurrentStep
                            ? "visited"
                            : ""
                        }`}
                        onClick={() => {

                          if (
                            index <=
                            progCurrentStep
                          ) {

                            setSelectedTrace(
                              index
                            );

                            setProgCurrentStep(
                              index
                            );

                            setProgCompleted(
                              index ===
                                progSteps.length -
                                  1
                            );

                          }

                        }}
                      >

                        <span className="dst7-trace-number">
                          {trace.step}
                        </span>

                        <span className="dst7-trace-content">

                          <b>
                            {trace.message}
                          </b>

                          <small>
                            Queue:{" "}
                            {trace.state}
                          </small>

                        </span>

                        <span className="dst7-trace-status">

                          {index <=
                          progCurrentStep
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

            {progCompleted &&
              currentProgramStep && (

                <div className="dst7-card dst7-output-card">

                  <div className="dst7-section-heading">
                    Program Output
                  </div>

                  <pre className="dst7-output">
{`Operation : ${progOperation.toUpperCase()}

Input Queue : ${
  progQueue.join(" ")
}

Output Queue : ${
  currentProgramStep.queue.length
    ? currentProgramStep.queue.join(" ")
    : "Empty"
}

Front : ${
  currentProgramStep.front >= 0
    ? currentProgramStep.queue[
        currentProgramStep.front
      ] ?? "—"
    : "—"
}

Rear : ${
  currentProgramStep.rear >= 0
    ? currentProgramStep.queue[
        currentProgramStep.rear
      ] ?? "—"
    : "—"
}

Execution Status : SUCCESS
All program steps completed.`}
                  </pre>

                  <div className="dst7-output-actions">

                    <button
                      className="dst7-new-btn"
                      onClick={
                        resetProgram
                      }
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              )}

          </div>
        )}

        {/* =====================================================
            QUESTIONS
        ===================================================== */}

        {activeTab === "questions" && (

          <div className="dst7-card dst7-questions-section">

            <div className="dst7-section-heading">
              Questions
            </div>

            <p className="dst7-question-note">
              Select one correct answer for each
              question.
            </p>

            <div className="dst7-question-list">

              {questions.map(
                (question, qIndex) => (

                  <div
                    className="dst7-question-card"
                    key={qIndex}
                  >

                    <div className="dst7-question-title">
                      {qIndex + 1}.{" "}
                      {question.q}
                    </div>

                    <div className="dst7-options">

                      {question.options.map(
                        (
                          option,
                          optionIndex
                        ) => (

                          <label
                            key={optionIndex}
                            className={`dst7-option ${
                              answers[
                                qIndex
                              ] ===
                              optionIndex
                                ? "selected"
                                : ""
                            }`}
                          >

                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={
                                answers[
                                  qIndex
                                ] ===
                                optionIndex
                              }
                              onChange={() =>
                                selectAnswer(
                                  qIndex,
                                  optionIndex
                                )
                              }
                            />

                            <span className="dst7-option-letter">
                              {String.fromCharCode(
                                65 +
                                  optionIndex
                              )}
                            </span>

                            <span>
                              {option}
                            </span>

                          </label>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

            {experimentCompleted && questionResult && (

              <div className="dst7-question-result">

                <div>

                  <b>
                    Quiz Completed
                  </b>

                  <br />

                  Score:{" "}
                  {questionResult.score}/
                  {questionResult.total}

                </div>

                <span className="dst7-status-badge success">
                  Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* SUBMIT EXPERIMENT */}

        <div className="dst7-submit-only">
          <button
            className="dst7-submit-btn"
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

export default DSTExperiment7;