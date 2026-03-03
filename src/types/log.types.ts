export interface ActivityLog {
    id: number
    description: string
    subject_type: string
    event: string
    causer: {
        name: string
        email: string
    } | null
    properties: {
        ip?: string
        old?: any
        attributes?: any
    }
    created_at: string
}