import React from "react" // Slider usually controlled
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, value, min = 0, max = 100, ...props }, ref) => {
    // Basic support for single or range slider (assuming 2 values for range)
    const val = value || [0]
    const percentage = ((val[0] - min) / (max - min)) * 100
    const endPercentage = val.length > 1 ? ((val[1] - min) / (max - min)) * 100 : percentage
    const width = val.length > 1 ? endPercentage - percentage : percentage
    const left = val.length > 1 ? percentage : 0

    return (
        <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
            <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                <div
                    className="absolute h-full bg-primary"
                    style={{ left: `${left}%`, width: `${width}%` }}
                />
            </div>
            {val.map((_, i) => (
                <div
                    key={i}
                    className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    style={{ left: `calc(${val.length > 1 && i === 0 ? percentage : endPercentage}% - 10px)` }}
                />
            ))}
        </div>
    )
})
Slider.displayName = "Slider"

export { Slider }
