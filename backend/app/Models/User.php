<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function createdEvents()
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    public function registeredEvents()
    {
        return $this->belongsToMany(Event::class, 'registrations')
                    ->withTimestamps();
    }
}