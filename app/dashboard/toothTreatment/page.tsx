"use client";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import TreatmentList from "./ToothTreatment";

const Treatment = observer(({isPatient,patientDetails}: any) => {
  return (
    <Box>
      <Box display="none">
        <DashPageHeader breadcrumb={[]} />
      </Box>
      <DashPageTitle title="Treatment" />
      <Box>
        <TreatmentList isPatient={isPatient} patientDetails={patientDetails} />
      </Box>
    </Box>
  );
});

export default Treatment;
