<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

protected $fillable = [
    'title',
    'description',
    'event_date',
    'location',
    'max_participants',
    'image',
    'created_by',
];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'registrations')
                    ->withTimestamps();
    }
}