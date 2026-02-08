<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['title', 'completed'];

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'completed' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
