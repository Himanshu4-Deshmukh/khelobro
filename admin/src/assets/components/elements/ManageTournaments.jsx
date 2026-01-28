import { useEffect, useState } from "react";
import { DashButton } from "../elements/DashButton";
import { AddAdmin } from "../elements/AddAdmin";
import { AdminList } from "../elements/AdminList";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AddTournament } from "../elements/AddTournament";
import { Tournaments } from "../elements/Tournaments";

export const ManageTournaments = () => {
  const auth = "MANAGE MATCH";
  const [menu, setMenu] = useState("Tournaments");
  const handleMenu = (menu) => {
    setMenu(menu);
  };

  const navigate = useNavigate();
  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    if (!_access.includes(auth) && !_isSuperadmin) navigate("/");
  }, []);
  return (
    <>
      <div>
        <div className="p-2 my-2 d-flex gap-2 flex-wrap">
          <DashButton current={menu} action={handleMenu} text="Tournaments" />
          <DashButton
            current={menu}
            action={handleMenu}
            text="Add New Tournament"
          />
        </div>

        {menu == "Tournaments" && <Tournaments />}

        {menu == "Add New Tournament" && <AddTournament setMenu={setMenu} />}
      </div>
    </>
  );
};
