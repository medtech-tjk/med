import React, { useId, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Options remain normal document flow: long labels wrap, never disappear into
// a clipped select or a nested scrolling area.
export default function FilterOptions({label, options, value, onChange, multiple = true}) {
  const {language} = useLanguage();
  const groupId = useId();
  const [query,setQuery] = useState('');
  const [expanded,setExpanded] = useState(false);
  const [revealed,setRevealed] = useState([]);
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const choices = useMemo(()=>{
    const seen=new Set();
    return (options || []).map(item=>String(item).trim()).filter(item=>{
      const key=item.toLocaleLowerCase();
      if(!key || seen.has(key) || ['все бренды','all brands','all'].includes(key))return false;
      seen.add(key);return true;
    });
  },[options]);
  const filtered=choices.filter(item=>item.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const visible=expanded || query ? filtered : filtered.filter((item,index)=>index<6 || values.includes(item) || revealed.includes(item));
  const remaining=filtered.length-visible.length;
  const choose=(option,checked)=>{
    setRevealed(current=>current.includes(option)?current:[...current,option]);
    onChange(multiple ? (checked ? [...values,option] : values.filter(item=>item!==option)) : option);
  };
  return <fieldset className="filter-group">
    <legend>{label}</legend>
    {choices.length>8 && <label className="filter-option-search"><Search size={15} aria-hidden="true"/><input type="search" maxLength={128} value={query} onChange={event=>setQuery(event.target.value)} aria-label={`${language==='ru'?'Поиск в фильтре':'Search filter'}: ${label}`} placeholder={language==='ru'?'Найти вариант':'Find an option'}/></label>}
    {!multiple && <label className="filter-option"><input type="radio" name={groupId} checked={!value} onChange={()=>onChange('')}/><span>{language==='ru'?'Все':'All'}</span></label>}
    {visible.map(option=><label key={option} className="filter-option"><input type={multiple?'checkbox':'radio'} name={groupId} checked={values.includes(option)} onChange={event=>choose(option,event.target.checked)}/><span>{option}</span></label>)}
    {!filtered.length && <p role="status" className="text-sm text-slate-500 py-2">{language==='ru'?'Нет совпадений':'No matches'}</p>}
    {!query && (expanded || remaining>0) && <button type="button" className="filter-expand" aria-expanded={expanded} onClick={()=>{if(expanded)setRevealed(values);setExpanded(current=>!current);}}>{expanded ? <><ChevronUp size={16}/>{language==='ru'?'Свернуть':'Show less'}</> : <><ChevronDown size={16}/>{language==='ru'?'Показать ещё':'Show more'}{remaining>0?` (${remaining})`:''}</>}</button>}
  </fieldset>;
}
