import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/catalog/${category.slug}`}
      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
          {category.name}
        </h3>
        <div className="flex items-center text-sm opacity-90 group-hover:opacity-100 transition-opacity">
          <span>Смотреть товары</span>
          <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Subcategories count badge */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="absolute top-3 right-3 bg-white text-[#074089] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {category.subcategories.length} категорий
        </div>
      )}
    </Link>
  );
};

export default CategoryCard;
