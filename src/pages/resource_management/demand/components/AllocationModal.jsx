import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Percent, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchResources, resourceAllocation } from "../../services/resource";
import { toast } from 'react-toastify';
import { cn } from "@/lib/utils";

const AllocationModal = ({ isOpen, onClose, demand }) => {
    const [resources, setResources] = useState([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        resourceId: [],
        demandId: demand?.demandId || '',
        allocationStartDate: '',
        allocationEndDate: '',
        allocationPercentage: 100,
        allocationStatus: 'ACTIVE'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            const loadResources = async () => {
                setIsLoadingResources(true);
                try {
                    const response = await fetchResources();
                    if (response.success) {
                        setResources(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch resources", error);
                    toast.error("Failed to load resources");
                } finally {
                    setIsLoadingResources(false);
                }
            };
            loadResources();

            setFormData(prev => ({
                ...prev,
                demandId: demand?.demandId || '',
                resourceId: [] // Reset on open
            }));
            setErrors({});
            setSearchQuery("");
        }
    }, [isOpen, demand]);

    const toggleResource = (id) => {
        setFormData(prev => {
            const current = prev.resourceId;
            if (current.includes(id)) {
                return { ...prev, resourceId: current.filter(i => i !== id) };
            } else {
                return { ...prev, resourceId: [...current, id] };
            }
        });
    };

    const validate = () => {
        const newErrors = {};
        if (formData.resourceId.length === 0) newErrors.resourceId = 'At least one resource is required';
        if (!formData.allocationStartDate) newErrors.allocationStartDate = 'Start date is required';
        if (!formData.allocationEndDate) newErrors.allocationEndDate = 'End date is required';

        if (formData.allocationStartDate && formData.allocationEndDate) {
            if (new Date(formData.allocationEndDate) < new Date(formData.allocationStartDate)) {
                newErrors.allocationEndDate = 'End date cannot be earlier than start date';
            }
        }

        if (formData.allocationPercentage <= 0 || formData.allocationPercentage > 100) {
            newErrors.allocationPercentage = 'Percentage must be between 1 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const result = await resourceAllocation(formData);
            if (result.success) {
                toast.success(result.message || "Resources allocated successfully");
                onClose();
            } else {
                toast.error(result.message || "Allocation failed");
            }
        } catch (error) {
            console.error("Allocation error:", error);
            toast.error(error.response?.data?.message || "Failed to allocate resources");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredResources = resources.filter(res =>
        res.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.resourceRole.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                style={{ width: '80vh', maxWidth: '95vw', maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">Bulk Allocation</h2>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Multi-Resource Flow</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="allocation-form" onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Demand Name (Read-only) */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Demand Pipeline
                        </label>
                        <Input
                            value={demand?.demandName || 'N/A'}
                            readOnly
                            className="bg-slate-50 border-slate-200 font-bold text-slate-900 h-10 rounded-xl focus-visible:ring-0 cursor-not-allowed pl-4 text-xs"
                        />
                    </div>

                    {/* Multi-Resource Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3 text-indigo-500" /> Target Resources ({formData.resourceId.length})
                            </label>
                            {formData.resourceId.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, resourceId: [] }))}
                                    className="text-[9px] font-black text-rose-500 uppercase hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Input
                                placeholder="Filter resources by name or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 rounded-xl border-slate-200 text-xs pl-4 pr-10"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                <Loader2 className={cn("h-3.5 w-3.5 animate-spin", !isLoadingResources && "hidden")} />
                            </div>
                        </div>

                        {/* Resource List (Selectable) */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {isLoadingResources ? (
                                    <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-400" /></div>
                                ) : filteredResources.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-bold text-[10px] uppercase">No resources found</div>
                                ) : filteredResources.map((res) => {
                                    const isSelected = formData.resourceId.includes(res.resourceId);
                                    return (
                                        <button
                                            key={res.resourceId}
                                            type="button"
                                            onClick={() => toggleResource(res.resourceId)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-xl transition-all border group text-left",
                                                isSelected
                                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                    : "bg-white border-transparent hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className={cn("text-xs font-bold", isSelected ? "text-indigo-900" : "text-slate-700 group-hover:text-slate-900")}>
                                                    {res.resourceName}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {res.resourceRole}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
                                            )}>
                                                {isSelected && <X className="h-3 w-3 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {errors.resourceId && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.resourceId}</p>}
                    </div>

                    {/* Selected Tags Display */}
                    {formData.resourceId.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {formData.resourceId.map(id => {
                                const res = resources.find(r => r.resourceId === id);
                                if (!res) return null;
                                return (
                                    <div key={id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg animate-in zoom-in-50">
                                        <span className="text-[10px] font-bold text-indigo-700">{res.resourceName}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleResource(id)}
                                            className="text-indigo-400 hover:text-indigo-600"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-indigo-500" /> Start Date
                            </label>
                            <Input
                                type="date"
                                value={formData.allocationStartDate}
                                onChange={(e) => setFormData({ ...formData, allocationStartDate: e.target.value })}
                                className={cn("h-10 rounded-xl border-slate-200 font-bold text-slate-900 text-xs", errors.allocationStartDate && "border-rose-500")}
                            />
                            {errors.allocationStartDate && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{errors.allocationStartDate}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-indigo-500" /> End Date
                            </label>
                            <Input
                                type="date"
                                value={formData.allocationEndDate}
                                onChange={(e) => setFormData({ ...formData, allocationEndDate: e.target.value })}
                                className={cn("h-10 rounded-xl border-slate-200 font-bold text-slate-900 text-xs", errors.allocationEndDate && "border-rose-500")}
                            />
                            {errors.allocationEndDate && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{errors.allocationEndDate}</p>}
                        </div>
                    </div>

                    {/* Percentage & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Percent className="h-3 w-3 text-indigo-500" /> Allocation %
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.allocationPercentage}
                                    onChange={(e) => setFormData({ ...formData, allocationPercentage: parseInt(e.target.value) || 0 })}
                                    className={cn("h-10 rounded-xl border-slate-200 font-bold text-slate-900 pr-8 text-xs", errors.allocationPercentage && "border-rose-500")}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">%</span>
                            </div>
                            {errors.allocationPercentage && <p className="text-[9px] font-bold text-rose-500 mt-0.5">{errors.allocationPercentage}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-3 w-3 text-indigo-500" /> Status
                            </label>
                            <Select
                                value={formData.allocationStatus}
                                onValueChange={(val) => setFormData({ ...formData, allocationStatus: val })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200 font-bold text-slate-900 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLANNED">PLANNED</SelectItem>
                                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                    <SelectItem value="ENDED">ENDED</SelectItem>
                                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-10 rounded-xl border-slate-200 font-bold tracking-widest text-[10px] hover:bg-white text-slate-500"
                    >
                        CANCEL
                    </Button>
                    <Button
                        form="allocation-form"
                        disabled={isSubmitting}
                        className="flex-[2] h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest text-[10px] shadow-xl shadow-indigo-600/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                PROCESSING...
                            </>
                        ) : (
                            `ALLOCATE ${formData.resourceId.length || ''} RESOURCE${formData.resourceId.length !== 1 ? 'S' : ''}`
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AllocationModal;
