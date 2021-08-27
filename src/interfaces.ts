export interface DoctorObj  { 
    name: string, 
    phone: string, 
    position: string, 
    type: string, 
    email: string, 
    belong: string, 
    profile_image: string, 
    password: string, 
    address: string
}

export interface RequestObj{
    requester: string,
    requester_phone: string,
    requester_address: string,
    responder: string,
    status: string,
    appointment_status: string,
    appointment_date: string,
    request_date: number,
    questionnaire: string,
    patient_name: string,
    patient_chartid: string,
    patient_phone: string,
    patient_ssn: string,
    patient_sex: string,
    requester_note: string,
    responder_note: string,
    operator: string,
    img_url: string,
    isDeleted : boolean
}
