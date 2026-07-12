"use client";

import { Center, Spinner } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Home from "./(main)/home/page";
import { getDefaultAuthenticatedRoute } from "./config/utils/roleAccess";
import stores from "./store/stores";

const RootPage = observer(() => {
  const router = useRouter();
  const { user, sessionReady } = stores.auth;
  if (!sessionReady) {
    return (
      <Center minH="55vh">
        <Spinner size="lg" color="purple.500" />
      </Center>
    );
  }

  return <Home />;
});

export default RootPage;
