/**
 * Add Variable Popover Component
 * Allows users to quickly add variables to their template
 */

"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { isValidVariableName } from "@/lib/prompt-variables"

interface AddVariablePopoverProps {
  onAddVariable: (variableName: string) => void
  disabled?: boolean
}

export function AddVariablePopover({ onAddVariable, disabled = false }: AddVariablePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [variableName, setVariableName] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setVariableName("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = variableName.trim()
    
    if (!trimmedName) {
      setError("Variable name is required")
      return
    }
    
    if (!isValidVariableName(trimmedName)) {
      setError("Only use letters, numbers, and underscores (no spaces)")
      return
    }
    
    // Add the variable
    onAddVariable(trimmedName)
    
    // Close popover and reset
    setIsOpen(false)
    setVariableName("")
    setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setVariableName(value)
    
    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 shadow-none"
          disabled={disabled}
        >
          <Icon name="plus" className="size-3.5" />
          Add Variable
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-3 rounded-3xl" align="start">
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="space-y-2">
            <Input
              ref={inputRef}
              value={variableName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="your_variable_here"
              className="text-sm"
              maxLength={50}
            />
            
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
          
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="shadow-none"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              size="sm"
              className="shadow-none"
              disabled={!variableName.trim()}
            >
              <Icon name="plus" className="size-3.5 mr-1" />
              Add Variable
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
