"use client";
import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  useBreakpointValue,
  Tooltip,
  Flex,
  Heading,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import TableLoader from "./TableLoader";
import Pagination from "../pagination/Pagination";
const MultiDropdown = dynamic(() => import("../multiDropdown/MultiDropdown"), {
  ssr: false,
});
import { FaEdit, FaEye } from "react-icons/fa";
import { IoMdAdd, IoMdInformationCircle } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { FcClearFilters } from "react-icons/fc";
import { formatDate } from "../../utils/dateUtils";
const CustomDateRange = dynamic(
  () => import("../CustomDateRange/CustomDateRange"),
  { ssr: false }
);

interface Column {
  headerName?: string;
  key?: string;
  type?: string;
  function?: any;
  addkey?: any;
  props?: any;
  actions?: any;
  metaData?: {
    component?: any;
    function?: any;
  };
}

interface RowData {
  [key: string]: any;
}

interface CustomTableProps {
  title?: string;
  columns: Column[];
  data: RowData[];
  serial?: any;
  loading: boolean;
  totalPages?: number;
  actions?: any;
  cells?: boolean;
  tableProps?: any;
  subTitle?: any
}

interface TableActionsProps {
  actions: any;
  column: any;
  row: any;
  cells: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({
  actions,
  column,
  row,
  // cells,
}) => {
  if (!actions) {
    actions = {};
  }
  const { actionBtn } = actions;
  // const cellProps = cells ? { border: "1px groove gray" } : {};

  const iconColor = useColorModeValue("brand.700", "gray.200");
  const deleteColor = useColorModeValue("red.500", "red.300");

  return (
    <Td
      // position="sticky" right={0} bg="white" zIndex={9999}
      {...column?.props?.row}
      // {...cellProps}
      position={column?.props?.isSticky ? "sticky" : "relative"}
      right={column?.props?.isSticky ? "0" : undefined}
      p={1}
      zIndex={column?.props?.isSticky ? "5" : undefined}
      bgColor={column?.props?.isSticky ? "white" : undefined}
    >
      <Flex columnGap={0} justifyContent={"center"}>
        {actionBtn?.editKey?.showEditButton && (
          <IconButton
            size="lg"
            bgColor="transparent"
            color={iconColor}
            onClick={() => {
              if (actionBtn?.editKey?.function)
                actionBtn?.editKey.function(row);
            }}
            aria-label=""
            title={actionBtn?.editKey?.title || "Edit Data"}
          >
            <FaEdit />
          </IconButton>
        )}
        {actionBtn?.viewKey?.showViewButton && (
          <IconButton
            size="lg"
            bgColor="transparent"
            color={iconColor}
            onClick={() => {
              if (actionBtn?.viewKey?.function)
                actionBtn?.viewKey.function(row);
            }}
            aria-label=""
            title={actionBtn?.viewKey?.title || "View Data"}
          >
            <FaEye />
          </IconButton>
        )}
        {actionBtn?.deleteKey?.showDeleteButton && (
          <IconButton
            size="lg"
            bgColor="transparent"
            color={deleteColor}
            onClick={() => {
              if (actionBtn?.deleteKey?.function)
                actionBtn?.deleteKey.function(row);
            }}
            aria-label=""
            title={actionBtn?.deleteKey?.title || "Delete Data"}
          >
            <MdDelete />
          </IconButton>
        )}
      </Flex>
    </Td>
  );
};

const GenerateRows: React.FC<{
  column: Column;
  row: RowData;
  action: any;
  cells: boolean;
}> = ({ column, row, action, cells }: any) => {
  // Define cell border color based on color mode
  const cellBorder = useColorModeValue("brand.200", "darkBrand.200");
  const cellTextColor = useColorModeValue("brand.900", "white");
  const cellProps = cells
    ? { border: `1px solid ${cellBorder}` } // Conditional border only if cells prop is true
    : {};

  switch (column.type) {
    case "date":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          color={cellTextColor}
        >
          {row[column.key] ? formatDate(row[column.key]) : "--"}
        </Td>
      );
    case "link":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          color="blue.400"
          textDecoration="underline"
          {...column?.props?.row}
          {...cellProps}
          onClick={() => {
            if (column?.function) {
              column?.function(row);
            }
          }}
        >
          {row[column.key] || "--"}
        </Td>
      );
    case "tooltip":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          color={cellTextColor}
        >
          <Tooltip label={row[column.key]}>
            {typeof row[column.key] === "string"
              ? row[column.key].substring(0, 15) || "--"
              : "-"}
          </Tooltip>
        </Td>
      );
    case "array":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          color={cellTextColor}
        >
          <Tooltip label={JSON.stringify(row[column.key])}>
            <IconButton
              aria-label="array info"
              size="lg"
              bgColor="transparent"
              color="gray.700"
            >
              <IoMdInformationCircle />
            </IconButton>
          </Tooltip>
        </Td>
      );
    case "table-actions":
      return (
        <TableActions
          actions={action}
          column={column}
          row={row}
          cells={cells}
        />
      );
    case "combineKey":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          isTruncated={true}
          color={cellTextColor}
        >
          {row[column.key] || "--"}
        </Td>
      );
    case "component":
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          color={cellTextColor}
        >
          {column.metaData?.component ? column.metaData.component(row) : null}
        </Td>
      );
    default:
      return (
        <Td
          whiteSpace="normal"
          cursor="pointer"
          fontSize="sm"
          {...column?.props?.row}
          {...cellProps}
          isTruncated={true}
          color={cellTextColor}
        >
          {row[column.key] || "--"}
        </Td>
      );
  }
};

const CustomTable: React.FC<CustomTableProps> = ({
  title,
  columns,
  data,
  serial,
  loading,
  subTitle,
  actions,
  cells = false,
  tableProps = {},
  // isActions = false,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  // const cellProps = cells ? { border: "1px solid gray" } : {};
  const headerBg = useColorModeValue("brand.100", "darkBrand.200");
  // const borderColor = useColorModeValue("gray.300", "gray.600");

  const bodyBg = useColorModeValue("white", "darkBrand.50");

  const hoverBg = useColorModeValue("brand.50", "darkBrand.200");
  const menuItemHover = useColorModeValue("brand.50", "darkBrand.200");
  const menuListBg = useColorModeValue("white", "darkBrand.100");
  const titleColor = useColorModeValue("brand.500", "white");

  const boxBorder = useColorModeValue("brand.200", "darkBrand.200");
  const mainBox = useColorModeValue("white", "gray.900");

  return (
    <Box
      rounded={12}
      bg={mainBox}
      boxShadow="rgb(0 0 0 / 20%) 0px 0px 8px"
      border={"1px solid"}
      borderColor={boxBorder}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        p={title ? 3 : 0}
      >
        {(title || subTitle) && (
          <Flex direction="column" gap={1}>
            {title && (
              <Heading
                color={titleColor}
                fontSize={isMobile ? "sm" : "xl"}
                lineHeight="short"
              >
                {title}
              </Heading>
            )}

            {subTitle && (
              <Text
                fontSize={isMobile ? "xs" : "sm"}
                color="blue.700"
                noOfLines={2}
                bg="blue.100"
                px={2}
                py={1}
                border="1px solid"
                borderColor="blue.200"
                borderRadius="md"
              >
                {subTitle}
              </Text>
            )}

          </Flex>
        )}

        <Flex alignItems="center" columnGap={2} ml="auto">
          {!isMobile && actions?.search && actions?.search?.show && (
            <Input
              placeholder={actions?.search?.placeholder || "Search"}
              value={actions?.search?.searchValue}
              onChange={actions?.search?.onSearchChange}
              borderRadius="5rem"
              // bg="white"
              borderColor={boxBorder}
              _focus={{ borderColor: "brand.500", boxShadow: "outline" }}
              maxW="25rem"
            />
          )}
          {actions?.datePicker?.show && actions?.datePicker?.date && (
            <Box display={isMobile ? "none" : undefined}>
              <CustomDateRange
                isMobile={actions?.datePicker?.isMobile}
                startDate={actions?.datePicker?.date.startDate}
                endDate={actions?.datePicker?.date.endDate}
                onStartDateChange={(e) => {
                  if (actions?.datePicker?.onDateChange) {
                    actions?.datePicker?.onDateChange(e, "startDate");
                  }
                }}
                onEndDateChange={(e) => {
                  if (actions?.datePicker?.onDateChange) {
                    actions?.datePicker?.onDateChange(e, "endDate");
                  }
                }}
              />
            </Box>
          )}
          {actions?.multidropdown?.show && (
            <Box display={isMobile ? "block" : undefined}>
              <MultiDropdown
                title={actions?.multidropdown?.title}
                dropdowns={actions?.multidropdown?.dropdowns || []}
                onDropdownChange={actions?.multidropdown?.onDropdownChange}
                selectedOptions={actions?.multidropdown?.selectedOptions}
                onApply={actions?.multidropdown?.onApply}
                search={{
                  visible: actions?.multidropdown?.search?.visible,
                  placeholder: actions?.multidropdown?.search?.placeholder,
                  searchValue: actions?.multidropdown?.search?.searchValue,
                  onSearchChange:
                    actions?.multidropdown?.search?.onSearchChange,
                }}
                actions={actions}
              />
            </Box>
          )}
          {(actions?.actionBtn?.addKey?.showAddButton ||
            actions?.resetData?.show) && (
              <>
                {/* Case 1: Both present → show Menu */}
                {actions?.actionBtn?.addKey?.showAddButton &&
                  actions?.resetData?.show ? (
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="outline"
                      borderColor={boxBorder}
                      color={titleColor}
                      minW={{ base: "6rem", md: "10rem" }}
                      fontSize="sm"
                      px={4}
                      py={2}
                      textAlign="center"
                      transition="all 0.2s ease-in-out"
                    >
                      Add
                    </MenuButton>
                    <MenuList
                      zIndex={15}
                      bg={menuListBg}
                      border="1px solid"
                      boxShadow="lg"
                      borderRadius="md"
                      minW="10rem"
                      py={0}
                    >
                      {actions?.actionBtn?.addKey?.showAddButton && (
                        <MenuItem
                          onClick={() =>
                            actions?.actionBtn?.addKey?.function?.("add")
                          }
                          _hover={{
                            bg: hoverBg,
                            transition: "background 0.2s ease-in-out",
                          }}
                          icon={
                            <IoMdAdd
                              fontSize="20px"
                            />
                          }
                          p="0.7rem"
                          fontSize="sm"
                        >
                          Add
                        </MenuItem>
                      )}
                      {actions?.resetData?.show && (
                        <MenuItem
                          onClick={actions?.resetData?.function}
                          _hover={{
                            bg: menuItemHover,
                            transition: "background 0.2s ease-in-out",
                          }}
                          icon={<FcClearFilters fontSize="20px" />}
                          p="0.7rem"
                          fontSize="sm"
                        >
                          {actions?.resetData?.text || "Reset"}
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                ) : (
                  /* Case 2: Only one present → show Button directly */
                  <>
                    {actions?.actionBtn?.addKey?.showAddButton && (
                      <Button
                        variant="solid"
                        bg={headerBg}
                        color="white"
                        fontSize="sm"
                        fontWeight="semibold"
                        px={5}
                        py={2}
                        w="160px"
                        borderRadius="lg"
                        boxShadow="sm"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                          boxShadow: "md",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                        leftIcon={<IoMdAdd fontSize="18px" />}
                        onClick={() =>
                          actions?.actionBtn?.addKey?.function?.("add")
                        }
                      >
                        Add
                      </Button>
                    )}
                    {actions?.resetData?.show && (
                      <Button
                        variant="outline"
                        borderColor={boxBorder}
                        color={titleColor}
                        fontSize="sm"
                        fontWeight="medium"
                        px={5}
                        py={2}
                        w="180px"
                        borderRadius="lg"
                        boxShadow="sm"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                          boxShadow: "md",
                        }}
                        _active={{
                          transform: "scale(0.98)",
                        }}
                        leftIcon={<FcClearFilters fontSize="18px" />}
                        onClick={actions?.resetData?.function}
                      >
                        {actions?.resetData?.text || "Reset"}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
        </Flex>
      </Flex>

      <Box
        overflow="auto"
        className="customScrollBar"
        minH={"65vh"}
        maxH={"65vh"}
        rounded={2}
        px={2}
        {...tableProps.tableBox}
      >
        <Table
          size={isMobile ? "xs" : "sm"}
          variant="striped"
          {...tableProps.table}
          bg={bodyBg}
          borderRadius="md"
          overflow="hidden"
        >
          <Thead
            bg={headerBg}
            position="sticky"
            top="0"
            zIndex="9"
            height="50px"
          >
            <Tr>
              {serial?.show && (
                <Th
                  color="white"
                  w={serial?.width || undefined}
                  border="none"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  fontSize="xs"
                >
                  {serial?.text || "S.No."}
                </Th>
              )}
              {columns.map((column, colIndex) => (
                <Th
                  key={colIndex}
                  textAlign="center"
                  position={column?.props?.isSticky ? "sticky" : "relative"}
                  right={column?.props?.isSticky ? "0" : undefined}
                  bg={headerBg}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="white"
                  fontWeight="bold"
                  border="none" // No borders on header cells
                  {...column?.props?.column}
                >
                  {column.headerName}
                </Th>
              ))}
            </Tr>
          </Thead>

          <TableLoader loader={loading} show={data.length}>
            <Tbody>
              {data.map((row, rowIndex) => (
                <Tr
                  key={rowIndex}
                  _hover={{
                    bg: hoverBg,
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  {serial?.show && (
                    <Td
                      fontWeight="bold"
                      w={serial?.width || undefined}
                      textAlign="center"
                      p={2}
                      fontSize="sm"
                      border="none" // No border on cells
                    >
                      {rowIndex + 1}
                    </Td>
                  )}
                  {columns.map((column, colIndex) => (
                    <GenerateRows
                      key={colIndex}
                      column={column}
                      row={row}
                      action={actions}
                      cells={cells}
                    // border="none" // No border on cells
                    />
                  ))}
                </Tr>
              ))}
            </Tbody>
          </TableLoader>
        </Table>
      </Box>
      {actions?.pagination?.show && (
        <Pagination
          currentPage={actions?.pagination?.currentPage || 1}
          onPageChange={(e) => {
            if (actions?.pagination?.onClick) {
              actions?.pagination?.onClick(e);
            }
          }}
          totalPages={actions?.pagination?.totalPages || 1}
          props={{ style: { marginTop: "15px" } }}
        />
      )}
    </Box>
  );
};

export default CustomTable;