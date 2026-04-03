import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Truck, Wrench, HeadphonesIcon, Shield, PackageCheck, GraduationCap, Settings, CheckCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { servicesTranslations } from '../translations/pagesTranslations';

const Services = () => {
    const { language } = useLanguage();
    const trans = servicesTranslations[language];

    const services = [
        {
            icon: <Truck size={40} />,
            title: trans.service1Title,
            description: trans.service1Desc,
            features: [
                language === 'ru' ? 'Прямые поставки от производителей' : 'Direct deliveries from manufacturers',
                language === 'ru' ? 'Гарантия подлинности оборудования' : 'Guarantee of equipment authenticity',
                language === 'ru' ? 'Сертифицированное оборудование' : 'Certified equipment',
                language === 'ru' ? 'Быстрые сроки поставки' : 'Fast delivery terms'
            ]
        },
        {
            icon: <Settings size={40} />,
            title: trans.service2Title,
            description: trans.service2Desc,
            features: [
                language === 'ru' ? 'Квалифицированные специалисты' : 'Qualified specialists',
                language === 'ru' ? 'Соблюдение стандартов безопасности' : 'Compliance with safety standards',
                language === 'ru' ? 'Тестирование после установки' : 'Testing after installation',
                language === 'ru' ? 'Документация по эксплуатации' : 'Operation documentation'
            ]
        },
        {
            icon: <GraduationCap size={40} />,
            title: trans.service3Title,
            description: trans.service3Desc,
            features: [
                language === 'ru' ? 'Теоретические занятия' : 'Theoretical classes',
                language === 'ru' ? 'Практические тренинги' : 'Practical training',
                language === 'ru' ? 'Сертификаты по завершению' : 'Certificates upon completion',
                language === 'ru' ? 'Постоянная консультационная поддержка' : 'Ongoing consulting support'
            ]
        },
        {
            icon: <Wrench size={40} />,
            title: trans.service4Title,
            description: trans.service4Desc,
            features: [
                language === 'ru' ? 'Плановое техническое обслуживание' : 'Scheduled maintenance',
                language === 'ru' ? 'Экстренный ремонт' : 'Emergency repair',
                language === 'ru' ? 'Оригинальные запчасти' : 'Original spare parts',
                language === 'ru' ? 'Квалифицированные инженеры' : 'Qualified engineers'
            ]
        },
        {
            icon: <Shield size={40} />,
            title: trans.service5Title,
            description: trans.service5Desc,
            features: [
                language === 'ru' ? 'Гарантия производителя' : 'Manufacturer warranty',
                language === 'ru' ? 'Бесплатный ремонт по гарантии' : 'Free warranty repair',
                language === 'ru' ? 'Замена неисправного оборудования' : 'Replacement of faulty equipment',
                language === 'ru' ? 'Круглосуточная поддержка' : '24/7 support'
            ]
        },
        {
            icon: <PackageCheck size={40} />,
            title: trans.service6Title,
            description: trans.service6Desc,
            features: [
                language === 'ru' ? 'Материалы для кардиологии' : 'Cardiology materials',
                language === 'ru' ? 'Материалы для кардиохирургии' : 'Cardiac surgery materials',
                language === 'ru' ? 'Эндоскопические расходники' : 'Endoscopic consumables',
                language === 'ru' ? 'Лабораторные материалы' : 'Laboratory materials'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#074089] to-[#2C5BB4] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">{trans.pageTitle}</h1>
                        <p className="text-xl opacity-90">
                            {trans.pageSubtitle}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2"
                        >
                            <div className="text-[#074089] mb-4">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                            <ul className="space-y-2">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <CheckCircle size={18} className="text-[#074089] flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Additional Info Section */}
                <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{trans.complexApproachTitle}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-[#074089] mb-4">{trans.engineeringTitle}</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {trans.engineeringDesc}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#074089] mb-4">{trans.consultationsTitle}</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {trans.consultationsDesc}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{trans.whyUsTitle}</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#074089] mb-2">17+</div>
                            <p className="text-gray-600">{trans.yearsOnMarket}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#074089] mb-2">7</div>
                            <p className="text-gray-600">{trans.officialDistributions}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#074089] mb-2">100+</div>
                            <p className="text-gray-600">{trans.successfulProjects}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#074089] mb-2">24/7</div>
                            <p className="text-gray-600">{trans.techSupport}</p>
                        </div>
                    </div>
                </section>

                {/* Contact CTA - Compact redesign */}
                <section className="bg-gradient-to-r from-[#074089] to-[#2C5BB4] rounded-xl shadow-lg p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{trans.needConsultation}</h2>
                            <p className="text-white/80 text-sm md:text-base max-w-md">
                                {trans.consultationDesc}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="tel:+992918611259"
                                className="flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#074089] transition-all text-sm"
                            >
                                <Phone size={18} />
                                <span>+992 93 333 96 39</span>
                            </a>
                            <a
                                href="mailto:info@medtech.tj"
                                className="flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#074089] transition-all text-sm"
                            >
                                <Mail size={18} />
                                <span>info@medtech.tj</span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Services;
