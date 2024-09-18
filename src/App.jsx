import React, { useState } from "react"; // Import useState from React
import "./App.css";

function Lift() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div id="lift" className={isOpen ? "open" : ""}>
        <div id="left-door"></div>
        <div id="right-door"></div>
      </div>
    </div>
  );
}

function Floors({ index }) {
  return (
    <div id="floor-set-up">
      <div>
        <div>{index !== 0 ? <button>Up</button> : <></>}</div>

        <div>
          <button>Down</button>
        </div>
      </div>
      <div>{index + 1}</div>
    </div>
  );
}

function App() {
  const [floors, setFloors] = useState("");
  const [lifts, setLifts] = useState("");

  const handleFloorChange = (e) => {
    setFloors(Number(e.target.value)); // Convert to number
  };

  const handleLiftsChange = (e) => {
    setLifts(Number(e.target.value)); // Convert to number
  };

  // Create an array of floor indices and reverse it
  const array = Array.from({ length: floors }, (_, index) => index);
  const reversedArray = [...array].reverse(); // Create a reversed copy

  return (
    <>
      <h1>Lift Simulation</h1>
      <div id="fieldBoxes">
        <input
          onChange={handleFloorChange}
          id="floors"
          type="number"
          value={floors}
          placeholder="Number of floors"
        />
        <input
          onChange={handleLiftsChange}
          id="lifts"
          type="number"
          value={lifts}
          placeholder="Number of lifts"
        />
      </div>
      <div>
        {reversedArray.map((info) => (
          <Floors key={info} index={info} />
        ))}
      </div>
      <div id="liftMainDiv">
        {Array.from({ length: lifts }, (_, index) => (
          <div key={index} style={{ margin: "1px" }}>
            <Lift />
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
