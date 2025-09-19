import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MoreHorizontal, MessageSquare, Calendar, FileText } from 'lucide-react';
import ChangeLeaveDatesModal from './ChangeLeaveDatesModal';
import ChangeLeaveTypeModal from './ChangeLeaveTypeModal';
import CommentModal from './CommentModal';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem('token');

const ActionDropdown = ({
  employeeId,
  currentLeaveType,
  currentStartDate,
  currentEndDate,
  currentReason,
  allLeaveTypes,
  managerComments,
  onUpdate,
  forceOpen,
  forceCommentMandatory,
  onModalClose,
  onCommentSave,
}) => {
  const [commentValue, setCommentValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isChangeLeaveTypeOpen, setIsChangeLeaveTypeOpen] = useState(false);
  const [isChangeLeaveDatesOpen, setIsChangeLeaveDatesOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [employeeLeaveBalances, setEmployeeLeaveBalances] = useState([]);
  const [isBalancesLoading, setIsBalancesLoading] = useState(false);

  // --- NEW: State to track if the dropdown should open upwards ---
  const [openUpwards, setOpenUpwards] = useState(false);

  // Store selected values here
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchBalances = async () => {
      if (isChangeLeaveTypeOpen && employeeId) {
        setIsBalancesLoading(true);
        try {
          const res = await axios.get(
            `${BASE_URL}/api/leave-balance/employee/${employeeId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployeeLeaveBalances(res.data || []);
        } catch (error) {
          console.error("Failed to fetch employee balances", error);
          toast.error("Failed to fetch employee leave balances");
        } finally {
          setIsBalancesLoading(false);
        }
      }
    };

    fetchBalances();
  }, [isChangeLeaveTypeOpen, employeeId]);

  useEffect(() => {
    if (isCommentOpen) setCommentValue(managerComments);
  }, [isCommentOpen, managerComments]);

  useEffect(() => {
    if (isChangeLeaveTypeOpen) {
      setLeaveTypeId(currentLeaveType?.leaveTypeId || '');
    }
  }, [isChangeLeaveTypeOpen, currentLeaveType]);

  useEffect(() => {
    if (isChangeLeaveDatesOpen) {
      setStartDate(currentStartDate);
      setEndDate(currentEndDate);
    }
  }, [isChangeLeaveDatesOpen, currentStartDate, currentEndDate]);

  useEffect(() => {
    if (isCommentOpen) {
      setReason(currentReason);
    }
  }, [isCommentOpen, currentReason]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- NEW: Handler to toggle dropdown and check its position ---
  const toggleDropdown = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 150; // Approximate height of the dropdown menu

      // If not enough space below, open upwards
      setOpenUpwards(spaceBelow < menuHeight);
    }
    setIsOpen(!isOpen);
  };


  const handleSaveLeaveType = (newTypeId) => {
    setLeaveTypeId(newTypeId);
    onUpdate({ leaveTypeId: newTypeId });
    setIsChangeLeaveTypeOpen(false);
  };

  const handleSaveLeaveDates = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    onUpdate({ startDate: start, endDate: end });
    setIsChangeLeaveDatesOpen(false);
  };

  const handleSaveComment = (comment) => {
    setReason(comment);
    onUpdate({ comment: comment });
    setIsCommentOpen(false);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'Add Comment') {
      setIsCommentOpen(true);
    } else if (action === 'Change Leave Type') {
      setIsChangeLeaveTypeOpen(true);
    } else if (action === 'Change Leave Dates') {
      setIsChangeLeaveDatesOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        // --- UPDATED: Use the new toggle handler ---
        onClick={toggleDropdown}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        // --- UPDATED: Conditionally apply classes to open upwards or downwards ---
        <div
          className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 ${
            openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="py-1">
            <button
              onClick={() => handleAction('Add Comment')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-3" />
              Add Comment
            </button>
            <button
              onClick={() => handleAction('Change Leave Type')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-4 h-4 mr-3" />
              Change Leave Type
            </button>
            <button
              onClick={() => handleAction('Change Leave Dates')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-3" />
              Change Leave Dates
            </button>
          </div>
        </div>
      )}

      {/* MODALS (No changes needed here) */}
      <ChangeLeaveTypeModal
        open={isChangeLeaveTypeOpen}
        onClose={() => setIsChangeLeaveTypeOpen(false)}
        onSave={handleSaveLeaveType}
        currentTypeId={leaveTypeId}
        leaveBalances={employeeLeaveBalances}
      />
      <ChangeLeaveDatesModal
        open={isChangeLeaveDatesOpen}
        onClose={() => setIsChangeLeaveDatesOpen(false)}
        onSave={handleSaveLeaveDates}
        currentStart={startDate}
        currentEnd={endDate}
      />
      <CommentModal
        open={forceOpen || isCommentOpen}
        onClose={() => {
          setIsCommentOpen(false);
          if (onModalClose) onModalClose();
        }}
        onSave={(c) => {
          setCommentValue(c);
          onUpdate({ comment: c });
          setIsCommentOpen(false);
          if (onCommentSave) onCommentSave(c);
        }}
        comment={commentValue}
        required={!!forceCommentMandatory}
        forceMandatory={!!forceCommentMandatory}
      />
    </div>
  );
};

export default ActionDropdown;