"use client";
import { observer } from "mobx-react-lite";
import RecallTable from "./component/recallAppointmentTable/RecallTable";

const page = observer(() => {
  return (
    <>
      <RecallTable />
    </>
  );
});

export default page;
