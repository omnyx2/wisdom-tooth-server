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
    responder: string,
    status: string,
    patient_name: string,
    patient_chartid: string,
    appointment_status: string,
    appointment_date: string,
    questionaire: string,
    patient_phone: string,
    request_date: string,
    requester_note: string,
    responder_note: string,
    patient_sex: string,
    read: string,
}
