import { useNavigate } from "react-router-dom";
import useSubjectExperiments from "../hooks/useSubjectExperiments";
import "./DSTExperimentList.css";

function DSTExperimentList() {
  const navigate = useNavigate();
  const { enabledByNumber, error } = useSubjectExperiments("DST");

  const experiments = [
    {
      no: 1,
      title:
        "Write a 'C' program to perform various operations on one dimensional array. E.g. Creation, Insertion, Deletion and Display.",
      path: "/dst-experiment-1",
    },
    {
      no: 2,
      title:
        "Write a 'C' program for different sorting techniques: Bubble Sort, Insertion Sort, Selection Sort and Merge Sort.",
      path: "/dst-experiment-2",
    },
    {
      no: 3,
      title:
        "Write a program for implementing various searching techniques: Linear Search and Binary Search.",
      path: "/dst-experiment-3",
    },
    {
      no: 4,
      title:
        "Write a 'C' program to perform PUSH and POP operations of stack using array.",
      path: "/dst-experiment-4",
    },
    {
      no: 5,
      title:
        "Write a 'C' program for finding factorial and Fibonacci series by using recursion.",
      path: "/dst-experiment-5",
    },
    {
      no: 6,
      title: "Write a C program to evaluate postfix expressions.",
      path: "/dst-experiment-6",
    },
    {
      no: 7,
      title: "Write a C program to perform all queue operations.",
      path: "/dst-experiment-7",
    },
    {
      no: 8,
      title: "Implement C program based on singly linked lists.",
      path: "/dst-experiment-8",
    },
    {
      no: 9,
      title:
        "Implement C program based on trees for creating and deleting a node in binary tree.",
      path: "/dst-experiment-9",
    },
    {
      no: 10,
      title:
        "Implement C program to traverse binary search tree (Inorder, Preorder and Postorder) traversal.",
      path: "/dst-experiment-10",
    },
    {
      no: 11,
      title: "Write a program to implement all the operations on Graph.",
      path: "/dst-experiment-11",
    },
    {
      no: 12,
      title:
        "Compute the time and space complexity with Big O for following programs: Addition of 2 numbers, Factorial of a Number and Printing numbers from 1 to 10 using for loop.",
      path: "/dst-experiment-12",
    },
  ];

  return (
    <div className="dst-experiment-list-page">

      {/* ================= HEADER ================= */}
      <div className="dst-page-header">

        <button
          className="dst-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h2 className="dst-page-title">
          Data Structure Using C (DST)
        </h2>

        <div className="dst-header-space"></div>

      </div>


      {/* ================= SUBTITLE ================= */}
      <h3 className="dst-page-subtitle">
        Experiment List
      </h3>
      {error && <p role="alert">{error}</p>}


      {/* ================= EXPERIMENT LIST ================= */}
      <div className="dst-experiment-list">

        {experiments.map((experiment) => (
          <div
            key={experiment.no}
            className="dst-experiment-card"
          >

            {/* ================= CARD HEADER ================= */}
            <div className="dst-card-header">

              <p className="dst-experiment-number">
                <strong>Experiment No:</strong>{" "}
                {experiment.no}
              </p>

            </div>


            {/* ================= EXPERIMENT TITLE ================= */}
            <p className="dst-experiment-title">
              <strong>Title:</strong>{" "}
              {experiment.title}
            </p>


            {/* ================= START BUTTON ================= */}
            <button
              className="dst-start-btn"
              onClick={() => navigate(experiment.path)}
              disabled={!enabledByNumber || enabledByNumber.get(experiment.no) !== true}
            >
              {enabledByNumber?.get(experiment.no) === false
                ? "Experiment Disabled"
                : enabledByNumber
                  ? "Start Experiment"
                  : "Checking Availability..."}
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default DSTExperimentList;