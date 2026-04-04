"use client";

import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BatchesWorkspace from "./components/BatchesWorkspace";
import stores from "@/app/store/stores";
import { isLearnerRole } from "@/app/config/utils/roleAccess";

const DashboardBatchesPage = observer(() => {
  const router = useRouter();
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = isLearnerRole(role);

  useEffect(() => {
    if (isLearner) {
      router.replace("/batches");
    }
  }, [isLearner, router]);

  if (isLearner) {
    return null;
  }

  return <BatchesWorkspace />;
});

export default DashboardBatchesPage;
