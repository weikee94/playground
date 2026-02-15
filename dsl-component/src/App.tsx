import { useState } from 'react';
import { SchemaPage } from './components/SchemaPage';
import { userSchema } from './schemas/user.schema';
import { productSchema } from './schemas/product.schema';

const schemas = [userSchema, productSchema];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6">
          <span className="font-bold text-gray-800">DSL Component</span>
          <span className="text-xs text-gray-400">动态组件</span>
          <div className="flex gap-1 ml-auto">
            {schemas.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeTab === i
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.displayName}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <SchemaPage key={schemas[activeTab].name} schema={schemas[activeTab]} />
      </main>
    </div>
  );
}
