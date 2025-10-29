import { Link } from "react-router-dom";
import { formatTimestamp, singleFetcher } from "../../../utils/api.manager";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { PostForm } from "./PostForm";

export const GameItem = ({ game }) => {
  return (
    <>
      <div className="bg-white p-3 border shadow-sm rounded my-2">
        <div className="fw-bold small text-dark">{game.title}</div>

        <PostForm
          action="/updateGame"
          subBtn="UPDATE GAME SETTING"
          subBtnClass="btn bg-gradient-primary mt-3 w-100 mb-2"
          loaderColor="white"
        >
          <div className="d-flex flex-wrap">
            <div className="col-12 col-md-6 p-1">
              <div className="fw-bold text-dark small">Status</div>
              <select
                name="status"
                defaultValue={game.status}
                className="form-control form-control-sm"
              >
                <option value="live">Live</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            {(game.title == "Classic Online" ||
              game.title == "Classic Online 1 Token") && (
              <>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Amounts (seperated by comma)
                  </div>
                  <input
                    name="amounts"
                    type="string"
                    defaultValue={game.amounts}
                    className="form-control form-control-sm"
                  />
                </div>
              </>
            )}

            {game.title == "Speed Ludo" && (
              <>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Amounts (seperated by comma)
                  </div>
                  <input
                    name="amounts"
                    type="string"
                    defaultValue={game.amounts}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Game Duration (in minutes)
                  </div>
                  <input
                    name="duration"
                    type="number"
                    defaultValue={game.duration}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Lite Game Duration (in minutes)
                  </div>
                  <input
                    name="durationLite"
                    type="number"
                    step="0.1"
                    defaultValue={game.durationLite}
                    className="form-control form-control-sm"
                  />
                </div>
              </>
            )}

            {game.title == "Quick Ludo" && (
              <>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">Total Moves</div>
                  <input
                    name="moves"
                    type="number"
                    defaultValue={game.moves}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-12 p-1">
                  <div className="fw-bold text-dark small">
                    Amounts (seperated by comma)
                  </div>
                  <input
                    name="amounts"
                    type="string"
                    defaultValue={game.amounts}
                    className="form-control form-control-sm"
                  />
                </div>
              </>
            )}

            {game.title == "Classic Manual" && (
              <>
                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">Multiple Of</div>
                  <input
                    name="multipleOf"
                    type="number"
                    defaultValue={game.multipleOf}
                    className="form-control form-control-sm"
                  />
                </div>

                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Minimum Playing Amount
                  </div>
                  <input
                    name="minAmount"
                    type="number"
                    defaultValue={game.minAmount}
                    className="form-control form-control-sm"
                  />
                </div>

                <div className="col-12 col-md-6 p-1">
                  <div className="fw-bold text-dark small">
                    Maximum Playing Amount
                  </div>
                  <input
                    name="maxAmount"
                    type="number"
                    defaultValue={game.maxAmount}
                    className="form-control form-control-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="col-12 small fw-bold mt-3">
            Game Guide / Instructions
          </div>
          <div className="col-12  small mt-2 d-flex gap-3">
            <div className="w-100">
              <div className="text-primary">In English Language</div>
              <textarea
                name="english"
                className="form-control"
                defaultValue={game.guideenglish}
              ></textarea>
            </div>
            <div className="w-100">
              <div className="text-danger">In Hindi Language</div>
              <textarea
                name="hindi"
                className="form-control"
                defaultValue={game.guidehindi}
              ></textarea>
            </div>
          </div>
          <input type="hidden" name="_id" value={game._id} />
        </PostForm>
      </div>
    </>
  );
};
