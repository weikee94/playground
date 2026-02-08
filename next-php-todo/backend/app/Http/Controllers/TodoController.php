<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    /**
     * List all todos.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $todos = Todo::orderBy('created_at', 'desc')->get();

        return response()->json($todos);
    }

    /**
     * Create a new todo.
     *
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
        ]);

        $todo = Todo::create([
            'title' => $validated['title'],
            'completed' => false,
        ]);

        return response()->json($todo, 201);
    }

    /**
     * Toggle a todo's completed status.
     *
     * @response Todo
     */
    public function update(string $id): JsonResponse
    {
        $todo = Todo::findOrFail($id);
        $todo->update(['completed' => !$todo->completed]);

        return response()->json($todo->fresh());
    }

    /**
     * Delete a todo.
     *
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $todo = Todo::findOrFail($id);
        $todo->delete();

        return response()->json(['id' => $id]);
    }
}
