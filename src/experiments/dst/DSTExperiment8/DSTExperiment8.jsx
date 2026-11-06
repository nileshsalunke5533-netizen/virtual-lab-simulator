import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment8.css";

const DEFAULT_VALUES = [10, 20, 30];

const cloneList = (list) => [...list];

/* =========================================================
   SINGLY LINKED LIST OPERATION BUILDER
   ========================================================= */

const buildOperationSteps = (values, operation, inputValue = "") => {
  const list = cloneList(values);
  const steps = [];

  const value =
    inputValue === "" ? null : Number(inputValue);

  const addStep = (
    message,
    type = "normal",
    current = -1,
    activeList = list
  ) => {
    steps.push({
      message,
      type,
      current,
      list: cloneList(activeList)
    });
  };

  addStep(
    `Initial linked list contains ${list.length} node(s).`,
    "initial",
    -1
  );

  /* INSERT AT BEGINNING */

  if (operation === "insertBeginning") {
    if (value === null || Number.isNaN(value)) {
      addStep(
        "Please enter a valid integer value.",
        "error"
      );
      return steps;
    }

    addStep(
      `Create a new node with value ${value}.`,
      "create",
      -1
    );

    list.unshift(value);

    addStep(
      `New node ${value} is linked to the previous HEAD node.`,
      "link",
      0
    );

    addStep(
      `HEAD is updated to node ${value}.`,
      "success",
      0
    );

    return steps;
  }

  /* INSERT AT END */

  if (operation === "insertEnd") {
    if (value === null || Number.isNaN(value)) {
      addStep(
        "Please enter a valid integer value.",
        "error"
      );
      return steps;
    }

    addStep(
      `Create a new node with value ${value}.`,
      "create",
      -1
    );

    if (list.length === 0) {
      list.push(value);

      addStep(
        `HEAD now points to the new node ${value}.`,
        "success",
        0
      );

      return steps;
    }

    addStep(
      `Traverse from HEAD to the last node.`,
      "traverse",
      0
    );

    for (let i = 1; i < list.length; i++) {
      addStep(
        `Move from node ${list[i - 1]} to node ${list[i]}.`,
        "traverse",
        i
      );
    }

    list.push(value);

    addStep(
      `Set the last node's next pointer to node ${value}.`,
      "link",
      list.length - 1
    );

    addStep(
      `Node ${value} is inserted at the end.`,
      "success",
      list.length - 1
    );

    return steps;
  }

  /* DELETE FROM BEGINNING */

  if (operation === "deleteBeginning") {
    if (list.length === 0) {
      addStep(
        "Linked list is empty. Nothing to delete.",
        "error"
      );
      return steps;
    }

    const deleted = list[0];

    addStep(
      `HEAD currently points to node ${deleted}.`,
      "traverse",
      0
    );

    list.shift();

    addStep(
      `HEAD is moved to the next node.`,
      "link",
      0
    );

    addStep(
      `Node ${deleted} is deleted from the beginning.`,
      "success",
      0
    );

    return steps;
  }

  /* DELETE FROM END */

  if (operation === "deleteEnd") {
    if (list.length === 0) {
      addStep(
        "Linked list is empty. Nothing to delete.",
        "error"
      );
      return steps;
    }

    const deleted = list[list.length - 1];

    if (list.length === 1) {
      addStep(
        `HEAD points to the only node ${deleted}.`,
        "traverse",
        0
      );

      list.pop();

      addStep(
        `HEAD is set to NULL because the list is now empty.`,
        "link",
        -1
      );

      addStep(
        `Node ${deleted} is deleted.`,
        "success",
        -1
      );

      return steps;
    }

    addStep(
      `Start traversal from HEAD.`,
      "traverse",
      0
    );

    for (let i = 1; i < list.length - 1; i++) {
      addStep(
        `Move to node ${list[i]}.`,
        "traverse",
        i
      );
    }

    list.pop();

    addStep(
      `Set the next pointer of the new last node to NULL.`,
      "link",
      list.length - 1
    );

    addStep(
      `Node ${deleted} is deleted from the end.`,
      "success",
      list.length - 1
    );

    return steps;
  }

  /* DISPLAY */

  if (operation === "display") {
    if (list.length === 0) {
      addStep(
        "Linked list is empty.",
        "error"
      );
      return steps;
    }

    for (let i = 0; i < list.length; i++) {
      addStep(
        `Visit node ${list[i]}.`,
        "traverse",
        i
      );
    }

    addStep(
      `Display completed. ${list.length} node(s) are present.`,
      "success",
      list.length - 1
    );

    return steps;
  }

  /* SEARCH */

  if (operation === "search") {
    if (value === null || Number.isNaN(value)) {
      addStep(
        "Please enter a valid search value.",
        "error"
      );
      return steps;
    }

    if (list.length === 0) {
      addStep(
        "Linked list is empty.",
        "error"
      );
      return steps;
    }

    for (let i = 0; i < list.length; i++) {
      addStep(
        `Compare search value ${value} with node ${list[i]}.`,
        "traverse",
        i
      );

      if (list[i] === value) {
        addStep(
          `Value ${value} found at node ${i + 1}.`,
          "success",
          i
        );

        return steps;
      }
    }

    addStep(
      `Value ${value} was not found in the linked list.`,
      "error",
      -1
    );

    return steps;
  }

  return steps;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const DSTExperiment8 = () => {
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

  const [listValues, setListValues] =
    useState(DEFAULT_VALUES);

  const [inputValue, setInputValue] =
    useState("");

  const [operation, setOperation] =
    useState("insertEnd");

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
    useState("insertEnd");

  const [programValue, setProgramValue] =
    useState("40");

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

  /* =========================================================
     QUESTIONS
     ========================================================= */

  const questions = [
    {
      q: "A singly linked list contains:",
      options: [
        "Only data",
        "Data and next pointer",
        "Only pointers",
        "Two previous pointers"
      ],
      answer: 1
    },
    {
      q: "The first node of a linked list is pointed to by:",
      options: [
        "TAIL",
        "NULL",
        "HEAD",
        "TOP"
      ],
      answer: 2
    },
    {
      q: "The last node of a singly linked list points to:",
      options: [
        "HEAD",
        "NULL",
        "TOP",
        "Previous node"
      ],
      answer: 1
    },
    {
      q: "Which pointer stores the address of the next node?",
      options: [
        "data",
        "next",
        "head",
        "value"
      ],
      answer: 1
    },
    {
      q: "Linked list nodes are generally stored:",
      options: [
        "Contiguously",
        "Randomly in memory",
        "Only in stack",
        "Only in array"
      ],
      answer: 1
    },
    {
      q: "Insertion at the beginning changes:",
      options: [
        "HEAD",
        "NULL",
        "Only data",
        "Nothing"
      ],
      answer: 0
    },
    {
      q: "Deletion at the beginning removes:",
      options: [
        "Last node",
        "First node",
        "Middle node",
        "All nodes"
      ],
      answer: 1
    },
    {
      q: "Traversal starts from:",
      options: [
        "NULL",
        "Last node",
        "HEAD",
        "Middle node"
      ],
      answer: 2
    },
    {
      q: "What indicates the end of a singly linked list?",
      options: [
        "HEAD",
        "NULL",
        "TOP",
        "0th node"
      ],
      answer: 1
    },
    {
      q: "Which operation visits nodes one by one?",
      options: [
        "Traversal",
        "Sorting",
        "Compilation",
        "Casting"
      ],
      answer: 0
    },
    {
      q: "When inserting a node at the beginning, what should the new node's next pointer reference?",
      options: ["The previous HEAD node", "NULL in every case", "The previous node", "The list length"],
      answer: 0
    },
    {
      q: "After inserting the first node into an empty list, where should HEAD point?",
      options: ["NULL", "The new node", "The last array index", "The previous node"],
      answer: 1
    },
    {
      q: "To insert a node at the end of a singly linked list, traversal continues until:",
      options: ["HEAD is NULL", "The current node's next is NULL", "The second node is reached", "The list length is zero"],
      answer: 1
    },
    {
      q: "After inserting a node at the end, what should its next pointer contain?",
      options: ["HEAD", "The previous node", "NULL", "Its own address"],
      answer: 2
    },
    {
      q: "When deleting the first node, what should HEAD point to afterward?",
      options: ["The deleted node", "The second node", "NULL in every case", "The last node"],
      answer: 1
    },
    {
      q: "What should HEAD be set to after deleting the only node in a list?",
      options: ["The deleted node", "0th node", "NULL", "The previous node"],
      answer: 2
    },
    {
      q: "During traversal, what condition indicates the end of a singly linked list?",
      options: ["The current node is HEAD", "The current node's next is NULL", "The data value is zero", "The current node is the second node"],
      answer: 1
    },
    {
      q: "What is the time complexity of accessing the kth node by traversing from HEAD?",
      options: ["O(1) for every node", "O(k)", "O(log k)", "O(k²)"],
      answer: 1
    },
    {
      q: "Which statement describes a typical advantage of linked-list storage over a fixed-size array?",
      options: ["Nodes must be stored contiguously", "The list can grow by linking newly created nodes", "Every node can be accessed directly by index", "No pointer fields are needed"],
      answer: 1
    },
    {
      q: "In a singly linked list, can a node directly point to its previous node?",
      options: ["Yes, every node stores a previous pointer", "No, it stores a link to the next node only", "Only the HEAD node can", "Only the last node can"],
      answer: 1
    }
  ];

  const [answers, setAnswers] =
    useState({});

  const [questionResult, setQuestionResult] =
    useState(null);

  const [experimentCompleted, setExperimentCompleted] =
    useState(false);

  /* =========================================================
     SIMULATION
     ========================================================= */

  const startSimulation = () => {
    const generated =
      buildOperationSteps(
        listValues,
        operation,
        inputValue
      );

    setSteps(generated);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1)
      return;

    const next =
      currentStep + 1;

    setCurrentStep(next);

    const finalStep = steps[next];

    /*
      Observation is added ONLY when the final
      successful operation is reached.
    */

    if (finalStep?.type === "success") {
      setListValues(
        cloneList(finalStep.list)
      );

      setObservations((old) => [
        ...old,
        {
          attempt: old.length + 1,
          operation: operationLabel(operation),
          value:
            inputValue || "—",
          before: listValues.join(" → ") || "Empty",
          after:
            finalStep.list.join(" → ") ||
            "Empty",
          status: "Successful"
        }
      ]);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(
        (old) => old - 1
      );
    }
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  const resetList = () => {
    setListValues(DEFAULT_VALUES);
    setSteps([]);
    setCurrentStep(-1);
    setInputValue("");
  };

  /* =========================================================
     OPERATION LABEL
     ========================================================= */

  const operationLabel = (value) => {
    switch (value) {
      case "insertBeginning":
        return "Insert at Beginning";

      case "insertEnd":
        return "Insert at End";

      case "deleteBeginning":
        return "Delete from Beginning";

      case "deleteEnd":
        return "Delete from End";

      case "display":
        return "Display";

      case "search":
        return "Search";

      default:
        return value;
    }
  };

  /* =========================================================
     PROGRAM
     ========================================================= */

  const runProgram = () => {
    const generated =
      buildOperationSteps(
        listValues,
        programOperation,
        programValue
      );

    setProgramSteps(generated);
    setProgramCurrentStep(0);
    setProgramRunning(true);
    setProgramCompleted(false);
    setAutoPlay(false);
  };

  const programNext = () => {
    if (
      programCurrentStep >=
      programSteps.length - 1
    ) {
      return;
    }

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
    if (experimentCompleted)
      return;

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
      experimentNo: 8,
      experimentName: "Implement Singly Linked List Operations",
      questionList: questions,
      selectedAnswers: answers,
      observations,
      questionResult,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment8Result",
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
      ? programSteps[
          programCurrentStep
        ]
      : null;

  /* =========================================================
     LINKED LIST VISUALIZER
     ========================================================= */

  const renderLinkedList = (
    values,
    activeIndex = -1
  ) => {
    if (!values || values.length === 0) {
      return (
        <div className="dst8-empty-list">
          <div className="dst8-head-null">
            HEAD
            <span>→</span>
            NULL
          </div>

          <div className="dst8-empty-message">
            LINKED LIST EMPTY
          </div>
        </div>
      );
    }

    return (
      <div className="dst8-linked-list">

        <div className="dst8-list-flow">

          <div className="dst8-head-label">
            HEAD
            <span>↓</span>
          </div>

          {values.map(
            (value, index) => (
              <React.Fragment key={index}>

                <div
                  className={`
                    dst8-node
                    ${
                      index === activeIndex
                        ? "active"
                        : ""
                    }
                  `}
                >

                  <div className="dst8-node-data">
                    <small>
                      DATA
                    </small>

                    <b>
                      {value}
                    </b>
                  </div>

                  <div className="dst8-node-next">
                    <small>
                      NEXT
                    </small>

                    <span>
                      {index <
                      values.length - 1
                        ? "→"
                        : "NULL"}
                    </span>
                  </div>

                </div>

                {index <
                  values.length - 1 && (
                  <div className="dst8-arrow">
                    →
                  </div>
                )}

              </React.Fragment>
            )
          )}

        </div>

        <div className="dst8-null-label">
          NULL
        </div>

      </div>
    );
  };

  return (
    <div className="dst8-root">

      <div className="dst8-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="dst8-header">

          <button
            className="dst8-back"
            onClick={() =>
              navigate("/dst-experiments")
            }
          >
            ← Back
          </button>

          <div className="dst8-header-title">

            <div className="dst8-exp-no">
              Experiment No. 8
            </div>

            <h1>
              Implement C Program Based on Singly Linked List
            </h1>

          </div>

          <button
            className="dst8-help"
            onClick={() => setShowHelp(true)}
          >
            ? Help
          </button>

        </header>

        {showHelp && (
          <div
            className="dst8-help-overlay"
            onClick={() => setShowHelp(false)}
          >
            <section
              aria-labelledby="dst8-help-title"
              aria-modal="true"
              className="dst8-help-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="dst8-help-dialog-header">
                <h2 id="dst8-help-title">Experiment Help</h2>
                <button
                  aria-label="Close help"
                  className="dst8-help-close"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ul>
                <li>Choose a linked-list operation and enter a value when required.</li>
                <li>Start the simulation and step through node creation, pointer updates, and traversal.</li>
                <li>Use the Program tab to execute the corresponding C program step by step.</li>
                <li>Answer all 20 questions and submit them before submitting the experiment.</li>
              </ul>
              <button
                className="dst8-help-done"
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

        <div className="dst8-card dst8-aim">

          <div className="dst8-title">
            Aim
          </div>

          <p>
            To write a C program to implement
            basic operations on a singly linked list.
          </p>

        </div>

        {/* =================================================
            THEORY
            ================================================= */}

        <div className="dst8-card dst8-collapse">

          <button
            className="dst8-collapse-header"
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
            <div className="dst8-collapse-content">

              <p>
                A singly linked list is a
                dynamic linear data structure
                consisting of nodes. Each node
                contains data and a pointer to
                the next node.
              </p>

              <p>
                The HEAD pointer stores the
                address of the first node. The
                NEXT pointer of the last node
                contains NULL.
              </p>

              <div className="dst8-theory-grid">

                <div>
                  <b>HEAD</b>
                  <span>
                    Points to first node
                  </span>
                </div>

                <div>
                  <b>DATA</b>
                  <span>
                    Stores value
                  </span>
                </div>

                <div>
                  <b>NEXT</b>
                  <span>
                    Points to next node
                  </span>
                </div>

                <div>
                  <b>NULL</b>
                  <span>
                    Marks list end
                  </span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            PROCEDURE
            ================================================= */}

        <div className="dst8-card dst8-collapse">

          <button
            className="dst8-collapse-header"
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
            <div className="dst8-collapse-content">

              <div className="dst8-procedure">

                <ol>

                  <li>
                    Create the singly
                    linked list nodes.
                  </li>

                  <li>
                    Store data in each node.
                  </li>

                  <li>
                    Connect each node using
                    the NEXT pointer.
                  </li>

                  <li>
                    Set HEAD to the first node.
                  </li>

                </ol>

                <ol start="5">

                  <li>
                    Perform insertion or
                    deletion operations.
                  </li>

                  <li>
                    Traverse the list from
                    HEAD when required.
                  </li>

                  <li>
                    Display or search
                    node values.
                  </li>

                  <li>
                    The last node points
                    to NULL.
                  </li>

                </ol>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            TABS
            ================================================= */}

        <div className="dst8-tabs">

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

            <div className="dst8-sim-row">

              {/* INPUT */}

              <div className="dst8-card dst8-input">

                <div className="dst8-section">
                  Linked List Input
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

                  <option value="insertBeginning">
                    Insert at Beginning
                  </option>

                  <option value="insertEnd">
                    Insert at End
                  </option>

                  <option value="deleteBeginning">
                    Delete from Beginning
                  </option>

                  <option value="deleteEnd">
                    Delete from End
                  </option>

                  <option value="display">
                    Display
                  </option>

                  <option value="search">
                    Search
                  </option>

                </select>

                {(operation ===
                  "insertBeginning" ||
                  operation ===
                    "insertEnd" ||
                  operation ===
                    "search") && (

                  <>
                    <label>
                      Value
                    </label>

                    <input
                      type="number"
                      value={
                        inputValue
                      }
                      onChange={(e) => {
                        setInputValue(
                          e.target.value
                        );
                        resetSimulation();
                      }}
                      placeholder="Enter value"
                    />
                  </>

                )}

                <div className="dst8-current-list">

                  <b>
                    Current List
                  </b>

                  <span>
                    {listValues.length
                      ? listValues.join(
                          " → "
                        )
                      : "Empty"}
                  </span>

                </div>

                <button
                  className="dst8-primary"
                  onClick={
                    startSimulation
                  }
                >
                  ▶ Start Operation
                </button>

                <button
                  className="dst8-secondary"
                  onClick={
                    resetSimulation
                  }
                >
                  Reset Operation
                </button>

                <button
                  className="dst8-secondary"
                  onClick={resetList}
                >
                  New List
                </button>

              </div>

              {/* CANVAS */}

              <div className="dst8-card dst8-canvas">

                <div className="dst8-panel-heading">

                  <span>
                    Singly Linked List
                  </span>

                  <small>
                    {currentSimulationStep
                      ? "RUNNING"
                      : "READY"}
                  </small>

                </div>

                <div className="dst8-operation-badge">

                  {operationLabel(
                    operation
                  )}

                </div>

                <div className="dst8-list-stage">

                  {renderLinkedList(
                    currentSimulationStep
                      ? currentSimulationStep.list
                      : listValues,
                    currentSimulationStep
                      ?.current ?? -1
                  )}

                </div>

                <div
                  className={`
                    dst8-message
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
                    "Select an operation and start the simulation."}

                </div>

                <div className="dst8-controls">

                  <button
                    className="dst8-secondary"
                    onClick={
                      previousStep
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
                    className="dst8-primary"
                    onClick={
                      nextStep
                    }
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

              <div className="dst8-card dst8-analysis">

                <div className="dst8-section">
                  Analysis
                </div>

                <div className="dst8-analysis-box">

                  <span>
                    Operation
                  </span>

                  <b>
                    {operationLabel(
                      operation
                    )}
                  </b>

                </div>

                <div className="dst8-analysis-box">

                  <span>
                    Current Node
                  </span>

                  <b>
                    {currentSimulationStep
                      ?.current >= 0
                      ? `Node ${
                          currentSimulationStep
                            .current + 1
                        }`
                      : "—"}
                  </b>

                </div>

                <div className="dst8-analysis-box">

                  <span>
                    Nodes
                  </span>

                  <b>
                    {
                      (
                        currentSimulationStep
                          ?.list ||
                        listValues
                      ).length
                    }
                  </b>

                </div>

                <div className="dst8-analysis-box">

                  <span>
                    Attempts
                  </span>

                  <b>
                    {
                      observations.length
                    }
                  </b>

                </div>

                <div className="dst8-mini-observations">

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
                            {
                              item.after
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

              <div className="dst8-card dst8-observation-table-card">

                <div className="dst8-section">
                  Observation Table
                </div>

                <div className="dst8-observation-table-wrapper">

                  <table className="dst8-observation-table">

                    <thead>

                      <tr>
                        <th>
                          Attempt
                        </th>

                        <th>
                          Operation
                        </th>

                        <th>
                          Value
                        </th>

                        <th>
                          Before
                        </th>

                        <th>
                          After
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
                                item.value
                              }
                            </td>

                            <td>
                              {
                                item.before
                              }
                            </td>

                            <td>
                              {
                                item.after
                              }
                            </td>

                            <td>

                              <span className="dst8-status-success">
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

          <div className="dst8-program-area">

            <div className="dst8-program-grid">

              {/* LEFT */}

              <div className="dst8-program-left">

                {/* C PROGRAM */}

                <div className="dst8-card dst8-code-card">

                  <div className="dst8-section">
                    C Program
                  </div>

                  <div className="dst8-code-header">

                    <span>
                      singly_linked_list.c
                    </span>

                    <span>
                      READ ONLY
                    </span>

                  </div>

                  <pre className="dst8-code">
{`#include <stdio.h>
#include <stdlib.h>

struct Node
{
    int data;
    struct Node *next;
};

struct Node *head = NULL;

void insertBeginning(int value)
{
    struct Node *newNode;

    newNode =
        (struct Node *)malloc(
            sizeof(struct Node)
        );

    newNode->data = value;
    newNode->next = head;
    head = newNode;
}

void insertEnd(int value)
{
    struct Node *newNode;
    struct Node *temp;

    newNode =
        (struct Node *)malloc(
            sizeof(struct Node)
        );

    newNode->data = value;
    newNode->next = NULL;

    if(head == NULL)
    {
        head = newNode;
        return;
    }

    temp = head;

    while(temp->next != NULL)
    {
        temp = temp->next;
    }

    temp->next = newNode;
}

void deleteBeginning()
{
    struct Node *temp;

    if(head == NULL)
    {
        printf("List is empty");
        return;
    }

    temp = head;
    head = head->next;

    free(temp);
}

void deleteEnd()
{
    struct Node *temp;
    struct Node *prev;

    if(head == NULL)
    {
        printf("List is empty");
        return;
    }

    if(head->next == NULL)
    {
        free(head);
        head = NULL;
        return;
    }

    temp = head;

    while(temp->next != NULL)
    {
        prev = temp;
        temp = temp->next;
    }

    prev->next = NULL;
    free(temp);
}

void display()
{
    struct Node *temp = head;

    while(temp != NULL)
    {
        printf("%d -> ",
               temp->data);

        temp = temp->next;
    }

    printf("NULL");
}

int main()
{
    insertEnd(10);
    insertEnd(20);
    insertEnd(30);

    display();

    return 0;
}`}
                  </pre>

                </div>

                {/* PROGRAM INPUT */}

                <div className="dst8-card dst8-program-input">

                  <div className="dst8-section">
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
                      setProgramCompleted(
                        false
                      );
                      setProgramRunning(
                        false
                      );
                    }}
                  >

                    <option value="insertBeginning">
                      Insert at Beginning
                    </option>

                    <option value="insertEnd">
                      Insert at End
                    </option>

                    <option value="deleteBeginning">
                      Delete from Beginning
                    </option>

                    <option value="deleteEnd">
                      Delete from End
                    </option>

                    <option value="display">
                      Display
                    </option>

                    <option value="search">
                      Search
                    </option>

                  </select>

                  {(programOperation ===
                    "insertBeginning" ||
                    programOperation ===
                      "insertEnd" ||
                    programOperation ===
                      "search") && (

                    <>
                      <label>
                        Value
                      </label>

                      <input
                        type="number"
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
                    </>

                  )}

                  <div className="dst8-program-buttons">

                    <button
                      className="dst8-primary"
                      onClick={
                        runProgram
                      }
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst8-secondary"
                      onClick={() => {
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
                        setAutoPlay(
                          false
                        );
                      }}
                    >
                      New Execution
                    </button>

                  </div>

                </div>

              </div>

              {/* EXECUTION */}

              <div className="dst8-card dst8-program-sim">

                <div className="dst8-panel-heading">

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

                <div className="dst8-live-strip">

                  <div>

                    <span>
                      Operation
                    </span>

                    <b>
                      {
                        operationLabel(
                          programOperation
                        )
                      }
                    </b>

                  </div>

                  <div>

                    <span>
                      Value
                    </span>

                    <b>
                      {
                        programValue ||
                        "—"
                      }
                    </b>

                  </div>

                  <div>

                    <span>
                      Step
                    </span>

                    <b>
                      {
                        programSteps.length
                          ? `${
                              programCurrentStep +
                              1
                            } / ${
                              programSteps.length
                            }`
                          : "0 / 0"
                      }
                    </b>

                  </div>

                </div>

                <div className="dst8-program-list">

                  {renderLinkedList(
                    currentProgramStep
                      ?.list ||
                      listValues,
                    currentProgramStep
                      ?.current ??
                      -1
                  )}

                </div>

                <div
                  className={`
                    dst8-message
                    ${
                      currentProgramStep
                        ?.type === "error"
                        ? "error"
                        : ""
                    }
                    ${
                      currentProgramStep
                        ?.type === "success"
                        ? "success"
                        : ""
                    }
                  `}
                >

                  {currentProgramStep
                    ?.message ||
                    "Select an operation and click Run Program to begin execution."}

                </div>

                <div className="dst8-controls">

                  <button
                    className="dst8-secondary"
                    onClick={
                      programPrevious
                    }
                    disabled={
                      programCurrentStep <=
                      0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    className="dst8-secondary"
                    onClick={() =>
                      setAutoPlay(
                        (value) =>
                          !value
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
                    className="dst8-primary"
                    onClick={
                      programNext
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

              <div className="dst8-card dst8-trace-card">

                <div className="dst8-trace-header">

                  <div>

                    <div className="dst8-section">
                      Execution Trace
                    </div>

                    <p>
                      Each step of singly
                      linked list execution
                    </p>

                  </div>

                  <span>
                    {
                      programSteps.length
                    }{" "}
                    Steps
                  </span>

                </div>

                <div className="dst8-trace-list">

                  {programSteps.map(
                    (step, index) => (

                      <button
                        key={index}
                        className={`
                          dst8-trace-item
                          ${
                            programCurrentStep ===
                            index
                              ? "active"
                              : ""
                          }
                          ${
                            index <=
                            programCurrentStep
                              ? "visited"
                              : ""
                          }
                        `}
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
                                1
                            );

                          }

                        }}
                      >

                        <span className="dst8-trace-number">
                          {index + 1}
                        </span>

                        <span className="dst8-trace-content">

                          <b>
                            {
                              step.message
                            }
                          </b>

                          <small>
                            List:{" "}
                            {
                              step.list.length
                                ? step.list.join(
                                    " → "
                                  )
                                : "Empty"
                            }
                          </small>

                        </span>

                        <span className="dst8-trace-status">
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

              <div className="dst8-card dst8-output-card">

                <div className="dst8-section">
                  Program Output
                </div>

                <pre className="dst8-output">
{`Operation : ${operationLabel(programOperation)}

Value : ${programValue || "—"}

Final Linked List : ${
  currentProgramStep.list.length
    ? currentProgramStep.list.join(" -> ")
    : "Empty"
} -> NULL

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

        {activeTab ===
          "questions" && (

          <div className="dst8-card dst8-questions">

            <div className="dst8-section">
              Questions
            </div>

            {questions.map(
              (question, index) => (

                <div
                  className="dst8-question"
                  key={index}
                >

                  <b>
                    {index + 1}.{" "}
                    {question.q}
                  </b>

                  <div className="dst8-options">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (

                        <label
                          key={
                            optionIndex
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

              <div className="dst8-question-result">

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
                  Completed
                </span>

              </div>

            )}

          </div>

        )}

        {/* =================================================
            FINAL SUBMIT
            ================================================= */}

        <div className="dst8-submit-section">

          <button
            className="dst8-submit"
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

export default DSTExperiment8;