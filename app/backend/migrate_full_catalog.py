#!/usr/bin/env python3

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

# Full catalog structure with Russian and English names
FULL_CATALOG = [
    {
        "name": "Ультразвуковая диагностика",
        "name_en": "Ultrasound Diagnostics",
        "slug": "ultrasound",
        "description": "Профессиональное оборудование для ультразвуковой диагностики",
        "description_en": "Professional equipment for ultrasound diagnostics",
        "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
        "children": [
            {
                "name": "УЗИ аппараты",
                "name_en": "Ultrasound Machines",
                "slug": "uzi-devices",
                "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
                "children": [
                    {"name": "УЗИ аппараты Mindray", "name_en": "Mindray Ultrasound", "slug": "uzi-mindray"},
                    {"name": "УЗИ аппараты Samsung", "name_en": "Samsung Ultrasound", "slug": "uzi-samsung"},
                    {"name": "УЗИ аппараты Canon", "name_en": "Canon Ultrasound", "slug": "uzi-canon"},
                    {"name": "УЗИ аппараты GE", "name_en": "GE Ultrasound", "slug": "uzi-ge"},
                    {"name": "УЗИ аппараты Philips", "name_en": "Philips Ultrasound", "slug": "uzi-philips"},
                    {"name": "УЗИ аппараты Fujifilm", "name_en": "Fujifilm Ultrasound", "slug": "uzi-fujifilm"},
                    {"name": "Портативные УЗИ аппараты", "name_en": "Portable Ultrasound", "slug": "uzi-portable"},
                    {"name": "Экспертные УЗИ аппараты", "name_en": "Expert Ultrasound", "slug": "uzi-expert"},
                    {"name": "ПРЕМИУМ УЗИ аппараты", "name_en": "Premium Ultrasound", "slug": "uzi-premium"},
                ]
            },
            {
                "name": "УЗИ датчики",
                "name_en": "Ultrasound Probes",
                "slug": "uzi-probes",
                "image": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop",
                "children": [
                    {"name": "Линейные", "name_en": "Linear", "slug": "linear"},
                    {"name": "Конвексные", "name_en": "Convex", "slug": "convex"},
                    {"name": "Секторные фазированные", "name_en": "Phased Array", "slug": "phased-array"},
                    {"name": "Микроконвексные", "name_en": "Microconvex", "slug": "microconvex"},
                    {"name": "Внутриполостные", "name_en": "Endocavity", "slug": "intracavity"},
                    {"name": "Чреспищеводные", "name_en": "Transesophageal", "slug": "transesophageal"},
                    {"name": "Карандашные", "name_en": "Pencil", "slug": "pencil"},
                    {"name": "Датчики УЗИ Mindray", "name_en": "Mindray Probes", "slug": "probes-mindray"},
                    {"name": "Датчики УЗИ Samsung", "name_en": "Samsung Probes", "slug": "probes-samsung"},
                    {"name": "Датчики УЗИ Canon", "name_en": "Canon Probes", "slug": "probes-canon"},
                ]
            },
            {"name": "Тележки для УЗИ", "name_en": "Ultrasound Carts", "slug": "uzi-carts"},
            {"name": "Принтеры для УЗИ", "name_en": "Ultrasound Printers", "slug": "uzi-printers"},
            {"name": "Ультразвуковые денситометры", "name_en": "Ultrasound Densitometers", "slug": "densitometers"},
        ]
    },
    {
        "name": "Гибкая эндоскопия",
        "name_en": "Flexible Endoscopy",
        "slug": "flexible-endoscopy",
        "description": "Оборудование для гибкой эндоскопии",
        "description_en": "Equipment for flexible endoscopy",
        "image": "https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=400&fit=crop",
        "children": [
            {"name": "Видеоэндоскопические системы", "name_en": "Video Endoscopy Systems", "slug": "video-endoscopy"},
            {"name": "Шкафы для эндоскопов", "name_en": "Endoscope Cabinets", "slug": "endoscope-cabinets"},
            {"name": "Мойки для эндоскопов", "name_en": "Endoscope Washers", "slug": "endoscope-washers"},
            {"name": "Инсуффляторы эндоскопические", "name_en": "Endoscopic Insufflators", "slug": "endo-insufflators"},
            {"name": "Аспираторы-ирригаторы эндоскопические", "name_en": "Endoscopic Aspirator-Irrigators", "slug": "endo-aspirators"},
            {"name": "Эндоскопические ирригационные помпы", "name_en": "Endoscopic Irrigation Pumps", "slug": "endo-pumps"},
            {"name": "Емкости для воды гибких эндоскопов", "name_en": "Water Containers for Endoscopes", "slug": "water-containers"},
            {"name": "Течеискатели и тестеры герметичности", "name_en": "Leak Testers", "slug": "leak-testers"},
            {"name": "Эндоскопические смотровые столы", "name_en": "Endoscopic Examination Tables", "slug": "examination-tables"},
            {"name": "Видеопроцессоры эндоскопические", "name_en": "Endoscopic Video Processors", "slug": "video-processors"},
            {"name": "Источники света", "name_en": "Light Sources", "slug": "light-sources"},
            {"name": "Мониторы эндоскопические", "name_en": "Endoscopy Monitors", "slug": "endoscopy-monitors"},
            {
                "name": "Эндоскопы",
                "name_en": "Endoscopes",
                "slug": "endoscopes",
                "children": [
                    {"name": "Гастроскопы", "name_en": "Gastroscopes", "slug": "gastroscopes"},
                    {"name": "Колоноскопы", "name_en": "Colonoscopes", "slug": "colonoscopes"},
                    {"name": "Бронхоскопы", "name_en": "Bronchoscopes", "slug": "bronchoscopes"},
                    {"name": "Риноларингоскопы", "name_en": "Rhinolaryngoscopes", "slug": "rhinolaryngoscopes"},
                    {"name": "Дуоденоскопы", "name_en": "Duodenoscopes", "slug": "duodenoscopes"},
                    {"name": "Сигмоидоскопы", "name_en": "Sigmoidoscopes", "slug": "sigmoidoscopes"},
                    {"name": "Гистероскопы", "name_en": "Hysteroscopes", "slug": "hysteroscopes"},
                    {"name": "Уретроскопы", "name_en": "Ureteroscopes", "slug": "ureteroscopes"},
                    {"name": "Холедохоскопы", "name_en": "Choledochoscopes", "slug": "choledochoscopes"},
                    {"name": "Цистоскопы", "name_en": "Cystoscopes", "slug": "cystoscopes"},
                    {"name": "Энтероскопы", "name_en": "Enteroscopes", "slug": "enteroscopes"},
                ]
            },
            {"name": "Тележки эндоскопические", "name_en": "Endoscopic Carts", "slug": "endo-carts"},
        ]
    },
    {
        "name": "Жёсткая эндоскопия",
        "name_en": "Rigid Endoscopy",
        "slug": "rigid-endoscopy",
        "description": "Оборудование для жёсткой эндоскопии",
        "description_en": "Equipment for rigid endoscopy",
        "image": "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop",
        "children": [
            {"name": "Эндоскопические стойки", "name_en": "Endoscopy Racks", "slug": "endoscopy-racks"},
            {"name": "Видеопроцессоры для жесткой эндоскопии", "name_en": "Video Processors for Rigid Endoscopy", "slug": "rigid-video-processors"},
            {"name": "Осветители эндоскопические", "name_en": "Endoscope Illuminators", "slug": "endoscope-illuminators"},
            {"name": "Мониторы", "name_en": "Monitors", "slug": "rigid-monitors"},
            {"name": "Электрохирургические блоки для эндоскопии", "name_en": "Electrosurgical Units for Endoscopy", "slug": "electrosurgical-blocks"},
            {"name": "Инсуффляторы", "name_en": "Insufflators", "slug": "rigid-insufflators"},
            {"name": "Аспираторы-ирригаторы", "name_en": "Aspirator-Irrigators", "slug": "rigid-aspirators"},
            {"name": "Помпы для эндоскопических операций", "name_en": "Surgery Pumps", "slug": "surgery-pumps"},
            {"name": "Мобильные тележки", "name_en": "Mobile Carts", "slug": "mobile-carts"},
        ]
    },
    {
        "name": "Лучевая диагностика",
        "name_en": "Radiology",
        "slug": "radiology",
        "description": "Рентгеновское и томографическое оборудование",
        "description_en": "X-ray and tomographic equipment",
        "image": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
        "children": [
            {"name": "Рентгеновские аппараты", "name_en": "X-Ray Machines", "slug": "xray"},
            {"name": "Палатные рентген аппараты", "name_en": "Ward X-Ray Machines", "slug": "ward-xray"},
            {"name": "Портативные рентген аппараты", "name_en": "Portable X-Ray Machines", "slug": "portable-xray"},
            {"name": "Рентген аппараты типа С-дуга", "name_en": "C-Arm X-Ray Machines", "slug": "c-arm"},
            {"name": "Маммографы", "name_en": "Mammographs", "slug": "mammographs"},
            {"name": "Флюорографы", "name_en": "Fluorographs", "slug": "fluorographs"},
            {"name": "Ангиографы", "name_en": "Angiographs", "slug": "angiographs"},
            {"name": "Аппараты КТ", "name_en": "CT Scanners", "slug": "ct-scanners"},
            {"name": "Ядерная медицина", "name_en": "Nuclear Medicine", "slug": "nuclear-medicine"},
            {"name": "Денситометры", "name_en": "Densitometers", "slug": "xray-densitometers"},
        ]
    },
    {
        "name": "Анестезиология и реанимация",
        "name_en": "Anesthesiology and Resuscitation",
        "slug": "anesthesiology",
        "description": "Оборудование для анестезиологии и интенсивной терапии",
        "description_en": "Equipment for anesthesiology and intensive care",
        "image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
        "children": [
            {"name": "Аппараты ИВЛ", "name_en": "Ventilators", "slug": "ventilators"},
            {"name": "Наркозно-дыхательные аппараты", "name_en": "Anesthesia Machines", "slug": "anesthesia-machines"},
            {"name": "Седация", "name_en": "Sedation", "slug": "sedation"},
            {"name": "Мониторы пациента", "name_en": "Patient Monitors", "slug": "patient-monitors"},
            {"name": "Инфузионные насосы", "name_en": "Infusion Pumps", "slug": "infusion-pumps"},
            {"name": "Дефибрилляторы", "name_en": "Defibrillators", "slug": "defibrillators"},
            {"name": "Концентраторы кислорода", "name_en": "Oxygen Concentrators", "slug": "oxygen-concentrators"},
            {"name": "Инкубаторы для новорожденных", "name_en": "Incubators for Newborns", "slug": "incubators"},
        ]
    },
    {
        "name": "Хирургическое оборудование",
        "name_en": "Surgical Equipment",
        "slug": "surgery",
        "description": "Профессиональное хирургическое оборудование",
        "description_en": "Professional surgical equipment",
        "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
        "children": [
            {"name": "Операционные столы", "name_en": "Operating Tables", "slug": "tables"},
            {"name": "Светильники хирургические", "name_en": "Surgical Lights", "slug": "surgical-lights"},
            {"name": "Консоли хирургические (потолочные)", "name_en": "Surgical Pendants", "slug": "surgical-pendants"},
            {"name": "Отсасыватели хирургические", "name_en": "Surgical Aspirators", "slug": "surgical-aspirators"},
            {"name": "Аппараты электрохирургические", "name_en": "Electrosurgical Units", "slug": "electrosurgical"},
            {"name": "Операционные микроскопы", "name_en": "Surgical Microscopes", "slug": "surgical-microscopes"},
            {"name": "Видеокамеры для операционных светильников", "name_en": "Surgical Cameras", "slug": "surgical-cameras"},
            {"name": "Ультразвуковые хирургические аппараты", "name_en": "Ultrasonic Surgical Devices", "slug": "ultrasonic-surgery"},
            {"name": "Инсуффляторы хирургические", "name_en": "Surgical Insufflators", "slug": "surgical-insufflators"},
            {"name": "Лазеры хирургические", "name_en": "Surgical Lasers", "slug": "surgical-lasers"},
            {"name": "Перевязочные столы", "name_en": "Dressing Tables", "slug": "dressing-tables"},
            {"name": "Системы хирургической навигации", "name_en": "Surgical Navigation Systems", "slug": "surgical-navigation"},
            {"name": "Эвакуаторы дыма", "name_en": "Smoke Evacuators", "slug": "smoke-evacuators"},
            {"name": "Аксессуары для операционных столов", "name_en": "Operating Table Accessories", "slug": "table-accessories"},
        ]
    },
    {
        "name": "ЛОР-оборудование",
        "name_en": "ENT Equipment",
        "slug": "ent",
        "description": "Оборудование для отоларингологии",
        "description_en": "Equipment for otolaryngology",
        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
        "children": [
            {"name": "ЛОР-комбайны", "name_en": "ENT Workstations", "slug": "lor-combines"},
            {"name": "ЛОР-кресла", "name_en": "ENT Chairs", "slug": "lor-chairs"},
            {"name": "ЛОР-видеосистемы", "name_en": "ENT Video Systems", "slug": "lor-video"},
            {"name": "Эндоскопы для ЛОР", "name_en": "ENT Endoscopes", "slug": "lor-endoscopes"},
            {"name": "Дополнительное ЛОР-оборудование", "name_en": "Additional ENT Equipment", "slug": "lor-accessories"},
            {"name": "Эхосинускопы", "name_en": "Echosinuscopes", "slug": "echosinuscopes"},
            {"name": "Налобные осветители", "name_en": "Headlights", "slug": "headlights"},
            {"name": "Массажеры (ЛОР)", "name_en": "ENT Massagers", "slug": "lor-massagers"},
            {"name": "УЗ ЛОР аппараты", "name_en": "ENT Ultrasound Devices", "slug": "lor-ultrasound"},
            {"name": "Футляры для стерилизации", "name_en": "Sterilization Cases", "slug": "sterilization-cases"},
            {"name": "ИК-излучатели", "name_en": "IR Emitters", "slug": "ir-emitters"},
            {"name": "ЛОР-небулайзеры", "name_en": "ENT Nebulizers", "slug": "lor-nebulizers"},
            {"name": "ЛОР-микроскопы", "name_en": "ENT Microscopes", "slug": "lor-microscopes"},
            {"name": "Аппараты ЭХВЧ для ЛОР", "name_en": "ENT EHVCH Devices", "slug": "lor-ehvch"},
            {"name": "ЛОР-аспираторы", "name_en": "ENT Aspirators", "slug": "lor-aspirators"},
            {"name": "ЛОР-ирригаторы", "name_en": "ENT Irrigators", "slug": "lor-irrigators"},
            {"name": "Ларингостробоскопы", "name_en": "Laryngostroboscopes", "slug": "laryngostroboscopes"},
            {"name": "Эвакуаторы дыма (ЛОР)", "name_en": "Smoke Evacuators (ENT)", "slug": "lor-smoke-evacuators"},
            {"name": "Системы для исследования вестибулярного аппарата", "name_en": "Vestibular Examination Systems", "slug": "vestibular-systems"},
        ]
    },
    {
        "name": "Магнитно-резонансная томография",
        "name_en": "MRI",
        "slug": "mri",
        "description": "Аппараты и оборудование для МРТ",
        "description_en": "MRI machines and equipment",
        "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
        "children": [
            {"name": "Аппараты МРТ", "name_en": "MRI Machines", "slug": "mri-machines"},
            {"name": "Катушки для МРТ", "name_en": "MRI Coils", "slug": "mri-coils"},
            {
                "name": "Дополнительное оборудование для МРТ",
                "name_en": "Additional MRI Equipment",
                "slug": "mri-accessories",
                "children": [
                    {"name": "Термопринтеры для МРТ", "name_en": "MRI Thermal Printers", "slug": "mri-printers"},
                    {"name": "Мониторы для рентгенологии / МРТ", "name_en": "Radiology/MRI Monitors", "slug": "mri-monitors"},
                    {"name": "Инжекторы для МРТ аппаратов", "name_en": "MRI Injectors", "slug": "mri-injectors"},
                    {"name": "ИБП для МРТ аппаратов", "name_en": "MRI UPS", "slug": "mri-ups"},
                    {"name": "Программное обеспечение для МРТ", "name_en": "MRI Software", "slug": "mri-software"},
                    {"name": "Серверы хранения данных для МРТ", "name_en": "MRI Data Storage Servers", "slug": "mri-servers"},
                    {"name": "Мониторы пациента для МРТ", "name_en": "MRI Patient Monitors", "slug": "mri-patient-monitors"},
                ]
            },
        ]
    },
    {
        "name": "Гинекологическое оборудование",
        "name_en": "Gynecological Equipment",
        "slug": "gynecology",
        "description": "Оборудование для гинекологии и акушерства",
        "description_en": "Equipment for gynecology and obstetrics",
        "image": "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=600&h=400&fit=crop",
        "children": [
            {"name": "Гинекологические кресла", "name_en": "Gynecological Chairs", "slug": "chairs"},
            {"name": "Кольпоскопы", "name_en": "Colposcopes", "slug": "colposcopes"},
            {"name": "Фетальные мониторы", "name_en": "Fetal Monitors", "slug": "fetal-monitors"},
            {"name": "Отсасыватели гинекологические", "name_en": "Gynecological Aspirators", "slug": "gyn-aspirators"},
            {"name": "Аппараты ЭХВЧ для гинекологии", "name_en": "Gynecological EHVCH Devices", "slug": "gyn-ehvch"},
            {"name": "Гинекологические светильники", "name_en": "Gynecological Lights", "slug": "gyn-lights"},
            {"name": "Хирургические УЗ-аппараты", "name_en": "Surgical Ultrasound Devices", "slug": "gyn-ultrasound"},
            {"name": "Лазеры для гинекологии", "name_en": "Gynecological Lasers", "slug": "gyn-lasers"},
            {"name": "Гинекологические комбайны", "name_en": "Gynecological Workstations", "slug": "gyn-combines"},
            {"name": "Акушерские кровати", "name_en": "Obstetric Beds", "slug": "obstetric-beds"},
            {"name": "Гинекологические столы", "name_en": "Gynecological Tables", "slug": "gyn-tables"},
        ]
    },
    {
        "name": "Реабилитационное оборудование",
        "name_en": "Rehabilitation Equipment",
        "slug": "rehabilitation",
        "description": "Оборудование для реабилитации пациентов",
        "description_en": "Equipment for patient rehabilitation",
        "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
        "children": [
            {"name": "Аппараты механотерапии", "name_en": "Mechanotherapy Devices", "slug": "mechanotherapy"},
            {"name": "Вертикализаторы", "name_en": "Verticalizers", "slug": "verticalizers"},
            {"name": "Подъёмники для инвалидов", "name_en": "Patient Lifts", "slug": "patient-lifts"},
            {"name": "Тренажёры для кинезитерапии", "name_en": "Kinesiotherapy Trainers", "slug": "kinesiotherapy"},
            {"name": "Экзоскелеты", "name_en": "Exoskeletons", "slug": "exoskeletons"},
            {"name": "Системы виртуальной реабилитации", "name_en": "VR Rehabilitation Systems", "slug": "vr-rehab"},
            {"name": "Системы вытяжения позвоночника", "name_en": "Spine Traction Systems", "slug": "spine-traction"},
            {"name": "Аппараты коррекции фигуры", "name_en": "Body Correction Devices", "slug": "body-correction"},
        ]
    },
    {
        "name": "Физиотерапия",
        "name_en": "Physiotherapy",
        "slug": "physiotherapy",
        "description": "Физиотерапевтическое оборудование",
        "description_en": "Physiotherapy equipment",
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
        "children": [
            {"name": "Аппараты УВТ", "name_en": "Shockwave Therapy Devices", "slug": "uvt"},
            {"name": "Аппараты для магнитотерапии", "name_en": "Magnetotherapy Devices", "slug": "magnetotherapy"},
            {"name": "Аппараты лазерной терапии", "name_en": "Laser Therapy Devices", "slug": "laser-therapy"},
            {"name": "Аппараты для прессотерапии и лимфодренажа", "name_en": "Pressotherapy Devices", "slug": "pressotherapy"},
            {"name": "Аппараты микроволновой терапии", "name_en": "Microwave Therapy Devices", "slug": "microwave-therapy"},
            {"name": "Аппараты для электротерапии", "name_en": "Electrotherapy Devices", "slug": "electrotherapy"},
            {"name": "Аппараты ультразвуковой терапии", "name_en": "Ultrasound Therapy Devices", "slug": "ultrasound-therapy"},
            {"name": "Аппараты для диатермии", "name_en": "Diathermy Devices", "slug": "diathermy"},
        ]
    },
    {
        "name": "Функциональная диагностика",
        "name_en": "Functional Diagnostics",
        "slug": "functional-diagnostics",
        "description": "Оборудование для функциональной диагностики",
        "description_en": "Equipment for functional diagnostics",
        "image": "https://images.unsplash.com/photo-1559757175-7b21e7e20a8d?w=600&h=400&fit=crop",
        "children": [
            {"name": "Электрокардиографы", "name_en": "Electrocardiographs", "slug": "ecg"},
            {"name": "Пульсоксиметры", "name_en": "Pulse Oximeters", "slug": "pulse-oximeters"},
            {"name": "Спирометры медицинские", "name_en": "Medical Spirometers", "slug": "spirometers"},
        ]
    },
    {
        "name": "Лабораторная диагностика",
        "name_en": "Laboratory Diagnostics",
        "slug": "laboratory",
        "description": "Лабораторное оборудование и анализаторы",
        "description_en": "Laboratory equipment and analyzers",
        "image": "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop",
        "children": [
            {"name": "Биохимические анализаторы", "name_en": "Biochemistry Analyzers", "slug": "biochemistry-analyzers"},
            {"name": "Гематологические анализаторы", "name_en": "Hematology Analyzers", "slug": "hematology-analyzers"},
            {"name": "Коагулометры", "name_en": "Coagulometers", "slug": "coagulometers"},
            {"name": "Иммунохимические анализаторы", "name_en": "Immunochemistry Analyzers", "slug": "immunochemistry-analyzers"},
            {"name": "Анализаторы электролитов и газов крови", "name_en": "Blood Gas Analyzers", "slug": "blood-gas-analyzers"},
            {"name": "Анализаторы мочи", "name_en": "Urine Analyzers", "slug": "urine-analyzers"},
            {"name": "Анализаторы глюкозы, лактата и гемоглобина", "name_en": "Glucose/Lactate/Hemoglobin Analyzers", "slug": "glucose-analyzers"},
            {"name": "Аппараты визуализации вен", "name_en": "Vein Finders", "slug": "vein-finders"},
            {"name": "Лабораторные микроскопы", "name_en": "Laboratory Microscopes", "slug": "lab-microscopes"},
            {"name": "Оборудование для жидкостной цитологии", "name_en": "Liquid Cytology Equipment", "slug": "cytology-equipment"},
        ]
    },
    {
        "name": "Стоматология",
        "name_en": "Dentistry",
        "slug": "dentistry",
        "description": "Стоматологическое оборудование",
        "description_en": "Dental equipment",
        "image": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop",
        "children": [
            {"name": "Стоматологические кресла", "name_en": "Dental Chairs", "slug": "dental-chairs"},
            {"name": "Стоматологические светильники", "name_en": "Dental Lights", "slug": "dental-lights"},
            {"name": "Эндомоторы", "name_en": "Endomotors", "slug": "endomotors"},
            {"name": "Скалеры ультразвуковые", "name_en": "Ultrasonic Scalers", "slug": "scalers"},
            {"name": "Стоматологические микроскопы", "name_en": "Dental Microscopes", "slug": "dental-microscopes"},
            {"name": "Аксессуары и принадлежности для стоматологии", "name_en": "Dental Accessories", "slug": "dental-accessories"},
        ]
    },
    {
        "name": "Офтальмология",
        "name_en": "Ophthalmology",
        "slug": "ophthalmology",
        "description": "Офтальмологическое оборудование",
        "description_en": "Ophthalmological equipment",
        "image": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=400&fit=crop",
        "children": [
            {"name": "Офтальмологические установки", "name_en": "Ophthalmology Units", "slug": "ophthalmology-units"},
            {"name": "Щелевые лампы", "name_en": "Slit Lamps", "slug": "slit-lamps"},
            {"name": "Фундус-камеры", "name_en": "Fundus Cameras", "slug": "fundus-cameras"},
            {"name": "Тонометры офтальмологические", "name_en": "Ophthalmic Tonometers", "slug": "tonometers"},
            {"name": "Лампы офтальмологические", "name_en": "Ophthalmic Lamps", "slug": "ophthalmic-lamps"},
            {"name": "Вспомогательное оборудование для офтальмологии", "name_en": "Ophthalmic Accessories", "slug": "ophthalmic-accessories"},
        ]
    },
]

# Sample products with bilingual data
SAMPLE_PRODUCTS = [
    {
        "name": "Mindray DC-60 Pro X-Insight",
        "name_en": "Mindray DC-60 Pro X-Insight",
        "slug": "mindray-dc-60-pro-x-insight",
        "sku": "UZI-MDR-001",
        "category_slug": "ultrasound",
        "subcategory_slug": "uzi-devices",
        "price": 850000,
        "price_usd": 78000,
        "old_price": 950000,
        "brand": "Mindray",
        "main_image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
        "images": [],
        "description": """<p>Ультразвуковая диагностическая система экспертного класса Mindray DC-60 Pro X-Insight представляет собой передовое решение для комплексной диагностики.</p>
        <h3>Особенности:</h3>
        <ul>
            <li>21.5-дюймовый сенсорный LED монитор высокого разрешения</li>
            <li>До 4 активных портов для датчиков</li>
            <li>Технология X-Insight для улучшенной визуализации</li>
            <li>Широкий спектр приложений: абдоминальные исследования, акушерство, гинекология, кардиология</li>
        </ul>""",
        "description_en": """<p>Expert-class ultrasound diagnostic system Mindray DC-60 Pro X-Insight is an advanced solution for comprehensive diagnostics.</p>
        <h3>Features:</h3>
        <ul>
            <li>21.5-inch touch LED monitor with high resolution</li>
            <li>Up to 4 active probe ports</li>
            <li>X-Insight technology for enhanced visualization</li>
            <li>Wide range of applications: abdominal, obstetrics, gynecology, cardiology</li>
        </ul>""",
        "specs": {
            "Бренд": "Mindray",
            "Тип": "Стационарный",
            "Класс": "Экспертный",
            "Область применения": "Общая визуализация",
            "Количество разъемов для датчиков": "4",
            "Страна": "КНР"
        },
        "in_stock": True,
        "is_new": True,
        "is_popular": True
    },
    {
        "name": "Samsung HS60",
        "name_en": "Samsung HS60",
        "slug": "samsung-hs60",
        "sku": "UZI-SAM-002",
        "category_slug": "ultrasound",
        "subcategory_slug": "uzi-devices",
        "price": 720000,
        "price_usd": 66000,
        "brand": "Samsung",
        "main_image": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop",
        "images": [],
        "description": "<p>Универсальная ультразвуковая система Samsung HS60 высокого класса для различных клинических применений.</p>",
        "description_en": "<p>Universal high-class ultrasound system Samsung HS60 for various clinical applications.</p>",
        "specs": {
            "Бренд": "Samsung",
            "Тип": "Стационарный",
            "Класс": "Высокий",
            "Область применения": "Кардиология",
            "Количество разъемов для датчиков": "3",
            "Страна": "Южная Корея"
        },
        "in_stock": True,
        "is_new": False,
        "is_popular": True
    },
    {
        "name": "Линейный датчик L12-3s",
        "name_en": "Linear Probe L12-3s",
        "slug": "linear-probe-l12-3s",
        "sku": "PRB-LIN-001",
        "category_slug": "ultrasound",
        "subcategory_slug": "uzi-probes",
        "third_level_slug": "linear",
        "price": 85000,
        "price_usd": 7800,
        "brand": "Mindray",
        "main_image": "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop",
        "images": [],
        "description": "<p>Высокочастотный линейный датчик L12-3s для поверхностных исследований, маммографии и сосудистых исследований.</p>",
        "description_en": "<p>High-frequency linear probe L12-3s for superficial examinations, mammography and vascular studies.</p>",
        "specs": {
            "Бренд": "Mindray",
            "Тип датчика": "Линейный",
            "Область применения": "Ангиология",
            "Страна": "КНР"
        },
        "in_stock": True,
        "is_new": False,
        "is_popular": False
    },
    {
        "name": "Операционный стол OT-500",
        "name_en": "Operating Table OT-500",
        "slug": "operating-table-ot-500",
        "sku": "SRG-TBL-001",
        "category_slug": "surgery",
        "subcategory_slug": "tables",
        "price": 450000,
        "price_usd": 41000,
        "old_price": 520000,
        "brand": "Mindray",
        "main_image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
        "images": [],
        "description": "<p>Универсальный операционный стол OT-500 с электроприводом для различных хирургических вмешательств.</p>",
        "description_en": "<p>Universal electric operating table OT-500 for various surgical interventions.</p>",
        "specs": {
            "Бренд": "Mindray",
            "Тип конструкции": "Стационарный",
            "Назначение": "Общая хирургия",
            "Рентгенопрозрачность": "Да",
            "Максимальная нагрузка (кг)": "300-400",
            "Страна": "КНР"
        },
        "in_stock": True,
        "is_new": True,
        "is_popular": True
    },
    {
        "name": "Аппарат ИВЛ SV-300",
        "name_en": "Ventilator SV-300",
        "slug": "ventilator-sv-300",
        "sku": "ANS-VNT-001",
        "category_slug": "anesthesiology",
        "subcategory_slug": "ventilators",
        "price": 380000,
        "price_usd": 35000,
        "brand": "Mindray",
        "main_image": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
        "images": [],
        "description": "<p>Аппарат искусственной вентиляции легких SV-300 для интенсивной терапии с широким спектром режимов вентиляции.</p>",
        "description_en": "<p>Ventilator SV-300 for intensive care with a wide range of ventilation modes.</p>",
        "specs": {
            "Бренд": "Mindray",
            "Привод": "Турбинный",
            "Тип аппарата": "Стационарный",
            "Пациенты": "Взрослые",
            "Способ вентиляции": "Комбинированный",
            "Страна": "КНР"
        },
        "in_stock": False,
        "is_new": False,
        "is_popular": True
    }
]

# Translation dictionaries for auto-translating specs
SPEC_KEY_TRANSLATIONS = {
    'Бренд': 'Brand', 'Страна': 'Country', 'Привод': 'Drive', 'Тип аппарата': 'Device Type',
    'Пациенты': 'Patients', 'Способ вентиляции': 'Ventilation Method', 'Тип': 'Type', 'Класс': 'Class',
    'Область применения': 'Application Area', 'Количество разъемов для датчиков': 'Number of Probe Connectors',
    'Тип датчика': 'Probe Type', 'Тип конструкции': 'Construction Type', 'Назначение': 'Purpose',
    'Рентгенопрозрачность': 'Radiolucent', 'Максимальная нагрузка (кг)': 'Max Load (kg)',
    'Тип привода': 'Drive Type', 'Количество приводов': 'Number of Drives', 'Метод регулировки': 'Adjustment Method',
    'Регулировка спинки': 'Backrest Adjustment', 'Регулировка подголовника': 'Headrest Adjustment',
    'Исполнение': 'Design',
}

SPEC_VALUE_TRANSLATIONS = {
    'Стационарный': 'Stationary', 'Портативный': 'Portable', 'Мобильный': 'Mobile',
    'Экспертный': 'Expert', 'Премиум': 'Premium', 'Высокий': 'High', 'Средний': 'Mid-range',
    'Общая визуализация': 'General Imaging', 'Кардиология': 'Cardiology', 'Ангиология': 'Angiology',
    'КНР': 'China', 'Южная Корея': 'South Korea', 'Германия': 'Germany', 'Япония': 'Japan',
    'Турбинный': 'Turbine', 'Взрослые': 'Adults', 'Дети': 'Children', 'Комбинированный': 'Combined',
    'Да': 'Yes', 'Нет': 'No', 'Общая хирургия': 'General Surgery',
    'Терапевтическое': 'Therapeutic', 'Хирургическое': 'Surgical', 'Электрический': 'Electric',
    'Ножная педаль': 'Foot Pedal', 'Стационарное': 'Stationary',
}

def translate_specs(specs_ru: dict) -> dict:
    """Auto-translate specs from Russian to English"""
    specs_en = {}
    for key_ru, value_ru in specs_ru.items():
        key_en = SPEC_KEY_TRANSLATIONS.get(key_ru, key_ru)
        value_en = SPEC_VALUE_TRANSLATIONS.get(value_ru, value_ru)
        specs_en[key_en] = value_en
    return specs_en


async def run_migration():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🗑️ Clearing old data...")
    await db.categories.delete_many({})
    await db.subcategories.delete_many({})
    await db.third_level_categories.delete_many({})
    await db.products.delete_many({})
    
    print("📁 Creating categories with bilingual names...")
    
    category_map = {}  # slug -> id
    subcategory_map = {}  # slug -> id
    third_level_map = {}  # slug -> id
    
    for order, cat_data in enumerate(FULL_CATALOG):
        cat_id = str(uuid4())
        category = {
            "id": cat_id,
            "name": cat_data["name"],
            "name_en": cat_data.get("name_en", cat_data["name"]),
            "slug": cat_data["slug"],
            "description": cat_data.get("description", ""),
            "description_en": cat_data.get("description_en", ""),
            "image": cat_data.get("image"),
            "order": order,
            "created_at": datetime.now(datetime.timezone.utc),
            "updated_at": datetime.now(datetime.timezone.utc)
        }
        await db.categories.insert_one(category)
        category_map[cat_data["slug"]] = cat_id
        print(f"  ✅ {cat_data['name']} / {cat_data.get('name_en', '')}")
        
        # Subcategories (level 2)
        for sub_order, sub_data in enumerate(cat_data.get("children", [])):
            sub_id = str(uuid4())
            
            # Handle different data formats
            if isinstance(sub_data, dict):
                sub_name = sub_data["name"]
                sub_name_en = sub_data.get("name_en", sub_name)
                sub_slug = sub_data["slug"]
                sub_image = sub_data.get("image")
                sub_children = sub_data.get("children", [])
            else:
                continue
            
            subcategory = {
                "id": sub_id,
                "name": sub_name,
                "name_en": sub_name_en,
                "slug": sub_slug,
                "parent_id": cat_id,
                "image": sub_image,
                "order": sub_order,
                "created_at": datetime.now(datetime.timezone.utc),
                "updated_at": datetime.now(datetime.timezone.utc)
            }
            await db.subcategories.insert_one(subcategory)
            subcategory_map[sub_slug] = sub_id
            
            # Level 3
            for third_order, third_data in enumerate(sub_children):
                if isinstance(third_data, dict):
                    third_id = str(uuid4())
                    third_level = {
                        "id": third_id,
                        "name": third_data["name"],
                        "name_en": third_data.get("name_en", third_data["name"]),
                        "slug": third_data["slug"],
                        "parent_id": sub_id,
                        "image": third_data.get("image"),
                        "order": third_order,
                        "created_at": datetime.now(datetime.timezone.utc),
                        "updated_at": datetime.now(datetime.timezone.utc)
                    }
                    await db.third_level_categories.insert_one(third_level)
                    third_level_map[third_data["slug"]] = third_id
    
    print("\n📦 Creating sample products with bilingual data...")
    
    for product_data in SAMPLE_PRODUCTS:
        product_id = str(uuid4())
        product = {
            "id": product_id,
            "name": product_data["name"],
            "name_en": product_data.get("name_en", product_data["name"]),
            "slug": product_data["slug"],
            "sku": product_data["sku"],
            "category_id": category_map.get(product_data["category_slug"]),
            "subcategory_id": subcategory_map.get(product_data["subcategory_slug"]),
            "price": product_data["price"],
            "price_usd": product_data.get("price_usd", 0),
            "old_price": product_data.get("old_price"),
            "brand": product_data["brand"],
            "main_image": product_data.get("main_image"),
            "images": product_data.get("images", []),
            "description": product_data["description"],
            "description_en": product_data.get("description_en", ""),
            "specs": product_data["specs"],
            "specs_en": translate_specs(product_data["specs"]),  # AUTO-TRANSLATE to English
            "in_stock": product_data.get("in_stock", True),
            "is_new": product_data.get("is_new", False),
            "is_popular": product_data.get("is_popular", False),
            "created_at": datetime.now(datetime.timezone.utc),
            "updated_at": datetime.now(datetime.timezone.utc)
        }
        await db.products.insert_one(product)
        print(f"  ✅ {product_data['name']}")
    
    # Count results
    cat_count = await db.categories.count_documents({})
    sub_count = await db.subcategories.count_documents({})
    third_count = await db.third_level_categories.count_documents({})
    prod_count = await db.products.count_documents({})
    
    print(f"\n🔄 Auto-translating specs to English for ALL products...")
    
    # Auto-translate specs_en for ALL products (including manually added ones)
    all_products = await db.products.find({}).to_list(None)
    translated_count = 0
    
    for product in all_products:
        specs_ru = product.get('specs', {})
        if specs_ru and len(specs_ru) > 0:
            # Only translate if specs_en doesn't exist or is empty
            if not product.get('specs_en') or len(product.get('specs_en', {})) == 0:
                specs_en = translate_specs(specs_ru)
                await db.products.update_one(
                    {'id': product['id']},
                    {'$set': {'specs_en': specs_en}}
                )
                translated_count += 1
                print(f"  ✅ Translated: {product.get('name')}")
    
    print(f"\n✅ Migration completed!")
    print(f"   Categories: {cat_count}")
    print(f"   Subcategories: {sub_count}")
    print(f"   3rd level: {third_count}")
    print(f"   Products: {prod_count}")
    print(f"   Auto-translated specs: {translated_count}")
    print(f"\n   All items now have Russian (name) and English (name_en) translations!")
    print(f"   Product specifications auto-translated to specs_en!")
    
    # Initialize global settings (currency rate)
    print(f"\n💱 Initializing global settings...")
    existing_settings = await db.settings.find_one({"id": "global_settings"})
    
    if existing_settings:
        print(f"   ✅ Settings already exist (USD to TJS rate: {existing_settings.get('usd_to_tjs_rate', 'N/A')})")
    else:
        default_settings = {
            "id": "global_settings",
            "usd_to_tjs_rate": 11.2,
            "updated_at": datetime.now(datetime.timezone.utc)
        }
        await db.settings.insert_one(default_settings)
        print(f"   ✅ Created settings with USD to TJS rate: {default_settings['usd_to_tjs_rate']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
