"use client";

import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BatchesWorkspace from "./components/BatchesWorkspace";
import stores from "@/app/store/stores";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";

const DashboardBatchesPage = observer(() => {
  const router = useRouter();
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = isLearnerRole(role);
  const canViewBatches = hasPermission(stores.auth.user, PERMISSION_KEYS.VIEW_BATCHES);

  useEffect(() => {
    if (isLearner) {
      router.replace("/batches");
    }
  }, [isLearner, router]);

  if (isLearner) {
    return null;
  }

  return (
    <PermissionGate
      allowed={canViewBatches}
      title="Batches module is disabled"
      description="This account does not currently have access to the batch workspace."
      fallbackHref="/dashboard/profile"
    >
      <BatchesWorkspace />
    </PermissionGate>
  );
});

export default DashboardBatchesPage;
