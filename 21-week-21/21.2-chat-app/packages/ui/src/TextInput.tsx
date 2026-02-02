"use client";

interface TextInputProps {
    placeholder: string;
    value: string;
    onChange(value: string): void;
    className?: string;
}

export function TextInput({ placeholder, value, onChange, className }: TextInputProps) {
    return (
        <input 
            type="text" 
            placeholder={placeholder} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} 
        />
    );
}