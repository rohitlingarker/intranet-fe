import React, { useState, useMemo, useEffect, useRef } from "react";
import Tree from "react-d3-tree";

/* ---------------- EMPLOYEE DATA ---------------- */

const employees = [
  "Alwala Swarna Raj",
  "Bhukya Ajay Kumar",
  "Bolli Aditya Teja",
  "Busam Lokeswari",
  "Dama Rangaswamy",
  "Gajula Thejas",
  "Gali Venkatesh",
  "Korada Ajay Kumar",
  "Niharika Kandukoori",
  "Nuthula Ruchitha",
  "Pannala Jagadish",
  "Patan Sumiya",
  "Perka Sathwik",
  "Pothamsetti Mounika",
  "Rohit Lingarker",
  "Saladi Mohan Dharma Teja",
  "Sri Charan Reddy Chilkuri",
  "Vijayadurga Balada",
  "Wazid Shaik",
  "Yanala Sindhu",
];

/* ---------------- AVATAR HELPERS ---------------- */

const palette = [
  "#6366F1",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

const getColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return palette[hash % palette.length];
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------------- TREE CREATION ---------------- */

const createOrgTree = (groupByDepartment = false) => {
  const engineerNodes = employees.map((name) => ({
    name,
    attributes: {
      designation: "Graduate Software Engineer",
      department: "Engineering",
      location: "Hyderabad Office",
    },
  }));

  const engineeringGrouped = {
    name: "Engineering",
    attributes: {
      designation: "Department",
      department: "Engineering",
      location: "",
    },
    children: engineerNodes,
  };

  return {
    name: "Sambi Reddy Eada",
    attributes: {
      designation: "Managing Director",
      department: "Administration",
      location: "Hyderabad Office",
    },
    children: [
      {
        name: "Accounts Paves",
        attributes: {
          designation: "Accounts",
          department: "Administration",
          location: "Hyderabad Office",
        },
      },
      {
        name: "Veni Priya P",
        attributes: {
          designation: "HRBP",
          department: "Human Resources",
          location: "Hyderabad Office",
        },
      },
      {
        name: "Varshinya",
        attributes: {
          designation: "HR Intern",
          department: "Human Resources",
          location: "Hyderabad Office",
        },
      },
      {
        name: "Rama Gopal Durgam",
        attributes: {
          designation: "Manager",
          department: "Administration",
          location: "Hyderabad Office",
        },
        children: groupByDepartment
          ? [engineeringGrouped]
          : engineerNodes,
      },
      {
        name: "Rakesh K",
        attributes: {
          designation: "Recruitment Intern Lead",
          department: "Human Resources",
          location: "Hyderabad Office",
        },
      },
    ],
  };
};

/* ---------------- EXPAND PATH ---------------- */

const expandPath = (node, targetName) => {
  if (!node.children) return false;

  let found = false;

  node.children.forEach((child) => {
    const childFound =
      child.name === targetName || expandPath(child, targetName);
    if (childFound) {
      child.__rd3t = { collapsed: false };
      found = true;
    }
  });

  return found;
};

/* ---------------- CUSTOM NODE ---------------- */

const CardNode = ({ nodeDatum, toggleNode }) => {
  const hasChildren = !!nodeDatum.children?.length;

  return (
    <g>
      <g onClick={toggleNode} style={{ cursor: "pointer" }}>
        {/* Card */}
        <rect
          width="270"
          height="95"
          x="-135"
          y="-47"
          rx="14"
          fill="#ffffff"
          stroke="#e5e7eb"
          style={{
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.06))",
          }}
        />

        {/* Avatar */}
        <circle
          cx="-105"
          cy="-12"
          r="20"
          fill={getColor(nodeDatum.name)}
        />

        <text
          x="-105"
          y="-6"
          textAnchor="middle"
          fontSize="11"
          fill="#ffffff"
          fontWeight="10"
        >
          {getInitials(nodeDatum.name)}
        </text>

        {/* Name (SAME STYLE FOR ALL) */}
        <text
          x="-70"
          y="-18"
          fontSize="14"
          fontWeight="500"
          fill="#1E293B"
        >
          {nodeDatum.name}
        </text>

        {/* Designation */}
        <text
          x="-70"
          y="-2"
          fontSize="11"
          fontWeight="400"
          fill="#475569"
        >
          {nodeDatum.attributes?.designation}
        </text>

        {/* Location */}
        <text
          x="-70"
          y="14"
          fontSize="10"
          fontWeight="400"
          fill="#64748B"
        >
          {nodeDatum.attributes?.location}
        </text>

        {/* Department */}
        <text
          x="-70"
          y="30"
          fontSize="10"
          fontWeight="400"
          fill="#2563EB"
        >
          {nodeDatum.attributes?.department?.toUpperCase()}
        </text>
      </g>

      {/* Expand/Collapse */}
      {hasChildren && (
        <g onClick={toggleNode}>
          <circle
            cx="0"
            cy="58"
            r="9"
            fill="#fff"
            stroke="#2563eb"
            strokeWidth="2"
          />
          {nodeDatum.__rd3t?.collapsed ? (
            <text
              x="0"
              y="62"
              textAnchor="middle"
              fontSize="12"
              fill="#2563eb"
              fontWeight="500"
            >
              +
            </text>
          ) : (
            <rect
              x="-4"
              y="57"
              width="8"
              height="2"
              fill="#2563eb"
            />
          )}
        </g>
      )}
    </g>
  );
};


/* ---------------- MAIN COMPONENT ---------------- */

export default function OrganizationTree() {
  const treeContainer = useRef(null);

  const [groupByDepartment, setGroupByDepartment] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 600, y: 120 });

  const treeData = useMemo(
    () => createOrgTree(groupByDepartment),
    [groupByDepartment]
  );

  const animateZoom = (targetZoom) => {
    const step = (targetZoom - zoom) / 15;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setZoom((z) => z + step);
      if (i >= 15) clearInterval(interval);
    }, 16);
  };

  const focusNode = (name) => {
    const width = treeContainer.current.offsetWidth;
    const height = treeContainer.current.offsetHeight;

    expandPath(treeData, name);

    animateZoom(1.3);

    setTranslate({
      x: width / 2,
      y: height / 4,
    });
  };

  useEffect(() => {
    const width = treeContainer.current.offsetWidth;
    setTranslate({ x: width / 2, y: 120 });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-[#f4f7fb] font-sans">

      {/* HEADER */}
      <div className="bg-[#071C2B] text-white px-8 py-4 flex items-center justify-between">

        <input
          placeholder="Search employee"
          className="bg-[#0E2A3D] text-white placeholder-gray-400
          px-4 py-2 rounded-md w-80 outline-none border border-[#12344D]"
        />

        <div className="flex items-center gap-6">

          <button
            onClick={() => focusNode("Rama Gopal Durgam")}
            className="px-4 py-2 bg-[#0E2A3D] rounded-md hover:bg-[#12344D]"
          >
            My Department
          </button>

          <button
            onClick={() => animateZoom(1)}
            className="px-4 py-2 bg-[#4B1E2F] rounded-md"
          >
            Top of the Org
          </button>

          <button
            onClick={() => focusNode("Pannala Jagadish")}
            className="px-4 py-2 bg-[#0E2A3D] rounded-md hover:bg-[#12344D]"
          >
            Me
          </button>

          <div
            onClick={() => setGroupByDepartment(!groupByDepartment)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className={`w-10 h-5 rounded-full p-1 transition ${
                groupByDepartment ? "bg-blue-500" : "bg-gray-500"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full transform transition ${
                  groupByDepartment ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span>Group by department</span>
          </div>
        </div>
      </div>

      {/* TREE AREA */}
      <div
        ref={treeContainer}
        className="flex-1 relative flex justify-center items-start pt-10"
      >
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          zoom={zoom}
          collapsible
          zoomable
          nodeSize={{ x: 300, y: 150 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          pathFunc="step"
          transitionDuration={300}
          renderCustomNodeElement={(props) => <CardNode {...props} />}
        />

        {/* RIGHT SIDE ZOOM CONTROLS */}
        <div className="absolute right-6 top-20 bg-white rounded-lg shadow-md flex flex-col">
          <button
            onClick={() => animateZoom(zoom + 0.2)}
            className="px-4 py-2 border-b hover:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => animateZoom(zoom - 0.2)}
            className="px-4 py-2 border-b hover:bg-gray-100"
          >
            −
          </button>
          <button
            onClick={() => animateZoom(1)}
            className="px-4 py-2 hover:bg-gray-100"
          >
            ⟳
          </button>
        </div>
      </div>
    </div>
  );
}
