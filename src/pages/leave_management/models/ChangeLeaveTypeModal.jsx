import { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

/**
 * Helper function to transform raw leave balance data into a structured
 * format suitable for the custom dropdown.
 * @param {Array} balances - The raw leave balance data for an employee.
 * @returns {Array} - A formatted array of options for the Listbox.
 */
function mapBalancesToOptions(balances) {
  if (!balances || balances.length === 0) return [];

  return balances.map((balance) => {
    const { leaveType, remainingLeaves } = balance;
    const leaveTypeId = leaveType.leaveTypeId;
    const leaveName = leaveType.leaveName.replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    let availableText;
    let isInfinite = false;

    if (leaveTypeId.includes("UPL") || leaveName.toLowerCase().includes("unpaid")) {
      availableText = "Infinite balance";
      isInfinite = true;
    } else if (remainingLeaves > 0) {
      const days = remainingLeaves % 1 === 0 ? remainingLeaves : remainingLeaves.toFixed(1);
      availableText = `${days} days available`;
    } else {
      availableText = "Not Available";
    }

    return {
      leaveTypeId,
      leaveName,
      availableText,
      disabled: !isInfinite && remainingLeaves <= 0,
    };
  });
}

function ChangeLeaveTypeModal({ 
  open, 
  onClose, 
  onSave, 
  currentTypeId, 
  leaveBalances = [] // ✨ Use leaveBalances prop now
}) {
  const [selected, setSelected] = useState(currentTypeId);

  // Derive options from props
  const leaveOptions = mapBalancesToOptions(leaveBalances);
  const selectedOption = leaveOptions.find(opt => opt.leaveTypeId === selected);
  
  // Reset the selection when the modal is opened or props change
  useEffect(() => {
    if (open) {
      setSelected(currentTypeId ?? (leaveOptions[0]?.leaveTypeId ?? ''));
    }
  }, [open, currentTypeId, leaveBalances]);
  
  const isLoading = leaveBalances.length === 0;

  return open ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Change Leave Type</h3>
        
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading leave balances...</div>
        ) : (
          // ✨ UI is now upgraded to the Listbox component
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300">
                <span className="block truncate font-medium">{selectedOption?.leaveName ?? 'Select a type'}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                  {leaveOptions.map((option) => (
                    <Listbox.Option
                      key={option.leaveTypeId}
                      className={({ active, disabled }) =>
                        `relative cursor-default select-none py-2 pl-4 pr-4 ${
                          active && !disabled ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                      }
                      value={option.leaveTypeId}
                      disabled={option.disabled}
                    >
                      {({ selected }) => (
                        <div className="flex justify-between items-center">
                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {option.leaveName}
                          </span>
                          <span className={`text-xs ${selected ? 'font-medium' : 'text-gray-500'}`}>
                            {option.availableText}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                              {/* This check icon can be placed differently if needed */}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition disabled:opacity-50"
            onClick={() => {
              if (selected && selected !== currentTypeId) {
                onSave(selected);
                onClose();
              }
            }}
            disabled={isLoading || !selected || selected === currentTypeId}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default ChangeLeaveTypeModal;