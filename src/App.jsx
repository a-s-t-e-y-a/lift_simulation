import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function LiftSimulation() {
  const [floors, setFloors] = useState("");
  const [numLifts, setNumLifts] = useState("");
  const [lifts, setLifts] = useState([]);
  const [maxLifts, setMaxLifts] = useState(1);
  const transitionTimeouts = useRef({});
  const doorTimeouts = useRef({});
  const liftMainDivRef = useRef(null);

  useEffect(() => {
    const updateMaxLifts = () => {
      if (liftMainDivRef.current) {
        const liftMainDivWidth = liftMainDivRef.current.offsetWidth;
        const singleLiftWidth = 70;
        const maxLiftsFit = Math.floor(liftMainDivWidth / singleLiftWidth);
        setMaxLifts(maxLiftsFit);
      }
    };

    updateMaxLifts();
    window.addEventListener("resize", updateMaxLifts);

    return () => window.removeEventListener("resize", updateMaxLifts);
  }, []);

  const initializeLifts = (numLifts) => {
    console.log(`Initializing lifts with ${numLifts} lifts.`);
    const liftArray = Array.from({ length: numLifts }, () => ({
      chooseFloor: 0,
      type_: null,
      liftposition: -101,
      currentFloor: 0,
      transitionTime: 0,
      transitioning: false,
      doorsOpen: false,
      doorState: "closed",
    }));
    setLifts(liftArray);
  };

  const handleFloorChange = (e) => {
    const floorValue = Math.max(0, Number(e.target.value));
    console.log(`Floor input changed to: ${floorValue}`);
    setFloors(floorValue);
  };

  const handleLiftsChange = (e) => {
    const liftsValue = Math.min(Math.max(0, Number(e.target.value)), maxLifts);
    console.log(`Lifts input changed to: ${liftsValue}`);
    setNumLifts(liftsValue);
    initializeLifts(liftsValue);
  };

  const findOptimalLift = (requestedFloor) => {
    console.log(`Finding optimal lift for requested floor: ${requestedFloor}`);
    let closestLiftIndex = null;
    let minDistance = Infinity;

    lifts.forEach((lift, index) => {
      const distance = Math.abs(lift.currentFloor - requestedFloor);
      console.log(
        `Lift ${index} distance to floor ${requestedFloor}: ${distance}`,
      );

      if (
        distance < minDistance &&
        !lift.transitioning &&
        lift.doorState === "closed"
      ) {
        minDistance = distance;
        closestLiftIndex = index;
      }
    });

    console.log(`Optimal lift index: ${closestLiftIndex}`);
    return closestLiftIndex;
  };

  const handleChange = (floor, type) => {
    console.log(`Handling change. Floor: ${floor}, Type: ${type}`);
    const liftIndex = findOptimalLift(floor);

    if (liftIndex !== null) {
      setLifts((prevLifts) => {
        const newLifts = [...prevLifts];
        const lift = newLifts[liftIndex];

        if (lift.doorState !== "closed") {
          console.log(`Lift ${liftIndex} doors are not closed. Cannot move.`);
          return prevLifts;
        }

        console.log(`Updating lift ${liftIndex} with new values.`);
        console.log(
          `Current Floor: ${lift.currentFloor}, Choose Floor: ${floor + 1}`,
        );

        lift.chooseFloor = floor + 1;
        lift.type_ = type;
        lift.liftposition = -lift.chooseFloor * 101;
        lift.transitionTime =
          Math.abs(lift.currentFloor - lift.chooseFloor) * 2.5;
        lift.transitioning = true;

        console.log(
          `Lift ${liftIndex} position updated to: ${lift.liftposition}`,
        );
        console.log(
          `Lift ${liftIndex} transition time set to: ${lift.transitionTime}s`,
        );

        const transitionTimeout = lift.transitionTime * 1000;
        console.log(
          `Timeout for lift ${liftIndex} started, waiting ${transitionTimeout} ms`,
        );

        if (transitionTimeouts.current[liftIndex]) {
          clearTimeout(transitionTimeouts.current[liftIndex]);
        }

        if (doorTimeouts.current[liftIndex]) {
          clearTimeout(doorTimeouts.current[liftIndex]);
        }

        const timeoutId = setTimeout(() => {
          console.log(`Timeout for lift ${liftIndex} completed`);
          setLifts((prevLifts) => {
            const updatedLifts = [...prevLifts];
            updatedLifts[liftIndex] = {
              ...updatedLifts[liftIndex],
              transitioning: false,
              currentFloor: lift.chooseFloor,
              doorState: "opening",
            };
            return updatedLifts;
          });

          setTimeout(() => {
            setLifts((prevLifts) => {
              const updatedLifts = [...prevLifts];
              updatedLifts[liftIndex] = {
                ...updatedLifts[liftIndex],
                doorState: "open",
              };
              return updatedLifts;
            });

            const doorTimeoutId = setTimeout(() => {
              setLifts((prevLifts) => {
                const updatedLifts = [...prevLifts];
                updatedLifts[liftIndex] = {
                  ...updatedLifts[liftIndex],
                  doorState: "closing",
                };
                return updatedLifts;
              });

              setTimeout(() => {
                setLifts((prevLifts) => {
                  const updatedLifts = [...prevLifts];
                  updatedLifts[liftIndex] = {
                    ...updatedLifts[liftIndex],
                    doorState: "closed",
                  };
                  return updatedLifts;
                });
              }, 2500);
            }, 2500);

            doorTimeouts.current[liftIndex] = doorTimeoutId;
          }, 2500);
        }, transitionTimeout);

        transitionTimeouts.current[liftIndex] = timeoutId;

        return newLifts;
      });
    } else {
      console.log("No available lift found for the requested floor.");
    }
  };

  const array = Array.from({ length: floors }, (_, index) => index);
  const reversedArray = array.reverse();

  return (
    <>
      <h1>Lift Simulation</h1>
      <div id="fieldBoxes">
        <input
          onChange={handleFloorChange}
          id="floors"
          type="number"
          value={floors}
          min="0"
          placeholder="Number of floors"
        />
        <input
          onChange={handleLiftsChange}
          id="lifts"
          type="number"
          value={numLifts}
          min="0"
          max={maxLifts}
          placeholder={`Number of lifts (max ${maxLifts})`}
        />
      </div>

      <div>
        {reversedArray.map((info) => (
          <div key={info} id="floor-set-up">
            <div>
              <div>
                {info !== 0 && (
                  <button onClick={() => handleChange(info, "UP")}>Up</button>
                )}
              </div>
              <div>
                <button onClick={() => handleChange(info, "DOWN")}>Down</button>
              </div>
            </div>
            <div>{info + 1}</div>
          </div>
        ))}
      </div>

      <div id="liftMainDiv" ref={liftMainDivRef}>
        {lifts.map((lift, index) => (
          <div key={index}>
            <div
              id="lift"
              className={lift.doorState !== "closed" ? "open" : ""}
              style={{
                top: `${lift.liftposition}px`,
                transition: `top ${lift.transitionTime}s ease-in-out`,
              }}
            >
              <div id="left-door"></div>
              <div id="right-door"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default LiftSimulation;
