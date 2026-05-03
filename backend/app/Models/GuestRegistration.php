<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestRegistration extends Model
{
    protected $fillable = ['name', 'email', 'event_id'];
}
