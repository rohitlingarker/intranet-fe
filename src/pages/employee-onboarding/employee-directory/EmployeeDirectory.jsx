import React, { useState } from "react";
import EmployeeCard from "../components/EmployeeCard";
import { Search } from "lucide-react";

const EmployeeDirectory = () => {
  const employees = [
  {
    name: "Alwala Swarna Raj",
    contact: "9876543210",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "swarnaraj.alwala@pavestechnologies.com",
    initials: "BA",
    gender: "Male",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
      employeeId: "PAVS001",
  },
  {
    name: "Bhukya Ajay Kumar",
    contact: "9876543211",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "ajay.bhukya@pavestechnologies.com",
    initials: "BA",
    gender: "Male",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001",     
  },
  {
    name: "Bolli Aditya Teja",
    contact: "9876543212",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "aditya.bolli@pavestechnologies.com",
    initials: "BL",
    gender: "Male",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
      employeeId: "PAVS001",
  },
  {
    name: "Busam Lokeswari",
    contact: "9876543213",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "lokeswari.busam@pavestechnologies.com",
    initials: "DR",
    gender: "Female", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001",
  },
  {
    name: "Dama Rangaswamy",
    contact: "9876543214",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "rangaswamy.dama@pavestechnologies.com",
    initials: "GT",
    gender: "Male",  
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001",
  },
  {
    name: "Gajula Thejas",
    contact: "9876543215",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "thejas.gajula@pavestechnologies.com",
    initials: "GV",
    gender: "Male",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",  
     employeeId: "PAVS001",
  },
  {
    name: "Gali Venkatesh",
    contact: "9876543216",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "venkatesh.gali@pavestechnologies.com",
    initials: "KA",
    gender: "Male",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
      employeeId: "PAVS001", 
  },
  {
    name: "Korada Ajay Kumar",
    contact: "9876543217",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "ajay.korada@pavestechnologies.com",
    initials: "NK",
    gender: "Male", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
      employeeId: "PAVS001",
  },
  {
    name: "Niharika Kandukoori",
    contact: "9876543218",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "niharika.kandukoori@pavestechnologies.com",
    initials: "NR",
    gender: "Female",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
      employeeId: "PAVS001",
  },
  {
    name: "Nuthula Ruchitha",
    contact: "9876543219",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "ruchitha.nuthula@pavestechnologies.com",
    initials: "PJ",
    gender: "Female",
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
    employeeId: "PAVS001", 
  },
  {
    name: "Pannala Jagadish",
    contact: "9876543220",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "jagadish.pannala@pavestechnologies.com",
    initials: "PS",
    gender: "Male",  
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001", 
  },
  {
    name: "Patan Sumiya",
    contact: "9876543221",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "patan.sumiya@pavestechnologies.com",
    initials: "PS",
    gender: "Female", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001", 
  },
  {
    name: "Perka Sathwik",
    contact: "9876543222",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "sathwik.perka@pavestechnologies.com",
    initials: "PM",
    gender: "Male", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
     employeeId: "PAVS001", 
  },
  {
    name: "Pothamsetti Mounika",
    contact: "9876543223",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "mounika.pothamsetti@pavestechnologies.com",
    initials: "RL",
    gender: "Female", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001", 
  },
  {
    name: "Rohit Lingarker",
    contact: "9876543224",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "rohit.lingarker@pavestechnologies.com",
    initials: "SM",
    gender: "Male", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma", 
     employeeId: "PAVS001", 
  },
  {
    name: "Saladi Mohan Dharma Teja",
    contact: "9876543225",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "mohan.saladi@pavestechnologies.com",
    initials: "SC",
    gender: "Male",  
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001", 
  },
  {
    name: "Sri Charan Reddy Chilkuri",
    contact: "9876543226",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "sricharan.chilkuri@pavestechnologies.com",
    initials: "VB",
    gender: "Male", 
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001",  
  },
  {
    name: "Vijayadurga Balada",
    contact: "9876543227",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "vijayadurga.balada@pavestechnologies.com",
    initials: "WS",
    gender: "Female",
    employeeType: "Full-Time",
    dateOfJoining: "2024-01-15",
    reportingManager: "Ram Gopal Varma", 
    employeeId: "PAVS001" 
  },
  {
    name: "Wazid Shaik",
    contact: "9876543228",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "wazid.shaik@pavestechnologies.com",
    initials: "YS",
    gender: "Male",  
    employeeType: "Full-Time",
     dateOfJoining: "2024-01-15",
     reportingManager: "Ram Gopal Varma",
     employeeId: "PAVS001", 
  },
  {
    name: "Yanala Sindhu",
    contact: "9876543229",
    role: "Graduate Software Engineer",
    department: "Engineering",
    location: "Hyderabad Office",
    email: "sindhu.yanala@pavestechnologies.com",
    initials: "YS",
    gender: "Female", 
    employeeType: "Full-Time",
    dateOfJoining: "2024-01-15",
    reportingManager: "Ram Gopal Varma", 
    employeeId: "PAVS001", 
  },

  ];

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      department === "All" || emp.department === department;

    return matchesSearch && matchesDepartment;
  });

  const departments = ["All", "Engineering", "HR"];

  return (
    
    <div className="p-0.5 overflow-x-hidden">

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-4xl font-semibold text-gray-900">
            Employee Directory
          </h2>
          <p className="text-gray-500 text-sm">
            Manage and browse organizational talent.
          </p>
        </div>

        <button className="bg-indigo-800 hover:bg-indigo-800 text-white px-5 py-2 rounded-xl shadow-md transition">
          + Add Employee
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-3/4 pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Department Chips */}
        <div className="flex gap-4 justify-center">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartment(dept)}
              className={`px-2 py-2 rounded-full text-sm font-medium transition ${
                department === dept
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6 p-2 ">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp, index) => (
            <EmployeeCard key={index} employee={emp} index={index}/>
          ))
        ) : (
          <p className="text-gray-500">No employees found.</p>
        )}
      </div>
    </div>
  );
 
};

export default EmployeeDirectory;
