import { useEffect, useState } from "react";
import {
  base,
  formatTimestamp,
  singleFetcher,
} from "../../../utils/api.manager";
import { Link } from "react-router-dom";
import axios from "axios";
import toastr from "toastr";

export const Tournaments = () => {
  const [matches, setMatches] = useState([]);
  const [workingTournamentId, setWorkingTournamentId] = useState(null);

  const fetchAllTournaments = () => {
    singleFetcher("/fetchTournaments", {}, setMatches);
  };

  const clone = function (tid) {
    setWorkingTournamentId(tid);

    const data = {};
    data._token = localStorage.getItem("_token");
    data._deviceId = localStorage.getItem("_deviceId");
    data.tournamentId = tid;

    axios
      .post(base("/cloneTournament"), data)
      .then(function (response) {
        if (response.data.success) {
          toastr.success(response.data.message || "Tournament copied");
          fetchAllTournaments();
        } else {
          toastr.error(response.data.message);
        }
        setWorkingTournamentId(null);
      })
      .catch(function (error) {
        toastr.error(error.response ? error.response.data : error.message);
        setWorkingTournamentId(null);
      });
  };

  const deleteTournament = function (tid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tournament?"
    );
    if (!confirmDelete) {
      return;
    }

    setWorkingTournamentId(tid);

    const data = {};
    data._token = localStorage.getItem("_token");
    data._deviceId = localStorage.getItem("_deviceId");
    data.tournamentId = tid;

    axios
      .post(base("/deleteTournament"), data)
      .then(function (response) {
        if (response.data.success) {
          toastr.success(response.data.message || "Tournament deleted");
          fetchAllTournaments();
        } else {
          toastr.error(response.data.message);
        }
        setWorkingTournamentId(null);
      })
      .catch(function (error) {
        toastr.error(error.response ? error.response.data : error.message);
        setWorkingTournamentId(null);
      });
  };

  useEffect(() => {
    fetchAllTournaments();
  }, []);
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <td>#</td>
              <td>Name</td>
              <td>Entry Fee</td>
              <td>Users</td>
              <td>Pool</td>
              <td>Total Entries</td>
              <td>Total Bets</td>
              <td>Status</td>

              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {matches.length > 0 &&
              matches.map((match, index) => (
                <tr key={match._id}>
                  <td>{index + 1}</td>
                  <td>
                    {match.name}

                    <div>Created : {formatTimestamp(match.createdAt)}</div>
                  </td>
                  <td>₹ {match.entryFee}</td>
                  <td>
                    {match.totalJoined}/{match.totalAllowedEntries}
                  </td>
                  <td> ₹ {match.prizePool}</td>
                  <td> {match.totalEntries}</td>

                  <td> ₹ {match.totalEntries * match.entryFee}</td>
                  <td>
                    <button
                      className={`btn btn-sm btn-dark p-0 p-1 ${
                        match.status == "running" && "text-white bg-success"
                      }`}
                    >
                      {match.status}
                    </button>
                    <div>
                      Ended :{" "}
                      {!!match.completedAt &&
                        formatTimestamp(match.completedAt)}
                    </div>
                  </td>

                  <td>
                    <button
                      className={`btn btn-sm btn-warning mx-2 ${
                        workingTournamentId === match._id ? "disabled" : ""
                      }`}
                      onClick={() => {
                        clone(match._id);
                      }}
                    >
                      Copy
                    </button>
                    <button
                      className={`btn btn-sm btn-danger mx-2 ${
                        workingTournamentId === match._id ? "disabled" : ""
                      }`}
                      onClick={() => {
                        deleteTournament(match._id);
                      }}
                    >
                      Delete
                    </button>
                    <Link
                      to={`/open-tournament/${match._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {matches.length < 1 && (
          <div className="text-center">no tournament found</div>
        )}
      </div>
    </>
  );
};
