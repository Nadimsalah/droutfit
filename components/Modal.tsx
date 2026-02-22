import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#13171F] border border-gray-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {title && (
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                )}

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
