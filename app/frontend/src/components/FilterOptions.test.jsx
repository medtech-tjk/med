import React,{act,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LanguageProvider} from '../context/LanguageContext';
import FilterOptions from './FilterOptions';

test('a selected option stays visible and keeps focus when deselected in a collapsed group',async()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  localStorage.setItem('language','ru');
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
  function Harness(){const[value,setValue]=useState([]);return <LanguageProvider><FilterOptions label="Бренд" options={Array.from({length:12},(_,i)=>`Option ${i+1}`)} value={value} onChange={setValue}/></LanguageProvider>;}
  await act(async()=>root.render(<Harness/>));
  await act(async()=>host.querySelector('.filter-expand').click());
  const selected=[...host.querySelectorAll('label')].find(label=>label.textContent==='Option 9').querySelector('input');
  await act(async()=>selected.click());
  await act(async()=>host.querySelector('.filter-expand').click());
  expect(host.contains(selected)).toBe(true);
  selected.focus();
  await act(async()=>selected.click());
  expect(selected.checked).toBe(false);
  expect(host.contains(selected)).toBe(true);
  expect(document.activeElement).toBe(selected);
  await act(async()=>root.unmount());host.remove();localStorage.clear();
});
