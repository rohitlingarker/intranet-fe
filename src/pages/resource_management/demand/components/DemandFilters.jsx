import React, { useState, useEffect } from 'react';
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DemandFilters = ({
    onToggleCollapse,
    clientFilter = 'ALL',
    onClientChange,
    priorityFilter = 'ALL',
    onPriorityChange,
    onReset,
    activeCount,
    inline = false,
    clients = [],
    statuses = [],
    demandNames = [],
    demandTypes = [],
    deliveryModels = [],
    priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    statusFilter = 'ALL',
    onStatusChange,
    demandNameFilter = 'ALL',
    onDemandNameChange,
    demandTypeFilter = 'ALL',
    onDemandTypeChange,
    deliveryModelFilter = 'ALL',
    onDeliveryModelChange,
    draft: externalDraft,
    setDraft: setExternalDraft
}) => {
    // Standardize 'All' to 'ALL' from props initially
    const safeClient = clientFilter || 'ALL';
    const safePriority = priorityFilter || 'ALL';
    const safeStatus = statusFilter || 'ALL';
    const safeName = demandNameFilter || 'ALL';
    const safeType = demandTypeFilter || 'ALL';
    const safeModel = deliveryModelFilter || 'ALL';

    // Local state as fallback for Sidebar mode, or use external for Persistence
    const [localDraft, setLocalDraft] = useState({
        client: safeClient,
        priority: safePriority,
        status: safeStatus,
        demandName: safeName,
        demandType: safeType,
        deliveryModel: safeModel
    });

    const draft = externalDraft || localDraft;
    const setDraft = setExternalDraft || setLocalDraft;

    // Sync with external changes ONLY if using local state (Sidebar)
    useEffect(() => {
        if (!externalDraft) {
            setLocalDraft({
                client: clientFilter,
                priority: priorityFilter,
                status: statusFilter,
                demandName: demandNameFilter,
                demandType: demandTypeFilter,
                deliveryModel: deliveryModelFilter
            });
        }
    }, [clientFilter, priorityFilter, statusFilter, demandNameFilter, demandTypeFilter, deliveryModelFilter, externalDraft]);

    const handleApply = () => {
        onClientChange(draft.client);
        onPriorityChange(draft.priority);
        onStatusChange(draft.status);
        onDemandNameChange(draft.demandName);
        onDemandTypeChange(draft.demandType);
        onDeliveryModelChange(draft.deliveryModel);
        onToggleCollapse(); // Close on apply
    };

    const handleReset = () => {
        onReset();
        // Reset local draft immediately for better UX
        setDraft({
            client: 'ALL',
            priority: 'ALL',
            status: 'ALL',
            demandName: 'ALL',
            demandType: 'ALL',
            deliveryModel: 'ALL'
        });
    };

    const formatEnum = (str) => {
        if (!str) return '';
        return str.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // If used as an inline/popover component (matching FilterBar.jsx dropdown)
    if (inline) {
        return (
            <div className="flex flex-col min-w-[300px] bg-white rounded-xl overflow-hidden">
                {/* Header - Identical to Admin Panel FilterBar */}
                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b">
                    <span className="text-xs font-bold text-slate-700">
                        Demand Filters
                    </span>
                    <button
                        onClick={onToggleCollapse}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body - 2 Column Grid like Admin Panel */}
                <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-full custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Client account
                            </label>
                            <Select
                                value={draft?.client || 'ALL'}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, client: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All Clients" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Clients</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client} value={client}>{client}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Priority
                            </label>
                            <Select
                                value={draft.priority?.toUpperCase()}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, priority: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Priorities</SelectItem>
                                    {priorities.map(p => (
                                        <SelectItem key={p} value={p}>
                                            {formatEnum(p)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Demand Status
                            </label>
                            <Select
                                value={draft.status?.toUpperCase()}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, status: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    {statuses.map(s => (
                                        <SelectItem key={s} value={s?.toUpperCase()}>{formatEnum(s)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Demand Name
                            </label>
                            <Select
                                value={draft?.demandName || 'ALL'}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, demandName: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All Names" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Names</SelectItem>
                                    {demandNames.map(name => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Demand Type
                            </label>
                            <Select
                                value={draft?.demandType || 'ALL'}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, demandType: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    {demandTypes.map(type => (
                                        <SelectItem key={type} value={type}>{formatEnum(type)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500 ml-0.5">
                                Delivery Model
                            </label>
                            <Select
                                value={draft?.deliveryModel || 'ALL'}
                                onValueChange={(v) => setDraft(prev => ({ ...prev, deliveryModel: v }))}
                            >
                                <SelectTrigger className="h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-1 focus:ring-indigo-500">
                                    <SelectValue placeholder="All Models" />
                                </SelectTrigger>
                                <SelectContent className="z-[110]">
                                    <SelectItem value="ALL">All Models</SelectItem>
                                    {deliveryModels.map(model => (
                                        <SelectItem key={model} value={model}>{formatEnum(model)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 italic leading-relaxed">
                            Adjust filter criteria and click apply to refresh your demand pipeline.
                        </p>
                    </div>
                </div>

                {/* Footer - Identical to Admin Panel Actions */}
                <div className="p-3 border-t bg-slate-50 flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex-1 bg-white text-slate-500 border border-slate-200 py-2 rounded-lg text-[11px] font-bold hover:text-red-500 hover:border-red-100 transition-all active:scale-[0.98]"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-[2] bg-indigo-600 text-white py-2 rounded-lg text-[11px] font-bold shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        );
    }

    // Default view (Sidebar style) - Kept simple but aligned
    return (
        <div className="w-64 shrink-0 rounded-lg border bg-card flex flex-col shadow-sm h-full">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-700">
                        Filters
                    </h3>
                </div>
                {activeCount > 0 && (
                    <button
                        onClick={onReset}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6 overflow-y-auto">
                {/* Client Dropdown */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Client account
                    </label>
                    <Select value={clientFilter} onValueChange={onClientChange}>
                        <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Clients</SelectItem>
                            {clients.map(client => (
                                <SelectItem key={client} value={client}>{client}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Priority level
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {['ALL', ...priorities].map((p) => (
                            <button
                                key={p}
                                onClick={() => onPriorityChange(p)}
                                className={cn(
                                    "px-3 py-2 rounded-md text-[11px] font-semibold border transition-all text-left",
                                    priorityFilter?.toUpperCase() === p?.toUpperCase()
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                {p === 'ALL' ? 'All' : formatEnum(p)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Demand Status
                    </label>
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            {statuses.map(s => (
                                <SelectItem key={s} value={s}>{formatEnum(s)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Demand Name Selection */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Demand Name
                    </label>
                    <Select value={demandNameFilter} onValueChange={onDemandNameChange}>
                        <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="All Names" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Names</SelectItem>
                            {demandNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Demand Type Selection */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Demand Type
                    </label>
                    <Select value={demandTypeFilter} onValueChange={onDemandTypeChange}>
                        <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {demandTypes.map(type => (
                                <SelectItem key={type} value={type}>{formatEnum(type)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Delivery Model Selection */}
                <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-500 block">
                        Delivery Model
                    </label>
                    <Select value={deliveryModelFilter} onValueChange={onDeliveryModelChange}>
                        <SelectTrigger className="h-10 text-xs font-semibold bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="All Models" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Models</SelectItem>
                            {deliveryModels.map(model => (
                                <SelectItem key={model} value={model}>{formatEnum(model)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-auto p-4 border-t bg-slate-50/30">
                <p className="text-[10px] font-medium text-slate-400 italic leading-snug">
                    Use filters to refine the pipeline. Changes are reflected in real-time in sidebar mode.
                </p>
            </div>
        </div>
    );
};

export default DemandFilters;
