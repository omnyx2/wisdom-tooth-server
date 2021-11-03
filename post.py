# -*- coding: utf-8 -*-
"""
Created on Thu Jul 22 15:02:45 2021

@author: INVISION
"""

# Token

import requests, json
import time

# BaseURL = 'http://invisionlab.xyz:5007/wisdom-tooth-apis/'
BaseURL = 'http://localhost:5007/wisdom-tooth-apis/'
authHeaders = {'Content-Type': 'application/json; charset=utf-8'}
URL = BaseURL + 'auth'
data =  {    
        "phone": "01025902746",
        "password": "91579&ryuL"
        }

res = requests.post(URL, data=json.dumps(data), headers=authHeaders)
token = res.text

#print(res.status_code)
#print(res.text)

for i in range(5):
    
    getRequestHeaders = {
        "Accept": "application/json" ,
        "Content-Type": "application/json",
        "Authorization" : "Bearer " + token
    }
    
    URL = BaseURL + 'request'
    
    requester = "동현치과" + str(i)
    responder = "연세대학병원"
    requester_phone = "010-2222-2222"
    requester_address = "서울특별시 용산구 신촌동6가 88-1, 6층"
    patient_name = "김동현"  + str(i)
    patient_ssn = "870827-1234567"
    patient_phone = "010-1234-1234"
    patient_chartid = "1234" + str(i)
    patient_sex = "M"
    questionaire = [ "V0",
                    [True, "수술 받았습니다."],
                    [True, "받고 있습니다."],
                    [False, ""],
                    [True, "복용 중"],
                    [False, ""],
                    [False, ""],
                    ["고혈압", "당뇨병"], 
                    ["당화혈색소 : 3mm"],
                    ["임신", "호흡 곤란"],
                    ["기타사항 없습니다."]]
    medication = "복약정보"
    requester_note = "특이사항 없음"
    #request_date = int(time.time())
    img_url = 'invisionlab.kr/database/20210804/20210804104158_AIQUB.jpg'
    isDeleted = False
    data = {
        "requester":requester,
        "requester_address": requester_address,
        "responder":responder,
        "requester_phone": requester_phone,
        "patient_name":patient_name,
        "patient_ssn":patient_ssn,
        "patient_phone":patient_phone,
        "patient_chartid":patient_chartid,
        "patient_sex":patient_sex,
        "questionnaire":questionaire,
        "medication":medication,
        "requester_note":requester_note,
    #    "request_date":request_date,
        "img_url":img_url,
        "isDeleted": isDeleted
    }
    
    res = requests.post(URL, data=json.dumps(data), headers=getRequestHeaders)
    
    print(res.status_code)
    print(res.text)





