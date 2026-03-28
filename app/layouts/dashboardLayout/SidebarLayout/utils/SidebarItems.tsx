import { PlusSquareIcon } from "@chakra-ui/icons";
import { BiCalendarEvent } from "react-icons/bi";
import {
  FaCalendarCheck,
  FaChartPie,
  FaCog,
  FaFileAlt,
  FaListAlt,
  FaNotesMedical,
  FaUserAstronaut,
  FaUserMd,
  FaUsers,
  FaUserTie,
  FaUserClock,
} from "react-icons/fa";

import { FaVial } from "react-icons/fa"; // correct icon
import { GiOfficeChair } from "react-icons/gi";
import { MdEventRepeat } from "react-icons/md";
import { RiToothLine } from "react-icons/ri";
import { VscWorkspaceTrusted } from "react-icons/vsc";

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
    role: ["patient", "user", "admin"],
  },
  // {
  //   id: 2,
  //   name: "Users",
  //   icon: <FaUsers />,
  //   url: "/dashboard/users",
  //   role: ["admin"],
  //   children: [
  //     {
  //       id: 21,
  //       name: "Patients",
  //       icon: <FaUsers />,
  //       url: "/dashboard/patients",
  //       role: ["admin"],
  //     },
  //     {
  //       id: 3,
  //       name: "Doctors",
  //       icon: <FaUserMd />,
  //       url: "/dashboard/doctors",
  //       role: ["admin"],
  //     },
  //     {
  //       id: 4,
  //       name: "Staffs",
  //       icon: <FaUserTie />,
  //       url: "/dashboard/staffs",
  //       role: ["admin"],
  //     },
  //   ],
  // },
  // {
  //   id: 5,
  //   name: "Labs",
  //   icon: <FaVial />,
  //   url: "/dashboard/labs",
  //   role: ["admin"],
  // },
  // {
  //   id: 8,
  //   name: "Appointments",
  //   icon: <FaCalendarCheck />,
  //   url: "/dashboard/appointments",
  //   role: ["patient", "doctor", "admin"],
  // },
  // {
  //   id: 15,
  //   name: "Book Appointment",
  //   icon: <BiCalendarEvent />,
  //   url: "/dashboard/appointments/book",
  //   role: ["patient", "doctor", "admin"],
  // },
  // {
  //   id: 16,
  //   name: "Waiting Room",
  //   icon: <FaUserClock />,
  //   url: "/dashboard/appointments/waiting-room",
  //   role: ["patient", "doctor", "admin"],
  // },
  // {
  //   id: 9,
  //   name: "Recall Appointment",
  //   icon: <MdEventRepeat />,
  //   url: "/dashboard/recall-appointment",
  //   role: ["admin"],
  // },
  // {
  //   id: 10,
  //   name: "Orders",
  //   icon: <FaNotesMedical />,
  //   url: "/dashboard/orders",
  //   role: ["admin", "patient"],
  // },
  {
    id: 100,
    name: "Users",
    icon: <FaUsers />,
    url: "/dashboard/users",
    role: ["admin"],
  },
  // {
  //   id: 11,
  //   name: "Masters",
  //   icon: <FaListAlt />,
  //   url: "/dashboard/masters",
  //   role: ["admin"],
  // },
  {
    id: 12,
    name: "Companies",
    icon: <FaUserAstronaut />,
    url: "/dashboard/admins",
    role: ["superadmin"],
  },
  // {
  //   id: 13,
  //   name: "Chairs",
  //   icon: <GiOfficeChair />,
  //   url: "/dashboard/chairs",
  //   role: ["superAdmin", "admin"],
  // },
  // {
  //   id: 13,
  //   name: "Workflow",
  //   icon: <GiOfficeChair />,
  //   url: "/dashboard/workflow",
  //   role: ["superAdmin", "admin"],
  // },
  // {
  //   id: 15,
  //   name: "Documents",
  //   icon: <FaFileAlt />,
  //   url: "/dashboard/documents",
  //   role: ["superAdmin", "admin","user"],
  // },
  // {
  //   id: 16,
  //   name: "Approvals",
  //   icon: <VscWorkspaceTrusted />,
  //   url: "/dashboard/approvals",
  //   role: ["superAdmin", "admin", "user"],
  // },
 {
  id: 17,
  name: "Course",
  icon: <PlusSquareIcon />,
  url: "/dashboard/course",
  role: ["superadmin", "admin", "user"],
  children: [
    {
      id: 171,
      name: "All Courses",
      icon: <PlusSquareIcon />,
      url: "/dashboard/course",
    },
    {
      id: 172,
      name: "Create Course",
      icon: <PlusSquareIcon />,
      url: "/dashboard/course/create",
    },

    // ✅ Testing nested level
    {
      id: 173,
      name: "Advanced",
      icon: <PlusSquareIcon />,
      url: "#",
      children: [
        {
          id: 1731,
          name: "Test Sub Course 1",
          icon: <PlusSquareIcon />,
          url: "/dashboard/course/test1",
        },
        {
          id: 1732,
          name: "Test Sub Course 2",
          icon: <PlusSquareIcon />,
          url: "/dashboard/course/test2",
        },
      ],
    },
  ],
}
  // {
  //   id: 14,
  //   name: "Work Done",
  //   icon: <VscWorkspaceTrusted />,
  //   url: "/dashboard/work-done",
  // },
];

export const sidebarFooterData: SidebarItem[] = [
  {
    id: 34,
    name: "Settings",
    icon: <FaCog />,
    url: "/dashboard/profile",
    role: ["admin", "superadmin", "patient", "doctor"],
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
