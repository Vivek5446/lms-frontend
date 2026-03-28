"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import stores from "../../store/stores";

const OrdersPage = observer(() => {
  const {
    auth: { user, openNotification },
    orderStore: { fetchUserOrders, userAddedItems },
  } = stores;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!user?._id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        await fetchUserOrders({ user: user._id });
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Failed to load orders",
          message: err?.data?.message || err?.message || "Something went wrong",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [fetchUserOrders, openNotification, user?._id]);

  const currentUserOrders = user?.username
    ? Object.values(userAddedItems.users?.[user.username] || {})
    : [];

  if (loading) {
    return (
      <Box minH="40vh" display="grid" placeItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">My Orders</Heading>
        <Text color="gray.600" mt={2}>
          Review the items currently linked to your account.
        </Text>
      </Box>

      {currentUserOrders.length === 0 ? (
        <Card>
          <CardBody>
            <Text>No orders found for your account yet.</Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {currentUserOrders.map((order: any) => (
            <Card key={order._id}>
              <CardBody>
                <Stack spacing={2}>
                  <Heading size="sm">{order.title || "Untitled order"}</Heading>
                  <Text color="gray.600">
                    Order ID: {order.orderId || order._id}
                  </Text>
                  <Text color="gray.700">
                    Quantity: {order.TotalNoOfQuantities || 0}
                  </Text>
                  <Text noOfLines={3}>
                    {order.description || "No description available."}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
});

export default OrdersPage;
