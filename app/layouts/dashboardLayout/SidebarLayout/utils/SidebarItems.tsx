import { PlusSquareIcon } from "@chakra-ui/icons";
import { FaChartPie, FaCog, FaUserAstronaut, FaUsers, FaUserTie } from "react-icons/fa";

interface SidebarItem {
  id: number;
  name: string;
  icon: any;
  url: string;
  role?: string[];
  children?: SidebarItem[];
}

const sidebarDatas: SidebarItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: <FaChartPie />,
    url: "/dashboard",
    role: ["patient", "user", "admin", "superadmin", "departmenthead"],
  },
  {
    id: 100,
    name: "Users",
    icon: <FaUsers />,
    url: "/dashboard/users",
    role: ["admin", "superadmin", "departmenthead"],
  },
  {
    id: 101,
    name: "Departments",
    icon: <FaUserTie />,
    url: "/dashboard/departments",
    role: ["admin", "superadmin", "departmenthead"],
  },
  {
    id: 12,
    name: "Companies",
    icon: <FaUserAstronaut />,
    url: "/dashboard/admins",
    role: ["superadmin"],
  },
  {
    id: 17,
    name: "Courses",
    icon: <PlusSquareIcon />,
    url: "/dashboard/course",
    role: ["superadmin", "admin", "departmenthead", "user"],
    children: [
      {
        id: 171,
        name: "All Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course",
      },
      {
        id: 172,
        name: "Assigned Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course/assigned",
      },
    ],
  },
];

export const sidebarFooterData: SidebarItem[] = [
  {
    id: 34,
    name: "Settings",
    icon: <FaCog />,
    url: "/dashboard/profile",
    role: ["admin", "superadmin", "patient", "doctor", "departmenthead", "user"],
  },
];

const getSidebarDataByRole = (role: string[] = ["admin"]): SidebarItem[] => {
  const filterByRole = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter((item) => !item.role || item.role.some((r) => role.includes(r)))
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };

  return filterByRole(sidebarDatas);
};

export { getSidebarDataByRole, sidebarDatas };
