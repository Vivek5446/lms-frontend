"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import stores from "../../store/stores";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../component/config/utils/variable";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import DeleteData from "./DeleteData";
import { formatDateTime } from "../../component/config/utils/dateUtils";

const TableList = observer(
  ({ currentPage, setCurrentPage, onAdd, onEdit }: any) => {
    const {
      EventStore: { getEvent, event },
      auth: { openNotification },
    } = stores;
    const [deleteData, setDeleteData] = useState({
      data: null,
      open: false,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);

    const applyGetAllRecords = useCallback(
      ({ page = 1, limit = tablePageLimit, reset = false }) => {
        const query: any = { page, limit };

        if (debouncedSearchQuery?.trim()) {
          query.search = debouncedSearchQuery.trim();
        }

        if (reset) {
          query.page = 1;
          query.limit = tablePageLimit;
        }

        getEvent(query)
          .then(() => {})
          .catch((err) => {
            openNotification({
              type: "error",
              title: "Failed to get testimonials",
              message: err?.message,
            });
          });
      },
      [debouncedSearchQuery, getEvent, openNotification]
    );

    useEffect(() => {
      applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
    }, [currentPage, debouncedSearchQuery, applyGetAllRecords]);

    const handleChangePage = (page: number) => {
      setCurrentPage(page);
    };

    const resetTableData = () => {
      setCurrentPage(1);
      setSearchQuery("");
      applyGetAllRecords({ reset: true });
    };

    // Define table columns
    const TestimonialTableColumns = [
      {
        headerName: "S.No.",
        key: "sno",
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Image",
        key: "image",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Box m={1}>
              <Avatar
                src={dt?.image?.url || undefined}
                name={dt?.image?.name}
                size={"sm"}
              />
            </Box>
          ),
        },
        props: {
          row: { minW: 120, textAlign: "center" },
          column: { textAlign: "center" },
        },
      },
      {
        headerName: "Title",
        key: "title",
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Price",
        key: "price",
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Description",
        key: "description",
        type: "tooltip",
        function: (testimonial: any) =>
          testimonial.description ? (
            <Tooltip label={testimonial?.description} hasArrow zIndex={9999}>
              <span>{testimonial?.description?.slice(0, 50)}</span>
            </Tooltip>
          ) : (
            "-"
          ),
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Category",
        key: "category",
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Target",
        key: "target",
        props: { row: { textAlign: "center" } },
      },
      {
        headerName: "Event Date",
        key: "eventDate",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Box m={1}>{formatDateTime(dt?.eventDate)}</Box>
          ),
        },
        props: {
          row: { minW: 120, textAlign: "center" },
          column: { textAlign: "center" },
        },
      },
      {
        headerName: "Created At",
        key: "createdAt",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Box m={1}>{formatDateTime(dt?.createdAt)}</Box>
          ),
        },
        props: {
          row: { minW: 120, textAlign: "center" },
          column: { textAlign: "center" },
        },
      },
      {
        headerName: "Actions",
        key: "table-actions",
        type: "table-actions",
        props: {
          // isSticky: true,
          row: { minW: 180, textAlign: "center" },
          column: { textAlign: "center" },
        },
      },
    ];

    return (
      <>
        <CustomTable
          title="Events"
          data={event.data.map((t: any, index: number) => ({
            ...t,
            sno: index + 1,
          }))}
          columns={TestimonialTableColumns}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: true,
                function: () => {
                  onAdd();
                },
              },
              editKey: {
                showEditButton: true,
                function: (e: any) => {
                  onEdit(e);
                },
              },
              deleteKey: {
                showDeleteButton: true,
                function: (dt: string) => {
                  setDeleteData({ open: true, data: dt });
                },
              },
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
            resetData: {
              show: true,
              text: "Reset Data",
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: event.totalPages,
            },
          }}
          loading={event.loading}
        />
        <DeleteData
          getData={() => applyGetAllRecords({})}
          isOpen={deleteData.open}
          data={deleteData.data}
          onClose={() => setDeleteData({ data: null, open: false })}
        />
      </>
    );
  }
);

export default TableList;
