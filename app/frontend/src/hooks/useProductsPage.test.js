import { vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useProductsPage } from './useApi';

test('product page requests send filters and return database-wide counts/facets', async () => {
  global.IS_REACT_ACT_ENVIRONMENT=true;
  let result;
  global.fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({
    items:[{id:'page-item',name:'Device'}],total:205,page:3,page_size:20,pages:11,
    facets:{brands:['Acme','Beta'],category_ids:['c1']}
  })});
  function Harness(){result=useProductsPage({category_id:'c1',brands:['Acme','Beta'],spec_filters:{Type:['Portable']},page:3,page_size:20});return null;}
  const host=document.createElement('div'),root=createRoot(host);
  await act(async()=>root.render(<Harness/>));
  await act(async()=>{});
  const url=new URL(global.fetch.mock.calls[0][0],'http://localhost');
  expect(url.pathname).toBe('/api/products/page');
  expect(url.searchParams.get('category_id')).toBe('c1');
  expect(url.searchParams.getAll('brands')).toEqual(['Acme','Beta']);
  expect(JSON.parse(url.searchParams.get('spec_filters'))).toEqual({Type:['Portable']});
  expect(result.total).toBe(205);expect(result.pages).toBe(11);
  expect(result.facets.brands).toEqual(['Acme','Beta']);
  await act(async()=>root.unmount());
});
