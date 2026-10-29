import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CategoryCard({category, to, headingLevel = 3}) {
  const {language,getLocalizedName} = useLanguage();
  const children = category.children || category.subcategories || [];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return <Link to={to || `/catalog/${category.slug}`} className="category-tile">
    <div className="category-tile-media">{category.image ? <img src={category.image} alt="" loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/placeholder.svg';}}/> : <LayoutGrid size={48} className="text-[#074089]/60" aria-hidden="true"/>}</div>
    <div className="category-tile-content">
      <Heading>{getLocalizedName(category)}</Heading>
      <div className="category-tile-caption"><span>{children.length ? `${language === 'ru' ? 'Разделов' : 'Sections'}: ${children.length}` : (language === 'ru' ? 'Смотреть оборудование' : 'Browse equipment')}</span><ArrowUpRight size={18} aria-hidden="true"/></div>
    </div>
  </Link>;
}
