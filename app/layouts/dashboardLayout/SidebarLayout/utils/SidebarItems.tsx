import { PlusSquareIcon } from "@chakra-ui/icons";
import { FaChartPie, FaCog, FaUserAstronaut, FaUsers, FaUserTie } from "react-icons/fa";
import { expandRoleAliases } from "@/app/config/utils/roleAccess";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";

interface SidebarItem {
  id: number;
  name: string;
  icon: any;
  url: string;
  role?: string[];
  permissionKey?: string;
  children?: SidebarItem[];
}

const sidebarDatas: SidebarItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: <FaChartPie />,
    url: "/dashboard",
    role: ["patient", "admin", "superadmin", "departmenthead"],
    permissionKey: PERMISSION_KEYS.VIEW_DASHBOARD,
  },
  {
    id: 100,
    name: "Users",
    icon: <FaUsers />,
    url: "/dashboard/users",
    role: ["admin", "superadmin", "departmenthead"],
    permissionKey: PERMISSION_KEYS.VIEW_USERS,
  },
  {
    id: 101,
    name: "Departments",
    icon: <FaUserTie />,
    url: "/dashboard/departments",
    role: ["admin", "superadmin", "departmenthead"],
    permissionKey: PERMISSION_KEYS.VIEW_DEPARTMENTS,
  },
  {
    id: 12,
    name: "Companies",
    icon: <FaUserAstronaut />,
    url: "/dashboard/admins",
    role: ["superadmin"],
    permissionKey: PERMISSION_KEYS.VIEW_COMPANIES,
  },
  {
    id: 13,
    name: "Permissions",
    icon: <FaCog />,
    url: "/dashboard/permissions",
    role: ["superadmin"],
    permissionKey: PERMISSION_KEYS.MANAGE_PERMISSIONS,
  },
  {
    id: 17,
    name: "Courses",
    icon: <PlusSquareIcon />,
    url: "/dashboard/course",
    role: ["superadmin", "admin", "departmenthead"],
    permissionKey: PERMISSION_KEYS.VIEW_COURSES,
    children: [
      {
        id: 171,
        name: "All Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course",
        role: ["superadmin", "admin", "departmenthead"],
        permissionKey: PERMISSION_KEYS.VIEW_COURSES,
      },
      {
        id: 172,
        name: "Assigned Courses",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course/assigned",
        role: ["superadmin", "admin", "departmenthead"],
        permissionKey: PERMISSION_KEYS.VIEW_COURSES,
      },
      {
        id: 174,
        name: "Assignments Audit",
        icon: <PlusSquareIcon />,
        url: "/dashboard/course/assignments",
        role: ["superadmin", "admin", "departmenthead"],
        permissionKey: PERMISSION_KEYS.VIEW_COURSES,
      },
    ],
  },
  {
  id: 18,
  name: "Batches",
  icon: <PlusSquareIcon />,
  url: "/dashboard/batches",
  role: ["superadmin", "admin", "departmenthead"],
  permissionKey: PERMISSION_KEYS.VIEW_BATCHES,
  children: [
    {
      id: 181,
      name: "All Batches",
      icon: <PlusSquareIcon />,
      url: "/dashboard/batches",
      role: ["superadmin", "admin", "departmenthead"],
      permissionKey: PERMISSION_KEYS.VIEW_BATCHES,
    },
    {
      id: 182,
      name: "Batch Reports",
      icon: <PlusSquareIcon />,
      url: "/dashboard/batches/reports",
      role: ["superadmin", "admin", "departmenthead"],
      permissionKey: PERMISSION_KEYS.VIEW_BATCHES,
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
    permissionKey: PERMISSION_KEYS.VIEW_PROFILE,
  },
];

const getSidebarDataByRole = (role: string[] = ["admin"], user?: any): SidebarItem[] => {
  const effectiveRoles = expandRoleAliases(role);

  const filterByRole = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter(
        (item) =>
          (!item.role || item.role.some((r) => effectiveRoles.includes(r))) &&
          (!item.permissionKey || hasPermission(user, item.permissionKey))
      )
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };

  return filterByRole(sidebarDatas);
};

export { getSidebarDataByRole, sidebarDatas };
