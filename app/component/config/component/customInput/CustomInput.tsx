"use client";

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  useColorMode,
  useColorModeValue,
  useTheme,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import stores from "../../../../store/stores";

interface CustomInputProps {
  type?:
  | "editor"
  | "password"
  | "number"
  | "text"
  | "radio"
  | "file"
  | "switch"
  | "textarea"
  | "select"
  | "date"
  | "time"
  | "checkbox"
  | "url"
  | "phone"
  | "dateAndTime"
  | "file-drag"
  | "tags"
  | "real-time-user-search"
  | "real-time-search"
  | "timeOnly";
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  maxDate?: string; // Date string type
  minDate?: string; // Date string type
  disabledDates?: string[]; // Array of date strings
  name: string;
  isClear?: boolean;
  onChange?: any;
  value?: any;
  w?: string;
  options?: { label: string; value: string }[]; // Options for select dropdown
  isSearchable?: boolean;
  isMulti?: boolean;
  getOptionLabel?: any;
  getOptionValue?: any;
  rows?: number;
  disabled?: boolean;
  showError?: boolean;
  style?: React.CSSProperties;
  phone?: string;
  accept?: string; // File accept type (string)
  readOnly?: boolean;
  labelcolor?: string;
  isPortal?: boolean;
  params?: any;
  query?: any;
  parentStyle?: any;
  shouldUpdateSelectWithValue?: any
  colorScheme?: any;
  id?: string;
  onKeyDown?: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  label,
  placeholder,
  error,
  name,
  value,
  onChange,
  required,
  isClear = false,
  options,
  isSearchable,
  isMulti,
  getOptionLabel,
  getOptionValue,
  disabled,
  rows,
  style,
  showError,
  accept,
  readOnly,
  labelcolor,
  isPortal,
  minDate,
  maxDate,
  params,
  colorScheme,
  query = {},
  parentStyle = {},
  shouldUpdateSelectWithValue = false,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useTheme();
  const isMounted = useRef(false);
  const { colorMode } = useColorMode();
  const [userOptions, setUserOptions] = useState(options || []);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState("");

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };


  useEffect(() => {
    if (shouldUpdateSelectWithValue) {
      setUserOptions(options)
    }
  }, [options])


  // console.log('options are', options)

  const fetchSearchUsers = useCallback(
    async (searchValue: string) => {
      if (searchValue?.trim() === "") {
        return;
      }

      try {
        if (type === "real-time-user-search") {
          const response: any = await stores.auth.getCompanyUsers({
            page: 1,
            searchValue: searchValue,
            ...query,
          });

          setUserOptions(
            response.map((it: any) => ({
              label: `${it.user.name || it.user.email || it.user.username} (${it.user.email || it.user.username})`,
              value: it.user._id,
              name: it.user.name,
              email: it.user.email || it.user.username,
              username: it.user.username,
              code: it.user.code,
              role: it.user.role || it.user.userType,
              company: it.user.company,
              createdBy: it.user.createdBy,
            }))
          );
        } else if (type === "real-time-search") {
          const { entityName, functionName, key } = params || {};

          if (!entityName || !stores[entityName]) {
            throw new Error(`Invalid entityName: ${entityName}`);
          }

          // check function
          const entityStore = stores[entityName];
          if (
            !functionName ||
            typeof entityStore[functionName] !== "function"
          ) {
            throw new Error(
              `Invalid functionName: ${functionName} for entity: ${entityName}`
            );
          }

          // call the store function dynamically
          const response: any = await entityStore[functionName]({
            page: 1,
            searchValue: searchValue,
            ...query,
          });

          if (Array.isArray(response?.data)) {
            return setUserOptions(
              response.data.map((item: any) => ({
                label: item[key] || "Unknown",
                value: item._id,
              }))
            );
          }
          // map using provided key
        }
      } catch (err: any) {
        alert(err?.message);
      }
    },
    [type, params, query]
  );

  const debouncedFetchSearchUserResults = useMemo(
    () => debounce(fetchSearchUsers, 800),
    [fetchSearchUsers]
  );

  // const handleSelectChange = (selectedOption: any) => {
  //   if (onChange) {
  //     onChange(selectedOption ? selectedOption.value : "");
  //   }
  //   setSearchInput(selectedOption ? selectedOption.label : "");
  // };

  useEffect(() => {
    if (isMounted?.current && searchInput?.trim() !== "") {
      debouncedFetchSearchUserResults(searchInput);
    } else {
      isMounted.current = true;
    }
  }, [searchInput, debouncedFetchSearchUserResults]);

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer.files;
      if (onChange) {
        onChange({ target: { name, files } });
      }
    },
    [name, onChange]
  );

  const handleTagAdd = (
    e?:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if ((e && "key" in e && e.key !== "Enter") || !inputValue.trim()) {
      return;
    }

    const newTags = [...(value || []), inputValue.trim()];
    if (onChange) {
      onChange(newTags);
    }
    setInputValue(""); // Clear input
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = (value || []).filter((tag: string) => tag !== tagToRemove);
    if (onChange) {
      onChange(newTags);
    }
  };

  const inputBg = useColorModeValue("white", "darkBrand.50");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");
  const focusBorderColor = "brand.500";
  const hoverBorderColor = "brand.300";

  const renderInputComponent = () => {
    switch (type) {
      case "password":
        return (
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              name={name}
              isRequired={required}
              disabled={disabled}
              fontSize="sm"
              bg={inputBg}
              borderColor={borderColor}
              _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
              _hover={{ borderColor: hoverBorderColor }}
              {...rest}
            />
            <InputRightElement cursor="pointer" onClick={handleTogglePassword}>
              {showPassword ? (
                <RiEyeOffLine size={18} />
              ) : (
                <RiEyeLine size={18} />
              )}
            </InputRightElement>
          </InputGroup>
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            bg={inputBg}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );

      case "textarea":
        return (
          <Textarea
            rows={rows || 3}
            placeholder={placeholder}
            bg={inputBg}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );

      case "switch":
        return (
          <Switch name={name} onChange={onChange} isChecked={value} colorScheme="brand" {...rest} />
        );

      case "checkbox":
        return (
          <Checkbox
            name={name}
            onChange={onChange}
            isChecked={value}
            colorScheme="brand"
            {...rest}
          />
        );

      case "phone":
        return (
          <PhoneInput
            country="in"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            inputStyle={{
              backgroundColor: colorMode === "light" ? "white" : "#1b1f2d", // darkBrand.50
              borderColor: colorMode === "light" ? "#c5c9ff" : "#4a5066", // brand.200 : darkBrand.200
              color: colorMode === "light" ? "inherit" : "white",
              width: "100%",
              height: "40px",
            }}
            buttonStyle={{
              backgroundColor: colorMode === "light" ? "#f7fafc" : "#2f3342", // gray.50 : darkBrand.100
              borderColor: colorMode === "light" ? "#c5c9ff" : "#4a5066",
            }}
            dropdownStyle={{
              backgroundColor: colorMode === "light" ? "white" : "#2f3342",
              color: colorMode === "light" ? "black" : "white",
            }}
          />
        );
      case "dateAndTime":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="datetime-local"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );
      case "tags":
        return (
          <Box>
            <HStack>
              <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                name={name}
                disabled={disabled}
                onKeyDown={handleTagAdd}
                bg={inputBg}
                borderColor={borderColor}
                _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
                _hover={{ borderColor: hoverBorderColor }}
              />
              <Button onClick={handleTagAdd} colorScheme="brand">
                Add
              </Button>
            </HStack>
            <Wrap mt={2}>
              {value?.map((tag: string, index: number) => (
                <WrapItem key={index}>
                  <Tag size="md" borderRadius="full" colorScheme="brand">
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton onClick={() => handleTagRemove(tag)} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        );

      case "file-drag":
        return (
          <div
            style={{
              border: `2px dashed ${colorMode === "light" ? "#c5c9ff" : "#4a5066"}`,
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
              backgroundColor: inputBg,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <p>Drag & drop files here or click to browse</p>
            <input
              type="file"
              name={name}
              multiple={isMulti}
              onChange={onChange}
              style={{ display: "none" }}
              id={`multiple-file-upload-with-draggable-${name}`}
              accept={accept}
            />
            <Button
              colorScheme="brand"
              onClick={() =>
                (
                  document.getElementById(
                    `multiple-file-upload-with-draggable-${name}`
                  ) as unknown as HTMLInputElement
                )?.click()
              }
            >
              Browse
            </Button>
          </div>
        );
      case "url":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            bg={inputBg}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );

      case "file":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            type="file"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            bg={inputBg}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );
      case "date":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="date"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            min={minDate}
            max={maxDate}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );

      case "select":
        return (
          <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isClearable={isClear ? true : undefined}
            className={`chakra-select ${theme ? theme.components.Select.baseStyle : ""
              }`}
            isMulti={isMulti}
            isSearchable={isSearchable}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            isDisabled={disabled}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused
                  ? theme.colors.brand[500]
                  : colorMode === "light"
                    ? theme.colors.brand[200]
                    : theme.colors.darkBrand[200],
                backgroundColor: colorMode === "light" ? "white" : theme.colors.darkBrand[50], // darkBrand.50
                fontSize: "14px",
                boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors.brand[500]}` : "none",
                ":hover": {
                  borderColor: theme.colors.brand[300]
                }
              }),
              option: (styles, { isSelected, isFocused }) => ({
                ...styles,
                backgroundColor:
                  colorMode === "light"
                    ? isSelected
                      ? theme.colors.brand[500]
                      : isFocused
                        ? theme.colors.brand[50]
                        : "white"
                    : isSelected
                      ? theme.colors.brand[500]
                      : isFocused
                        ? theme.colors.darkBrand[100]
                        : theme.colors.darkBrand[50],
                color: isSelected 
                  ? "white" 
                  : colorMode === "light" 
                    ? "inherit" 
                    : "white",
                padding: "8px 12px",
                cursor: "pointer",
                ":hover": {
                  backgroundColor:
                    colorMode === "light" ? theme.colors.brand[100] : theme.colors.brand[600],
                  color: "white"
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: colorMode === "light" ? "white" : theme.colors.darkBrand[50],
                borderColor: colorMode === "light" ? theme.colors.brand[200] : theme.colors.darkBrand[200],
                zIndex: 9999,
                overflow: "hidden"
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              multiValue: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? theme.colors.brand[50] : theme.colors.darkBrand[100],
                color: colorMode === "light" ? theme.colors.brand[700] : "white",
              }),
              multiValueLabel: (styles) => ({
                ...styles,
                color: colorMode === "light" ? theme.colors.brand[700] : "white",
              }),
              singleValue: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              clearIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              indicatorSeparator: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? theme.colors.brand[200] : theme.colors.darkBrand[200],
              }),
            }}
            components={{
              IndicatorSeparator: null,
              DropdownIndicator: () => (
                <div className="chakra-select__dropdown-indicator" />
              ),
            }}
            menuPosition={isPortal ? "fixed" : undefined}
            menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          />
        );

      case "timeOnly":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="time"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
          />
        );

      case "real-time-user-search":
      case "real-time-search":
        return isMulti ? (
          <Select
            key={name}
            name={name}
            options={userOptions}
            value={
              isMulti
                ? Array.isArray(value)
                  ? value
                  : [] // Ensure value is always an array for multi-select
                : userOptions.find((opt: any) => opt?.value === value?.value) ||
                value ||
                null
            }
            onChange={(selectedOption: any) => {
              if (isMulti) {
                // Always store an array of objects [{label, value}]
                if (onChange) {
                  onChange(selectedOption || []);
                }
              } else {
                // Store a single selected object or null
                if (onChange) {
                  onChange(selectedOption || null);
                }
              }
            }}
            inputValue={searchInput}
            onInputChange={(input, { action }) => {
              if (action === "input-change") setSearchInput(input);
            }}
            placeholder={placeholder}
            isClearable={!!isClear}
            isMulti={isMulti}
            isSearchable={isSearchable}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            isDisabled={disabled}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused
                  ? theme.colors.brand[500]
                  : colorMode === "light"
                    ? theme.colors.brand[200]
                    : theme.colors.darkBrand[200],
                backgroundColor: colorMode === "light" ? "white" : theme.colors.darkBrand[50], // darkBrand.50
                fontSize: "14px",
                boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors.brand[500]}` : "none",
                ":hover": {
                  borderColor: theme.colors.brand[300]
                }
              }),
              option: (styles, { isSelected, isFocused }) => ({
                ...styles,
                backgroundColor:
                  colorMode === "light"
                    ? isSelected
                      ? theme.colors.brand[100]
                      : isFocused
                        ? theme.colors.brand[50]
                        : "white"
                    : isSelected
                      ? theme.colors.darkBrand[200]
                      : isFocused
                        ? theme.colors.darkBrand[100]
                        : theme.colors.darkBrand[50],
                color: colorMode === "light"
                  ? (isSelected ? "brand.900" : "inherit")
                  : "white",
                padding: "8px 12px",
                ":hover": {
                  backgroundColor:
                    colorMode === "light" ? theme.colors.brand[50] : theme.colors.darkBrand[100],
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: colorMode === "light" ? "white" : theme.colors.darkBrand[50],
                borderColor: colorMode === "light" ? theme.colors.brand[200] : theme.colors.darkBrand[200],
                zIndex: 9999
              }),
              multiValue: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? theme.colors.brand[50] : theme.colors.darkBrand[100],
                color: colorMode === "light" ? theme.colors.brand[700] : "white",
              }),
              multiValueLabel: (styles) => ({
                ...styles,
                color: colorMode === "light" ? theme.colors.brand[700] : "white",
              }),
              singleValue: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              clearIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "inherit" : "white",
              }),
              indicatorSeparator: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? theme.colors.brand[200] : theme.colors.darkBrand[200],
              }),
            }}
            components={{
              IndicatorSeparator: null,
              DropdownIndicator: () => (
                <div className="chakra-select__dropdown-indicator" />
              ),
            }}
            menuPosition={isPortal ? "fixed" : undefined}
          />
        ) : (
          <Select
            key={name}
            name={name}
            options={userOptions}
            value={
              isMulti
                ? Array.isArray(value)
                  ? value?.length > 0
                    ? value
                    : null
                  : null
                : userOptions.find((opt: any) => opt?.value === value?.value) || value || null
            }
            onChange={(selectedOption: any) => {
              if (isMulti) {
                if (onChange) {
                  onChange(selectedOption.map((opt: any) => opt));
                }
                setSearchInput(selectedOption ? selectedOption.label : "");
              } else {
                if (onChange) {
                  onChange(selectedOption ? selectedOption : "");
                }
              }
            }}
            inputValue={searchInput}
            onInputChange={(input) => setSearchInput(input)}
            placeholder={placeholder}
            isClearable={isClear ? true : undefined}
            isMulti={isMulti}
            isSearchable={isSearchable}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            isDisabled={disabled}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? "#6269ff" : (colorMode === "light" ? "#c5c9ff" : "#4a5066"), // brand.500 : brand.200/darkBrand.200
                backgroundColor: colorMode === "light" ? "white" : "#1b1f2d", // darkBrand.50
                fontSize: "14px",
                boxShadow: state.isFocused ? "0 0 0 1px #6269ff" : "none",
                ":hover": {
                  borderColor: "#a4a9ff" // brand.300
                }
              }),
              option: (styles, { isSelected, isFocused }) => ({
                ...styles,
                backgroundColor:
                  colorMode === "light"
                    ? isSelected
                      ? "#045B64" // brand.100
                      : isFocused
                        ? "#f5f7ff" // brand.50
                        : "white"
                    : isSelected
                      ? "#4a5066" // darkBrand.200
                      : isFocused
                        ? "#2f3342" // darkBrand.100
                        : "#1b1f2d",
                color: colorMode === "light"
                  ? (isSelected ? "white" : "#171923")
                  : "white",
                padding: "8px 12px",
                ":hover": {
                  backgroundColor:
                    colorMode === "light" ? "#f5f7ff" : "#2f3342",
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: colorMode === "light" ? "white" : "#1b1f2d",
                borderColor: colorMode === "light" ? "#c5c9ff" : "#4a5066",
              }),
              multiValue: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? "#f5f7ff" : "#2f3342",
                color: colorMode === "light" ? "black" : "white",
              }),
              multiValueLabel: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "#045B64" : "#eaf3f9",
              }),
              singleValue: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              clearIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              indicatorSeparator: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? "#c5c9ff" : "#4a5066",
              }),
            }}
            components={{
              IndicatorSeparator: null,
              DropdownIndicator: () => (
                <div className="chakra-select__dropdown-indicator" />
              ),
            }}
            menuPosition={isPortal ? "fixed" : undefined}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            isDisabled={disabled}
            onChange={onChange}
            name={name}
            bg={inputBg}
            borderColor={borderColor}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
            _hover={{ borderColor: hoverBorderColor }}
            {...rest}
          />
        );
    }
  };

  return (
    <FormControl id={name} isInvalid={!!error && showError} style={parentStyle}>
      <FormLabel color={labelcolor}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </FormLabel>
      {renderInputComponent()}
      {showError && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CustomInput;
