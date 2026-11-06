import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildDstResult } from "../../../utils/dstResult.js";
import "./DSTExperiment3.css";

// =========================================================
// PREDEFINED PROGRAMS — READ ONLY
// =========================================================

const LINEAR_SEARCH_CODE = `#include <stdio.h>

int main() {
    int arr[100], n, key;
    int i, found = -1;

    printf("Enter array size: ");
    scanf("%d", &n);

    printf("Enter array elements: ");
    for(i = 0; i < n; i++)
        scanf("%d", &arr[i]);

    printf("Enter search key: ");
    scanf("%d", &key);

    for(i = 0; i < n; i++) {
        if(arr[i] == key) {
            found = i;
            break;
        }
    }

    if(found != -1)
        printf("Element found at index %d", found);
    else
        printf("Element not found");

    return 0;
}`;

const BINARY_SEARCH_CODE = `#include <stdio.h>

int main() {
    int arr[100], n, key;
    int low, high, mid;
    int found = -1;

    printf("Enter sorted array size: ");
    scanf("%d", &n);

    printf("Enter sorted array elements: ");
    for(int i = 0; i < n; i++)
        scanf("%d", &arr[i]);

    printf("Enter search key: ");
    scanf("%d", &key);

    low = 0;
    high = n - 1;

    while(low <= high) {
        mid = (low + high) / 2;

        if(arr[mid] == key) {
            found = mid;
            break;
        }
        else if(arr[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }

    if(found != -1)
        printf("Element found at index %d", found);
    else
        printf("Element not found");

    return 0;
}`;

// =========================================================
// STEP BUILDERS
// =========================================================

const buildLinearSteps = (elements, key) => {
  const steps = [];

  steps.push({
    type: "start",
    array: [...elements],
    active: [],
    message: `Start Linear Search for key ${key}.`,
    codeLine: "Initialize search from index 0.",
  });

  for (let i = 0; i < elements.length; i++) {
    const value = Number(elements[i]);

    if (value === Number(key)) {
      steps.push({
        type: "found",
        array: [...elements],
        active: [i],
        found: i,
        message: `Compare arr[${i}] = ${value} with key ${key}. Element found.`,
        codeLine: `if(arr[${i}] == key) → TRUE`,
      });

      steps.push({
        type: "complete",
        array: [...elements],
        active: [i],
        found: i,
        message: `Linear Search completed. Element found at index ${i}.`,
        codeLine: `found = ${i}`,
      });

      return steps;
    }

    steps.push({
      type: "compare",
      array: [...elements],
      active: [i],
      message: `Compare arr[${i}] = ${value} with key ${key}.`,
      codeLine: `arr[${i}] == key → FALSE`,
    });
  }

  steps.push({
    type: "complete",
    array: [...elements],
    active: [],
    found: -1,
    message: `Linear Search completed. Element ${key} was not found.`,
    codeLine: "found == -1",
  });

  return steps;
};

const buildBinarySteps = (elements, key) => {
  const steps = [];

  let low = 0;
  let high = elements.length - 1;

  steps.push({
    type: "start",
    array: [...elements],
    active: [],
    low,
    high,
    message: `Start Binary Search for key ${key}.`,
    codeLine: `low = 0, high = ${high}`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = Number(elements[mid]);

    if (value === Number(key)) {
      steps.push({
        type: "found",
        array: [...elements],
        active: [mid],
        low,
        high,
        mid,
        found: mid,
        message: `arr[${mid}] = ${value}. Key ${key} found.`,
        codeLine: `arr[mid] == key → TRUE`,
      });

      steps.push({
        type: "complete",
        array: [...elements],
        active: [mid],
        low,
        high,
        mid,
        found: mid,
        message: `Binary Search completed. Element found at index ${mid}.`,
        codeLine: `found = ${mid}`,
      });

      return steps;
    }

    steps.push({
      type: "compare",
      array: [...elements],
      active: [mid],
      low,
      high,
      mid,
      message: `Check middle element arr[${mid}] = ${value} against key ${key}.`,
      codeLine: `mid = (${low} + ${high}) / 2 = ${mid}`,
    });

    if (value < Number(key)) {
      const oldLow = low;
      low = mid + 1;

      steps.push({
        type: "move-right",
        array: [...elements],
        active: [mid],
        low,
        high,
        mid,
        message: `${value} < ${key}, so search the right half.`,
        codeLine: `low = mid + 1 → ${low}`,
        previousLow: oldLow,
      });
    } else {
      const oldHigh = high;
      high = mid - 1;

      steps.push({
        type: "move-left",
        array: [...elements],
        active: [mid],
        low,
        high,
        mid,
        message: `${value} > ${key}, so search the left half.`,
        codeLine: `high = mid - 1 → ${high}`,
        previousHigh: oldHigh,
      });
    }
  }

  steps.push({
    type: "complete",
    array: [...elements],
    active: [],
    low,
    high,
    found: -1,
    message: `Binary Search completed. Element ${key} was not found.`,
    codeLine: "low > high → Element not found",
  });

  return steps;
};

// =========================================================
// COMPONENT
// =========================================================

const DSTExperiment3 = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // =======================================================
  // SIMULATION STATE
  // =======================================================

  const [operation, setOperation] = useState("linear");
  const [arraySize, setArraySize] = useState(5);
  const [elements, setElements] = useState([
    "10",
    "20",
    "30",
    "40",
    "50",
  ]);
  const [searchKey, setSearchKey] = useState("");

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [observations, setObservations] = useState([]);
  const [experimentCompleted, setExperimentCompleted] = useState(false);

  // =======================================================
  // PROGRAM STATE
  // =======================================================

  const [progOperation, setProgOperation] = useState("linear");
  const [progArraySize, setProgArraySize] = useState("");
  const [progElements, setProgElements] = useState([]);
  const [progSearchKey, setProgSearchKey] = useState("");

  const [progSteps, setProgSteps] = useState([]);
  const [progCurrentStep, setProgCurrentStep] = useState(-1);
  const [progRunning, setProgRunning] = useState(false);
  const [progError, setProgError] = useState("");

  // =======================================================
  // QUESTIONS
  // =======================================================

  const questions = [
    {
      q: "Which searching technique checks each element one by one?",
      options: ["Binary Search", "Linear Search", "Hashing", "Sorting"],
      answer: 1,
    },
    {
      q: "Binary Search requires the array to be:",
      options: [
        "Unsorted",
        "Random",
        "Sorted",
        "Empty",
      ],
      answer: 2,
    },
    {
      q: "What is the best-case time complexity of Linear Search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: 2,
    },
    {
      q: "What is the average time complexity of Binary Search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: 1,
    },
    {
      q: "In Binary Search, which element is checked first?",
      options: ["First", "Last", "Middle", "Random"],
      answer: 2,
    },
    {
      q: "If the middle element is smaller than the search key, which half is selected?",
      options: [
        "Left half",
        "Right half",
        "Both halves",
        "No half",
      ],
      answer: 1,
    },
    {
      q: "Linear Search can be performed on:",
      options: [
        "Only sorted arrays",
        "Only linked lists",
        "Sorted or unsorted arrays",
        "Only matrices",
      ],
      answer: 2,
    },
    {
      q: "What is the worst-case complexity of Binary Search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      answer: 2,
    },
    {
      q: "Linear Search checks [8, 3, 11, 6] for key 11. At which index is the key found?",
      options: ["0", "1", "2", "3"],
      answer: 2,
    },
    {
      q: "How many elements are checked when Linear Search looks for a missing key in an array of 5 elements?",
      options: ["1", "At most 5", "At most 2", "0"],
      answer: 1,
    },
    {
      q: "What is the initial value of low in Binary Search on an array with zero-based indexing?",
      options: ["-1", "0", "1", "n"],
      answer: 1,
    },
    {
      q: "For an array with 8 elements, what is the initial value of high in Binary Search?",
      options: ["8", "7", "4", "0"],
      answer: 1,
    },
    {
      q: "For low = 0 and high = 6, what is mid using (low + high) / 2 with integer division?",
      options: ["2", "3", "4", "6"],
      answer: 1,
    },
    {
      q: "In Binary Search, if arr[mid] is less than the key, what should happen next?",
      options: ["Set high = mid - 1", "Set low = mid + 1", "Stop immediately", "Search both halves"],
      answer: 1,
    },
    {
      q: "In Binary Search, if arr[mid] is greater than the key, which range remains?",
      options: ["The right half", "The left half", "The whole array", "No range"],
      answer: 1,
    },
    {
      q: "When should a typical Binary Search loop stop because the key was not found?",
      options: ["When low becomes greater than high", "When mid is always zero", "After one comparison", "When the array is sorted"],
      answer: 0,
    },
    {
      q: "Binary Search is used on [2, 5, 8, 12, 16] to find 12. What is checked first?",
      options: ["2", "5", "8", "12"],
      answer: 2,
    },
    {
      q: "After checking 8 while searching for 12 in [2, 5, 8, 12, 16], which indices remain to search?",
      options: ["0 to 1", "3 to 4", "0 to 4", "Only index 2"],
      answer: 1,
    },
    {
      q: "Which input is valid for Binary Search in ascending order?",
      options: ["[9, 2, 7, 1]", "[1, 3, 6, 10]", "[4, 4, 2, 8]", "[5, 1, 3, 2]"],
      answer: 1,
    },
    {
      q: "If a search key is found at index 0, what does that indicate?",
      options: ["The key is at the first element", "The key is absent", "The array is empty", "The key is at the last element"],
      answer: 0,
    },
  ];

  const [answers, setAnswers] = useState({});
  const [questionResult, setQuestionResult] = useState(null);

  // =======================================================
  // CURRENT PROGRAM
  // =======================================================

  const currentProgram = useMemo(() => {
    return progOperation === "linear"
      ? LINEAR_SEARCH_CODE
      : BINARY_SEARCH_CODE;
  }, [progOperation]);

  // =======================================================
  // SIMULATION HELPERS
  // =======================================================

  const handleSizeChange = (value) => {
    let size = Number(value);

    if (!value) {
      setArraySize("");
      setElements([]);
      return;
    }

    size = Math.max(1, Math.min(10, size));

    setArraySize(size);

    setElements((prev) => {
      const newArr = [];

      for (let i = 0; i < size; i++) {
        newArr.push(prev[i] !== undefined ? prev[i] : "");
      }

      return newArr;
    });

    resetSimulation();
  };

  const updateElement = (index, value) => {
    if (!/^-?\d*$/.test(value)) return;

    setElements((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

    resetSimulation(false);
  };

  const startSimulation = () => {
    if (!arraySize || arraySize < 1) {
      alert("Please enter valid array size.");
      return;
    }

    if (elements.some((item) => item === "")) {
      alert("Please enter all array elements.");
      return;
    }

    if (searchKey === "") {
      alert("Please enter search key.");
      return;
    }

    if (operation === "binary") {
      const nums = elements.map(Number);

      for (let i = 1; i < nums.length; i++) {
        if (nums[i] < nums[i - 1]) {
          alert("Binary Search requires a sorted array.");
          return;
        }
      }
    }

    const generated =
      operation === "linear"
        ? buildLinearSteps(elements, searchKey)
        : buildBinarySteps(elements, searchKey);

    setSteps(generated);
    setCurrentStep(0);
    setSimulationStarted(true);
  };

  const nextSimulationStep = () => {
    if (!simulationStarted) return;

    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);

      if (next === steps.length - 1) {
        const finalStep = steps[next];

        setObservations((prev) => [
          ...prev,
          {
            attempt: prev.length + 1,
            technique:
              operation === "linear"
                ? "Linear Search"
                : "Binary Search",
            input: elements.join(", "),
            key: searchKey,
            result:
              finalStep.found !== undefined && finalStep.found !== -1
                ? `Found at index ${finalStep.found}`
                : "Not Found",
            status: "Completed",
          },
        ]);
      }
    }
  };

  const previousSimulationStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetSimulation = (clearInputs = true) => {
    setSteps([]);
    setCurrentStep(-1);
    setSimulationStarted(false);

    if (clearInputs) {
      setSearchKey("");
    }
  };

  // =======================================================
  // PROGRAM HANDLERS
  // =======================================================

  const handleProgramOperationChange = (value) => {
    setProgOperation(value);
    setProgArraySize("");
    setProgElements([]);
    setProgSearchKey("");
    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgError("");
  };

  const handleProgramSizeChange = (value) => {
    if (!value) {
      setProgArraySize("");
      setProgElements([]);
      return;
    }

    let size = Number(value);
    size = Math.max(1, Math.min(10, size));

    setProgArraySize(size);

    setProgElements((prev) => {
      const updated = [];

      for (let i = 0; i < size; i++) {
        updated.push(prev[i] !== undefined ? prev[i] : "");
      }

      return updated;
    });

    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgError("");
  };

  const updateProgramElement = (index, value) => {
    if (!/^-?\d*$/.test(value)) return;

    setProgElements((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
  };

  const runProgram = () => {
    setProgError("");

    if (!progArraySize) {
      setProgError("Please enter array size.");
      return;
    }

    if (progElements.length !== Number(progArraySize)) {
      setProgError("Please enter all array elements.");
      return;
    }

    if (progElements.some((item) => item === "")) {
      setProgError("Please enter all array elements.");
      return;
    }

    if (progSearchKey === "") {
      setProgError("Please enter search key.");
      return;
    }

    if (progOperation === "binary") {
      const nums = progElements.map(Number);

      for (let i = 1; i < nums.length; i++) {
        if (nums[i] < nums[i - 1]) {
          setProgError(
            "Binary Search requires a sorted array. Please enter elements in ascending order."
          );
          return;
        }
      }
    }

    const generated =
      progOperation === "linear"
        ? buildLinearSteps(progElements, progSearchKey)
        : buildBinarySteps(progElements, progSearchKey);

    setProgSteps(generated);
    setProgCurrentStep(0);
    setProgRunning(true);
  };

  const progNextStep = () => {
    if (!progRunning) return;

    if (progCurrentStep < progSteps.length - 1) {
      setProgCurrentStep((prev) => prev + 1);
    }
  };

  const progPreviousStep = () => {
    if (progCurrentStep > 0) {
      setProgCurrentStep((prev) => prev - 1);
    }
  };

  const resetProgram = () => {
    setProgSteps([]);
    setProgCurrentStep(-1);
    setProgRunning(false);
    setProgError("");
  };

  // =======================================================
  // QUESTIONS
  // =======================================================

  const selectAnswer = (qIndex, optionIndex) => {
    const nextAnswers = {
      ...answers,
      [qIndex]: optionIndex,
    };

    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === questions.length) {
      const score = questions.reduce(
        (total, question, index) =>
          total + (nextAnswers[index] === question.answer ? 1 : 0),
        0
      );

      setQuestionResult({
        score,
        total: questions.length,
      });
    }
  };

  // =======================================================
  // FINAL SUBMIT
  // =======================================================

  const submitExperiment = () => {
    if (observations.length === 0) {
      alert("Please complete at least one search operation.");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting the experiment.");
      return;
    }

    const resultData = buildDstResult({
      experimentNo: 3,
      experimentName:
        "Implement Linear Search and Binary Search",
      questionList: questions,
      selectedAnswers: answers,
      observations,
    });

    setExperimentCompleted(true);

    localStorage.setItem(
      "DSTExperiment3Result",
      JSON.stringify({
        experiment: 3,
        title: "Linear Search and Binary Search",
        observations,
        completedAt: new Date().toISOString(),
      })
    );
    localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    navigate("/result", { state: resultData });
  };

  const newExperiment = () => {
    setExperimentCompleted(false);
    setObservations([]);
    setOperation("linear");
    setArraySize(5);
    setElements(["10", "20", "30", "40", "50"]);
    setSearchKey("");
    resetSimulation();
  };

  // =======================================================
  // MEMORY VISUALIZER
  // =======================================================

  const renderMemoryVisualizer = (simArray, stepData = {}) => {
    if (!simArray || simArray.length === 0) {
      return (
        <div className="dst3-empty-canvas">
          <div className="dst3-array-icon">🔎</div>
          <h3>Search Visualization</h3>
          <p>Start the search to visualize the algorithm.</p>
        </div>
      );
    }

    return (
      <div className="dst3-memory-container">
        <div className="dst3-address-row">
          {simArray.map((_, index) => (
            <div className="dst3-address" key={index}>
              {1000 + index * 4}
            </div>
          ))}
        </div>

        <div className="dst3-index-row">
          {simArray.map((_, index) => (
            <div className="dst3-index-label" key={index}>
              index {index}
            </div>
          ))}
        </div>

        <div className="dst3-array">
          {simArray.map((value, index) => {
            const isActive = stepData.active?.includes(index);
            const isLow = stepData.low === index;
            const isHigh = stepData.high === index;
            const isMid = stepData.mid === index;
            const isFound = stepData.found === index;

            return (
              <div
                className={`dst3-array-cell
                  ${isActive ? "current" : ""}
                  ${isFound ? "found-cell" : ""}
                  ${isMid ? "mid-cell" : ""}
                `}
                key={index}
              >
                <div className="dst3-cell-top">A[{index}]</div>

                <div className="dst3-value">{value}</div>

                <div className="dst3-pointer-row">
                  {isLow && <span className="dst3-low-pointer">L</span>}
                  {isMid && <span className="dst3-mid-pointer">M</span>}
                  {isHigh && <span className="dst3-high-pointer">H</span>}
                </div>
              </div>
            );
          })}
        </div>

        {(stepData.low !== undefined ||
          stepData.mid !== undefined ||
          stepData.high !== undefined) && (
          <div className="dst3-search-range">
            <span>Search Range</span>
            <b>
              Low: {stepData.low ?? "-"} &nbsp; | &nbsp;
              Mid: {stepData.mid ?? "-"} &nbsp; | &nbsp;
              High: {stepData.high ?? "-"}
            </b>
          </div>
        )}
      </div>
    );
  };

  const currentSimStep =
    simulationStarted && currentStep >= 0
      ? steps[currentStep]
      : null;

  const currentProgStep =
    progRunning && progCurrentStep >= 0
      ? progSteps[progCurrentStep]
      : null;

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="dst3-root">
      <div className="dst3-container">

        {/* HEADER */}
        <header className="dst3-exp-header">
          <button
            className="dst3-back-btn"
            onClick={() => navigate("/dst-experiments")}
          >
            ← Back
          </button>

          <div className="dst3-title-group">
            <div className="dst3-exp-no">EXPERIMENT NO. 3</div>
            <h1>
            Implement Linear Search and Binary Search
            </h1>
          </div>

          <div className="dst3-header-actions">
            <button
              className="dst3-help-btn"
              onClick={() => setShowHelp(true)}
            >
              ? Help
            </button>
          </div>
        </header>

        {/* AIM */}
        <section className="dst3-card dst3-aim-card">
          <div className="dst3-card-title">Aim</div>
          <p>
            To write a program for implementing various searching
            techniques: Linear Search and Binary Search.
          </p>
        </section>

        {/* THEORY */}
        <section className="dst3-card dst3-collapse-card">
          <button
            className="dst3-collapse-header"
            onClick={() => setShowTheory(!showTheory)}
          >
            <span>Theory</span>
            <span>{showTheory ? "▲" : "▼"}</span>
          </button>

          {showTheory && (
            <div className="dst3-collapse-content">
              <p>
                Searching is the process of finding a particular
                element, called the search key, from a collection
                of data.
              </p>

              <p>
                <b>Linear Search:</b> It checks every element
                sequentially from the beginning until the required
                element is found or the array ends.
              </p>

              <p>
                <b>Binary Search:</b> It works on a sorted array.
                It repeatedly checks the middle element and
                eliminates half of the search space.
              </p>

              <div className="dst3-complexity-box">
                <span>
                  <b>Linear Search:</b> Best O(1), Worst O(n)
                </span>
                <span>
                  <b>Binary Search:</b> Best O(1), Worst O(log n)
                </span>
              </div>
            </div>
          )}
        </section>

        {/* PROCEDURE */}
        <section className="dst3-card dst3-collapse-card">
          <button
            className="dst3-collapse-header"
            onClick={() => setShowProcedure(!showProcedure)}
          >
            <span>Procedure</span>
            <span>{showProcedure ? "▲" : "▼"}</span>
          </button>

          {showProcedure && (
            <div className="dst3-collapse-content">
              <ol>
                <li>Select Linear Search or Binary Search.</li>
                <li>Enter the array size.</li>
                <li>Enter the required number of array elements.</li>
                <li>Enter the search key.</li>
                <li>Click Start Search.</li>
                <li>Use Next Step to observe the execution.</li>
                <li>Observe the result and execution trace.</li>
              </ol>
            </div>
          )}
        </section>

        {/* TABS */}
        <div className="dst3-tabs">
          <button
            className={`dst3-tab ${
              activeTab === "simulation" ? "active" : ""
            }`}
            onClick={() => setActiveTab("simulation")}
          >
            Simulation
          </button>

          <button
            className={`dst3-tab ${
              activeTab === "program" ? "active" : ""
            }`}
            onClick={() => setActiveTab("program")}
          >
            Program
          </button>

          <button
            className={`dst3-tab ${
              activeTab === "questions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
        </div>

        {/* ===================================================
            SIMULATION TAB
        =================================================== */}

        {activeTab === "simulation" && (
          <>
            <div className="dst3-sim-row">

              {/* INPUT */}
              <section className="dst3-card dst3-input-panel">
                <div className="dst3-panel-heading">
                  Input Panel
                </div>

                <div className="dst3-operation-label">
                  Select Searching Technique
                </div>

                <div className="dst3-operation-cards">
                  <button
                    className={`dst3-op-card ${
                      operation === "linear" ? "active" : ""
                    }`}
                    onClick={() => {
                      setOperation("linear");
                      resetSimulation();
                    }}
                  >
                    <span>01</span>
                    <b>Linear Search</b>
                    <small>Sequential search</small>
                  </button>

                  <button
                    className={`dst3-op-card ${
                      operation === "binary" ? "active" : ""
                    }`}
                    onClick={() => {
                      setOperation("binary");
                      resetSimulation();
                    }}
                  >
                    <span>02</span>
                    <b>Binary Search</b>
                    <small>Sorted array</small>
                  </button>
                </div>

                <label>Array Size</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={arraySize}
                  onChange={(e) =>
                    handleSizeChange(e.target.value)
                  }
                />

                <label>Array Elements</label>

                <div className="dst3-input-grid">
                  {elements.map((value, index) => (
                    <div
                      className="dst3-small-input"
                      key={index}
                    >
                      <span>{index}</span>

                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateElement(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <label>Search Key</label>
                <input
                  type="number"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="Enter key"
                />

                <div className="dst3-button-stack">
                  <button
                    className="dst3-primary-btn"
                    onClick={startSimulation}
                  >
                    ▶ Start Search
                  </button>

                  <button
                    className="dst3-reset-btn"
                    onClick={() => resetSimulation()}
                  >
                    ↻ Reset
                  </button>
                </div>
              </section>

              {/* CANVAS */}
              <section className="dst3-card dst3-canvas-panel">
                <div className="dst3-canvas-header">
                  <div>
                    <div className="dst3-panel-heading">
                      Search Visualization
                    </div>

                    <div className="dst3-canvas-subtitle">
                      {operation === "linear"
                        ? "Linear Search — sequential comparison"
                        : "Binary Search — divide and search"}
                    </div>
                  </div>

                  <div className="dst3-step-badge">
                    {simulationStarted
                      ? `STEP ${currentStep + 1} / ${steps.length}`
                      : "READY"}
                  </div>
                </div>

                <div className="dst3-live-strip">
                  <div>
                    <span>Technique</span>
                    <b>
                      {operation === "linear"
                        ? "Linear Search"
                        : "Binary Search"}
                    </b>
                  </div>

                  <div>
                    <span>Search Key</span>
                    <b>
                      {searchKey || "—"}
                    </b>
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
                        ? "Running"
                        : "Ready"}
                    </b>
                  </div>
                </div>

                <div className="dst3-memory-title">
                  <span>Array Memory</span>
                  <small>4 bytes per integer</small>
                </div>

                <div className="dst3-array-stage">
                  {simulationStarted
                    ? renderMemoryVisualizer(
                        currentSimStep?.array,
                        currentSimStep || {}
                      )
                    : renderMemoryVisualizer(elements, {})}
                </div>

                {currentSimStep && (
                  <>
                    <div className="dst3-step-message">
                      <div className="dst3-step-icon">
                        {currentStep + 1}
                      </div>

                      <div>
                        <span>Current Step</span>
                        <p>{currentSimStep.message}</p>
                      </div>
                    </div>

                    <div className="dst3-before-after">
                      <div>
                        <span>Code Action</span>
                        <b>{currentSimStep.codeLine}</b>
                      </div>

                      <div className="dst3-ba-arrow">→</div>

                      <div>
                        <span>Search State</span>
                        <b>
                          {currentSimStep.found !== undefined
                            ? currentSimStep.found !== -1
                              ? `Found @ ${currentSimStep.found}`
                              : "Not Found"
                            : operation === "binary"
                            ? `L ${currentSimStep.low ?? "-"} | H ${
                                currentSimStep.high ?? "-"
                              }`
                            : "Comparing"}
                        </b>
                      </div>
                    </div>

                    <div className="dst3-navigation">
                      <button
                        className="dst3-secondary-btn"
                        disabled={currentStep <= 0}
                        onClick={previousSimulationStep}
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst3-next-btn"
                        disabled={
                          currentStep >= steps.length - 1
                        }
                        onClick={nextSimulationStep}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* ANALYSIS */}
              <section className="dst3-card dst3-analysis-panel">
                <div className="dst3-panel-heading">
                  Live Analysis
                </div>

                <div className="dst3-analysis-status">
                  <div className="dst3-analysis-dot"></div>

                  <div>
                    <span>Status</span>
                    <b>
                      {currentSimStep?.type === "complete"
                        ? "Completed"
                        : simulationStarted
                        ? "Searching"
                        : "Ready"}
                    </b>
                  </div>
                </div>

                <div className="dst3-analysis-item">
                  <span>Technique</span>
                  <b>
                    {operation === "linear"
                      ? "Linear"
                      : "Binary"}
                  </b>
                </div>

                <div className="dst3-analysis-item">
                  <span>Array Size</span>
                  <b>{arraySize || 0}</b>
                </div>

                <div className="dst3-analysis-item">
                  <span>Search Key</span>
                  <b>{searchKey || "—"}</b>
                </div>

                <div className="dst3-analysis-item">
                  <span>Current Step</span>
                  <b>
                    {simulationStarted
                      ? currentStep + 1
                      : 0}
                  </b>
                </div>

                <div className="dst3-analysis-item">
                  <span>Complexity</span>
                  <b className="dst3-complexity">
                    {operation === "linear"
                      ? "O(n)"
                      : "O(log n)"}
                  </b>
                </div>

                {operation === "binary" && currentSimStep && (
                  <div className="dst3-analysis-box">
                    <span>Search Range</span>
                    <p>
                      Low: {currentSimStep.low ?? "-"}
                      <br />
                      Middle: {currentSimStep.mid ?? "-"}
                      <br />
                      High: {currentSimStep.high ?? "-"}
                    </p>
                  </div>
                )}

                <div className="dst3-analysis-box">
                  <span>Algorithm Insight</span>
                  <p>
                    {operation === "linear"
                      ? "Each element is checked sequentially until the key is found."
                      : "The sorted array is repeatedly divided into two halves."}
                  </p>
                </div>
              </section>
            </div>

            {/* OBSERVATION */}
            <section className="dst3-card dst3-table-section">
              <div className="dst3-section-heading">
                Observation
              </div>

              {observations.length === 0 ? (
                <div className="dst3-no-observation">
                  No search operation completed yet.
                </div>
              ) : (
                <div className="dst3-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Technique</th>
                        <th>Array</th>
                        <th>Key</th>
                        <th>Result</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {observations.map((item, index) => (
                        <tr key={index}>
                          <td>{item.attempt}</td>
                          <td>{item.technique}</td>
                          <td>{item.input}</td>
                          <td>{item.key}</td>
                          <td>{item.result}</td>
                          <td>
                            <span className="dst3-success-badge">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {experimentCompleted && (
              <section className="dst3-result-card">
                <div className="dst3-result-icon">✓</div>

                <div>
                  <h3>Experiment Completed</h3>
                  <p>
                    Linear Search and Binary Search practical
                    has been completed successfully.
                  </p>
                </div>

                <button
                  className="dst3-new-btn"
                  onClick={newExperiment}
                >
                  New
                </button>
              </section>
            )}
          </>
        )}

        {/* ===================================================
            PROGRAM TAB
        =================================================== */}

        {activeTab === "program" && (
          <div className="dst3-program-area">

            {/* PROGRAM SELECT */}
            <section className="dst3-card dst3-program-dropdown-row">
              <label>Select Program</label>

              <select
                className="dst3-program-dropdown"
                value={progOperation}
                onChange={(e) =>
                  handleProgramOperationChange(e.target.value)
                }
              >
                <option value="linear">
                  Linear Search
                </option>
                <option value="binary">
                  Binary Search
                </option>
              </select>
            </section>

            {/* PROGRAM + EXECUTION */}
            <div className="dst3-program-grid">

              {/* LEFT */}
              <div className="dst3-program-left">

                {/* PREDEFINED CODE */}
                <section className="dst3-card dst3-code-card">
                  <div className="dst3-code-header">
                    <span>
                      {progOperation === "linear"
                        ? "linear_search.c"
                        : "binary_search.c"}
                    </span>

                    <span>READ ONLY</span>
                  </div>

                  <pre className="dst3-code">
                    {currentProgram}
                  </pre>
                </section>

                {/* USER INPUT */}
                <section className="dst3-card dst3-program-input">
                  <div className="dst3-panel-heading">
                    Program Input
                  </div>

                  <label>Array Size</label>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={progArraySize}
                    onChange={(e) =>
                      handleProgramSizeChange(
                        e.target.value
                      )
                    }
                    placeholder="Enter array size"
                  />

                  {progArraySize && (
                    <>
                      <label>
                        {progOperation === "binary"
                          ? "Sorted Array Elements"
                          : "Array Elements"}
                      </label>

                      <div className="dst3-program-elements">
                        {progElements.map((value, index) => (
                          <div
                            className="dst3-program-element"
                            key={index}
                          >
                            <span>
                              arr[{index}]
                            </span>

                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateProgramElement(
                                  index,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <label>Search Key</label>

                  <input
                    type="number"
                    value={progSearchKey}
                    onChange={(e) =>
                      setProgSearchKey(e.target.value)
                    }
                    placeholder="Enter search key"
                  />

                  {progOperation === "binary" && (
                    <div className="dst3-program-note">
                      Binary Search requires elements in
                      ascending order.
                    </div>
                  )}

                  {progError && (
                    <div className="dst3-error">
                      {progError}
                    </div>
                  )}

                  <div className="dst3-button-row">
                    <button
                      className="dst3-primary-btn"
                      onClick={runProgram}
                    >
                      ▶ Run Program
                    </button>

                    <button
                      className="dst3-reset-btn"
                      onClick={resetProgram}
                    >
                      ↻ Reset
                    </button>
                  </div>
                </section>
              </div>

              {/* RIGHT — EXECUTION */}
              <section className="dst3-card dst3-program-execution">

                <div className="dst3-canvas-header">
                  <div>
                    <div className="dst3-panel-heading">
                      Program Execution
                    </div>

                    <div className="dst3-canvas-subtitle">
                      Step-by-step execution of the predefined
                      C program
                    </div>
                  </div>

                  <div className="dst3-step-badge">
                    {progRunning
                      ? `STEP ${progCurrentStep + 1} / ${progSteps.length}`
                      : "READY"}
                  </div>
                </div>

                <div className="dst3-live-strip">
                  <div>
                    <span>Program</span>
                    <b>
                      {progOperation === "linear"
                        ? "Linear Search"
                        : "Binary Search"}
                    </b>
                  </div>

                  <div>
                    <span>Key</span>
                    <b>
                      {progSearchKey || "—"}
                    </b>
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
                      {progRunning
                        ? "Executing"
                        : "Ready"}
                    </b>
                  </div>
                </div>

                <div className="dst3-memory-title">
                  <span>Execution Memory</span>
                  <small>
                    Runtime array state
                  </small>
                </div>

                <div className="dst3-array-stage dst3-program-stage">
                  {progRunning
                    ? renderMemoryVisualizer(
                        currentProgStep?.array,
                        currentProgStep || {}
                      )
                    : progElements.length > 0
                    ? renderMemoryVisualizer(
                        progElements,
                        {}
                      )
                    : (
                      <div className="dst3-empty-canvas">
                        <div className="dst3-array-icon">
                          ▶
                        </div>

                        <h3>
                          Program Execution
                        </h3>

                        <p>
                          Enter runtime values and click
                          Run Program.
                        </p>
                      </div>
                    )}
                </div>

                {currentProgStep && (
                  <>
                    <div className="dst3-step-message">
                      <div className="dst3-step-icon">
                        {progCurrentStep + 1}
                      </div>

                      <div>
                        <span>Execution Step</span>
                        <p>
                          {currentProgStep.message}
                        </p>
                      </div>
                    </div>

                    <div className="dst3-before-after">
                      <div>
                        <span>Program Statement</span>
                        <b>
                          {currentProgStep.codeLine}
                        </b>
                      </div>

                      <div className="dst3-ba-arrow">
                        →
                      </div>

                      <div>
                        <span>Current Result</span>
                        <b>
                          {currentProgStep.found !==
                            undefined
                            ? currentProgStep.found !== -1
                              ? `Found @ index ${currentProgStep.found}`
                              : "Not Found"
                            : progOperation === "binary"
                            ? `Low ${currentProgStep.low ?? "-"} | High ${
                                currentProgStep.high ?? "-"
                              }`
                            : "Comparing"}
                        </b>
                      </div>
                    </div>

                    <div className="dst3-navigation">
                      <button
                        className="dst3-secondary-btn"
                        disabled={
                          progCurrentStep <= 0
                        }
                        onClick={progPreviousStep}
                      >
                        ← Previous
                      </button>

                      <button
                        className="dst3-next-btn"
                        disabled={
                          progCurrentStep >=
                          progSteps.length - 1
                        }
                        onClick={progNextStep}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* EXECUTION TRACE */}
            {progSteps.length > 0 && (
              <section className="dst3-card dst3-trace-card">
                <div className="dst3-section-heading">
                  Program Execution Trace
                </div>

                <div className="dst3-trace-note">
                  Click any step to inspect the corresponding
                  execution state.
                </div>

                <div className="dst3-trace-list">
                  {progSteps.map((step, index) => (
                    <button
                      key={index}
                      className={`dst3-trace-item ${
                        index === progCurrentStep
                          ? "active"
                          : ""
                      } ${
                        index < progCurrentStep
                          ? "visited"
                          : ""
                      }`}
                      onClick={() =>
                        setProgCurrentStep(index)
                      }
                    >
                      <span className="dst3-trace-number">
                        {index + 1}
                      </span>

                      <span className="dst3-trace-content">
                        <b>{step.type}</b>
                        <small>
                          {step.message}
                        </small>
                      </span>

                      <span className="dst3-trace-arrow">
                        →
                      </span>
                    </button>
                  ))}
                </div>

                {progCurrentStep ===
                  progSteps.length - 1 && (
                  <div className="dst3-program-final">
                    <div>
                      <span>Program Output</span>

                      <b>
                        {currentProgStep?.found !==
                        undefined
                          ? currentProgStep.found !== -1
                            ? `Element ${progSearchKey} found at index ${currentProgStep.found}`
                            : `Element ${progSearchKey} not found`
                          : "Execution completed"}
                      </b>
                    </div>

                    <button
                      className="dst3-new-btn"
                      onClick={resetProgram}
                    >
                      New
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* ===================================================
            QUESTIONS TAB
        =================================================== */}

        {activeTab === "questions" && (
          <section className="dst3-card dst3-questions-section">
            <div className="dst3-section-heading">
              Viva / Assignment Questions
            </div>

            <p className="dst3-question-note">
              Select the correct option for each question.
            </p>

            <div className="dst3-question-list">
              {questions.map((question, qIndex) => (
                <div
                  className="dst3-question-card"
                  key={qIndex}
                >
                  <div className="dst3-question-title">
                    Q{qIndex + 1}. {question.q}
                  </div>

                  <div className="dst3-options">
                    {question.options.map(
                      (option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`dst3-option ${
                            answers[qIndex] === optionIndex
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={
                              answers[qIndex] ===
                              optionIndex
                            }
                            onChange={() =>
                              selectAnswer(
                                qIndex,
                                optionIndex
                              )
                            }
                          />

                          <span className="dst3-option-letter">
                            {String.fromCharCode(
                              65 + optionIndex
                            )}
                          </span>

                          <span>{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {experimentCompleted && questionResult && (
              <div className="dst3-question-result">
                <span>
                  Your Score:{" "}
                  <b>
                    {questionResult.score} /{" "}
                    {questionResult.total}
                  </b>
                </span>

                <span>
                  {questionResult.score ===
                  questionResult.total
                    ? "All answers are correct."
                    : "Review the incorrect answers and try again."}
                </span>
              </div>
            )}
          </section>
        )}

        <section className="dst3-submit-global">
          <button
            className="dst3-submit-btn"
            onClick={submitExperiment}
          >
            Submit Experiment
          </button>
        </section>

          {showHelp && (
            <div
              className="dst3-help-overlay"
              onClick={() => setShowHelp(false)}
            >
              <section
                aria-labelledby="dst3-help-title"
                aria-modal="true"
                className="dst3-help-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <div className="dst3-help-dialog-header">
                  <h2 id="dst3-help-title">Experiment Help</h2>
                  <button
                    aria-label="Close help"
                    className="dst3-help-close"
                    onClick={() => setShowHelp(false)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                <p>Practice finding a key using Linear Search and Binary Search.</p>
                <ul>
                  <li>Select a search technique and enter the array and key.</li>
                  <li>Binary Search requires the array to be sorted in ascending order.</li>
                  <li>Start the simulation and use the step controls to follow each comparison.</li>
                  <li>Use the Program tab to follow the corresponding C program execution.</li>
                </ul>
                <button
                  className="dst3-help-done"
                  onClick={() => setShowHelp(false)}
                  type="button"
                >
                  Got it
                </button>
              </section>
            </div>
          )}
      </div>
    </div>
  );
};

export default DSTExperiment3;