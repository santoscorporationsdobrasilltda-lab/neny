import React, { createContext, useContext, useState, forwardRef } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext({})

const Tabs = forwardRef(({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
  const [selected, setSelected] = useState(defaultValue)
  const current = value !== undefined ? value : selected
  
  const handleChange = (val) => {
    if (onValueChange) {
      onValueChange(val)
    } else {
      setSelected(val)
    }
  }

  return (
    <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = forwardRef(({ className, value, disabled, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isActive = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-sm hover:text-slate-900",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = forwardRef(({ className, value, ...props }, ref) => {
  const { value: selectedValue } = useContext(TabsContext)
  
  if (selectedValue !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state="active"
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }