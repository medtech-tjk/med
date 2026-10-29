import { matchesSpecification } from './filterProducts';

test('a selected specification excludes products without that value',()=>{
  expect(matchesSpecification({specs:{}},'Класс',['Экспертный'])).toBe(false);
  expect(matchesSpecification({specs:{Класс:'Экспертный'}},'Класс',['Экспертный'])).toBe(true);
});
test('brand filters read the actual brand field with exact normalized matching',()=>{
  expect(matchesSpecification({brand:'Mindray'},'Бренд',['mindray'])).toBe(true);
  expect(matchesSpecification({brand:'Mindray X'},'Бренд','Mindray')).toBe(false);
});
test('English specifications are supported',()=>{
  expect(matchesSpecification({specs_en:{Class:'Expert'}},'Class',['Expert'],'en')).toBe(true);
});
