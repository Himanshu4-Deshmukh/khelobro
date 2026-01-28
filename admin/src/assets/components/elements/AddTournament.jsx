import { useState } from "react";
import { base } from "../../../utils/api.manager";
import axios from "axios";
import toastr from "toastr";

export const AddTournament = ({ setMenu }) => {
  const permissions = [
    "MANAGE USER",
    "ADD TRANSACTION",
    "CHAT SUPPORT",
    "MANAGE DEPOSIT",
    "MANAGE WITHDRAW",
    "PENDING RESULT",
    "CANCEL REQUEST",
    "MANAGE CONFLICT",
    "MANAGE MATCH",
    "DASHBOARD REPORT",
  ];
  const [working, setWorking] = useState(false);
  const [scoring, setScoring] = useState([
    { fromRank: "", toRank: "", reward: "" },
  ]);

  const addScoreRow = () => {
    setScoring([...scoring, { fromRank: "", toRank: "", reward: "" }]);
  };

  const removeScoreRow = (index) => {
    const updated = scoring.filter((_, i) => i !== index);
    setScoring(updated);
  };

  const updateScoreRow = (index, field, value) => {
    const updated = [...scoring];
    updated[index][field] = value;
    setScoring(updated);
  };
  const handleFormSubmit = function (e) {
    console.log(scoring);
    setWorking(true);
    e.preventDefault();
    const form = e.target;
    const data = {};
    data._token = localStorage.getItem("_token");
    data._deviceId = localStorage.getItem("_deviceId");
    new FormData(e.target).forEach((value, key) => {
      if (key === "access[]") {
        // If key is "access[]", store values in an array
        if (!data.access) {
          data.access = [];
        }
        data.access.push(value);
      } else {
        data[key] = value.trim();
      }
    });

    data["scoring"] = scoring;

    axios
      .post(base("/addNewTournament"), data)
      .then(function (response) {
        console.log("response : ", response.data);
        if (response.data.success) {
          toastr.success(response.data.message);
          setMenu("Tournaments");
        } else {
          toastr.error(response.data.message);
        }
        setWorking(false);
      })
      .catch(function (error) {
        toastr.error(error.response ? error.response.data : error.message);
        setWorking(false);
      });
  };
  return (
    <>
      <div className="border rounded bg-white shadow-sm p-3 mx-2">
        <div className="fw-bold small mb-2 text-dark">Create Tournament</div>

        <form onSubmit={handleFormSubmit}>
          {/* MAIN INPUTS */}
          <div className="d-flex flex-wrap">
            {/* Tournament Name */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Tournament Name</label>
              <input
                type="text"
                name="name"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* Moves */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Moves</label>
              <input
                type="number"
                name="moves"
                className="form-control form-control-sm"
                required
              />
            </div>
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Entry Fee (₹)</label>
              <input
                type="number"
                name="entryFee"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* First Prize */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">First Prize (₹)</label>
              <input
                type="number"
                name="firstPrize"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* Prize Pool */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Prize Pool (₹)</label>
              <input
                type="number"
                name="prizePool"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* Assured Winners */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Assured Winners</label>
              <input
                type="number"
                name="assuredWinners"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* Total Allowed Entries */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Total Allowed Entries</label>
              <input
                type="number"
                name="totalAllowedEntries"
                className="form-control form-control-sm"
                required
              />
            </div>

            {/* Entries Per User */}
            <div className="col-12 col-md-4 p-1">
              <label className="small fw-bold">Allowed Entries Per User</label>
              <input
                type="number"
                name="totalAllowedEntriesPerUser"
                className="form-control form-control-sm"
                required
              />
            </div>
          </div>

          {/* SCORING SYSTEM */}
          <div className="mt-3 border-top pt-3">
            <div className="fw-bold small mb-2">Scoring System</div>

            {scoring.map((row, index) => (
              <div key={index} className="d-flex gap-1 mb-2">
                <input
                  type="number"
                  name="fromRank"
                  className="form-control form-control-sm w-100"
                  placeholder="From Rank"
                  value={row.fromRank}
                  onChange={(e) =>
                    updateScoreRow(index, "fromRank", e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  name="toRank"
                  className="form-control form-control-sm w-100"
                  placeholder="To Rank"
                  value={row.toRank}
                  onChange={(e) =>
                    updateScoreRow(index, "toRank", e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  name="reward"
                  className="form-control form-control-sm w-100"
                  placeholder="Reward (₹)"
                  value={row.reward}
                  onChange={(e) =>
                    updateScoreRow(index, "reward", e.target.value)
                  }
                  required
                />

                {/* Remove Button */}
                <button
                  type="button"
                  className="btn btn-sm btn-danger px-2"
                  onClick={() => removeScoreRow(index)}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add New Row */}
            <button
              type="button"
              className="btn btn-sm btn-success mt-2"
              onClick={addScoreRow}
            >
              + Add Rank Reward
            </button>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className={`btn btn-primary btn-sm w-100 mt-3 ${
              working ? "disabled" : ""
            }`}
          >
            CREATE TOURNAMENT
          </button>
        </form>
      </div>
    </>
  );
};
