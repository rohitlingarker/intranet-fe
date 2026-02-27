import { useState, useEffect } from "react";
import { getAllEnums } from "../services/enumService";

// Simple module-level cache to share enums across components
let cachedEnums = null;
let enumsPromise = null;

/**
 * Hook to manage and provide dynamic enums fetched from the API.
 */
export const useEnums = () => {
    const [enums, setEnums] = useState(cachedEnums);
    const [loading, setLoading] = useState(!cachedEnums);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If already cached, no need to fetch
        if (cachedEnums) {
            setLoading(false);
            return;
        }

        // If a fetch is already in progress, wait for it
        if (!enumsPromise) {
            enumsPromise = getAllEnums()
                .then((res) => {
                    const enumMap = {};
                    if (res.success && Array.isArray(res.data)) {
                        res.data.forEach((item) => {
                            enumMap[item.enumName] = item.values;
                        });
                    }
                    cachedEnums = enumMap;
                    return enumMap;
                })
                .catch((err) => {
                    enumsPromise = null; // Reset on error so we can retry
                    throw err;
                });
        }

        enumsPromise
            .then((data) => {
                setEnums(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    /**
     * Get values for a specific enum by name.
     * @param {string} enumName - The name of the enum (e.g., 'DemandType')
     * @returns {string[]} Array of enum values
     */
    const getEnumValues = (enumName) => {
        return enums?.[enumName] || [];
    };

    return { enums, getEnumValues, loading, error };
};

export default useEnums;
