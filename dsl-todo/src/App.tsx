import { ModelPage } from './components/ModelPage';
import { todoModel } from './models/todo.model';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <span className="font-bold text-gray-800">DSL Todo</span>
          <span className="text-xs text-gray-400 ml-2">配置驱动</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ModelPage model={todoModel} />
      </main>
    </div>
  );
}
