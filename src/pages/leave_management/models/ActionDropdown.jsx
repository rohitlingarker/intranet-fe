import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, MessageSquare, Calendar, FileText } from 'lucide-react';
import ChangeLeaveDatesModal from './ChangeLeaveDatesModal';
import ChangeLeaveTypeModal from './ChangeLeaveTypeModal';
import CommentModal from './CommentModal';

const ActionDropdown = ({
  requestId,
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

  // Store selected values here
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

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
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
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

      {/* Change Leave Type Modal */}
      <ChangeLeaveTypeModal
        open={isChangeLeaveTypeOpen}
        onClose={() => setIsChangeLeaveTypeOpen(false)}
        onSave={handleSaveLeaveType}
        currentTypeId={leaveTypeId}
        allTypes={allLeaveTypes}
      />

      {/* Change Leave Dates Modal */}
      <ChangeLeaveDatesModal
        open={isChangeLeaveDatesOpen}
        onClose={() => setIsChangeLeaveDatesOpen(false)}
        onSave={handleSaveLeaveDates}
        currentStart={startDate}
        currentEnd={endDate}
      />

      {/* Comment Modal */}
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
