import { toast } from "sonner"

export function showToast({ show, label, description }: {show: string, label: string, description: string}){
    if (description == "success"){
        toast.success(`${show}`, {
            description: `${label}`
        })
    }
    else if (description == "error"){
        toast.error(`${show}`, {
            description: `${label}`
        })
    }
    else if (description == "info"){
        toast.info(`${show}`, {
            description: `${label}`
        })
    }
    else if (description == "none"){
        toast(`${show}`, {
            description: `${label}`
        })
    }
}