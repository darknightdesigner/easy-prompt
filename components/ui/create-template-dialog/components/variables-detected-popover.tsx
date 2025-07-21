/**
 * Variables Detected Popover Component
 * Shows all detected variables and allows users to edit their names
 */

"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { isValidVariableName } from "@/lib/prompt-variables"

interface VariablesDetectedPopoverProps {
  variables: string[]
  onRenameVariable: (oldName: string, newName: string) => void
  disabled?: boolean
  trigger?: React.ReactNode
}

export function VariablesDetectedPopover({ 
  variables, 
  onRenameVariable, 
  disabled = false,
  trigger 
}: VariablesDetectedPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingVariable && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingVariable])

  // Reset editing state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setEditingVariable(null)
      setEditValue("")
      setError("")
    }
  }, [isOpen])

  const startEditing = (variableName: string) => {
    setEditingVariable(variableName)
    setEditValue(variableName)
    setError("")
  }

  const cancelEditing = () => {
    setEditingVariable(null)
    setEditValue("")
    setError("")
  }

  const handleSaveEdit = () => {
    const trimmedName = editValue.trim()
    
    if (!trimmedName) {
      setError("Variable name is required")
      return
    }
    
    if (!isValidVariableName(trimmedName)) {
      setError("Only use letters, numbers, and underscores (no spaces)")
      return
    }
    
    if (trimmedName !== editingVariable && variables.includes(trimmedName)) {
      setError("Variable name already exists")
      return
    }
    
    // Only rename if the name actually changed
    if (trimmedName !== editingVariable && editingVariable) {
      onRenameVariable(editingVariable, trimmedName)
    }
    
    // Reset editing state
    setEditingVariable(null)
    setEditValue("")
    setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEditValue(value)
    
    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  if (variables.length === 0) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground hover:text-foreground h-auto p-0"
            disabled={disabled}
          >
            Variables detected: {variables.length}
            <Icon name="caret-down" className="size-3" />
          </Button>
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-2 rounded-3xl" align="start">
        <div className="space-y-3">
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {variables.map((variable, index) => (
              <div 
                key={index}
                className="flex items-center rounded-3xl border p-2"
              >
                {editingVariable === variable ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="variable_name"
                      className="text-default"
                      maxLength={50}
                    />
                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}
                    <div className="flex gap-1 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="default"
                        onClick={cancelEditing}
                        className="px-2 text-xs"
                      >
                        <Icon name="x" className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={handleSaveEdit}
                        className="px-2 text-xs"
                      >
                        <Icon name="check" className="size-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <code className="text-sm font-mono text-primary px-1.5">
                        {`{{ ${variable} }}`}
                      </code>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(variable)}
                      className=""
                    >
                      <Icon name="pencil" className="" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {variables.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No variables detected
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
