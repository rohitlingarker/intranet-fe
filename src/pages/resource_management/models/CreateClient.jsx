import React, { useState, Fragment, useMemo } from 'react';
import { Listbox, Combobox, Transition } from '@headlessui/react'; // Import Combobox
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import ct from 'countries-and-timezones'; 
import { clientservice } from "../services/clientservice";
import { toast } from "react-toastify";

// --- 1. Reusable Standard Listbox (For static fields like Status, Priority) ---
const CustomListbox = ({ label, value, onChange, options, disabled = false }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative mt-1">
          <Listbox.Button 
            className={`relative w-full cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm 
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}`}
          >
            <span className="block truncate">{value || "Select..."}</span>
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
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

// --- 2. New Searchable Combobox (Specifically for Country) ---
const SearchableCombobox = ({ label, value, onChange, options }) => {
  const [query, setQuery] = useState('');

  // Filter options based on user input
  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
              displayValue={(option) => option}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {option}
                        </span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-blue-900' : 'text-blue-600'}`}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

// --- 3. Main Form Component ---
const CreateClient = () => {

  const clientService = new clientservice();
  
  // A. Load Countries
  const allCountryData = useMemo(() => {
    const countriesObj = ct.getAllCountries();
    return Object.values(countriesObj).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [formData, setFormData] = useState({
    client_name: '',
    client_type: 'Enterprise',
    priority_level: 'Low',
    delivery_model: 'Onsite',
    status: 'Active',
    country_name: '',    
    default_timezone: ''  
  });

  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenericListboxChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Logic: Country -> Timezone Offset
  const handleCountryChange = (selectedCountryName) => {
    // 1. Find Data
    const countryData = allCountryData.find(c => c.name === selectedCountryName);
    if (!countryData) return;

    // 2. Get Timezones
    const tzIds = countryData.timezones || [];

    // 3. Convert to Unique Offsets (e.g. "UTC+05:30")
    const uniqueOffsets = [...new Set(tzIds.map(id => {
      const tzInfo = ct.getTimezone(id);
      return `UTC${tzInfo.utcOffsetStr}`; 
    }))];

    // 4. Update State
    setTimezoneOptions(uniqueOffsets);
    setFormData(prev => ({
      ...prev,
      country_name: countryData.name,
      default_timezone: uniqueOffsets.length > 0 ? uniqueOffsets[0] : ''
    }));
  };

  const handleSubmit = (e) => {
    setIsSubmitting(true);
    try {
      const clientCreation = clientService.createClient(formData);
      toast.success(clientCreation.data.message || "Client created successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    // e.preventDefault();
    // alert(JSON.stringify(formData, null, 2));
  };

  return (
    <div className="p-1">

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
        
        {/* Client Name */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleInputChange}
            className="mt-2 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Enter client name"
            required
          />
        </div>

        {/* Standard Listboxes */}
        <CustomListbox
          label="Client Type"
          value={formData.client_type}
          options={['Enterprise', 'Partner', 'Internal', 'Support']}
          onChange={(val) => handleGenericListboxChange('client_type', val)}
        />

        <CustomListbox
          label="Priority Level"
          value={formData.priority_level}
          options={['Low', 'Medium', 'High']}
          onChange={(val) => handleGenericListboxChange('priority_level', val)}
        />

        <CustomListbox
          label="Delivery Model"
          value={formData.delivery_model}
          options={['Onsite', 'Offshore', 'Hybrid']}
          onChange={(val) => handleGenericListboxChange('delivery_model', val)}
        />

        <CustomListbox
          label="Status"
          value={formData.status}
          options={['Active', 'Inactive']}
          onChange={(val) => handleGenericListboxChange('status', val)}
        />

        {/* --- Dynamic Location Section --- */}
        <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Location Settings</h3>
        </div>

        {/* 1. SEARCHABLE Country Combobox */}
        <div className="col-span-1 md:col-span-2">
          <SearchableCombobox
            label="Country"
            value={formData.country_name}
            options={allCountryData.map(c => c.name)}
            onChange={handleCountryChange}
          />
        </div>

        {/* 2. Default Timezone (Standard Listbox) */}
        <div className="col-span-1 md:col-span-2">
          <CustomListbox
            label="Default Timezone"
            value={formData.default_timezone}
            options={timezoneOptions}
            onChange={(val) => handleGenericListboxChange('default_timezone', val)}
            disabled={!formData.country_name}
          />
        </div>

        {/* Footer Actions */}
        <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-md"
          >
            {isSubmitting ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;