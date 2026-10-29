import { vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useProducts } from './useApi';

test('an older catalog request cannot replace the current search results', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const pending=[];
  global.fetch=vi.fn((url,options)=>new Promise(resolve=>pending.push({url,options,resolve})));
  let latest;
  function Harness({search}) {latest=useProducts({search});return null;}
  const host=document.createElement('div');const root=createRoot(host);
  await act(async()=>root.render(<Harness search="old"/>));
  await act(async()=>root.render(<Harness search="new"/>));
  expect(pending[0].options.signal.aborted).toBe(true);
  await act(async()=>pending[1].resolve({ok:true,json:async()=>({items:[{id:'new',name:'new'}],pages:1,total:1,facets:{brands:[]}})}));
  await act(async()=>pending[0].resolve({ok:true,json:async()=>({items:[{id:'old',name:'old'}],pages:1,total:1,facets:{brands:[]}})}));
  expect(latest.products[0].id).toBe('new');
  await act(async()=>root.unmount());
});
