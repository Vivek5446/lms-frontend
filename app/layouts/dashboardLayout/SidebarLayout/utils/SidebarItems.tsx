import { PlusSquareIcon } from "@chakra-ui/icons";
import { FaChartPie, FaCog, FaUserAstronaut, FaUsers, FaUserTie } from "react-icons/fa";
import { expandRoleAliases } from "@/app/config/utils/roleAccess";

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
    role: ["patient", "admin", "superadmin", "departmenthead"],
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
    role: ["superadmin", "admin", "departmenthead"],
    children: [
      {
        id: 171,
        name: "All Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course",
        role: ["superadmin", "admin", "departmenthead"],
      },
      {
        id: 172,
        name: "Assigned Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course/assigned",
        role: ["superadmin", "admin", "departmenthead"],
      },
      {
        id: 174,
        name: "Assignments Audit",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course/assignments",
        role: ["superadmin", "admin", "departmenthead"],
      },
    ],
  },
  {
  id: 18,
  name: "Batches",
  icon: <PlusSquareIcon />,
  url: "/dashboard/batches",
  role: ["superadmin", "admin", "departmenthead"],
  children: [
    {
      id: 181,
      name: "All Batches",
      icon: <PlusSquareIcon />,
      url: "/dashboard/batches",
      role: ["superadmin", "admin", "departmenthead"],
    },
    {
      id: 182,
      name: "Batch Reports",
      icon: <PlusSquareIcon />,
      url: "/dashboard/batches/reports",
      role: ["superadmin", "admin", "departmenthead"],
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
    role: ["admin", "superadmin", "patient", "doctor", "departmenthead"],
  },
];

const getSidebarDataByRole = (role: string[] = ["admin"]): SidebarItem[] => {
  const effectiveRoles = expandRoleAliases(role);

  const filterByRole = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter((item) => !item.role || item.role.some((r) => effectiveRoles.includes(r)))
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };

  return filterByRole(sidebarDatas);
};

export { getSidebarDataByRole, sidebarDatas };
