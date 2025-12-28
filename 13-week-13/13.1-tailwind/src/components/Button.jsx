export default function Button({ disabled, children, onClick }) {
    return (
        <button
            className={`inline-block text-white cursor-pointer px-8 py-2 m-2 rounded-md ${disabled ? "bg-blue-200" : "bg-green-400"}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
