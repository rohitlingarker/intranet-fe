// Create Project Model
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GripVertical, Trash2, Plus, Check,
  Search, RotateCcw, ChevronRight, AlertTriangle,
} from "lucide-react";

/* ─── Font ────────────────────────────────────────────────────────────────── */
if (!document.getElementById("pmw-font")) {
  const l = document.createElement("link");
  l.id = "pmw-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap";
  document.head.appendChild(l);
}

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const CSS = `
  .pmw * { box-sizing: border-box; }
  .pmw, .pmw input, .pmw select, .pmw textarea, .pmw button {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .pmw-input, .pmw-select, .pmw-textarea {
    font-size: 13.5px; color: #111827;
    background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 8px; outline: none;
    width: 100%; transition: border-color .15s, box-shadow .15s;
  }
  .pmw-input, .pmw-select { height: 40px; padding: 0 12px; }
  .pmw-select {
    appearance: none; cursor: pointer; padding-right: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .pmw-textarea { padding: 10px 12px; min-height: 82px; resize: vertical; line-height: 1.55; }
  .pmw-input:focus,.pmw-select:focus,.pmw-textarea:focus {
    border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12);
  }
  .pmw-input.err,.pmw-select.err,.pmw-textarea.err {
    border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.12);
  }
  .pmw-input::placeholder,.pmw-textarea::placeholder { color: #9ca3af; }
  .pmw-label {
    display: block; font-size: 11px; font-weight: 600;
    color: #6b7280; text-transform: uppercase;
    letter-spacing: .06em; margin-bottom: 5px;
  }
  .pmw-label .req { color: #ef4444; margin-left: 2px; }
  .pmw-label .opt { color: #9ca3af; font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 10.5px; margin-left: 4px; }
  .pmw-err { font-size: 11px; color: #ef4444; font-weight: 500; overflow: hidden; display: block; }
  .pmw-divider { height: 1px; background: #f1f5f9; margin: 18px 0; }
  .pmw-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pmw-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .pmw-sec { font-size: 10px; font-weight: 700; color: #c4cdd9; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 12px; }
  /* skeleton */
  @keyframes pmw-sh { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  .pmw-skel {
    background: linear-gradient(90deg,#f1f5f9 25%,#e9eef5 50%,#f1f5f9 75%);
    background-size: 800px 100%; animation: pmw-sh 1.4s infinite linear; border-radius: 7px;
  }
  /* stepper btn */
  .pmw-sbtn {
    display:flex;flex-direction:column;gap:2px;
    padding:9px 16px 9px 20px;position:relative;
    text-align:left;background:transparent;border:none;width:100%;cursor:default;
  }
  .pmw-sbtn.done{cursor:pointer;}
  .pmw-sbtn.done:hover{background:rgba(37,99,235,.04);}
  .pmw-sbtn.active::before {
    content:'';position:absolute;left:0;top:0;bottom:0;
    width:3px;background:#2563eb;border-radius:0 2px 2px 0;
  }
  /* member row */
  .pmw-mrow {
    display:flex;align-items:center;gap:10px;padding:8px 12px;
    cursor:pointer;transition:background .12s;border-bottom:1px solid #f8fafc;
  }
  .pmw-mrow:last-child{border-bottom:none;}
  .pmw-mrow:hover{background:#f8fafc;}
  .pmw-mrow.sel{background:#eff6ff;}
  .pmw-mrow.dis{opacity:.38;cursor:not-allowed;pointer-events:none;}
  /* status row */
  .pmw-srow {
    display:flex;align-items:center;gap:10px;padding:9px 12px;
    background:#fff;border:1.5px solid #e9eef5;border-radius:8px;
    user-select:none;
  }
  .pmw-srow:hover{border-color:#d1d9e4;}
  /* buttons */
  .pmw-btn-cancel {
    font-size:13px;font-weight:500;border:none;background:transparent;
    color:#6b7280;cursor:pointer;padding:7px 13px;border-radius:8px;
    transition:background .15s,color .15s;
  }
  .pmw-btn-cancel:hover{background:#f3f4f6;color:#374151;}
  .pmw-btn-back {
    font-size:13px;font-weight:500;border:1.5px solid #e2e8f0;background:#fff;
    color:#374151;cursor:pointer;padding:7px 15px;border-radius:8px;
    transition:background .15s,border-color .15s;
  }
  .pmw-btn-back:hover{background:#f8fafc;border-color:#cbd5e1;}
  .pmw-btn-primary {
    font-size:13px;font-weight:600;border:none;background:#2563eb;
    color:#fff;cursor:pointer;padding:7px 18px;border-radius:8px;
    transition:background .15s,opacity .15s;
    display:flex;align-items:center;gap:5px;
  }
  .pmw-btn-primary:hover:not(:disabled){background:#1d4ed8;}
  .pmw-btn-primary:disabled{opacity:.6;cursor:not-allowed;}
  .pmw-btn-discard {
    font-size:13px;font-weight:600;border:none;background:#ef4444;
    color:#fff;cursor:pointer;padding:7px 16px;border-radius:8px;
    transition:background .15s;
  }
  .pmw-btn-discard:hover{background:#dc2626;}
  .pmw-add-inp {
    flex:1;height:40px;padding:0 12px;font-size:13.5px;color:#111827;
    background:#fff;border:1.5px solid #e2e8f0;border-radius:8px;outline:none;
    transition:border-color .15s,box-shadow .15s;
  }
  .pmw-add-inp:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12);}
  .pmw-add-inp::placeholder{color:#9ca3af;}
  .pmw-add-btn {
    height:40px;padding:0 14px;font-size:13px;font-weight:600;
    border:1.5px solid #2563eb;background:#eff6ff;color:#2563eb;
    border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:5px;
    transition:background .15s;white-space:nowrap;
  }
  .pmw-add-btn:hover{background:#dbeafe;}
  .pmw-srch {
    height:40px;width:100%;box-sizing:border-box;padding:0 12px 0 34px;
    font-size:13.5px;color:#111827;background:#fff;
    border:1.5px solid #e2e8f0;border-radius:8px;outline:none;
    transition:border-color .15s,box-shadow .15s;
  }
  .pmw-srch:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12);}
  .pmw-srch::placeholder{color:#9ca3af;}
  .pmw-scroll::-webkit-scrollbar{width:4px;}
  .pmw-scroll::-webkit-scrollbar-track{background:transparent;}
  .pmw-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px;}
  .pmw-scroll::-webkit-scrollbar-thumb:hover{background:#cbd5e1;}
  /* review */
  .pmw-rcell{display:flex;flex-direction:column;gap:3px;}
  .pmw-rlabel{font-size:10px;font-weight:600;color:#a0aec0;text-transform:uppercase;letter-spacing:.06em;}
  .pmw-rval{font-size:13px;color:#111827;font-weight:400;}
  .pmw-rempty{font-size:13px;color:#d1d5db;font-style:italic;}
  .pmw-badge{
    display:inline-flex;align-items:center;gap:5px;
    font-size:11.5px;font-weight:600;border-radius:5px;
    padding:3px 9px;border-width:1.5px;border-style:solid;
  }
`;

if (!document.getElementById("pmw-styles")) {
  const s = document.createElement("style");
  s.id = "pmw-styles"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Core Details",  desc: "Name, key, location"      },
  { id: 2, label: "Lifecycle",     desc: "Dates, stage, delivery"    },
  { id: 3, label: "Team",          desc: "Owner, managers, members"  },
  { id: 4, label: "Workflow",      desc: "Task statuses"             },
  { id: 5, label: "Review",        desc: "Confirm and submit"        },
];

const DEFAULT_FORM = {
  name:"", projectKey:"", description:"", primaryLocation:"",
  status:"PLANNING", currentStage:"INITIATION", deliveryModel:"ONSITE",
  startDate:new Date().toISOString().split("T")[0], endDate:"", riskLevel:"", priorityLevel:"",
  projectBudget:"", ownerId:"", clientId:"", rmId:"",
  deliveryOwnerId:"", memberIds:[],
};

const DEFAULT_STATUSES = [
  { id:"def-1", name:"To Do",       color:"#9ca3af" },
  { id:"def-2", name:"In Progress", color:"#3b82f6" },
  { id:"def-3", name:"Done",        color:"#22c55e" },
];

const STEP_REQ = {
  1:["name","projectKey","primaryLocation"],
  2:["status","currentStage","deliveryModel","startDate","riskLevel","priorityLevel"],
  3:["ownerId","rmId","deliveryOwnerId"],
  4:[], 5:[],
};

const FIELD_LABELS = {
  name:"Project name", projectKey:"Project key",
  primaryLocation:"Primary location", status:"Status",
  currentStage:"Current stage", deliveryModel:"Delivery model",
  startDate:"Start date", riskLevel:"Risk level",
  priorityLevel:"Priority level", ownerId:"Project owner",
  rmId:"Resource manager", deliveryOwnerId:"Delivery owner",
};

const STATUS_OPT   = ["PLANNING","ACTIVE","ARCHIVED","COMPLETED"];
const STAGE_OPT    = ["INITIATION","PLANNING","DESIGN","DEVELOPMENT","TESTING","DEPLOYMENT","MAINTENANCE","COMPLETED"];
const DELIVERY_OPT = ["ONSITE","OFFSHORE","HYBRID"];
const RISK_OPT     = ["LOW","MEDIUM","HIGH"];
const PRI_OPT      = ["LOW","MEDIUM","HIGH","CRITICAL"];

const RISK_B = {
  LOW:    { dot:"#16a34a", bg:"#f0fdf4", text:"#15803d", border:"#bbf7d0" },
  MEDIUM: { dot:"#d97706", bg:"#fffbeb", text:"#b45309", border:"#fde68a" },
  HIGH:   { dot:"#dc2626", bg:"#fef2f2", text:"#b91c1c", border:"#fecaca" },
};
const PRI_B = {
  LOW:      { bg:"#f8fafc", text:"#475569", border:"#e2e8f0" },
  MEDIUM:   { bg:"#eff6ff", text:"#1d4ed8", border:"#bfdbfe" },
  HIGH:     { bg:"#fff7ed", text:"#c2410c", border:"#fed7aa" },
  CRITICAL: { bg:"#fef2f2", text:"#b91c1c", border:"#fecaca" },
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const genKey = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const letters = words
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "")[0] || "")
    .join("")
    .toUpperCase();
  const num = Math.floor(Math.random() * 900) + 100; // 3-digit number
  return `${letters}-${num}`;
};

const CreateProjectModal = (form, statuses) => {
  const df = DEFAULT_FORM;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
            required
          />
        </div>
 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
            required
          />
        </div>
 
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
              required
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          <p className="text-sm text-gray-500 mb-2">Team assignment will be available after project creation</p>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            Team members can be assigned from the User Management section
          </div>
        </div>
 
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#263383] text-white rounded-lg hover:bg-[#3548b6] transition-colors"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
 
export default CreateProjectModal;
 